import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  FileText,
  FolderLock,
  Hammer,
  Landmark,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Siren,
  Smartphone,
  Users,
  UserCircle,
  Vote,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import ChatbotWidget from './ChatbotWidget';
import toast from 'react-hot-toast';

const ROLE_GROUPS = {
  resident: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: BarChart3 },
        { label: 'Notices', to: '/notices', icon: Bell },
        { label: 'Document Vault', to: '/vault', icon: FolderLock },
      ],
    },
    {
      title: 'Payments & Fines',
      items: [
        { label: 'Finances', to: '/finances', icon: Coins },
        { label: 'Maintenance', to: '/maintenance/my', icon: Wrench },
        { label: 'Penalties', to: '/penalties', icon: Siren },
      ],
    },
    {
      title: 'Services',
      items: [
        { label: 'Bookings', to: '/bookings', icon: Calendar },
        { label: 'My Bookings', to: '/bookings/my', icon: ClipboardList },
        { label: 'Support & Tickets', to: '/support/my', icon: MessageSquare },
        { label: 'Parking Slots', to: '/parking', icon: Car },
      ],
    },
  ],
  society_admin: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
        { label: 'Residents', to: '/admin/residents', icon: Users },
        { label: 'Notices', to: '/admin/notices', icon: Bell },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
        { label: 'Finances', to: '/admin/finances', icon: Coins },
        { label: 'Penalties', to: '/admin/penalties', icon: Siren },
      ],
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Parking Management', to: '/admin/parking', icon: Car },
        { label: 'Security Shift', to: '/admin/security', icon: ShieldCheck },
        { label: 'Staff Management', to: '/admin/staff', icon: Hammer },
      ],
    },
    {
      title: 'System & Logs',
      items: [
        { label: 'Bookings', to: '/admin/bookings', icon: Calendar },
        { label: 'Support & Tickets', to: '/admin/support', icon: MessageSquare },
        { label: 'Events & Polls', to: '/admin/voting', icon: Vote },
        { label: 'Document Vault', to: '/admin/vault', icon: FolderLock },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: FileText },
        { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
      ],
    },
  ],
  security: [
    {
      title: 'Gate Control',
      items: [
        { label: 'Dashboard', to: '/security/dashboard', icon: BarChart3 },
        { label: 'Log Visitor', to: '/visitors/log', icon: BookOpen },
        { label: 'Scan QR', to: '/security/scan', icon: Smartphone },
      ],
    },
  ],
  app_admin: [
    {
      title: 'System Administration',
      items: [
        { label: 'Dashboard', to: '/app-admin/dashboard', icon: BarChart3 },
        { label: 'Societies', to: '/app-admin/societies', icon: Building2 },
        { label: 'Users', to: '/app-admin/users', icon: Users },
        { label: 'Audit Logs', to: '/app-admin/audit-logs', icon: FileText },
      ],
    },
  ],
};

const THEMES = [
  { value: 'theme-clean-corporate', label: 'Clean Corporate' },
  { value: 'theme-warm-modern', label: 'Warm Modern' },
  { value: 'theme-midnight', label: 'Midnight Dashboard' },
  { value: 'theme-graphite', label: 'Graphite Pro' },
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

  // Sync theme selection to document body class and store in localStorage
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

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
  const allLinks = groups.flatMap((group) => group.items);
  const activeLink = allLinks.find((link) => location.pathname === link.to);
  const pageTitle = activeLink ? activeLink.label : 'Residio';

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {mobileShow && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setMobileShow(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileShow ? 'is-open' : ''}`}>
        <div className="sidebar-header-modern">
          <Link to="/" className="sidebar-brand-modern" onClick={() => setMobileShow(false)}>
            <Landmark className="nav-icon" aria-hidden="true" />
            <span>Residio</span>
          </Link>
          <button
            type="button"
            className="nav-icon-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="nav-icon" /> : <ChevronLeft className="nav-icon" />}
          </button>
        </div>

        <nav className="sidebar-nav-modern" aria-label="Primary navigation">
          {groups.map((group) => (
            <div key={group.title} className="sidebar-group-modern">
              <span className="sidebar-group-title">{group.title}</span>
              <ul>
                {group.items.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <li key={link.to} data-label={link.label}>
                      <Link
                        to={link.to}
                        onClick={() => setMobileShow(false)}
                        className={`sidebar-link-modern ${isActive ? 'is-active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="nav-icon" aria-hidden="true" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="top-nav-modern">
          <div className="top-nav-title-wrap">
            <button
              type="button"
              className="nav-icon-button mobile-menu-button"
              onClick={() => setMobileShow(!mobileShow)}
              aria-label="Open navigation"
            >
              <Menu className="nav-icon" />
            </button>
            <div>
              <span className="top-nav-kicker">Current Page</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="top-nav-actions">
            {user.societyId && <NotificationBell />}

            <div ref={dropdownRef} className="profile-menu-wrap">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <UserCircle className="nav-icon" />
                <span>{user.name}</span>
                <ChevronDown className="profile-chevron" aria-hidden="true" />
              </button>

              {profileOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-header">
                    <strong>{user.name}</strong>
                    <span>{user.role.replace('_', ' ')}</span>
                    {user.flatNumber && <span>Flat {user.flatNumber}</span>}
                  </div>
                  
                  {/* Theme Selector inside Profile Dropdown */}
                  <div className="theme-select-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Theme</span>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      aria-label="Select theme"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {THEMES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="button" className="profile-logout" onClick={handleLogout}>
                    <LogOut className="nav-icon" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className="app-content"
          onClick={() => {
            setMobileShow(false);
            setProfileOpen(false);
          }}
        >
          {children}
        </main>
      </div>

      {user.role === 'resident' && <ChatbotWidget />}
    </div>
  );
};

export default DashboardLayout;
