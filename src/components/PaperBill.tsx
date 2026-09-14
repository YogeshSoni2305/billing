import Image from 'next/image'

export default function PaperBill({ billNumber, date, customerName, customerMobile, storeName = 'SAGAR ELECTRICALS', items, isMerchant, narration }: any) {
  // ─── GEOMETRY (all in px, A6 = 397 × 560 max) ──────────────────────────────
  const PX = 10  // horizontal padding
  const PY = 6   // vertical top + bottom padding

  const HEADER_H   = 50   // logo + store header
  const META_H     = 14   // No. / Date row
  const CUSTOMER_H = 26   // M/s + Mobile
  const TBL_HEAD_H = 16   // column labels
  const TBL_FOOT_H = 22   // Total qty / Net amount
  const NOTE_H     = 14   // Note row

  const G1 = 3  // after header
  const G2 = 2  // after meta
  const G3 = 2  // after customer
  const G4 = 2  // between table and note

  const MIN_ROWS = 18
  const usedPx = PY + HEADER_H + G1 + META_H + G2 + CUSTOMER_H + G3
               + TBL_HEAD_H + TBL_FOOT_H + G4 + NOTE_H + PY + 2
  const availableForRows = 525 - usedPx
  const ROW_H = Math.floor(availableForRows / MIN_ROWS) // ~21px

  const displayItems = [...(items || [])]
  while (displayItems.length < MIN_ROWS) displayItems.push({ _empty: true })

  const totalQuantity = (items || []).length
  const grandTotal    = (items || []).reduce((sum: number, i: any) => sum + i.amount, 0)

  const hasDiscount = (items || []).some((item: any) => {
    if (item.discount) return true
    if (item.rate && item.quantity && item.amount)
      return (item.rate * item.quantity) - item.amount > 0
    return false
  })

  // Column widths
  const cols = hasDiscount
    ? { qty: 32, desc: undefined, rate: 50, disc: 40, amt: 58 }
    : { qty: 32, desc: undefined, rate: 56, disc: 0,  amt: 64 }

  // Cell base style
  const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    borderRight: '1px solid #e2e8f0',
    ...extra,
  })

  const FONT = "'Arial', sans-serif"

  return (
    <div className="bill-page" style={{
      width: 397,
      minWidth: 397,
      height: 560,
      minHeight: 560,
      background: '#fff',
      color: '#0f172a',
      fontFamily: FONT,
      fontSize: 9,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: `${PY}px ${PX}px`,
      display: 'flex',
      flexDirection: 'column',
      margin: '0 auto',
    }}>

      {/* WATERMARK */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        <span style={{
          transform: 'rotate(-45deg)',
          color: 'rgba(0,0,0,0.04)',
          fontSize: 72, fontWeight: 900,
          letterSpacing: 8, whiteSpace: 'nowrap',
          fontFamily: FONT,
        }}>FINOLEX</span>
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{ height: HEADER_H, flexShrink: 0, display: 'flex', alignItems: 'flex-start', marginBottom: G1 }}>
        {/* left spacer: 100px */}
        <div style={{ width: 100 }} />
        {/* centre: 172px */}
        <div style={{ width: 172, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, position: 'relative' }}>
            <Image src="/ganesha.png" alt="Ganesha" fill sizes="28px" style={{ objectFit: 'contain' }} priority />
          </div>
          <div style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.1 }}>Quotation</div>
          <div style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, lineHeight: 1.1 }}>INVOICE</div>
          {storeName && (
            <div style={{ fontWeight: 800, fontSize: 12, color: '#1e3a8a', lineHeight: 1.2, letterSpacing: 0.5 }}>
              {storeName}
            </div>
          )}
        </div>
        {/* right badge: 100px */}
        <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end', paddingTop: 2 }}>
          <span style={{
            fontSize: 7, fontWeight: 700, color: '#94a3b8',
            border: '1px solid #cbd5e1', padding: '2px 4px',
            textTransform: 'uppercase', letterSpacing: 1,
            whiteSpace: 'nowrap', lineHeight: 1,
          }}>
            {isMerchant ? 'Merchant Copy' : 'Customer Copy'}
          </span>
        </div>
      </div>

      {/* ── BILL META ──────────────────────────────────────────────── */}
      <div style={{
        height: META_H, flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontWeight: 600, fontSize: 9, marginBottom: G2,
      }}>
        <span>No.: <span style={{ fontWeight: 400, color: '#64748b' }}>{billNumber}</span></span>
        <span>Date: <span style={{ fontWeight: 400, color: '#64748b' }}>{date}</span></span>
      </div>

      {/* ── CUSTOMER INFO ──────────────────────────────────────────── */}
      <div style={{ height: CUSTOMER_H, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', marginBottom: G3 }}>
        {[
          { label: 'M/s:', value: customerName },
          { label: 'Mob:', value: customerMobile },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontWeight: 600, width: 28, flexShrink: 0, fontSize: 9 }}>{label}</span>
            <span style={{
              flex: 1,
              borderBottom: '1px dashed #d1d5db',
              paddingBottom: 1,
              fontSize: 9,
              lineHeight: 1,
              minHeight: 11,
              display: 'flex', alignItems: 'flex-end',
            }}>{value || ''}</span>
          </div>
        ))}
      </div>

      {/* ── TABLE ──────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, border: '1px solid #e2e8f0' }}>

        {/* Table Header */}
        <div style={{
          display: 'flex', height: TBL_HEAD_H,
          background: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 700, fontSize: 7.5,
          color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div style={{ ...cell({ justifyContent: 'center', width: cols.qty }) }}>Qty</div>
          <div style={{ ...cell({ paddingLeft: 5, flex: 1 }) }}>Description</div>
          <div style={{ ...cell({ justifyContent: 'flex-end', paddingRight: 4, width: cols.rate }) }}>Rate</div>
          {hasDiscount && <div style={{ ...cell({ justifyContent: 'flex-end', paddingRight: 4, width: cols.disc }) }}>Disc</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, width: cols.amt, overflow: 'hidden' }}>Amt</div>
        </div>

        {/* Data Rows */}
        {displayItems.map((item: any, idx: number) => (
          <div key={idx} style={{
            display: 'flex', height: ROW_H,
            borderBottom: idx < displayItems.length - 1 ? '1px solid #e2e8f0' : 'none',
            background: idx % 2 === 0 ? '#fff' : '#fafafa',
          }}>
            {!item._empty ? (
              <>
                <div style={{ ...cell({ justifyContent: 'center', width: cols.qty, fontWeight: 600, fontSize: 8.5 }) }}>{item.quantity}</div>
                <div style={{ ...cell({ paddingLeft: 5, flex: 1, fontSize: 8.5, fontWeight: 500, textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }) }}>{item.product_name}</div>
                <div style={{ ...cell({ justifyContent: 'flex-end', paddingRight: 4, width: cols.rate, fontWeight: 500, fontSize: 8.5 }) }}>{item.rate.toFixed(2)}</div>
                {hasDiscount && (
                  <div style={{ ...cell({ justifyContent: 'flex-end', paddingRight: 4, width: cols.disc, fontWeight: 500, fontSize: 8.5 }) }}>
                    {item.discount || (() => {
                      const diff = (item.rate * item.quantity) - item.amount
                      return diff > 0 ? (diff / item.quantity).toFixed(2) : ''
                    })()}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 4, width: cols.amt, fontWeight: 700, fontSize: 8.5, overflow: 'hidden' }}>{item.amount.toFixed(2)}</div>
              </>
            ) : (
              <>
                <div style={{ width: cols.qty, borderRight: '1px solid #e2e8f0' }} />
                <div style={{ flex: 1, borderRight: '1px solid #e2e8f0' }} />
                <div style={{ width: cols.rate, borderRight: '1px solid #e2e8f0' }} />
                {hasDiscount && <div style={{ width: cols.disc, borderRight: '1px solid #e2e8f0' }} />}
                <div style={{ width: cols.amt }} />
              </>
            )}
          </div>
        ))}

        {/* Table Footer */}
        <div style={{
          display: 'flex', height: TBL_FOOT_H,
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, fontSize: 8.5, color: '#64748b', fontWeight: 500, borderRight: '1px solid #e2e8f0' }}>
            Total Qty: <span style={{ fontWeight: 700, color: '#0f172a', marginLeft: 4 }}>{totalQuantity}</span>
          </div>
          <div style={{ width: 58, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 4, borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 7, color: '#64748b' }}>Total</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Net</div>
          </div>
          <div style={{ width: cols.amt, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 4 }}>
            <div style={{ fontSize: 7, color: '#64748b' }}>{grandTotal.toFixed(2)}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#10b981' }}>{grandTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* ── NOTE ───────────────────────────────────────────────────── */}
      <div style={{ height: NOTE_H, flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: G4 }}>
        <span style={{ fontWeight: 600, fontSize: 8.5, width: 28, flexShrink: 0 }}>Note:</span>
        <span style={{
          flex: 1, borderBottom: '1px dashed #d1d5db', paddingBottom: 1,
          fontSize: 8.5, lineHeight: 1, display: 'flex', alignItems: 'flex-end',
        }}>{narration}</span>
      </div>

    </div>
  )
}
