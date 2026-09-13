import Image from 'next/image'

export default function PaperBill({ billNumber, date, customerName, customerMobile, storeName = 'SAGAR ELECTRICALS', items, isMerchant, narration }: any) {
  
  const MIN_ROWS = 10
  const displayItems = [...(items || [])]
  while (displayItems.length < MIN_ROWS) {
    displayItems.push({ _empty: true })
  }

  const totalQuantity = (items || []).length
  const grandTotal = (items || []).reduce((sum: number, i: any) => sum + i.amount, 0)

  const hasDiscount = (items || []).some((item: any) => {
    if (item.discount) return true;
    if (item.rate && item.quantity && item.amount) {
      const diff = (item.rate * item.quantity) - item.amount;
      return diff > 0;
    }
    return false;
  })

  // Dual grid config: Screen (Large) vs Print (A6 Small)
  const gridColsClass = hasDiscount 
    ? "grid-cols-[80px_1fr_80px_60px_100px] print:grid-cols-[30px_1fr_40px_35px_50px]" 
    : "grid-cols-[80px_1fr_80px_100px] print:grid-cols-[30px_1fr_45px_55px]"

  return (
    <div className="w-full bg-white border border-[var(--color-border)] rounded-xl p-10 font-sans text-sm text-[var(--color-text-primary)] relative mx-auto print:border-none print:w-[105mm] print:min-h-[148.5mm] print:p-[4mm] print:text-[8px] print:overflow-hidden print:flex print:flex-col box-border">
      
      <div className="absolute top-10 right-10 text-[10px] font-bold text-slate-400 border border-slate-300 px-2 py-1 uppercase rounded-sm print:hidden">
        {isMerchant ? 'Merchant Copy' : 'Customer Copy'}
      </div>
      
      <div className="text-center mb-8 print:mb-3 flex flex-col items-center print:shrink-0">
        <div className="w-[60px] h-[60px] print:w-[30px] print:h-[30px] relative">
          <Image src="/ganesha.png" alt="Ganesha" fill style={{ objectFit: 'contain' }} priority />
        </div>
        <h2 className="font-bold text-xl print:text-sm leading-tight mt-2 print:mt-1">Quotation</h2>
        <h3 className="uppercase tracking-widest text-sm print:text-[8px] text-[var(--color-text-secondary)]">INVOICE</h3>
        {storeName && <h1 className="font-bold text-2xl print:text-base tracking-wide mt-2 print:mt-1 text-blue-900">{storeName}</h1>}
      </div>

      <div className="flex justify-between font-semibold mb-6 print:mb-2 text-sm print:text-[9px] print:shrink-0">
        <div>No.: <span className="font-normal text-[var(--color-text-secondary)]">{billNumber}</span></div>
        <div>Date: <span className="font-normal text-[var(--color-text-secondary)]">{date}</span></div>
      </div>

      <div className="grid grid-cols-2 gap-8 print:grid-cols-1 print:gap-1 mb-8 print:mb-3 print:text-[9px] print:shrink-0">
        <div className="flex items-center gap-4 print:gap-2">
          <div className="font-semibold text-sm print:text-[9px] w-12 print:w-8 print:pt-0 pt-2">M/s:</div>
          <div className="flex-1">
            <div className="w-full rounded-md border border-[var(--color-border)] print:border-none print:border-b print:border-dashed print:border-gray-300 print:rounded-none bg-white px-3 py-2 print:px-0 print:py-0 print:pb-0.5 text-sm print:text-[9px] text-[var(--color-text-primary)] min-h-[38px] print:min-h-[14px] flex items-center print:items-end">
              {isMerchant && customerName ? customerName : <span className="text-slate-300"></span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 print:gap-2">
          <div className="font-semibold text-sm print:text-[9px] w-20 print:w-8 print:pt-0 pt-2">Mob:</div>
          <div className="flex-1">
            <div className="w-full rounded-md border border-[var(--color-border)] print:border-none print:border-b print:border-dashed print:border-gray-300 print:rounded-none bg-white px-3 py-2 print:px-0 print:py-0 print:pb-0.5 text-sm print:text-[9px] text-[var(--color-text-primary)] min-h-[38px] print:min-h-[14px] flex items-center print:items-end">
              {isMerchant && customerMobile ? customerMobile : <span className="text-slate-300"></span>}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg print:rounded-sm overflow-hidden print:flex-1 print:flex print:flex-col">
        <div className={`grid ${gridColsClass} bg-[var(--color-surface)] border-b border-[var(--color-border)] font-semibold text-center divide-x divide-[var(--color-border)] py-3 print:py-1.5 text-xs print:text-[8px] uppercase tracking-wider text-[var(--color-text-secondary)] print:shrink-0 print:leading-tight`}>
          <div>Qty</div>
          <div>DESCRIPTION</div>
          <div>Rate</div>
          {hasDiscount && <div>Disc</div>}
          <div>Amount</div>
        </div>

        <div className="flex flex-col min-h-[400px] print:min-h-0 print:flex-1 divide-y divide-[var(--color-border)] print:text-[9px]">
          {displayItems.map((item, idx) => (
            <div key={idx} className={`grid ${gridColsClass} divide-x divide-[var(--color-border)] h-10 print:h-auto print:min-h-[22px]`}>
              {!item._empty ? (
                <>
                  <div className="p-1 print:p-0.5 flex items-center justify-center font-medium print:leading-tight">{item.quantity} <span className="print:hidden ml-1">NOS</span></div>
                  <div className="p-1 px-2 print:px-1 flex items-center uppercase print:leading-tight print:overflow-hidden">{item.product_name}</div>
                  <div className="p-1 px-2 print:px-1 flex items-center justify-end font-medium print:leading-tight">{item.rate.toFixed(2)}</div>
                  {hasDiscount && (
                    <div className="p-1 px-2 print:px-1 flex items-center justify-end font-medium print:leading-tight">
                      {item.discount || (() => {
                        const diff = (item.rate * item.quantity) - item.amount;
                        return diff > 0 ? (diff / item.quantity).toFixed(2) : '';
                      })()}
                    </div>
                  )}
                  <div className="px-3 print:px-1 flex items-center justify-end font-bold text-[var(--color-text-primary)] print:leading-tight">{item.amount.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div></div><div></div><div></div>{hasDiscount && <div></div>}<div></div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_160px_100px] print:grid-cols-[1fr_50px_60px] border-t border-[var(--color-border)] divide-x divide-[var(--color-border)] h-16 print:h-10 bg-[var(--color-surface)] print:shrink-0 print:text-[9px]">
          <div className="p-4 print:p-0 print:px-2 flex items-center justify-end font-medium text-[var(--color-text-secondary)] text-sm print:text-[9px]">
            Total Qty: <span className="font-bold ml-2 print:ml-1 text-[var(--color-text-primary)]">{totalQuantity}</span>
          </div>
          <div className="flex flex-col justify-center px-4 print:px-1 text-xs print:text-[8px]">
            <div className="text-[var(--color-text-secondary)]">Total</div>
            <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Net</div>
          </div>
          <div className="flex flex-col justify-center text-right px-4 print:px-1 text-sm print:text-[10px]">
            <div className="text-[var(--color-text-secondary)] print:text-[8px]">{grandTotal.toFixed(2)}</div>
            <div className="font-bold text-[var(--color-primary)] text-base print:text-[10px]">{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 print:mt-3 flex items-center print:items-start gap-4 print:gap-2 print:shrink-0">
        <div className="font-semibold text-sm print:text-[9px] w-20 print:w-8 print:pt-0.5">Note:</div>
        <div className="flex-1">
          <div className="w-full rounded-md border border-[var(--color-border)] print:border-none print:border-b print:border-dashed print:border-gray-300 print:rounded-none bg-white px-3 py-2 print:px-0 print:py-0 print:pb-0.5 text-sm print:text-[9px] text-[var(--color-text-primary)] min-h-[38px] print:min-h-[16px] flex items-center print:items-end print:leading-tight print:break-all">
            {narration}
          </div>
        </div>
      </div>

    </div>
  )
}
