import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, IndianRupee, FileText } from 'lucide-react';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: todayStr, end: todayStr });

  useEffect(() => { fetchReport(); }, [dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/sales?start_date=${dateRange.start}&end_date=${dateRange.end}`);
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const setPreset = (preset) => {
    const today = new Date();
    let start = new Date();
    
    if (preset === 'today') { start = today; }
    else if (preset === 'yesterday') { start.setDate(start.getDate() - 1); today.setDate(today.getDate() - 1); }
    else if (preset === 'week') { start.setDate(start.getDate() - 7); }
    else if (preset === 'month') { start.setDate(start.getDate() - 30); }
    
    setDateRange({ start: start.toISOString().split('T')[0], end: today.toISOString().split('T')[0] });
  };

  const StatBox = ({ title, value, color = 'var(--text-primary)' }) => (
    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
        </div>
        <div>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button className="btn btn-secondary" onClick={() => setPreset('today')}>Today</button>
          <button className="btn btn-secondary" onClick={() => setPreset('yesterday')}>Yesterday</button>
          <button className="btn btn-secondary" onClick={() => setPreset('week')}>Last 7 Days</button>
          <button className="btn btn-secondary" onClick={() => setPreset('month')}>Last 30 Days</button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Report...</div> : 
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatBox title="Total Sales" value={`₹ ${stats?.totals?.total_sales?.toFixed(2) || '0.00'}`} color="var(--accent-primary)" />
          <StatBox title="Number of Bills" value={stats?.totals?.total_invoices || 0} />
          <StatBox title="Items Sold" value={stats?.totals?.total_pieces || 0} />
          <StatBox title="Discounts" value={`₹ ${stats?.totals?.total_discount?.toFixed(2) || '0.00'}`} color="var(--danger)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={20} /> Payment Breakdown
            </h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {stats?.payments?.map(p => (
                <div key={p.payment_method} style={{ padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', flex: 1, border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{p.payment_method}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹ {p.total?.toFixed(2)}</div>
                </div>
              ))}
              {(!stats?.payments || stats.payments.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No payment data for this period.</div>}
            </div>
          </div>
        </div>
      </>}

    </motion.div>
  );
};

export default Reports;
