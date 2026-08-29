import Image from 'next/image'

export default function PaperBill({ billNumber, date, customerName, items, isMerchant, narration }: any) {
  
  const MIN_ROWS = 12
  const displayItems = [...(items || [])]
  while (displayItems.length < MIN_ROWS) {
    displayItems.push({ _empty: true })
  }

  const totalQuantity = (items || []).reduce((sum: number, i: any) => sum + (Number(i.quantity) || 0), 0)
  const grandTotal = (items || []).reduce((sum: number, i: any) => sum + i.amount, 0)

  return (
    <div className="w-full bg-white border border-[var(--color-border)] rounded-xl p-10 font-sans text-sm text-[var(--color-text-primary)] relative mx-auto">
      <div className="absolute top-10 right-10 text-[10px] font-bold text-slate-400 border border-slate-300 px-2 py-1 uppercase rounded-sm print:hidden">
        {isMerchant ? 'Merchant Copy' : 'Customer Copy'}
      </div>
      
      <div className="text-center mb-8 flex flex-col items-center">
        <Image src="/ganesha.png" alt="Ganesha" width={60} height={60} priority />
        <h2 className="font-bold text-xl leading-tight mt-2">Quotation</h2>
        <h3 className="uppercase tracking-widest text-sm text-[var(--color-text-secondary)]">INVOICE</h3>
        <h1 className="font-bold text-2xl tracking-wide mt-2 text-blue-900">SAGAR ELECTRICALS</h1>
      </div>

      <div className="flex justify-between font-semibold mb-6 text-sm">
        <div>No. &nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-normal text-[var(--color-text-secondary)]">{billNumber}</span></div>
        <div>Date: <span className="font-normal text-[var(--color-text-secondary)]">{date}</span></div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="font-semibold text-sm w-12 pt-2">M/s:</div>
        <div className="flex-1">
          <div className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] min-h-[38px] flex items-center">
            {isMerchant && customerName ? customerName : <span className="text-slate-300"></span>}
          </div>
        </div>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="grid grid-cols-[40px_80px_1fr_80px_60px_100px] bg-[var(--color-surface)] border-b border-[var(--color-border)] font-semibold text-center divide-x divide-[var(--color-border)] py-3 text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">
          <div>S.No.</div>
          <div>Qty</div>
          <div>DESCRIPTION OF GOODS</div>
          <div>Rate</div>
          <div>Disc</div>
          <div>Amount</div>
        </div>

        <div className="flex flex-col min-h-[400px] divide-y divide-[var(--color-border)]">
          {displayItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-[40px_80px_1fr_80px_60px_100px] divide-x divide-[var(--color-border)] h-10">
              {!item._empty ? (
                <>
                  <div className="flex items-center justify-center text-[var(--color-text-secondary)] font-medium text-xs">{idx + 1}</div>
                  <div className="p-1 flex items-center justify-center font-medium">{item.quantity} NOS</div>
                  <div className="p-1 px-2 flex items-center uppercase">{item.product_name}</div>
                  <div className="p-1 px-2 flex items-center justify-end font-medium">{item.rate.toFixed(2)}</div>
                  <div className="p-1 px-2 flex items-center justify-end font-medium">{item.discount || ''}</div>
                  <div className="px-3 flex items-center justify-end font-bold text-[var(--color-text-primary)]">{item.amount.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div></div><div></div><div></div><div></div><div></div><div></div>
                </>
              )}
            </div>
          ))}
        </div>

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

      <div className="mt-8 flex items-center gap-4">
        <div className="font-semibold text-sm w-20">Narration:</div>
        <div className="flex-1">
          <div className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] min-h-[38px] flex items-center">
            {narration}
          </div>
        </div>
      </div>

    </div>
  )
}
