import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Leaf,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Efek untuk menerapkan tema ke HTML
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
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} /> },
    { path: '/admin/users',     name: 'Users',     icon: <Users size={18} strokeWidth={2} /> },
    { path: '/admin/roles',     name: 'Roles',     icon: <KeyRound size={18} strokeWidth={2} /> },
    { path: '/admin/permissions', name: 'Permissions', icon: <ShieldCheck size={18} strokeWidth={2} /> },
  ];

  return (
    <div className="admin-container">
      {/* ── Mobile top bar ── */}
      <header className="mobile-topbar">
        <div className="sidebar-brand">
          <span className="brand-icon-wrap">
            <Leaf size={16} strokeWidth={2.5} />
          </span>
          <span className="brand-name">Smart Farm</span>
        </div>
        <button
          className="btn-mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand (Desktop Only) */}
        <div className="sidebar-brand desktop-only">
          <span className="brand-icon-wrap">
            <Leaf size={16} strokeWidth={2.5} />
          </span>
          <span className="brand-name">Smart Farm</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-menu">
          <p className="nav-section-label">Main Menu</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-icon">{item.icon}</span>
              <span className="link-label">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* User badge */}
          {user && (
            <div className="user-badge">
              <div className="user-avatar">{getInitials(user.name)}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.roles?.[0] || 'Admin'}</span>
              </div>
            </div>
          )}

          {/* Theme toggle */}
          <div className="theme-toggle-bar">
            <span className="toggle-label">Appearance</span>
            <div className="toggle-btns">
              <button
                className={`btn-theme ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light Mode"
                aria-label="Light mode"
              >
                <Sun size={14} strokeWidth={2} />
              </button>
              <button
                className={`btn-theme ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
                aria-label="Dark mode"
              >
                <Moon size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-link logout-link">
            <span className="link-icon">
              <LogOut size={18} strokeWidth={2} />
            </span>
            <span className="link-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Overlay (mobile) ── */}
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

      {/* ── Main content ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;