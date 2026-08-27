import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const [history, setHistory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adjData, setAdjData] = useState({ product_id: '', change_amount: '', reason: '' });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, prodRes] = await Promise.all([
        fetch('/api/inventory/history'),
        fetch('/api/products')
      ]);
      setHistory(await histRes.json());
      setProducts(await prodRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: parseInt(adjData.product_id),
        change_amount: parseInt(adjData.change_amount),
        reason: adjData.reason
      };
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setAdjData({ product_id: '', change_amount: '', reason: '' });
        fetchData();
      }
    } catch (e) { alert("Failed to adjust inventory"); }
  };

  const lowStock = products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0);
  const outOfStock = products.filter(p => p.stock_quantity <= 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '1rem' }}><AlertTriangle size={20} /> Low Stock</h3>
          {lowStock.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>All products well stocked.</p> : 
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {lowStock.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{p.name} ({p.sku})</span> <span className="badge badge-warning">{p.stock_quantity} left</span>
                </li>
              ))}
            </ul>
          }
        </div>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1rem' }}><AlertTriangle size={20} /> Out of Stock</h3>
          {outOfStock.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No products out of stock.</p> : 
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {outOfStock.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{p.name} ({p.sku})</span> <span className="badge badge-danger">0 left</span>
                </li>
              ))}
            </ul>
          }
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Recent Inventory Movements</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Adjust Stock</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product (SKU)</th>
              <th>Change</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr> : 
             history.map(h => (
              <tr key={h.id}>
                <td style={{ color: 'var(--text-secondary)' }}>{h.created_at}</td>
                <td style={{ fontWeight: 500 }}>{h.product_name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({h.sku})</span></td>
                <td>
                  <span className={`badge ${h.change_amount > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {h.change_amount > 0 ? '+' : ''}{h.change_amount}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{h.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90vw', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Adjust Inventory</h2>
            <form onSubmit={handleAdjust}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select required className="form-input" value={adjData.product_id} onChange={e=>setAdjData({...adjData, product_id: e.target.value})}>
                  <option value="">Select a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.stock_quantity})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity to Add/Remove (Use negative to remove)</label>
                <input required type="number" className="form-input" value={adjData.change_amount} onChange={e=>setAdjData({...adjData, change_amount: e.target.value})} placeholder="e.g. 10 or -5" />
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <input required className="form-input" value={adjData.reason} onChange={e=>setAdjData({...adjData, reason: e.target.value})} placeholder="e.g. New Stock Arrival, Damaged, etc." />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Inventory;
