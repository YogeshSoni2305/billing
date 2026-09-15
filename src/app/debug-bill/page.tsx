'use client'

import React, { useEffect, useState } from 'react';
import PaperBill from '@/components/PaperBill';

export default function DebugBill() {
  const [debugOutput, setDebugOutput] = useState<string>('Running debug...');

  useEffect(() => {
    // Wait for fonts/images to load briefly
    setTimeout(() => {
      const billContainer = document.querySelector('.bill-page');
      if (!billContainer) {
        setDebugOutput('Bill container not found!');
        return;
      }

      const rect = billContainer.getBoundingClientRect();
      
      let out = '=== BILL CONTAINER ===\n';
      out += JSON.stringify({
        width: rect.width,
        height: rect.height,
        clientWidth: billContainer.clientWidth,
        clientHeight: billContainer.clientHeight,
        scrollWidth: billContainer.scrollWidth,
        scrollHeight: billContainer.scrollHeight,
        overflow_horizontal: billContainer.scrollWidth > billContainer.clientWidth,
        overflow_vertical: billContainer.scrollHeight > billContainer.clientHeight
      }, null, 2) + '\n\n';

      const sections = [
        { selector: '.text-center.mb-2', name: 'Header' },
        { selector: '.flex.justify-between.font-semibold.mb-2', name: 'Bill Meta' },
        { selector: '.flex.flex-col.gap-1.mb-2', name: 'Customer Info' },
        { selector: '.border.border-\\[\\#e2e8f0\\].rounded-sm', name: 'Table Container' }
      ];

      sections.forEach(({ selector, name }) => {
        const el = billContainer.querySelector(selector);
        if (el) {
          const r = el.getBoundingClientRect();
          out += `=== ${name.toUpperCase()} ===\n`;
          out += JSON.stringify({
            selector,
            height: r.height,
            clientHeight: el.clientHeight,
            scrollHeight: el.scrollHeight,
            overflow_vertical: el.scrollHeight > el.clientHeight,
            computed_style_height: window.getComputedStyle(el).height,
            computed_style_padding: window.getComputedStyle(el).padding
          }, null, 2) + '\n\n';
        }
      });

      const rows = billContainer.querySelectorAll('.flex.flex-col.flex-1.divide-y > div');
      out += `=== TABLE ROWS (count: ${rows.length}) ===\n`;
      if (rows.length > 0) {
        const firstRow = rows[0];
        const r = firstRow.getBoundingClientRect();
        out += `First row height: ${r.height}\n`;
        out += `Total row heights: ${r.height * rows.length}\n`;
        out += `Expected (17 × row_height): ${r.height * 17}\n`;
      }

      setDebugOutput(out);
    }, 1000); // 1 second delay to ensure layout is settled
  }, []);

  const dummyItems = Array(17).fill(null).map((_, i) => ({
    product_name: `Item ${i+1}`,
    quantity: 1,
    rate: 100,
    amount: 100
  }));

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div id="paper-bill-container" style={{ width: 397 }}>
        <PaperBill 
          billNumber="123"
          date="15-Sep-26"
          customerName="Test Customer"
          customerMobile="1234567890"
          storeName="SAGAR ELECTRICALS"
          items={dummyItems}
          isMerchant={false}
        />
      </div>
      <div>
        <pre id="debug-output" style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', minWidth: '400px', whiteSpace: 'pre-wrap' }}>
          {debugOutput}
        </pre>
      </div>
    </div>
  );
}
