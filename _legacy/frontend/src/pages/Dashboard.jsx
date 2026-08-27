import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, IndianRupee, Box, ShoppingCart, List } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/reports/sales?start_date=${today}&end_date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{
      background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem'
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px', background: `rgba(${color}, 0.1)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: `rgb(${color})`
      }}>
        <Icon size={28} />
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Today's Sales" value={loading ? '...' : `₹ ${stats?.totals?.total_sales?.toFixed(2) || '0.00'}`} icon={IndianRupee} color="16, 185, 129" />
        <StatCard title="Total Bills" value={loading ? '...' : (stats?.totals?.total_invoices || 0)} icon={FileText} color="59, 130, 246" />
        <StatCard title="Pieces Sold" value={loading ? '...' : (stats?.totals?.total_pieces || 0)} icon={ShoppingCart} color="245, 158, 11" />
        <StatCard title="Discounts Given" value={loading ? '...' : `₹ ${stats?.totals?.total_discount?.toFixed(2) || '0.00'}`} icon={TrendingUp} color="239, 68, 68" />
      </div>

      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/new-bill" className="btn btn-primary" style={{ padding: '2rem', flexDirection: 'column', fontSize: '1.1rem' }}>
          <FileText size={32} /> New Bill
        </Link>
        <Link to="/products" className="btn btn-secondary" style={{ padding: '2rem', flexDirection: 'column', fontSize: '1.1rem' }}>
          <Box size={32} /> Products
        </Link>
        <Link to="/bills" className="btn btn-secondary" style={{ padding: '2rem', flexDirection: 'column', fontSize: '1.1rem' }}>
          <List size={32} /> View Bills
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Payment Breakdown (Today)</h3>
          {loading ? <div>Loading...</div> : (
            <div style={{ display: 'flex', gap: '2rem' }}>
              {stats?.payments?.map(p => (
                <div key={p.payment_method} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', flex: 1 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{p.payment_method}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>₹ {p.total?.toFixed(2)}</div>
                </div>
              ))}
              {(!stats?.payments || stats.payments.length === 0) && <div style={{ color: 'var(--text-muted)' }}>No payments today yet.</div>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
