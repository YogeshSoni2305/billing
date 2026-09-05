'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { signJWT, verifyJWT, hashPassword, verifyPassword, AUTH_COOKIE_NAME } from '@/lib/auth'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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

function parseDiscount(discStr: string, rate: number) {
  const s = String(discStr || "").trim()
  if (s.endsWith('%')) {
    const p = parseFloat(s.replace('%', '')) || 0
    return rate * (p / 100)
  }
  return parseFloat(s) || 0
}

export async function createBill(data: {
  customer_name?: string,
  customer_mobile?: string,
  request_id: string,
  items: { product_name: string, quantity: number, rate?: number, discount?: string }[]
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
    const discountVal = parseDiscount(item.discount || "", safeRate)
    const amount = item.quantity * Math.max(0, safeRate - discountVal)
    return {
      product_name: item.product_name,
      quantity: item.quantity,
      rate: safeRate,
      discount: item.discount || "",
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
        customer_mobile: data.customer_mobile || null,
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
  }, {
    maxWait: 5000,
    timeout: 10000
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
    },
    include: { items: true }
  })

  const dailyMap = new Map<string, { date: string, bills: any[], total: number }>()
  bills.forEach(b => {
    // Convert UTC to IST before grouping by day
    const localDateStr = new Date(b.timestamp.getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]
    const current = dailyMap.get(localDateStr) || { date: localDateStr, bills: [], total: 0 }
    current.bills.push(b)
    current.total += b.total_amount
    dailyMap.set(localDateStr, current)
  })

  const days = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date))

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

export async function getCustomerHistory(query: string) {
  if (!query) return []
  
  const bills = await prisma.bill.findMany({
    where: {
      OR: [
        { customer_name: { contains: query, mode: 'insensitive' } },
        { customer_mobile: { contains: query } }
      ]
    },
    include: { items: true },
    orderBy: { timestamp: 'desc' }
  })
  
  return bills
}

// --- Authentication Actions ---

function getPrisma() {
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any).user) {
    return globalForPrisma.prisma
  }
  const client = new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  return client
}

export async function ensureDefaultAdminUser() {
  const db = getPrisma()
  const count = await db.user.count()
  if (count === 0) {
    const passwordHash = await hashPassword('admin123')
    await db.user.create({
      data: {
        username: 'admin',
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN'
      }
    })
    console.log('Default admin user created: admin / admin123')
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, error: 'Username and password are required' }
  }

  await ensureDefaultAdminUser()

  const db = getPrisma()
  const user = await db.user.findUnique({
    where: { username: username.trim() }
  })

  if (!user) {
    return { success: false, error: 'Invalid username or password' }
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    return { success: false, error: 'Invalid username or password' }
  }

  const token = await signJWT({
    userId: user.id,
    username: user.username,
    name: user.name || user.username,
    role: user.role
  })

  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return { success: true, error: null }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  redirect('/login')
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
    if (!token) return null
    return await verifyJWT(token)
  } catch (error) {
    return null
  }
}
