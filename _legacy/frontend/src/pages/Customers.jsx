import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Search, User } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      setCustomers(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ name: customer.name, phone: customer.phone || '', email: customer.email || '', id: customer.id });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (e) { alert("Failed to save customer"); }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" style={{ width: '100%', paddingLeft: '2.5rem' }} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Add Customer</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Purchases</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr> : 
             filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '50%' }}><User size={16} /></div>
                  {c.name}
                </td>
                <td>{c.phone || '-'}</td>
                <td>{c.email || '-'}</td>
                <td style={{ fontWeight: 600 }}>₹{c.total_purchases.toFixed(2)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.created_at.split(' ')[0]}</td>
                <td><button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => openModal(c)}><Edit2 size={16} /></button></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '400px', maxWidth: '90vw', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Name *</label><input required className="form-input" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Customers;
