import { NavLink } from 'react-router-dom';
import { FileText, Calendar, CalendarDays, CalendarCheck, Box, Settings } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'New Bill', path: '/', icon: FileText },
    { name: 'Daily Summary', path: '/daily', icon: Calendar },
    { name: 'Monthly Summary', path: '/monthly', icon: CalendarDays },
    { name: 'Yearly Summary', path: '/yearly', icon: CalendarCheck },
    { name: 'Products', path: '/products', icon: Box },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="sidebar" style={{
      width: '260px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)',
      zIndex: 20
    }}>
      <div style={{
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderRadius: '8px', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', boxShadow: 'var(--shadow-glow)'
        }}>S</div>
        <div style={{ fontWeight: 700, letterSpacing: '0.5px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          SAGAR ELECTRICALS
        </div>
      </div>

      <div className="sidebar-nav" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              transition: 'var(--transition)',
              textDecoration: 'none'
            })}
          >
            <item.icon size={20} strokeWidth={2.5} />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
