import { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';

const YearlySummary = () => {
  const today = new Date();
  const [year, setYear] = useState(String(today.getFullYear()));
  const [summary, setSummary] = useState(null);

  useEffect(() => { fetchSummary(); }, [year]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/summaries/yearly?year=${year}`);
      setSummary(await res.json());
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>YEARLY TOTAL</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={28} /> {summary.yearly_total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bills</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.months.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{m.month}</td>
                    <td>{m.bills}</td>
                    <td style={{ fontWeight: 600 }}>₹{m.total.toFixed(2)}</td>
                  </tr>
                ))}
                {summary.months.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No bills for this year.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default YearlySummary;
