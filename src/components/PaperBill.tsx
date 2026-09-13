import Image from 'next/image'

export default function PaperBill({ billNumber, date, customerName, customerMobile, storeName = 'SAGAR ELECTRICALS', items, isMerchant, narration }: any) {
  
  const MIN_ROWS = 18
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

  // Fixed widths for perfectly rendering within a 396px container (A6 width)
  const gridColsClass = hasDiscount 
    ? "grid-cols-[35px_1fr_50px_40px_60px]" 
    : "grid-cols-[40px_1fr_60px_70px]"

  return (
    <div className="w-[396px] min-h-[561px] bg-white text-[#0f172a] relative mx-auto flex flex-col px-4 py-3 text-[10px] font-sans box-border overflow-hidden">
      
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
        <div style={{ transform: 'rotate(-45deg)', color: 'rgba(0, 0, 0, 0.05)', fontSize: '75px', fontWeight: '900', letterSpacing: '0.1em' }}>
          FINOLEX
        </div>
      </div>

      {/* Header Area with Badge */}
      <div className="flex items-start mb-1 shrink-0 w-full">
        <div className="flex-1"></div>
        <div className="flex-[2] text-center flex flex-col items-center">
          <div className="w-[32px] h-[32px] relative">
            <Image src="/ganesha.png" alt="Ganesha" fill sizes="32px" style={{ objectFit: 'contain' }} priority />
          </div>
          <h2 className="font-bold text-sm leading-tight">Quotation</h2>
          <h3 className="uppercase tracking-widest text-[8px] text-[#64748b]">INVOICE</h3>
          {storeName && <h1 className="font-bold text-base tracking-wide text-[#1e3a8a]">{storeName}</h1>}
        </div>
        <div className="flex-1 flex justify-end">
          <div className="text-[8px] font-bold text-[#94a3b8] border border-[#cbd5e1] px-1.5 py-0.5 uppercase h-fit text-center whitespace-nowrap">
            {isMerchant ? 'Merchant Copy' : 'Customer Copy'}
          </div>
        </div>
      </div>

      {/* Bill Meta */}
      <div className="flex justify-between font-semibold mb-2 text-[10px] shrink-0 px-1">
        <div>No.: <span className="font-normal text-[#64748b]">{billNumber}</span></div>
        <div>Date: <span className="font-normal text-[#64748b]">{date}</span></div>
      </div>

      <div className="flex flex-col gap-1.5 mb-2 text-[10px] shrink-0 px-1">
        <div className="flex items-center gap-2">
          <div className="font-semibold w-8">M/s:</div>
          <div className="flex-1 border-b border-dashed border-[#d1d5db] pb-0.5 min-h-[16px] flex items-end">
            {customerName ? customerName : <span className="text-[#cbd5e1]"></span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-semibold w-8">Mob:</div>
          <div className="flex-1 border-b border-dashed border-[#d1d5db] pb-0.5 min-h-[16px] flex items-end">
            {customerMobile ? customerMobile : <span className="text-[#cbd5e1]"></span>}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e2e8f0] rounded-sm flex-1 flex flex-col overflow-hidden text-[9px]">
        
        {/* Table Header */}
        <div className={`grid ${gridColsClass} bg-[#f8fafc] border-b border-[#e2e8f0] font-semibold divide-x divide-[#e2e8f0] py-1 text-[8px] uppercase tracking-wider text-[#64748b] shrink-0 leading-tight`}>
          <div className="text-center">Qty</div>
          <div className="text-left px-1.5">DESCRIPTION</div>
          <div className="text-right px-1.5">Rate</div>
          {hasDiscount && <div className="text-right px-1.5">Disc</div>}
          <div className="text-right px-1.5">Amount</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col flex-1 divide-y divide-[#e2e8f0]">
          {displayItems.map((item, idx) => (
            <div key={idx} className={`grid ${gridColsClass} divide-x divide-[#e2e8f0] h-[18px] max-h-[18px] overflow-hidden`}>
              {!item._empty ? (
                <>
                  <div className="px-0.5 flex items-center justify-center font-medium overflow-hidden">{item.quantity}</div>
                  <div className="px-1.5 flex items-center justify-start uppercase overflow-hidden whitespace-nowrap text-ellipsis">{item.product_name}</div>
                  <div className="px-1.5 flex items-center justify-end font-medium overflow-hidden">{item.rate.toFixed(2)}</div>
                  {hasDiscount && (
                    <div className="px-1.5 flex items-center justify-end font-medium overflow-hidden">
                      {item.discount || (() => {
                        const diff = (item.rate * item.quantity) - item.amount;
                        return diff > 0 ? (diff / item.quantity).toFixed(2) : '';
                      })()}
                    </div>
                  )}
                  <div className="px-1.5 flex items-center justify-end font-bold overflow-hidden">{item.amount.toFixed(2)}</div>
                </>
              ) : (
                <>
                  <div className="h-full"></div><div className="h-full"></div><div className="h-full"></div>{hasDiscount && <div className="h-full"></div>}<div className="h-full"></div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Table Footer */}
        <div className="grid grid-cols-[1fr_60px_70px] border-t border-[#e2e8f0] divide-x divide-[#e2e8f0] h-7 bg-[#f8fafc] shrink-0">
          <div className="px-2 flex items-center justify-end font-medium text-[#64748b]">
            Total Qty: <span className="font-bold ml-1 text-[#0f172a]">{totalQuantity}</span>
          </div>
          <div className="flex flex-col justify-center px-1.5 text-[8px]">
            <div className="text-[#64748b]">Total</div>
            <div className="font-bold text-[#0f172a] uppercase tracking-wider">Net</div>
          </div>
          <div className="flex flex-col justify-center text-right px-1.5 text-[9px]">
            <div className="text-[#64748b] text-[8px]">{grandTotal.toFixed(2)}</div>
            <div className="font-bold text-[#10b981] text-[10px]">{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-2 flex items-start gap-2 shrink-0 px-1">
        <div className="font-semibold w-8 pt-0.5">Note:</div>
        <div className="flex-1 border-b border-dashed border-[#d1d5db] pb-0.5 min-h-[16px] flex items-end leading-tight break-all">
          {narration}
        </div>
      </div>

    </div>
  )
}
