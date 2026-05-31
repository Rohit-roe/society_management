import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const ROLE_LINKS = {
  resident: [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Notices', to: '/notices' },
    { label: 'Bookings', to: '/bookings' },
    { label: 'My Bookings', to: '/bookings/my' },
    { label: 'Maintenance', to: '/maintenance/my' },
    { label: 'Support', to: '/support/my' },
    { label: 'Finances', to: '/finances' },
    { label: 'Events & Polls', to: '/voting' },
    { label: 'Vault', to: '/vault' },
    { label: 'Penalties', to: '/penalties' },
  ],
  society_admin: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Residents', to: '/admin/residents' },
    { label: 'Notices', to: '/admin/notices' },
    { label: 'Maintenance', to: '/admin/maintenance' },
    { label: 'Bookings', to: '/admin/bookings' },
    { label: 'Support', to: '/admin/support' },
    { label: 'Finances', to: '/admin/finances' },
    { label: 'Events & Polls', to: '/admin/voting' },
    { label: 'Vault', to: '/admin/vault' },
    { label: 'Penalties', to: '/admin/penalties' },
    { label: 'Audit Logs', to: '/admin/audit-logs' },
    { label: 'Analytics', to: '/admin/analytics' },
  ],
  security: [
    { label: 'Dashboard', to: '/security/dashboard' },
    { label: 'Log Visitor', to: '/visitors/log' },
    { label: 'Scan QR', to: '/security/scan' },
  ],
  app_admin: [
    { label: 'Dashboard', to: '/app-admin/dashboard' },
    { label: 'Societies', to: '/app-admin/societies' },
    { label: 'Users', to: '/app-admin/users' },
    { label: 'Audit Logs', to: '/app-admin/audit-logs' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = ROLE_LINKS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        SocietyApp
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <Link key={l.to} to={l.to}>
            {l.label}
          </Link>
        ))}
      </div>
      {user && (
        <div className="nav-user">
          {user.societyId && <NotificationBell />}
          <span>{user.name}</span>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
