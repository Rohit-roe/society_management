import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageResidentsPage = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [preAddedResidents, setPreAddedResidents] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [preAddForm, setPreAddForm] = useState({
    houseNo: '',
    name: '',
    phone: '',
    email: '',
    familyCount: 0,
    residentType: 'owner',
  });

  const [transferTargetId, setTransferTargetId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, preAddedRes, requestsRes] = await Promise.all([
        API.get('/users/society'),
        API.get('/residents/pre-added'),
        API.get('/residents/requests'),
      ]);
      // Active users: status is active and user is not self (or is self but we can show them)
      setActiveUsers(usersRes.data.filter((u) => u.status === 'active'));
      setPreAddedResidents(preAddedRes.data);
      setJoinRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch resident management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePreAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/residents/pre-add', preAddForm);
      setSuccess(`Pre-added resident "${preAddForm.name}" successfully.`);
      setPreAddForm({
        houseNo: '',
        name: '',
        phone: '',
        email: '',
        familyCount: 0,
        residentType: 'owner',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pre-add resident');
    }
  };

  const handleApproveJoin = async (id) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/residents/requests/${id}/approve`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve join request');
    }
  };

  const handleRejectJoin = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this join request?')) return;
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/residents/requests/${id}/reject`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject join request');
    }
  };

  const handleTransferAdmin = async (e) => {
    e.preventDefault();
    if (!transferTargetId) return;
    const targetUser = activeUsers.find((u) => u._id === transferTargetId);
    if (!window.confirm(`WARNING: Are you sure you want to transfer Society Admin privileges to ${targetUser?.name}? You will be demoted to a regular resident and logged out.`)) return;

    try {
      setError('');
      setSuccess('');
      const res = await API.post('/residents/transfer-admin', { targetUserId: transferTargetId });
      setSuccess(res.data.message);
      // Wait for user to read success then redirect / logout
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer admin privileges');
    }
  };

  if (loading) return <p className="page-container">Loading resident manager...</p>;

  return (
    <section className="page-container">
      <h2>Resident & Staff Management</h2>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Pre-add Whitelist Resident */}
        <div className="card">
          <h3>Pre-Add Resident Entry</h3>
          <p className="note">Add residents here so they can choose their details during self-registration.</p>
          <form onSubmit={handlePreAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-row">
              <input
                placeholder="House / Flat No (e.g. A-101)"
                value={preAddForm.houseNo}
                onChange={(e) => setPreAddForm({ ...preAddForm, houseNo: e.target.value })}
                required
              />
              <input
                placeholder="Resident Name"
                value={preAddForm.name}
                onChange={(e) => setPreAddForm({ ...preAddForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <input
                placeholder="Phone (optional)"
                value={preAddForm.phone}
                onChange={(e) => setPreAddForm({ ...preAddForm, phone: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={preAddForm.email}
                onChange={(e) => setPreAddForm({ ...preAddForm, email: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                placeholder="Family Count"
                value={preAddForm.familyCount}
                onChange={(e) => setPreAddForm({ ...preAddForm, familyCount: Number(e.target.value) })}
              />
              <select
                value={preAddForm.residentType}
                onChange={(e) => setPreAddForm({ ...preAddForm, residentType: e.target.value })}
              >
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
                <option value="family_member">Family Member</option>
              </select>
            </div>
            <button type="submit">Pre-Add Resident</button>
          </form>
        </div>

        {/* Transfer Privileges */}
        <div className="card">
          <h3>Transfer Admin Privilege</h3>
          <p className="note">Promote another active resident to Society Admin. You will lose admin status.</p>
          <form onSubmit={handleTransferAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value)}
              required
            >
              <option value="">-- Select Active Resident --</option>
              {activeUsers
                .filter((u) => u.role === 'resident')
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} (Flat: {u.flatNumber})
                  </option>
                ))}
            </select>
            <button type="submit" className="btn-danger" disabled={!transferTargetId}>
              Transfer Admin Privileges
            </button>
          </form>
        </div>
      </div>

      {/* Join Requests */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Pending Join Requests</h3>
        <p className="note">Approve or reject residents/guards trying to register for your society.</p>
        {joinRequests.length === 0 ? (
          <p className="note">No pending join requests.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Flat</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {joinRequests.map((req) => (
                <tr key={req._id}>
                  <td><strong>{req.name}</strong></td>
                  <td>{req.email}</td>
                  <td>{req.role}</td>
                  <td>{req.flatNumber || '—'}</td>
                  <td>{req.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        style={{ background: '#1e7a4a', padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleApproveJoin(req._id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleRejectJoin(req._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pre-Added Whitelist Members */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Pre-Added Resident Whitelist</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Flat</th>
              <th>Name</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Registration Link Status</th>
            </tr>
          </thead>
          <tbody>
            {preAddedResidents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }} className="note">
                  No pre-added residents whitelist entries yet.
                </td>
              </tr>
            ) : (
              preAddedResidents.map((r) => (
                <tr key={r._id}>
                  <td><strong>{r.houseNo}</strong></td>
                  <td>{r.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.residentType}</td>
                  <td>{r.phone || '—'}</td>
                  <td>{r.email || '—'}</td>
                  <td>
                    {r.userId ? (
                      <span style={{ color: '#1e7a4a', fontWeight: '600' }}>Linked (Registered)</span>
                    ) : (
                      <span style={{ color: '#9a7d0a', fontStyle: 'italic' }}>Pending Resident Signup</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Active Users */}
      <div className="card">
        <h3>Active Residents & Staff</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Flat</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{u.flatNumber || '—'}</td>
                <td>{u.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManageResidentsPage;
