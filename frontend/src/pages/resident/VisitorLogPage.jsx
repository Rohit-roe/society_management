import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const VisitorLogPage = ({ showAll = false, readOnly = false, embedded = false }) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({
    visitorName: '',
    visitorPhone: '',
    flatToVisit: user?.flatNumber || '',
    purpose: '',
  });
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPending = () => {
    if (user?.role === 'resident' && !showAll) {
      API.get('/visitors/pending').then((res) => setPending(res.data));
    }
  };

  const fetchVisitors = () => {
    const endpoint = showAll ? '/visitors' : '/visitors/flat';
    API.get(endpoint)
      .then((res) => setVisitors(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisitors();
    fetchPending();
  }, [showAll, user?.role]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLog = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await API.post('/visitors', form);
      setForm({
        visitorName: '',
        visitorPhone: '',
        flatToVisit: user?.flatNumber || '',
        purpose: '',
      });
      fetchVisitors();
      setMessage('Visitor request logged at gate!');
    } catch {
      setError('Failed to log visitor');
    }
  };

  const handleCheckin = async (id) => {
    try {
      await API.patch(`/visitors/${id}/checkin`);
      fetchVisitors();
    } catch (err) {
      setError('Failed to check in visitor');
    }
  };

  const handleCheckout = async (id) => {
    try {
      await API.patch(`/visitors/${id}/checkout`);
      fetchVisitors();
    } catch (err) {
      setError('Failed to check out visitor');
    }
  };

  const handleApprove = async (id) => {
    await API.patch(`/visitors/${id}/approve`);
    fetchVisitors();
    fetchPending();
  };

  const handleReject = async (id) => {
    await API.patch(`/visitors/${id}/reject`);
    fetchPending();
  };

  const isResident = user?.role === 'resident';
  const canModify = !readOnly && (user?.role === 'security' || user?.role === 'society_admin');

  return (
    <div className={embedded ? '' : 'page-container'}>
      {!embedded && (
        <div className="page-header">
          <h2>Visitor Log & Gate Approvals</h2>
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      {isResident && !showAll && pending.length > 0 && (
        <section className="card visitor-pending-panel">
          <h3>Pending Gate Approvals</h3>
          <div className="visitor-pending-grid">
            {pending.map((v) => (
              <div key={v._id} className="visitor-pending-card">
                <p>{v.visitorName}</p>
                <span>Purpose: {v.purpose || 'Visit'}</span>
                <span>Phone: {v.visitorPhone || 'N/A'}</span>
                <div className="visitor-compact-actions">
                  <button type="button" className="btn btn-primary btn-compact" onClick={() => handleApprove(v._id)}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-danger btn-compact" onClick={() => handleReject(v._id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {user?.role === 'security' && !readOnly && (
        <div className="card">
          <h3>Log Gated Visitor Request</h3>
          <form onSubmit={handleLog} className="filter-bar visitor-log-form">
            <input
              name="visitorName"
              placeholder="Visitor Full Name"
              onChange={handleChange}
              value={form.visitorName}
              required
            />
            <input
              name="visitorPhone"
              placeholder="Phone Number"
              onChange={handleChange}
              value={form.visitorPhone}
            />
            <input
              name="flatToVisit"
              placeholder="Flat to Visit (e.g. 101)"
              onChange={handleChange}
              value={form.flatToVisit}
              required
            />
            <input
              name="purpose"
              placeholder="Purpose (e.g. Delivery, Guest)"
              onChange={handleChange}
              value={form.purpose}
            />
            <button type="submit" className="btn btn-primary">Log & Notify</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <div className="card">
          <h3>Visitor Ledger</h3>
          <div className="smart-table-wrapper visitor-ledger-table">
            <table className="smart-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Flat</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  {!readOnly && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {visitors.length > 0 ? (
                  visitors.map((v) => (
                    <tr key={v._id}>
                      <td><strong>{v.visitorName}</strong></td>
                      <td>{v.visitorPhone || '—'}</td>
                      <td>Flat {v.flatToVisit}</td>
                      <td>{v.purpose || '—'}</td>
                      <td>
                        <DashboardStatusBadge
                          tone={v.approvalStatus === 'pending' ? 'warning' : 'neutral'}
                          icon={v.approvalStatus === 'pending' ? Clock : CheckCircle2}
                        >
                          {v.approvalStatus?.replace('_', ' ').toUpperCase()}
                        </DashboardStatusBadge>
                      </td>
                      <td>{v.checkIn ? new Date(v.checkIn).toLocaleString() : '—'}</td>
                      <td>{v.checkOut ? new Date(v.checkOut).toLocaleString() : '—'}</td>
                      {!readOnly && (
                        <td>
                          {v.approvalStatus === 'approved' && canModify && (
                            <button type="button" className="btn btn-primary btn-compact" onClick={() => handleCheckin(v._id)}>
                              Check In
                            </button>
                          )}
                          {v.approvalStatus === 'checked_in' && (canModify || isResident) && (
                            <button type="button" className="btn btn-danger btn-compact" onClick={() => handleCheckout(v._id)}>
                              Check Out
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No visitors logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorLogPage;
