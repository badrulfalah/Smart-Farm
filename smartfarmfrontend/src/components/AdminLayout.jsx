import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/admin/users', name: 'Users', icon: '👥' },
    { path: '/admin/roles', name: 'Roles', icon: '🔑' },
    { path: '/admin/permissions', name: 'Permissions', icon: '🛡️' },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🍃</span>
          <span className="brand-name">Smart Farm</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-icon">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User badge */}
          {user && (
            <div className="user-badge">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.roles?.[0] || 'User'}</span>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div className="theme-toggle-bar">
            <span>Mode</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn-theme ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light Mode"
              >
                ☀️
              </button>
              <button
                className={`btn-theme ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
              >
                🌙
              </button>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="sidebar-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              color: '#ef4444',
            }}
          >
            <span className="link-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Mobile Header Bar */}
        <div className="header-bar" style={{ display: 'none' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            🍔
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
