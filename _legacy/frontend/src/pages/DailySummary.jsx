import { useState, useEffect } from 'react';
import { IndianRupee } from 'lucide-react';

const DailySummary = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [date]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`/api/summaries/daily?date=${date}`);
      setSummary(await res.json());
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Select Date</label>
          <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>DAILY TOTAL</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={28} /> {summary.daily_total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Time</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.bills.map((b, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{b.bill_number}</td>
                    <td>{b.timestamp.split(' ')[1]}</td>
                    <td style={{ fontWeight: 600 }}>₹{b.total_amount.toFixed(2)}</td>
                  </tr>
                ))}
                {summary.bills.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No bills for this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DailySummary;
