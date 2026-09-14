'use client'

import { useState, useEffect, useRef } from 'react'
import { createBill, getNextBillNumber } from './actions'
import { getProductsCached } from '@/lib/productCache'
import { Printer, CheckCircle, Plus, Trash2 } from 'lucide-react'
import PaperBill from '@/components/PaperBill'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'

// The Print layout uses the exact same UI as the editor, 
// so we don't need a massive separate PrintLayout component anymore.
// We just hide the controls and inputs turn to static text during print.

export default function NewBill() {
  const [products, setProducts] = useState<any[]>([])
  
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [showStoreName, setShowStoreName] = useState(true)
  const [printMerchantCopy, setPrintMerchantCopy] = useState(true)
  const [narration, setNarration] = useState('')
  
  const MIN_ROWS = 18
  const emptyRow = { product_name: '', quantity: '', rate: '', discount: '', amount: 0 }
  const [cart, setCart] = useState<any[]>(Array(MIN_ROWS).fill(null).map(() => ({ ...emptyRow })))
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successBill, setSuccessBill] = useState<any>(null)
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const [nextBillNumber, setNextBillNumber] = useState<string>('Loading...')
  
  const [activeRow, setActiveRow] = useState<number | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    getProductsCached().then(setProducts)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { 
        setSuccessBill(null) 
        setRequestId(crypto.randomUUID())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    getNextBillNumber().then(setNextBillNumber)
    if (successBill) {
      setTimeout(() => {
        generatePDF()
      }, 100)
    }
  }, [successBill])

  const generatePDF = async () => {
    const element = document.getElementById('paper-bill-container');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `Bill_${successBill?.billNumber || 'receipt'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 4, 
          useCORS: true, 
          logging: false,
          windowWidth: 397,
          width: 397
        },
        jsPDF: { unit: 'mm', format: [105.1, 148.1], orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert("Failed to generate PDF.");
    }
  }

  const handleSearch = (query: string, rowIndex: number) => {
    setActiveRow(rowIndex)
    if (!query) {
      setSearchResults([])
      return
    }
    const matches = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    setSearchResults(matches)
  }

  const selectProduct = (p: any, rowIndex: number) => {
    updateItem(rowIndex, 'product_name', p.name)
    updateItem(rowIndex, 'rate', p.default_rate)
    updateItem(rowIndex, 'quantity', 1)
    setActiveRow(null)
    document.getElementById(`input-${rowIndex}-quantity`)?.focus()
  }

  const parseDiscount = (discStr: string, rate: number) => {
    const s = String(discStr).trim()
    if (s.endsWith('%')) {
      const p = parseFloat(s.replace('%', '')) || 0
      return rate * (p / 100)
    }
    return parseFloat(s) || 0
  }

  const updateItem = (idx: number, field: string, val: any) => {
    setCart(prev => {
      const newCart = [...prev]
      newCart[idx] = { ...newCart[idx], [field]: val }
      
      const q = parseFloat(newCart[idx].quantity) || 0
      const r = parseFloat(newCart[idx].rate) || 0
      const d = parseDiscount(newCart[idx].discount, r)
      
      newCart[idx].amount = q * Math.max(0, r - d)
      return newCart
    })
  }

  const addRow = () => {
    setCart(prev => [...prev, { ...emptyRow }])
  }
  
  const removeRow = (idx: number) => {
    setCart(prev => {
      const next = prev.filter((_, i) => i !== idx)
      if (next.length < MIN_ROWS) next.push({ ...emptyRow })
      return next
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const flow = ['quantity', 'product_name', 'rate', 'discount']
      const currIdx = flow.indexOf(colName)
      if (currIdx < flow.length - 1) {
        document.getElementById(`input-${rowIdx}-${flow[currIdx+1]}`)?.focus()
      } else {
        if (rowIdx === cart.length - 1) addRow()
        setTimeout(() => document.getElementById(`input-${rowIdx+1}-quantity`)?.focus(), 10)
      }
    }
  }

  const validItems = cart.filter(i => 
    i.product_name && 
    parseFloat(i.quantity) > 0 && 
    parseFloat(i.rate) >= 0
  )
  const totalQuantity = validItems.length
  const grandTotal = validItems.reduce((sum, i) => sum + (i.amount || 0), 0)

  const handleSubmit = async () => {
    if (validItems.length === 0) return alert("Bill is empty")
    
    const mobile = customerMobile.trim()
    if (mobile && !/^\d{10}$/.test(mobile)) {
      return alert("Mobile number must be exactly 10 digits")
    }

    setIsSubmitting(true)
    try {
      const res = await createBill({ 
        customer_name: customerName, 
        customer_mobile: customerMobile,
        request_id: requestId,
        items: validItems.map(i => ({
          product_name: i.product_name,
          quantity: parseFloat(i.quantity) || 1,
          rate: parseFloat(i.rate) || 0,
          discount: String(i.discount || '')
        }))
      })
      setSuccessBill(res)
      setCart(Array(MIN_ROWS).fill(null).map(() => ({ ...emptyRow })))
      setCustomerName('')
      setCustomerMobile('')
      setNarration('')
    } catch (e: any) {
      console.error(e);
      alert("Failed to generate bill: " + (e.message || "The server might be unreachable. Check Vercel logs."));
    }
    setIsSubmitting(false)
  }

  if (successBill) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="print:hidden w-full max-w-[800px] flex justify-end gap-4 p-4">
          <Button onClick={generatePDF} variant="secondary" className="shadow-sm">
            <Printer size={16} className="mr-2" /> Print Bill
          </Button>
          <Button onClick={() => { setSuccessBill(null); setRequestId(crypto.randomUUID()); }} className="shadow-sm">
            <Plus size={16} className="mr-2" /> New Bill
          </Button>
        </div>
        <div id="paper-bill-container" style={{ width: 397 }} className="flex flex-col items-center">
          <PaperBill 
            billNumber={successBill.bill_number}
            date={new Date(successBill.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
            customerName={successBill.customer_name} 
            customerMobile={successBill.customer_mobile}
            storeName={showStoreName ? 'SAGAR ELECTRICALS' : ''}
            items={successBill.items}
            isMerchant={false} 
            narration={narration}
          />
          {printMerchantCopy && (
            <>

              <PaperBill 
                billNumber={successBill.bill_number}
                date={new Date(successBill.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                customerName={successBill.customer_name} 
                customerMobile={successBill.customer_mobile}
                storeName={showStoreName ? 'SAGAR ELECTRICALS' : ''}
                items={successBill.items}
                isMerchant={true} 
                narration={narration}
              />
            </>
          )}
        </div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')

  return (
    <div className="h-full w-full overflow-auto bg-[var(--color-surface)] flex flex-col items-center p-4 print:p-0 print:hidden relative">
      
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-10">
        <Button id="submit-bill" onClick={handleSubmit} disabled={isSubmitting || validItems.length === 0} size="lg" className="rounded-full shadow-xl text-lg px-8 py-6 h-auto">
          {isSubmitting ? 'GENERATING...' : 'GENERATE BILL (F8)'}
        </Button>
      </div>

      <div className="bg-white w-full shadow-xl border border-[var(--color-border)] rounded-xl p-4 md:p-6 font-sans text-sm text-[var(--color-text-primary)] relative">
        
        <div className="text-center mb-4 flex flex-col items-center">
          <Image src="/ganesha.png" alt="Ganesha" width={50} height={50} priority />
          <h2 className="font-bold text-lg leading-tight mt-1">Quotation</h2>
          <h3 className="uppercase tracking-widest text-xs text-[var(--color-text-secondary)]">INVOICE</h3>
          {showStoreName && <h1 className="font-bold text-xl tracking-wide mt-1 text-blue-900">SAGAR ELECTRICALS</h1>}
          
          <div className="mt-4 print:hidden flex items-center justify-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showStoreName}
                onChange={e => setShowStoreName(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 font-medium">Print Store Name</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={printMerchantCopy}
                onChange={e => setPrintMerchantCopy(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 font-medium">Print Merchant Copy</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between font-semibold mb-4 text-sm">
          <div>No. &nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-normal text-[var(--color-text-secondary)]">{nextBillNumber}</span></div>
          <div>Date: <span className="font-normal text-[var(--color-text-secondary)]">{currentDate}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold text-sm w-12 pt-2">M/s:</div>
            <div className="flex-1">
              <Input 
                placeholder="Type customer name..."
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-semibold text-sm w-20 pt-2">Mobile:</div>
            <div className="flex-1">
              <Input 
                placeholder="Type customer mobile..."
                value={customerMobile}
                onChange={e => setCustomerMobile(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_80px_60px_100px] bg-[var(--color-surface)] border-b border-[var(--color-border)] font-semibold text-center divide-x divide-[var(--color-border)] py-3 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
            <div>Qty</div>
            <div>DESCRIPTION OF GOODS</div>
            <div>Rate</div>
            <div>Disc</div>
            <div>Amount</div>
          </div>

          <div className="flex flex-col relative min-h-[400px] divide-y divide-[var(--color-border)]">
            {cart.map((item, idx) => {
              return (
                <div key={idx} className="grid grid-cols-[80px_1fr_80px_60px_100px] divide-x divide-[var(--color-border)] h-10 group relative transition-colors hover:bg-slate-50">
                  
                  <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => removeRow(idx)} className="text-[var(--color-error)] hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <div className="p-1">
                    <input type="number" min="1" id={`input-${idx}-quantity`} className="w-full h-full text-center bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] rounded transition-all"
                           value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 'quantity')} />
                  </div>
                  <div className="p-1 relative">
                    <input type="text" id={`input-${idx}-product_name`} className="w-full h-full px-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] rounded transition-all uppercase"
                           value={item.product_name} 
                           onChange={e => { updateItem(idx, 'product_name', e.target.value); handleSearch(e.target.value, idx) }} 
                           onFocus={() => handleSearch(item.product_name, idx)}
                           onKeyDown={(e) => handleKeyDown(e, idx, 'product_name')}
                    />
                    
                    {activeRow === idx && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-[var(--color-border)] shadow-xl z-50 mt-1 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                        {searchResults.map((p, pIdx) => (
                          <div key={p.id} onClick={() => selectProduct(p, idx)} className="px-4 py-2.5 border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] cursor-pointer flex justify-between items-center transition-colors">
                            <span className="font-semibold text-[var(--color-text-primary)] text-xs">{p.name}</span>
                            <span className="text-[var(--color-primary)] font-semibold text-xs">₹{p.default_rate.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-1">
                    <input type="number" step="0.01" min="0" id={`input-${idx}-rate`} className="w-full h-full text-right px-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] rounded transition-all"
                           value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 'rate')} />
                  </div>
                  <div className="p-1">
                    <input type="text" id={`input-${idx}-discount`} className="w-full h-full text-right px-2 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] rounded transition-all"
                           value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)} onKeyDown={(e) => handleKeyDown(e, idx, 'discount')} />
                  </div>
                  <div className="px-3 flex items-center justify-end font-bold text-[var(--color-text-primary)]">
                    {item.amount ? item.amount.toFixed(2) : ''}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table Footer */}
          <div className="grid grid-cols-[1fr_160px_100px] border-t border-[var(--color-border)] divide-x divide-[var(--color-border)] h-16 bg-[var(--color-surface)]">
            <div className="p-4 flex items-center justify-end font-medium text-[var(--color-text-secondary)] text-sm">
              Total Quantity : <span className="font-bold ml-2 text-[var(--color-text-primary)]">{totalQuantity}</span>
            </div>
            <div className="flex flex-col justify-center px-4 text-xs">
              <div className="text-[var(--color-text-secondary)]">Total Amount</div>
              <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Net Amount</div>
            </div>
            <div className="flex flex-col justify-center text-right px-4 text-sm">
              <div className="text-[var(--color-text-secondary)]">{grandTotal.toFixed(2)}</div>
              <div className="font-bold text-[var(--color-primary)] text-base">{grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Narration */}
        <div className="mt-8 flex items-center gap-4">
          <div className="font-semibold text-sm w-20">Narration:</div>
          <div className="flex-1">
            <Input 
              placeholder="Add optional notes..."
              value={narration} 
              onChange={e => setNarration(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}


