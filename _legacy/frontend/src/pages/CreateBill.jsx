import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, CheckCircle } from 'lucide-react';

const CreateBill = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    const handleKeyDown = (e) => {
      if (e.key === 'F2') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F8') { e.preventDefault(); document.getElementById('btn-complete')?.click(); }
      if (e.key === 'Escape') { setSuccessData(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const res = products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
    setSearchResults(res);
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch (e) { console.error(e); }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_name === product.name);
      if (existing) {
        return prev.map(item => item.product_name === product.name 
          ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.rate } 
          : item
        );
      }
      return [...prev, {
        product_name: product.name,
        rate: product.default_rate,
        quantity: 1,
        amount: product.default_rate
      }];
    });
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const updateCartItem = (idx, field, value) => {
    setCart(prev => {
      const newCart = [...prev];
      const item = { ...newCart[idx] };
      item[field] = value;
      if (item.quantity < 1) item.quantity = 1;
      item.amount = item.quantity * item.rate;
      newCart[idx] = item;
      return newCart;
    });
  };

  const removeCartItem = (idx) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          items: cart
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create bill");
      
      setSuccessData(data);
      setCart([]);
      setCustomerName('');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Bill Generated!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Invoice: {successData.bill_number}</p>
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => setSuccessData(null)}>
            New Bill (F1)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-split" style={{ display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'flex-start' }}>
      
      <div className="glass-panel bill-left" style={{ flex: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              ref={searchInputRef}
              type="text" 
              className="form-input" 
              style={{ width: '100%', paddingLeft: '3rem', fontSize: '1.1rem' }}
              placeholder="Search product (F2)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                style={{ position: 'absolute', top: '100%', left: '1.5rem', right: '1.5rem', background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, marginTop: '0.5rem', overflow: 'hidden' }}>
                {searchResults.map(p => (
                  <div key={p.id} 
                    style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    onClick={() => addToCart(p)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontWeight: 600 }}>₹{p.default_rate.toFixed(2)}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Product</th>
                <th style={{ width: '80px' }}>Qty</th>
                <th style={{ width: '120px' }}>Rate (₹)</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td><div style={{ fontWeight: 500 }}>{item.product_name}</div></td>
                  <td>
                    <input type="number" className="form-input" style={{ width: '100%', padding: '0.25rem', textAlign: 'center' }} 
                           value={item.quantity} onChange={e => updateCartItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                  </td>
                  <td>
                    <input type="number" className="form-input" style={{ width: '100%', padding: '0.25rem' }} 
                           value={item.rate} onChange={e => updateCartItem(idx, 'rate', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => removeCartItem(idx)} className="btn btn-danger" style={{ padding: '0.5rem' }}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Cart is empty</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel bill-right" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-label">Customer Name (Optional)</label>
          <input type="text" className="form-input" style={{ width: '100%' }} placeholder="Will print only on Merchant copy"
                 value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>₹ {grandTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>TOTAL</span>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹ {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button id="btn-complete" disabled={isSubmitting || cart.length === 0} onClick={handleSubmit} className="btn btn-primary" style={{ padding: '1.25rem', fontSize: '1.2rem' }}>
          {isSubmitting ? 'Processing...' : 'GENERATE BILL (F8)'}
        </button>

      </div>
    </div>
  );
};

export default CreateBill;
