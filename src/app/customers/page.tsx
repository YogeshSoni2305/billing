'use client'

import { useState } from 'react'
import { getCustomerHistory } from '../actions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'

export default function CustomerHistory() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setHasSearched(true)
    const bills = await getCustomerHistory(query.trim())
    setHistory(bills)
    setLoading(false)
  }

  const purchases = history.flatMap(bill => 
    bill.items.map((item: any) => ({
      ...item,
      bill_number: bill.bill_number,
      date: new Date(bill.timestamp).toLocaleDateString(),
    }))
  )

  const totalAmount = history.reduce((sum, b) => sum + b.total_amount, 0)
  const totalItemsPurchased = purchases.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex flex-col gap-4 shrink-0">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Search Customer History</h2>
        <form onSubmit={handleSearch} className="flex items-end gap-4">
          <div className="w-80">
            <Input 
              label="Customer Name or Mobile" 
              placeholder="e.g. John or 9876543210"
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              startIcon={<Search size={18} />}
            />
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {hasSearched && !loading && (
        <>
          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Total Items Bought</div>
              <div className="text-4xl font-bold text-[var(--color-text-primary)]">{totalItemsPurchased}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Total Amount Spent</div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">₹{totalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Product</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Qty</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Rate</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors last:border-0">
                    <td className="p-4 text-[var(--color-text-secondary)]">{p.date}</td>
                    <td className="p-4 font-bold text-[var(--color-text-primary)] uppercase">{p.product_name}</td>
                    <td className="p-4 text-[var(--color-text-secondary)] text-right">{p.quantity}</td>
                    <td className="p-4 text-[var(--color-text-secondary)] text-right">₹{p.rate.toFixed(2)}</td>
                    <td className="p-4 text-right font-bold text-[var(--color-text-primary)]">₹{p.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--color-text-secondary)]">
                      No records found for "{query}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
