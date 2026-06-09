import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Building2, Calendar, FileText, ListChecks, MessageSquare, Plus, Siren, Users, Vote, Wallet, X } from 'lucide-react';
import API from '../../api/axios';
import ActivityFeed from '../../components/common/ActivityFeed';
import toast from 'react-hot-toast';
import {
  DashboardActionGrid,
  DashboardActionLink,
  DashboardCard,
  DashboardCardSkeleton,
  DashboardEmptyState,
  DashboardHeader,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardKpiSkeleton,
  DashboardPage,
  DashboardSection,
  DashboardStatusBadge,
} from '../../components/common/DashboardSections';

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString()}`;

const AppAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [confirmApproveRequest, setConfirmApproveRequest] = useState(null);
  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Refs for Focus Trap
  const approveConfirmButtonRef = useRef(null);
  const rejectTextareaRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setActivitiesLoading(true);
      const [summaryRes, requestsRes, auditRes] = await Promise.all([
        API.get('/app-admin/summary'),
        API.get('/app-admin/requests'),
        API.get('/app-admin/audit-logs').catch(() => ({ data: [] })),
      ]);
      setStats(summaryRes.data);
      setRequests(requestsRes.data);

      const mappedActivities = auditRes.data.slice(0, 5).map((log) => ({
        _id: log._id,
        actor: log.performedBy?.name || 'System Admin',
        action: `${log.action} ${log.societyId?.name ? `(${log.societyId.name})` : ''}: ${log.details}`,
        timestamp: log.createdAt,
        status: 'logged',
        priority: (log.action?.includes('REJECT') || log.action?.includes('DELETE'))
          ? 'critical'
          : (log.action?.includes('APPROVE') || log.action?.includes('CREATE'))
            ? 'important'
            : 'normal'
      }));
      setActivities(mappedActivities);
      setActivitiesLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ESC Key listener for Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setConfirmApproveRequest(null);
        setRejectionRequest(null);
      }
    };
    if (confirmApproveRequest || rejectionRequest) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmApproveRequest, rejectionRequest]);

  // Focus trap for Approval Confirm button
  useEffect(() => {
    if (confirmApproveRequest) {
      approveConfirmButtonRef.current?.focus();
    }
  }, [confirmApproveRequest]);

  // Focus trap for Rejection textarea
  useEffect(() => {
    if (rejectionRequest) {
      rejectTextareaRef.current?.focus();
    }
  }, [rejectionRequest]);

  const handleApprove = async (id) => {
    try {
      const res = await API.post(`/app-admin/requests/${id}/approve`);
      toast.success(res.data.message || 'Society approved successfully');
      setConfirmApproveRequest(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve society');
    }
  };

  const handleRejectSubmit = async (e, id) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    try {
      const res = await API.post(`/app-admin/requests/${id}/reject`, { rejectionReason });
      toast.success(res.data.message || 'Society onboarding rejected');
      setRejectionRequest(null);
      setRejectionReason('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject society');
    }
  };

  if (loading) {
    return (
      <DashboardPage>
        <div className="page-skeleton">
          <div className="skeleton-box" style={{ height: 110, borderRadius: 'var(--radius)' }} />
          <DashboardKpiSkeleton count={8} />
          <DashboardCardSkeleton rows={4} />
          <DashboardCardSkeleton rows={3} />
        </div>
      </DashboardPage>
    );
  }

  const pendingRequests = requests.filter((request) => request.status === 'pending');

  return (
    <DashboardPage>
      <DashboardHeader
        title="App Super Admin Dashboard"
        subtitle="System control panel for societies, users, requests, and platform-wide operational health."
        summary={
          <div className="dashboard-header-summary">
            <span>Pending Requests</span>
            <strong>{pendingRequests.length}</strong>
          </div>
        }
      />

      {stats && (
        <DashboardKpiGrid className="dashboard-kpi-grid--fluid">
          <DashboardKpiCard icon={Building2} label="Total Societies" value={stats.societyCount} helper="Registered societies" />
          <DashboardKpiCard icon={Users} label="Platform Users" value={stats.userCount} helper="All user accounts" />
          <DashboardKpiCard icon={MessageSquare} label="Active Complaints" value={stats.activeComplaints} helper="Cross-society support load" tone={stats.activeComplaints ? 'warning' : 'default'} />
          <DashboardKpiCard icon={BarChart3} label="Visitor Records" value={stats.visitorCount} helper="Gate activity records" />
          <DashboardKpiCard icon={Calendar} label="Facility Bookings" value={stats.bookingsCount} helper="Shared facility reservations" />
          <DashboardKpiCard icon={Siren} label="Outstanding Dues" value={formatCurrency(stats.totalPendingDues)} helper="Pending maintenance value" tone={stats.totalPendingDues ? 'danger' : 'default'} />
          <DashboardKpiCard icon={Vote} label="Total Poll Votes" value={stats.totalPollVotes || 0} helper="Governance participation" />
          <DashboardKpiCard icon={Wallet} label="Cross-Society Spending" value={formatCurrency(stats.totalExpenses)} helper="Recorded expenses" />
        </DashboardKpiGrid>
      )}

      <DashboardSection
        title="Urgent Work"
        description="Society onboarding requests that require platform approval."
        icon={ListChecks}
        priority="urgent"
      >
        {pendingRequests.length === 0 ? (
          <DashboardEmptyState title="No pending society requests" message="New society registration requests will appear here." />
        ) : (
          <div className="dashboard-plain-list">
            {pendingRequests.map((request) => (
              <DashboardCard key={request._id} emphasis="urgent">
                <div className="dashboard-list-item">
                  <div>
                    <h4>{request.name}</h4>
                    <p><strong>Location:</strong> {request.address}, {request.city}</p>
                    <p><strong>Scale:</strong> {request.totalFlats} flats | {request.estimatedResidents || 0} estimated residents</p>
                    <p>
                      <strong>Requested By:</strong> {request.requestedBy?.name} ({request.requestedBy?.email}) | Contact:{' '}
                      {request.contactNumber || request.requestedBy?.phone || 'N/A'}
                    </p>
                    {request.proofDocument && (
                      <p>
                        <a href={request.proofDocument} target="_blank" rel="noreferrer" className="dashboard-link">
                          View Proof Document -&gt;
                        </a>
                      </p>
                    )}
                    {request.description && <p>{request.description}</p>}
                  </div>
                  <DashboardStatusBadge tone="warning" icon={Siren}>Pending</DashboardStatusBadge>
                </div>

                <div className="dashboard-inline-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setConfirmApproveRequest(request)}
                  >
                    Approve Society
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setRejectionRequest(request);
                      setRejectionReason('');
                    }}
                  >
                    Reject
                  </button>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Platform-wide administration log and financial trends."
        icon={BarChart3}
      >
        <div className="dashboard-two-column">
          <DashboardCard>
            <h4>Platform Activity Feed</h4>
            <ActivityFeed
              activities={activities}
              loading={activitiesLoading}
              emptyTitle="No platform events logged"
              emptyMessage="Global society additions, account approvals, and superadmin updates will appear here."
            />
          </DashboardCard>

          <DashboardCard>
            <h4>Top Defaulting Societies</h4>
            {stats?.highDefaulterSocieties?.length > 0 ? (
              <div className="dashboard-chart-wrap" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.highDefaulterSocieties}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="societyName" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="unpaidAmount" fill="var(--primary)" name="Unpaid Dues" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <DashboardEmptyState title="No defaulting society chart" message="Outstanding dues trends will appear when available." />
            )}
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Quick Actions"
        description="Core platform administration tools."
        icon={Plus}
        priority="tertiary"
      >
        <DashboardActionGrid>
          <DashboardActionLink to="/app-admin/societies" icon={Building2} title="Manage Societies" description="Review platform societies" />
          <DashboardActionLink to="/app-admin/users" icon={Users} title="Manage Users" description="Inspect platform users" />
          <DashboardActionLink to="/app-admin/audit-logs" icon={FileText} title="Audit Logs" description="Review system events" />
        </DashboardActionGrid>
      </DashboardSection>

      <DashboardSection
        title="Secondary Content"
        description="Platform overview derived from current system statistics."
        icon={Building2}
      >
        <div className="dashboard-card-grid">
          <DashboardCard>
            <h4>Community Scale</h4>
            <p>{stats?.societyCount || 0} societies and {stats?.userCount || 0} users are represented on the platform.</p>
          </DashboardCard>
          <DashboardCard>
            <h4>Operational Load</h4>
            <p>{stats?.activeComplaints || 0} active complaint{stats?.activeComplaints === 1 ? '' : 's'} and {stats?.bookingsCount || 0} facility bookings are recorded.</p>
          </DashboardCard>
          <DashboardCard>
            <h4>Financial Exposure</h4>
            <p>{formatCurrency(stats?.totalPendingDues)} remains outstanding across societies.</p>
          </DashboardCard>
        </div>
      </DashboardSection>

      {/* In-Page Confirmation Modal for Approval */}
      {confirmApproveRequest && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Approve Society</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setConfirmApproveRequest(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ margin: '16px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              <p>Are you sure you want to approve <strong>{confirmApproveRequest.name}</strong>?</p>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                This will activate the society account and automatically grant administrative credentials.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmApproveRequest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                ref={approveConfirmButtonRef}
                className="btn btn-primary"
                onClick={() => handleApprove(confirmApproveRequest._id)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectionRequest && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Reject Society Onboarding</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setRejectionRequest(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={(e) => handleRejectSubmit(e, rejectionRequest._id)}>
              <div className="modern-form-group" style={{ margin: '16px 0' }}>
                <label className="modern-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Provide Rejection Reason for <strong>{rejectionRequest.name}</strong>
                </label>
                <textarea
                  ref={rejectTextareaRef}
                  className="modern-input"
                  style={{ width: '100%', minHeight: '100px', padding: '10px' }}
                  placeholder="State the reason for rejection (this will be visible to the applicant)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRejectionRequest(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

export default AppAdminDashboard;
