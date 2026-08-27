'use client'

import { useState, useEffect } from 'react'
import { getMonthlySummary } from '../actions'

export default function MonthlySummary() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    getMonthlySummary(year, month).then(setSummary)
  }, [year, month])

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)] flex items-end gap-6 shrink-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Select Month</label>
          <select 
            value={month} 
            onChange={e => setMonth(Number(e.target.value))} 
            className="h-10 w-48 rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Select Year</label>
          <select 
            value={year} 
            onChange={e => setYear(Number(e.target.value))} 
            className="h-10 w-32 rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={today.getFullYear() - i}>{today.getFullYear() - i}</option>
            ))}
          </select>
        </div>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Total Bills</div>
              <div className="text-4xl font-bold text-[var(--color-text-primary)]">{summary.total_bills}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Monthly Total</div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">₹{summary.monthly_total.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] flex-1 overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs">Bills Generated</th>
                  <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.days.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors last:border-0">
                    <td className="p-4 font-bold text-[var(--color-text-primary)]">{d.date}</td>
                    <td className="p-4 text-[var(--color-text-secondary)]">{d.bills}</td>
                    <td className="p-4 text-right font-bold text-[var(--color-text-primary)]">₹{d.total.toFixed(2)}</td>
                  </tr>
                ))}
                {summary.days.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-[var(--color-text-secondary)]">
                      No bills found for this month.
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
