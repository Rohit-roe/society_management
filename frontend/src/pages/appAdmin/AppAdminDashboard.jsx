import { useState, useEffect } from 'react';
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
import { BarChart3, Building2, Calendar, FileText, ListChecks, MessageSquare, Plus, Siren, Users, Vote, Wallet } from 'lucide-react';
import API from '../../api/axios';
import {
  DashboardActionGrid,
  DashboardActionLink,
  DashboardCard,
  DashboardEmptyState,
  DashboardHeader,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardPage,
  DashboardSection,
  DashboardStatusBadge,
} from '../../components/common/DashboardSections';

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString()}`;

const AppAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectionId, setRejectionId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, requestsRes] = await Promise.all([
        API.get('/app-admin/summary'),
        API.get('/app-admin/requests'),
      ]);
      setStats(summaryRes.data);
      setRequests(requestsRes.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this society? This will create the society and activate the admin user.')) return;
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/app-admin/requests/${id}/approve`);
      setSuccess(res.data.message);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve society');
    }
  };

  const handleRejectSubmit = async (e, id) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/app-admin/requests/${id}/reject`, { rejectionReason });
      setSuccess(res.data.message);
      setRejectionId('');
      setRejectionReason('');
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject society');
    }
  };

  if (loading) return <p className="page-container">Loading admin dashboard...</p>;

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

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {stats && (
        <DashboardKpiGrid>
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
                  <button type="button" className="btn btn-primary" onClick={() => handleApprove(request._id)}>
                    Approve Society
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => setRejectionId(request._id)}>
                    Reject
                  </button>
                </div>

                {rejectionId === request._id && (
                  <form onSubmit={(e) => handleRejectSubmit(e, request._id)} className="dashboard-reject-form">
                    <label>Rejection Reason</label>
                    <input
                      placeholder="Provide rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      required
                    />
                    <div className="dashboard-inline-actions">
                      <button type="submit" className="btn btn-danger">
                        Confirm Rejection
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setRejectionId('');
                          setRejectionReason('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </DashboardCard>
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Platform-wide financial risk and defaulting society trends."
        icon={BarChart3}
      >
        {stats?.highDefaulterSocieties?.length > 0 ? (
          <DashboardCard>
            <h4>Top Defaulting Societies</h4>
            <div className="dashboard-chart-wrap">
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
          </DashboardCard>
        ) : (
          <DashboardEmptyState title="No defaulting society chart" message="Outstanding dues trends will appear when available." />
        )}
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
    </DashboardPage>
  );
};

export default AppAdminDashboard;
