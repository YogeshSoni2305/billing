import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', default_rate: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      setProducts(await res.json());
    } catch (e) { console.error(e); }
  };

  const openModal = (product = null) => {
    if (product) {
      setFormData({ name: product.name, default_rate: product.default_rate, id: product.id });
    } else {
      setFormData({ name: '', default_rate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (e) { alert("Failed to save product"); }
  };

  const deleteProduct = async (id) => {
    if(!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) { alert("Failed to delete"); }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <input type="text" className="form-input" style={{ width: '300px' }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add Product</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Default Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
             {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>₹{p.default_rate.toFixed(2)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => openModal(p)}><Edit2 size={16} /></button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{formData.id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Product Name *</label><input required className="form-input" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Default Rate *</label><input required type="number" step="0.01" className="form-input" value={formData.default_rate} onChange={e=>setFormData({...formData, default_rate: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
