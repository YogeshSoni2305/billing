import { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';

const MonthlySummary = () => {
  const today = new Date();
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [summary, setSummary] = useState(null);

  useEffect(() => { fetchSummary(); }, [month, year]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/summaries/monthly?year=${year}&month=${month}`);
      setSummary(await res.json());
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Month</label>
          <select className="form-input" value={month} onChange={e => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => <option key={i} value={String(i+1).padStart(2, '0')}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Year</label>
          <select className="form-input" value={year} onChange={e => setYear(e.target.value)}>
            {[...Array(5)].map((_, i) => {
              const y = today.getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL BILLS</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{summary.total_bills}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>MONTHLY TOTAL</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={28} /> {summary.monthly_total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bills</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.days.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.date}</td>
                    <td>{d.bills}</td>
                    <td style={{ fontWeight: 600 }}>₹{d.total.toFixed(2)}</td>
                  </tr>
                ))}
                {summary.days.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No bills for this month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlySummary;
