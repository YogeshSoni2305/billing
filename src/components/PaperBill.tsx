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

  // Fixed widths for 396px (A6 width at 96dpi)
  const gridColsClass = hasDiscount
    ? 'grid-cols-[34px_1fr_48px_38px_58px]'
    : 'grid-cols-[34px_1fr_58px_68px]'

  return (
    // Exact A6 = 396 × 561 px. Use h-[561px] so it never grows past one page.
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
         className="w-[396px] h-[561px] bg-white text-[#0f172a] relative mx-auto flex flex-col px-3 py-2 box-border overflow-hidden">

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <div style={{ transform: 'rotate(-45deg)', color: 'rgba(0,0,0,0.04)', fontSize: '72px', fontWeight: 900, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          FINOLEX
        </div>
      </div>

      {/* ── HEADER ── */}
      <div className="flex items-start shrink-0 w-full mb-1">
        {/* Left spacer */}
        <div className="flex-1" />
        {/* Centre: logo + title */}
        <div className="flex-[2] text-center flex flex-col items-center">
          <div className="w-[30px] h-[30px] relative">
            <Image src="/ganesha.png" alt="Ganesha" fill sizes="30px" style={{ objectFit: 'contain' }} priority />
          </div>
          <h2 className="font-bold leading-none" style={{ fontSize: '11px', marginTop: '1px' }}>Quotation</h2>
          <p className="uppercase tracking-widest text-[#64748b]" style={{ fontSize: '7px' }}>INVOICE</p>
          {storeName && (
            <h1 className="font-bold text-[#1e3a8a] leading-tight" style={{ fontSize: '12px' }}>{storeName}</h1>
          )}
        </div>
        {/* Right: copy badge */}
        <div className="flex-1 flex justify-end items-start pt-0.5">
          <span className="text-[7px] font-bold text-[#94a3b8] border border-[#cbd5e1] px-1 py-0.5 uppercase tracking-wide leading-none whitespace-nowrap">
            {isMerchant ? 'Merchant Copy' : 'Customer Copy'}
          </span>
        </div>
      </div>

      {/* ── BILL META ── */}
      <div className="flex justify-between font-semibold shrink-0 px-1 mb-1" style={{ fontSize: '9px' }}>
        <span>No.: <span className="font-normal text-[#64748b]">{billNumber}</span></span>
        <span>Date: <span className="font-normal text-[#64748b]">{date}</span></span>
      </div>

      {/* ── CUSTOMER INFO ── */}
      <div className="flex flex-col shrink-0 px-1 mb-1" style={{ fontSize: '9px', gap: '3px' }}>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold w-7">M/s:</span>
          <span className="flex-1 border-b border-dashed border-[#d1d5db] pb-px min-h-[12px] flex items-end leading-none">
            {customerName || ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold w-7">Mob:</span>
          <span className="flex-1 border-b border-dashed border-[#d1d5db] pb-px min-h-[12px] flex items-end leading-none">
            {customerMobile || ''}
          </span>
        </div>
      </div>

      {/* ── TABLE: flex-1 so it fills all remaining vertical space ── */}
      <div className="border border-[#e2e8f0] flex-1 flex flex-col overflow-hidden" style={{ fontSize: '8.5px' }}>

        {/* Table Header */}
        <div className={`grid ${gridColsClass} shrink-0 bg-[#f1f5f9] border-b border-[#e2e8f0] divide-x divide-[#e2e8f0] font-bold text-[#475569] uppercase tracking-wide`}
             style={{ fontSize: '7.5px', padding: '3px 0' }}>
          <div className="text-center">Qty</div>
          <div className="px-1.5">Description</div>
          <div className="text-right px-1.5">Rate</div>
          {hasDiscount && <div className="text-right px-1.5">Disc</div>}
          <div className="text-right px-1.5">Amount</div>
        </div>

        {/* Table Body — rows auto-distribute remaining height */}
        <div className="flex-1 flex flex-col divide-y divide-[#e2e8f0] overflow-hidden">
          {displayItems.map((item, idx) => (
            <div key={idx} className={`grid ${gridColsClass} divide-x divide-[#e2e8f0] flex-1 overflow-hidden`}
                 style={{ minHeight: 0 }}>
              {!item._empty ? (
                <>
                  <div className="flex items-center justify-center font-medium overflow-hidden">{item.quantity}</div>
                  <div className="px-1.5 flex items-center font-medium uppercase overflow-hidden whitespace-nowrap"
                       style={{ textOverflow: 'ellipsis' }}>{item.product_name}</div>
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
                  <div /><div /><div />
                  {hasDiscount && <div />}
                  <div />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Table Footer */}
        <div className="grid grid-cols-[1fr_58px_68px] shrink-0 border-t border-[#e2e8f0] divide-x divide-[#e2e8f0] bg-[#f8fafc]"
             style={{ height: '26px' }}>
          <div className="px-2 flex items-center justify-end font-medium text-[#64748b]">
            Total Qty: <span className="font-bold ml-1 text-[#0f172a]">{totalQuantity}</span>
          </div>
          <div className="flex flex-col justify-center px-1.5" style={{ fontSize: '7px' }}>
            <div className="text-[#64748b]">Total</div>
            <div className="font-bold text-[#0f172a] uppercase tracking-wide">Net</div>
          </div>
          <div className="flex flex-col justify-center text-right px-1.5">
            <div className="text-[#64748b]" style={{ fontSize: '7px' }}>{grandTotal.toFixed(2)}</div>
            <div className="font-bold text-[#10b981]" style={{ fontSize: '9px' }}>{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* ── NOTE ── */}
      <div className="flex items-center gap-1.5 shrink-0 px-1 mt-1" style={{ fontSize: '8.5px' }}>
        <span className="font-semibold w-7">Note:</span>
        <span className="flex-1 border-b border-dashed border-[#d1d5db] pb-px min-h-[11px] flex items-end leading-none">
          {narration}
        </span>
      </div>

    </div>
  )
}
