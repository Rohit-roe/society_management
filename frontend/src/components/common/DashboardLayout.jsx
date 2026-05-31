import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import ChatbotWidget from './ChatbotWidget';
import toast from 'react-hot-toast';

const ROLE_GROUPS = {
  resident: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: '📊' },
        { label: 'Notices', to: '/notices', icon: '📢' },
        { label: 'Document Vault', to: '/vault', icon: '🗄️' },
      ]
    },
    {
      title: 'Payments & Fines',
      items: [
        { label: 'Finances', to: '/finances', icon: '💰' },
        { label: 'Maintenance', to: '/maintenance/my', icon: '🔧' },
        { label: 'Penalties', to: '/penalties', icon: '⚠️' },
      ]
    },
    {
      title: 'Services',
      items: [
        { label: 'Bookings', to: '/bookings', icon: '📅' },
        { label: 'My Bookings', to: '/bookings/my', icon: '🗓️' },
        { label: 'Support & Tickets', to: '/support/my', icon: '💬' },
        { label: 'Parking Slots', to: '/parking', icon: '🚗' },
      ]
    }
  ],
  society_admin: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: '📊' },
        { label: 'Residents', to: '/admin/residents', icon: '👥' },
        { label: 'Notices', to: '/admin/notices', icon: '📢' },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Maintenance', to: '/admin/maintenance', icon: '🔧' },
        { label: 'Finances', to: '/admin/finances', icon: '💰' },
        { label: 'Penalties', to: '/admin/penalties', icon: '⚠️' },
        { label: 'Parking Management', to: '/admin/parking', icon: '🚗' },
        { label: 'Security Shift', to: '/admin/security', icon: '🛡️' },
        { label: 'Staff Management', to: '/admin/staff', icon: '👷' },
      ]
    },
    {
      title: 'System & Logs',
      items: [
        { label: 'Bookings', to: '/admin/bookings', icon: '📅' },
        { label: 'Support & Tickets', to: '/admin/support', icon: '💬' },
        { label: 'Events & Polls', to: '/admin/voting', icon: '🗳️' },
        { label: 'Document Vault', to: '/admin/vault', icon: '🗄️' },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📜' },
        { label: 'Analytics', to: '/admin/analytics', icon: '📈' },
      ]
    }
  ],
  security: [
    {
      title: 'Gate Control',
      items: [
        { label: 'Dashboard', to: '/security/dashboard', icon: '📊' },
        { label: 'Log Visitor', to: '/visitors/log', icon: '🚪' },
        { label: 'Scan QR', to: '/security/scan', icon: '📷' },
      ]
    }
  ],
  app_admin: [
    {
      title: 'System Administration',
      items: [
        { label: 'Dashboard', to: '/app-admin/dashboard', icon: '📊' },
        { label: 'Societies', to: '/app-admin/societies', icon: '🏢' },
        { label: 'Users', to: '/app-admin/users', icon: '👥' },
        { label: 'Audit Logs', to: '/app-admin/audit-logs', icon: '📜' },
      ]
    }
  ]
};

const THEMES = [
  { value: 'theme-clean-corporate', label: 'Clean Corporate (Light)' },
  { value: 'theme-warm-modern', label: 'Warm Modern (Light)' },
  { value: 'theme-midnight', label: 'Midnight Dashboard (Dark)' },
  { value: 'theme-graphite', label: 'Graphite Pro (Dark)' },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'theme-clean-corporate');
  const [mobileShow, setMobileShow] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside to close user profile dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!user) return <>{children}</>;

  const groups = ROLE_GROUPS[user.role] || [];
  const allLinks = groups.flatMap((g) => g.items);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  // Find active label for Top Navbar title
  const activeLink = allLinks.find((l) => l.to === location.pathname);
  const pageTitle = activeLink ? activeLink.label : 'SocietyApp';

  return (
    <div className="flex min-h-screen w-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans">
      
      {/* Mobile Sidebar overlay backdrop */}
      {mobileShow && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileShow(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-[var(--bg-sidebar)] text-[var(--text-sidebar)] flex flex-col shrink-0 z-50 border-r border-white/5 shadow-xl transition-all duration-300 ease-in-out
          fixed inset-y-0 left-0 md:sticky md:top-0 h-screen
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileShow ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link
            to="/"
            className={`text-lg font-black tracking-tight text-white flex items-center gap-2 truncate transition-opacity duration-200 ${
              collapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setMobileShow(false)}
          >
            🏢 SocietyApp
          </Link>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider text-[var(--text-sidebar-muted)] px-3 block transition-opacity duration-200 ${
                  collapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                {group.title}
              </span>
              <ul className="space-y-1 list-none">
                {group.items.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <li
                      key={link.to}
                      className="group relative"
                      data-label={link.label}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMobileShow(false)}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          isActive
                            ? 'bg-[var(--bg-sidebar-active)] text-white shadow-md'
                            : 'opacity-80 hover:opacity-100 hover:bg-[var(--bg-sidebar-hover)]'
                        }`}
                      >
                        <span className="text-lg shrink-0">{link.icon}</span>
                        <span
                          className={`transition-all duration-200 ${
                            collapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'
                          }`}
                        >
                          {link.label}
                        </span>
                      </Link>

                      {/* Tooltip on Hover when Collapsed */}
                      {collapsed && (
                        <div className="absolute left-24 top-1/2 -translate-y-1/2 bg-slate-950 text-white text-xs px-3 py-1.5 rounded shadow-lg border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                          {link.label}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 md:hidden transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              onClick={() => setMobileShow(!mobileShow)}
            >
              ☰
            </button>
            <span className="text-lg font-black tracking-tight text-[var(--text-primary)]">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Selector */}
            <div className="theme-switcher">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Select Theme"
                className="bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer shadow-sm hover:border-[var(--border-focus)] transition-colors"
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            {user.societyId && <NotificationBell />}

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="text-base">👤</span>
                <span className="hidden sm:inline">{user.name}</span>
                <span className="text-[10px] opacity-60">▼</span>
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-12 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl p-4 min-w-[240px] z-50 flex flex-col gap-3 animate-fade-in text-[var(--text-primary)]">
                  <div className="border-b border-[var(--border)] pb-3">
                    <p className="font-extrabold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5 flex items-center gap-1.5 capitalize">
                      💼 {user.role.replace('_', ' ')}
                    </p>
                    {user.flatNumber && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
                        🏠 Flat {user.flatNumber}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none active:scale-95"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main
          className="flex-1 p-6 md:p-8 overflow-y-auto bg-[var(--bg-primary)] transition-colors duration-300"
          onClick={() => {
            setMobileShow(false);
            setProfileOpen(false);
          }}
        >
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Widget for Residents */}
      {user.role === 'resident' && <ChatbotWidget />}
    </div>
  );
};

export default DashboardLayout;
