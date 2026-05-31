import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import API from '../../api/axios';

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

  return (
    <section className="page-container">
      <div className="page-header-row">
        <h2>App Super Admin Dashboard</h2>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>System Control Panel</span>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '32px' }}>
          <article className="stat-card">
            <h4>Total Societies</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a3c5e', marginTop: '8px' }}>
              {stats.societyCount}
            </p>
          </article>
          <article className="stat-card">
            <h4>Platform Users</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a3c5e', marginTop: '8px' }}>
              {stats.userCount}
            </p>
          </article>
          <article className="stat-card pending">
            <h4>Active Complaints</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9a7d0a', marginTop: '8px' }}>
              {stats.activeComplaints}
            </p>
          </article>
          <article className="stat-card">
            <h4>Visitor Records</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e86ab', marginTop: '8px' }}>
              {stats.visitorCount}
            </p>
          </article>
          <article className="stat-card">
            <h4>Facility Bookings</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e86ab', marginTop: '8px' }}>
              {stats.bookingsCount}
            </p>
          </article>
          <article className="stat-card overdue">
            <h4>Outstanding Dues</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626', marginTop: '8px' }}>
              ₹{stats.totalPendingDues?.toLocaleString() || 0}
            </p>
          </article>
          <article className="stat-card">
            <h4>Total Poll Votes</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>
              {stats.totalPollVotes || 0}
            </p>
          </article>
          <article className="stat-card overdue">
            <h4>Cross-Society Spending</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c0392b', marginTop: '8px' }}>
              ₹{stats.totalExpenses.toLocaleString()}
            </p>
          </article>
        </div>
      )}

      {stats?.highDefaulterSocieties?.length > 0 && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3>Top Defaulting Societies (Outstanding Maintenance Dues)</h3>
          <div style={{ marginTop: '16px', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.highDefaulterSocieties}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="societyName" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="unpaidAmount" fill="#ef4444" name="Unpaid Dues (INR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', marginBottom: '32px' }}>
        <div>
          <h3>Pending Society Requests</h3>
          <div style={{ marginTop: '12px' }}>
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <p className="note">No pending society requests.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {requests.filter(r => r.status === 'pending').map((req) => (
                  <article key={req._id} className="card" style={{ borderLeft: '4px solid #9a7d0a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ color: '#1a3c5e', fontSize: '1.1rem' }}>{req.name}</h4>
                        <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '4px' }}>
                          <strong>Location:</strong> {req.address}, {req.city}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#555' }}>
                          <strong>Scale:</strong> {req.totalFlats} Flats | {req.estimatedResidents || 0} Est. Residents
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#555' }}>
                          <strong>Requested By:</strong> {req.requestedBy?.name} ({req.requestedBy?.email}) | Contact: {req.contactNumber || req.requestedBy?.phone || 'N/A'}
                        </p>
                        {req.proofDocument && (
                          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                            <a href={req.proofDocument} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                              View Proof Document
                            </a>
                          </p>
                        )}
                        {req.description && (
                          <p style={{ fontSize: '0.85rem', color: '#777', fontStyle: 'italic', marginTop: '8px' }}>
                            "{req.description}"
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-start' }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(req._id)}
                          style={{ background: '#1e7a4a', fontWeight: '600' }}
                        >
                          Approve Society
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => setRejectionId(req._id)}
                          style={{ fontWeight: '600' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {rejectionId === req._id && (
                      <form onSubmit={(e) => handleRejectSubmit(e, req._id)} style={{ marginTop: '16px', background: '#fadbd8', padding: '16px', borderRadius: '4px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#c0392b' }}>
                          Rejection Reason:
                        </label>
                        <input
                          placeholder="Provide rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          required
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            Confirm Rejection
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectionId('');
                              setRejectionReason('');
                            }}
                            style={{ background: '#777', color: '#fff', padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-links" style={{ borderTop: '1px solid #c5d8e8', paddingTop: '20px' }}>
        <Link to="/app-admin/societies" style={{ padding: '10px 20px', background: '#1a3c5e', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>
          Manage Societies
        </Link>
        <Link to="/app-admin/users" style={{ padding: '10px 20px', background: '#1a3c5e', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>
          Manage Users
        </Link>
        <Link to="/app-admin/audit-logs" style={{ padding: '10px 20px', background: '#2e86ab', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>
          View Audit Logs
        </Link>
      </div>
    </section>
  );
};

export default AppAdminDashboard;
