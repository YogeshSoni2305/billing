'use client'

import { useState, useEffect } from 'react'
import { getMonthlySummary } from '../actions'
import PaperBill from '@/components/PaperBill'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export default function MonthlySummary() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewingBill, setViewingBill] = useState<any>(null)

  const generatePDF = () => {
    const element = document.getElementById('modal-paper-bill-container');
    if (!element) return;

    const origin = window.location.origin;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print the bill.");
      return;
    }

    const clone = element.cloneNode(true) as HTMLElement;
    const badElements = clone.querySelectorAll('iframe, script, style, noscript, [id^="ext-"], [class^="ext-"], [id*="extension"], [class*="extension"], grammarly-extension, [data-extension]');
    badElements.forEach(el => el.remove());

    printWindow.document.open();
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Bill_${viewingBill?.billNumber || 'receipt'}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 105mm; height: 148mm; background: white; }
  @page { size: 105mm 148mm; margin: 0; }
  @media print { 
    -webkit-print-color-adjust: exact !important; 
    print-color-adjust: exact !important; 
    body > *:not(.bill-page) { display: none !important; }
    iframe, [id^="ext-"], [class^="ext-"], [id*="extension"], [class*="extension"], grammarly-extension { display: none !important; }
  }
  .bill-page + .bill-page { page-break-before: always; break-before: page; }
</style>
</head>
<body>
${clone.innerHTML.replace(/src="\//g, `src="${origin}/`).replace(/srcset="[^"]*"/g, '')}
</body>
</html>`);
    printWindow.document.close();

    const imgs = Array.from(printWindow.document.querySelectorAll('img'));
    const loaded = imgs.map(img =>
      img.complete ? Promise.resolve() : new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); })
    );
    Promise.all(loaded).then(() => {
      printWindow.onafterprint = () => {
        printWindow.close();
        setViewingBill(null);
      };

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    });
  }


  useEffect(() => {
    let active = true
    setLoading(true)
    getMonthlySummary(year, month).then(res => {
      if (!active) return
      setSummary(res)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [year, month])

  return (
    <div className="flex flex-col gap-6 h-full relative">
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

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          <span className="ml-3 font-medium">Loading summary...</span>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Total Bills</div>
              <div className="text-4xl font-bold text-[var(--color-text-primary)]">{String(summary?.total_bills || 0)}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-border)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Monthly Total</div>
              <div className="text-4xl font-bold text-[var(--color-primary)]">₹{Number(summary?.monthly_total || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex flex-col gap-6">
            {(summary?.days || []).map((d: any, i: number) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden shrink-0">
                <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] p-4 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--color-text-primary)] text-lg">
                    {d?.date ? new Date(d.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                  </h3>
                  <div className="flex gap-6 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Bills: <strong className="text-[var(--color-text-primary)]">{d?.bills?.length || 0}</strong></span>
                    <span className="text-[var(--color-text-secondary)]">Total: <strong className="text-[var(--color-primary)] text-base">₹{Number(d?.total || 0).toFixed(2)}</strong></span>
                  </div>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      <th className="p-3 pl-4 font-semibold uppercase tracking-wider text-xs">Bill No</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-xs">Time</th>
                      <th className="p-3 font-semibold uppercase tracking-wider text-xs text-right">Amount</th>
                      <th className="p-3 pr-4 font-semibold uppercase tracking-wider text-xs text-center w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d?.bills || []).map((b: any, j: number) => (
                      <tr key={j} className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors last:border-0">
                        <td className="p-3 pl-4 font-bold text-[var(--color-text-primary)]">{String(b?.bill_number || '')}</td>
                        <td className="p-3 text-[var(--color-text-secondary)]">{b?.timestamp ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                        <td className="p-3 text-right font-bold text-[var(--color-text-primary)]">₹{Number(b?.total_amount || 0).toFixed(2)}</td>
                        <td className="p-3 pr-4 text-center">
                          <Button variant="tertiary" size="sm" onClick={() => setViewingBill(b)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {(summary?.days || []).length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-8 text-center text-[var(--color-text-secondary)]">
                No bills found for this month.
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Bill View Modal */}
      <Modal 
        isOpen={!!viewingBill} 
        onClose={() => setViewingBill(null)}
        title={`Invoice: ${viewingBill?.bill_number || ''}`}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewingBill(null)}>Close</Button>
            <Button onClick={generatePDF}>Print Bill</Button>
          </>
        }
      >
        <div className="flex justify-center -mx-6 -mt-2">
          {viewingBill ? (
            <div id="modal-paper-bill-container" style={{ width: 397 }} className="flex flex-col items-center">
              <PaperBill 
                billNumber={viewingBill.bill_number}
                date={new Date(viewingBill.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                customerName={viewingBill.customer_name} 
                items={viewingBill.items}
                isMerchant={false} 
              />

              <PaperBill 
                billNumber={viewingBill.bill_number}
                date={new Date(viewingBill.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}
                customerName={viewingBill.customer_name} 
                items={viewingBill.items}
                isMerchant={true} 
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
