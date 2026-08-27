import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, XCircle, Printer } from 'lucide-react';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bills');
      setBills(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const viewBill = async (id) => {
    try {
      const res = await fetch(`/api/bills/${id}`);
      if (res.ok) {
        setSelectedBill(await res.json());
        setIsModalOpen(true);
      }
    } catch (e) { console.error(e); }
  };

  const cancelBill = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this bill? This will restore inventory and deduct customer purchases.")) return;
    try {
      const res = await fetch(`/api/bills/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        fetchBills();
        if (selectedBill && selectedBill.id === id) setIsModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to cancel bill");
      }
    } catch (e) { alert("Failed to cancel bill"); }
  };

  const filtered = bills.filter(b => 
    b.bill_number.toLowerCase().includes(search.toLowerCase()) || 
    (b.customer_name && b.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    b.date.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" style={{ width: '100%', paddingLeft: '2.5rem' }} placeholder="Search invoice, customer, date..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr> : 
             filtered.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{b.bill_number}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{b.date}</td>
                <td>{b.customer_name || 'Walk-in Customer'}</td>
                <td>{b.total_pieces}</td>
                <td style={{ fontWeight: 600 }}>₹{b.grand_total.toFixed(2)}</td>
                <td>{b.payment_mode}</td>
                <td>
                  <span className={`badge ${b.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => viewBill(b.id)} title="View Bill"><Eye size={16} /></button>
                    {b.status === 'Completed' && (
                      <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => cancelBill(b.id)} title="Cancel Bill"><XCircle size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bills found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedBill && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '600px', maxWidth: '90vw', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Invoice: {selectedBill.bill_number}</h2>
              <span className={`badge ${selectedBill.status === 'Completed' ? 'badge-success' : 'badge-danger'}`}>{selectedBill.status}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              <div>
                <div><strong>Date:</strong> {selectedBill.date}</div>
                <div><strong>Payment Mode:</strong> {selectedBill.payment_mode}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Customer:</strong> {selectedBill.customer_name}</div>
                <div><strong>Phone:</strong> {selectedBill.customer_phone || '-'}</div>
              </div>
            </div>

            <table style={{ width: '100%', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0' }}>Product</th>
                  <th style={{ padding: '0.5rem 0' }}>Qty</th>
                  <th style={{ padding: '0.5rem 0' }}>Price</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.5rem 0' }}>{item.product_name}</td>
                    <td style={{ padding: '0.5rem 0' }}>{item.quantity}</td>
                    <td style={{ padding: '0.5rem 0' }}>₹{item.price.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '250px', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Subtotal</span><span>₹{selectedBill.subtotal.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Discount</span><span>₹{selectedBill.discount.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Tax</span><span>₹{selectedBill.tax.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1.25rem' }}>
                  <span>Total</span><span color="var(--accent-primary)">₹{selectedBill.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Bills;
