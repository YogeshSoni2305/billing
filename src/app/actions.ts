'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

// --- Product Cache Versioning ---
export async function getProductVersion() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'product_version' }
  })
  return config?.value || 1
}

async function incrementProductVersion() {
  await prisma.systemConfig.upsert({
    where: { key: 'product_version' },
    update: { value: { increment: 1 } },
    create: { key: 'product_version', value: 2 }
  })
}

// --- Audit Logging ---
async function createAuditLog(action: string, details: string) {
  await prisma.auditLog.create({
    data: { action, details }
  })
}

// --- Products ---
export async function getProducts() {
  return await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  })
}

export async function saveProduct(data: { id?: number, name: string, default_rate: number }) {
  const trimmedName = data.name?.trim() || ""
  if (!trimmedName) throw new Error("Product name cannot be empty")
  if (data.default_rate < 0) throw new Error("Default rate cannot be negative")

  let actionDetails = ""
  if (data.id) {
    await prisma.product.update({
      where: { id: data.id },
      data: { name: trimmedName, default_rate: data.default_rate }
    })
    actionDetails = `Edited product ID ${data.id}: ${trimmedName} to ₹${data.default_rate}`
  } else {
    const created = await prisma.product.create({
      data: { name: trimmedName, default_rate: data.default_rate }
    })
    actionDetails = `Added product ID ${created.id}: ${trimmedName} at ₹${data.default_rate}`
  }
  await incrementProductVersion()
  await createAuditLog(data.id ? 'PRODUCT_EDITED' : 'PRODUCT_ADDED', actionDetails)
  revalidatePath('/products')
  revalidatePath('/')
}

export async function deleteProduct(id: number) {
  const p = await prisma.product.findUnique({ where: { id } })
  await prisma.product.update({
    where: { id },
    data: { active: false }
  })
  await incrementProductVersion()
  await createAuditLog('PRODUCT_DELETED', `Deactivated product ID ${id}: ${p?.name}`)
  revalidatePath('/products')
  revalidatePath('/')
}

// --- Bills ---
export async function getNextBillNumber() {
  const lastBill = await prisma.bill.findFirst({
    orderBy: { id: 'desc' }
  })
  const nextId = (lastBill?.id || 0) + 1
  return `SE-${String(nextId).padStart(6, '0')}`
}

export async function createBill(data: {
  customer_name?: string,
  request_id: string,
  items: { product_name: string, quantity: number, rate?: number, discount?: number }[]
}) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Bill must contain at least one item")
  }

  // Idempotency check: If a bill with this request_id exists, return it immediately.
  const existingBill = await prisma.bill.findUnique({
    where: { request_id: data.request_id },
    include: { items: true }
  })
  if (existingBill) {
    return existingBill
  }

  // Calculate items and total purely on the backend
  const calculatedItems = data.items.map(item => {
    if (item.quantity <= 0) throw new Error("Quantity must be positive")
    const safeRate = Math.max(0, item.rate || 0) 
    const safeDisc = Math.max(0, item.discount || 0)
    const amount = item.quantity * Math.max(0, safeRate - safeDisc)
    return {
      product_name: item.product_name,
      quantity: item.quantity,
      rate: safeRate,
      amount
    }
  })

  const total_amount = calculatedItems.reduce((sum, item) => sum + item.amount, 0)

  // Execute atomically
  const result = await prisma.$transaction(async (tx) => {
    // We use the database ID generation implicitly to ensure perfectly safe sequential bill numbers.
    // Since Prisma generates the ID after insert, we'll create the bill with a temporary dummy number,
    // then immediately update it with the true sequential formatted number based on its unique ID.
    const tempBill = await tx.bill.create({
      data: {
        bill_number: `TEMP-${data.request_id}`,
        request_id: data.request_id,
        customer_name: data.customer_name || null,
        total_amount,
        items: {
          create: calculatedItems
        }
      },
    })

    const finalBillNumber = `SE-${String(tempBill.id).padStart(6, '0')}`
    
    return await tx.bill.update({
      where: { id: tempBill.id },
      data: { bill_number: finalBillNumber },
      include: { items: true }
    })
  })

  await createAuditLog('BILL_CREATED', `Created bill ${result.bill_number} for ₹${result.total_amount}`)

  revalidatePath('/daily')
  revalidatePath('/monthly')
  revalidatePath('/yearly')
  return result
}

export async function cancelBill(id: number) {
  const bill = await prisma.bill.update({
    where: { id },
    data: { status: 'CANCELLED' }
  })
  await createAuditLog('BILL_CANCELLED', `Cancelled bill ${bill.bill_number}`)
  revalidatePath('/daily')
  revalidatePath('/monthly')
  revalidatePath('/yearly')
}

// --- Summaries ---
export async function getDailySummary(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00.000+05:30`)
  const end = new Date(`${dateStr}T23:59:59.999+05:30`)

  const bills = await prisma.bill.findMany({
    where: {
      timestamp: { gte: start, lte: end },
      status: 'COMPLETED'
    },
    include: { items: true },
    orderBy: { id: 'asc' }
  })

  const total_bills = bills.length
  const daily_total = bills.reduce((sum, b) => sum + b.total_amount, 0)

  return { date: dateStr, bills, total_bills, daily_total }
}

export async function getMonthlySummary(year: number, month: number) {
  const monthStr = month.toString().padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate().toString().padStart(2, '0')
  const start = new Date(`${year}-${monthStr}-01T00:00:00.000+05:30`)
  const end = new Date(`${year}-${monthStr}-${lastDay}T23:59:59.999+05:30`)

  const bills = await prisma.bill.findMany({
    where: {
      timestamp: { gte: start, lte: end },
      status: 'COMPLETED'
    }
  })

  const dailyMap = new Map<string, { bills: number, total: number }>()
  bills.forEach(b => {
    // Convert UTC to IST before grouping by day
    const localDateStr = new Date(b.timestamp.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]
    const current = dailyMap.get(localDateStr) || { bills: 0, total: 0 }
    dailyMap.set(localDateStr, { bills: current.bills + 1, total: current.total + b.total_amount })
  })

  const days = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    bills: data.bills,
    total: data.total
  })).sort((a, b) => a.date.localeCompare(b.date))

  const total_bills = bills.length
  const monthly_total = bills.reduce((sum, b) => sum + b.total_amount, 0)

  return { year, month, days, total_bills, monthly_total }
}

export async function getYearlySummary(year: number) {
  const start = new Date(`${year}-01-01T00:00:00.000+05:30`)
  const end = new Date(`${year}-12-31T23:59:59.999+05:30`)

  const bills = await prisma.bill.findMany({
    where: {
      timestamp: { gte: start, lte: end },
      status: 'COMPLETED'
    }
  })

  const monthlyMap = new Map<string, { bills: number, total: number }>()
  bills.forEach(b => {
    // Convert UTC to IST before grouping by month
    const localMonthStr = new Date(b.timestamp.getTime() + 5.5 * 60 * 60 * 1000).toISOString().substring(0, 7)
    const current = monthlyMap.get(localMonthStr) || { bills: 0, total: 0 }
    monthlyMap.set(localMonthStr, { bills: current.bills + 1, total: current.total + b.total_amount })
  })

  const months = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    bills: data.bills,
    total: data.total
  })).sort((a, b) => a.month.localeCompare(b.month))

  const total_bills = bills.length
  const yearly_total = bills.reduce((sum, b) => sum + b.total_amount, 0)

  return { year, months, total_bills, yearly_total }
}
