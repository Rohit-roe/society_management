import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForbiddenPage from '../pages/public/ForbiddenPage';
import ResidentDashboard from '../pages/resident/ResidentDashboard';
import NoticeBoardPage from '../pages/resident/NoticeBoardPage';
import VisitorLogPage from '../pages/resident/VisitorLogPage';
import PreApproveVisitorPage from '../pages/resident/PreApproveVisitorPage';
import MyMaintenancePage from '../pages/resident/MyMaintenancePage';
import SocietyMaintenancePage from '../pages/resident/SocietyMaintenancePage';
import FacilityBookingPage from '../pages/resident/FacilityBookingPage';
import MyBookingsPage from '../pages/resident/MyBookingsPage';
import NotificationsPage from '../pages/resident/NotificationsPage';
import AdminDashboard from '../pages/societyAdmin/AdminDashboard';
import ManageNoticesPage from '../pages/societyAdmin/ManageNoticesPage';
import ManageMaintenancePage from '../pages/societyAdmin/ManageMaintenancePage';
import AdminVisitorLogPage from '../pages/societyAdmin/AdminVisitorLogPage';
import ManageResidentsPage from '../pages/societyAdmin/ManageResidentsPage';
import ManageBookingsPage from '../pages/societyAdmin/ManageBookingsPage';
import AnalyticsDashboard from '../pages/societyAdmin/AnalyticsDashboard';
import SecurityDashboard from '../pages/security/SecurityDashboard';
import QRScannerPage from '../pages/security/QRScannerPage';
import AppAdminDashboard from '../pages/appAdmin/AppAdminDashboard';
import ManageSocietiesPage from '../pages/appAdmin/ManageSocietiesPage';
import ManageUsersPage from '../pages/appAdmin/ManageUsersPage';
import VerifyVisitorPage from '../pages/public/VerifyVisitorPage';
import ManageSupportTicketsPage from '../pages/societyAdmin/ManageSupportTicketsPage';
import MySupportTicketsPage from '../pages/resident/MySupportTicketsPage';

// New Pages Imports
import AppAdminAuditLogsPage from '../pages/appAdmin/AppAdminAuditLogsPage';
import ManageFinancesPage from '../pages/societyAdmin/ManageFinancesPage';
import ManageEventsPollsPage from '../pages/societyAdmin/ManageEventsPollsPage';
import ManageVaultPage from '../pages/societyAdmin/ManageVaultPage';
import ManagePenaltiesPage from '../pages/societyAdmin/ManagePenaltiesPage';
import AdminAuditLogsPage from '../pages/societyAdmin/AdminAuditLogsPage';
import ResidentFinancesPage from '../pages/resident/ResidentFinancesPage';
import ResidentEventsPollsPage from '../pages/resident/ResidentEventsPollsPage';
import ResidentVaultPage from '../pages/resident/ResidentVaultPage';
import ResidentPenaltiesPage from '../pages/resident/ResidentPenaltiesPage';

// Operational Pages
import ManageParkingPage from '../pages/societyAdmin/ManageParkingPage';
import ParkingStatusPage from '../pages/resident/ParkingStatusPage';
import ManageSecurityPage from '../pages/societyAdmin/ManageSecurityPage';
import ManageStaffPage from '../pages/societyAdmin/ManageStaffPage';

const PR = ({ roles, el }) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/403" element={<ForbiddenPage />} />
    <Route path="/verify-visitor" element={<VerifyVisitorPage />} />

    <Route
      path="/notifications"
      element={
        <PR
          roles={['resident', 'society_admin', 'security']}
          el={<NotificationsPage />}
        />
      }
    />

    {/* Resident Routes */}
    <Route path="/dashboard" element={<PR roles={['resident']} el={<ResidentDashboard />} />} />
    <Route path="/notices" element={<PR roles={['resident']} el={<NoticeBoardPage />} />} />
    <Route path="/visitors" element={<PR roles={['resident']} el={<VisitorLogPage />} />} />
    <Route
      path="/visitors/pre-approve"
      element={<PR roles={['resident']} el={<PreApproveVisitorPage />} />}
    />
    <Route path="/maintenance/my" element={<PR roles={['resident']} el={<MyMaintenancePage />} />} />
    <Route
      path="/maintenance/society"
      element={<PR roles={['resident', 'society_admin']} el={<SocietyMaintenancePage />} />}
    />
    <Route path="/bookings" element={<PR roles={['resident']} el={<FacilityBookingPage />} />} />
    <Route path="/bookings/my" element={<PR roles={['resident']} el={<MyBookingsPage />} />} />
    <Route path="/support/my" element={<PR roles={['resident']} el={<MySupportTicketsPage />} />} />
    <Route path="/finances" element={<PR roles={['resident']} el={<ResidentFinancesPage />} />} />
    <Route path="/voting" element={<PR roles={['resident']} el={<ResidentEventsPollsPage />} />} />
    <Route path="/vault" element={<PR roles={['resident']} el={<ResidentVaultPage />} />} />
    <Route path="/penalties" element={<PR roles={['resident']} el={<ResidentPenaltiesPage />} />} />
    <Route path="/parking" element={<PR roles={['resident']} el={<ParkingStatusPage />} />} />

    {/* Security Routes */}
    <Route path="/security/dashboard" element={<PR roles={['security']} el={<SecurityDashboard />} />} />
    <Route path="/visitors/log" element={<PR roles={['security']} el={<VisitorLogPage showAll />} />} />
    <Route path="/security/scan" element={<PR roles={['security']} el={<QRScannerPage />} />} />

    {/* Society Admin Routes */}
    <Route path="/admin/dashboard" element={<PR roles={['society_admin']} el={<AdminDashboard />} />} />
    <Route path="/admin/notices" element={<PR roles={['society_admin']} el={<ManageNoticesPage />} />} />
    <Route path="/admin/maintenance" element={<PR roles={['society_admin']} el={<ManageMaintenancePage />} />} />
    <Route path="/admin/bookings" element={<PR roles={['society_admin']} el={<ManageBookingsPage />} />} />
    <Route path="/admin/analytics" element={<PR roles={['society_admin']} el={<AnalyticsDashboard />} />} />
    <Route path="/admin/visitors" element={<PR roles={['society_admin']} el={<AdminVisitorLogPage />} />} />
    <Route path="/admin/residents" element={<PR roles={['society_admin']} el={<ManageResidentsPage />} />} />
    <Route path="/admin/support" element={<PR roles={['society_admin']} el={<ManageSupportTicketsPage />} />} />
    <Route path="/admin/finances" element={<PR roles={['society_admin']} el={<ManageFinancesPage />} />} />
    <Route path="/admin/voting" element={<PR roles={['society_admin']} el={<ManageEventsPollsPage />} />} />
    <Route path="/admin/vault" element={<PR roles={['society_admin']} el={<ManageVaultPage />} />} />
    <Route path="/admin/penalties" element={<PR roles={['society_admin']} el={<ManagePenaltiesPage />} />} />
    <Route path="/admin/audit-logs" element={<PR roles={['society_admin']} el={<AdminAuditLogsPage />} />} />
    <Route path="/admin/parking" element={<PR roles={['society_admin']} el={<ManageParkingPage />} />} />
    <Route path="/admin/security" element={<PR roles={['society_admin']} el={<ManageSecurityPage />} />} />
    <Route path="/admin/staff" element={<PR roles={['society_admin']} el={<ManageStaffPage />} />} />

    {/* App Super Admin Routes */}
    <Route path="/app-admin/dashboard" element={<PR roles={['app_admin']} el={<AppAdminDashboard />} />} />
    <Route path="/app-admin/societies" element={<PR roles={['app_admin']} el={<ManageSocietiesPage />} />} />
    <Route path="/app-admin/users" element={<PR roles={['app_admin']} el={<ManageUsersPage />} />} />
    <Route path="/app-admin/audit-logs" element={<PR roles={['app_admin']} el={<AppAdminAuditLogsPage />} />} />
  </Routes>
);

export default AppRouter;
