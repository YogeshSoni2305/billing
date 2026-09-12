import Image from 'next/image'

export default function PaperBill({ billNumber, date, customerName, customerMobile, storeName = 'SAGAR ELECTRICALS', items, isMerchant, narration }: any) {
  
  const MIN_ROWS = 10 // Reduced empty rows to fit better on A6 height
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

  // Adjust grid columns for A6 width (approx 396px)
  const gridColsClass = hasDiscount 
    ? "grid-cols-[30px_1fr_40px_35px_50px]" 
    : "grid-cols-[30px_1fr_45px_55px]"

  return (
    <div className="w-[105mm] min-h-[148.5mm] bg-white border border-[var(--color-border)] rounded p-[4mm] font-sans text-[10px] text-[var(--color-text-primary)] relative mx-auto box-border print:border-none overflow-hidden flex flex-col">
      <div className="absolute top-2 right-2 text-[8px] font-bold text-slate-400 border border-slate-300 px-1 py-0.5 uppercase rounded-sm print:hidden">
        {isMerchant ? 'Merchant' : 'Customer'}
      </div>
      
      <div className="text-center mb-3 flex flex-col items-center shrink-0">
        <Image src="/ganesha.png" alt="Ganesha" width={30} height={30} priority />
        <h2 className="font-bold text-sm leading-tight mt-1">Quotation</h2>
        <h3 className="uppercase tracking-widest text-[8px] text-[var(--color-text-secondary)]">INVOICE</h3>
        {storeName && <h1 className="font-bold text-base tracking-wide mt-1 text-blue-900">{storeName}</h1>}
      </div>

      <div className="flex justify-between font-semibold mb-2 text-[9px] shrink-0">
        <div>No.: <span className="font-normal text-[var(--color-text-secondary)]">{billNumber}</span></div>
        <div>Date: <span className="font-normal text-[var(--color-text-secondary)]">{date}</span></div>
      </div>

      <div className="grid grid-cols-1 gap-1 mb-3 text-[9px] shrink-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold w-8">M/s:</div>
          <div className="flex-1 border-b border-dashed border-gray-300 min-h-[14px] flex items-end pb-0.5">
            {isMerchant && customerName ? customerName : <span className="text-slate-300"></span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-semibold w-8">Mob:</div>
          <div className="flex-1 border-b border-dashed border-gray-300 min-h-[14px] flex items-end pb-0.5">
            {isMerchant && customerMobile ? customerMobile : <span className="text-slate-300"></span>}
          </div>
        </div>
      </div>

      <div className="border border-[var(--color-border)] rounded-sm overflow-hidden flex-1 flex flex-col">
        <div className={`grid ${gridColsClass} bg-[var(--color-surface)] border-b border-[var(--color-border)] font-semibold text-center divide-x divide-[var(--color-border)] py-1.5 text-[8px] uppercase tracking-wider text-[var(--color-text-secondary)] leading-tight shrink-0`}>
          <div>Qty</div>
          <div>DESCRIPTION</div>
          <div>Rate</div>
          {hasDiscount && <div>Disc</div>}
          <div>Amount</div>
        </div>

        <div className="flex flex-col flex-1 divide-y divide-[var(--color-border)] text-[9px]">
          {displayItems.map((item, idx) => (
            <div key={idx} className={`grid ${gridColsClass} divide-x divide-[var(--color-border)] min-h-[22px]`}>
              {!item._empty ? (
                <>
                  <div className="px-0.5 flex items-center justify-center font-medium leading-tight">{item.quantity}</div>
                  <div className="px-1 flex items-center uppercase overflow-hidden leading-tight py-0.5">{item.product_name}</div>
                  <div className="px-1 flex items-center justify-end font-medium leading-tight">{item.rate.toFixed(2)}</div>
                  {hasDiscount && (
                    <div className="px-1 flex items-center justify-end font-medium leading-tight">
                      {item.discount || (() => {
                        const diff = (item.rate * item.quantity) - item.amount;
                        return diff > 0 ? (diff / item.quantity).toFixed(2) : '';
                      })()}
                    </div>
                  )}
                  <div className="px-1 flex items-center justify-end font-bold text-[var(--color-text-primary)] leading-tight">{item.amount.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div></div><div></div><div></div>{hasDiscount && <div></div>}<div></div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_50px_60px] border-t border-[var(--color-border)] divide-x divide-[var(--color-border)] h-10 bg-[var(--color-surface)] text-[9px] shrink-0">
          <div className="px-2 flex items-center justify-end font-medium text-[var(--color-text-secondary)]">
            Total Qty: <span className="font-bold ml-1 text-[var(--color-text-primary)]">{totalQuantity}</span>
          </div>
          <div className="flex flex-col justify-center px-1 text-[8px]">
            <div className="text-[var(--color-text-secondary)]">Total</div>
            <div className="font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Net</div>
          </div>
          <div className="flex flex-col justify-center text-right px-1">
            <div className="text-[var(--color-text-secondary)] text-[8px]">{grandTotal.toFixed(2)}</div>
            <div className="font-bold text-[var(--color-primary)] text-[10px]">{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[9px] shrink-0">
        <div className="font-semibold w-8 pt-0.5">Note:</div>
        <div className="flex-1 border-b border-dashed border-gray-300 min-h-[16px] leading-tight break-all pb-0.5">
          {narration}
        </div>
      </div>

    </div>
  )
}
