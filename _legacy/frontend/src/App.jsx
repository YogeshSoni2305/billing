import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreateBill from './pages/CreateBill';
import DailySummary from './pages/DailySummary';
import MonthlySummary from './pages/MonthlySummary';
import YearlySummary from './pages/YearlySummary';
import Products from './pages/Products';

function App() {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'New Bill';
      case '/daily': return 'Daily Summary';
      case '/monthly': return 'Monthly Summary';
      case '/yearly': return 'Yearly Summary';
      case '/products': return 'Products';
      case '/settings': return 'Settings';
      default: return 'Billing Software';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-area">
        <header className="page-header">
          <h1 style={{textTransform: 'capitalize'}}>{getTitle()}</h1>
          <div className="user-profile">
            <span style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </header>
        
        <main className="page-content">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<CreateBill />} />
            <Route path="/daily" element={<DailySummary />} />
            <Route path="/monthly" element={<MonthlySummary />} />
            <Route path="/yearly" element={<YearlySummary />} />
            <Route path="/products" element={<Products />} />
            <Route path="/settings" element={<div>Settings coming soon...</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
