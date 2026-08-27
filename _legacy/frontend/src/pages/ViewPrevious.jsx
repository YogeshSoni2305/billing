import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Printer, FileText } from 'lucide-react';

const ViewPrevious = () => {
  const [mode, setMode] = useState('bill');
  const [query, setQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/invoices?mode=${mode}&query=${query}`);
        const data = await res.json();
        setInvoices(data);
      } catch (e) {
        setInvoices([]);
      }
      setLoading(false);
    };
    
    // Add a slight debounce for search
    const timer = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(timer);
  }, [mode, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={`btn ${mode === 'bill' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('bill')}>
            BILLS
          </button>
          <button className={`btn ${mode === 'receipt' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('receipt')}>
            RECEIPTS
          </button>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search Bill No or Date..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }} 
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{mode.toUpperCase()} NO</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount (₹)</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                No records found.
              </td></tr>
            ) : (
              invoices.map((inv, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  key={inv.id}
                >
                  <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{inv.bill_number}</td>
                  <td>{inv.date}</td>
                  <td>
                    <div>{inv.customer_name || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.customer_phone}</div>
                  </td>
                  <td>{inv.total_pieces}</td>
                  <td style={{ fontWeight: 600 }}>{inv.grand_total.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${inv.payment_mode === 'CASH' ? 'badge-success' : inv.payment_mode === 'SPLIT' ? 'badge-warning' : 'badge-primary'}`} style={{ border: '1px solid currentColor' }}>
                      {inv.payment_mode}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ViewPrevious;
