'use client'

import { useState, useEffect } from 'react'
import { getDailySummary } from '../actions'
import PaperBill from '@/components/PaperBill'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Calendar } from 'lucide-react'

export default function DailySummary() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [summary, setSummary] = useState<any>(null)
  const [viewingBill, setViewingBill] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getDailySummary(date).then(res => {
      setSummary(res)
      setLoading(false)
    })
  }, [date])

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex items-end gap-6 shrink-0">
        <div className="w-64">
          <Input 
            label="Select Date" 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            startIcon={<Calendar size={18} />}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          <span className="ml-3 font-medium">Loading summary...</span>
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Total Bills</div>
              <div className="text-4xl font-bold text-[var(--color-text-primary)]">{summary.total_bills}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Daily Total</div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">₹{summary.daily_total.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Bill No</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Time</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.bills.map((b: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors last:border-0">
                    <td className="p-4 font-bold text-[var(--color-text-primary)]">{b.bill_number}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{new Date(b.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4 text-right font-bold text-[var(--color-text-primary)]">₹{b.total_amount.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <Button variant="tertiary" size="sm" onClick={() => setViewingBill(b)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {summary.bills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[var(--color-text-secondary)]">
                      No bills found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Bill View Modal */}
      <Modal 
        isOpen={!!viewingBill} 
        onClose={() => setViewingBill(null)}
        title={`Invoice: ${viewingBill?.bill_number}`}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingBill(null)}>Close</Button>
            <Button onClick={() => window.print()}>Print Invoice</Button>
          </>
        }
      >
        <div className="flex justify-center -mx-6 -mt-2">
          {viewingBill && (
            <div className="w-full shadow-lg print:shadow-none bg-white">
              <PaperBill 
                billNumber={viewingBill.bill_number}
                date={new Date(viewingBill.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                customerName={viewingBill.customer_name} 
                items={viewingBill.items}
                isMerchant={true} 
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
