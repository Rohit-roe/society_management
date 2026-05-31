import { useState, useEffect } from 'react';
import API from '../../api/axios';

const STATUSES = ['open', 'in_progress', 'resolved', 'closed', 'escalated'];
const CATEGORIES = ['water', 'lift', 'electricity', 'parking', 'security', 'noise', 'plumbing', 'custom'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ManageSupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTickets = () => {
    API.get('/support')
      .then((res) => setTickets(res.data))
      .finally(() => setLoading(false));
  };

  const fetchStaff = () => {
    API.get('/users/society')
      .then((res) => {
        // Staff can be security guards or admins
        const staff = res.data.filter((u) => u.role === 'security' || u.role === 'society_admin');
        setStaffList(staff);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTickets();
    fetchStaff();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setError('');
      setSuccess('');
      await API.patch(`/support/${id}`, { status });
      setSuccess('Status updated successfully.');
      fetchTickets();
    } catch (err) {
      setError('Failed to update ticket status');
    }
  };

  const handleAssignChange = async (id, assignedTo) => {
    try {
      setError('');
      setSuccess('');
      await API.put(`/support/${id}/assign`, { assignedTo });
      setSuccess('Ticket assignment updated successfully.');
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === '' ? true : t.status === statusFilter;
    const matchesCategory = categoryFilter === '' ? true : t.category === categoryFilter;
    const matchesPriority = priorityFilter === '' ? true : t.priority === priorityFilter;
    return matchesStatus && matchesCategory && matchesPriority;
  });

  if (loading && tickets.length === 0) return <p className="page-container">Loading support tickets...</p>;

  return (
    <div className="page-container">
      <h2>Manage Complaints & Tickets</h2>
      <p className="note">Oversee resident complaints, assign tasks, and track resolutions.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1a3c5e' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px', padding: '8px', marginTop: '4px', marginBottom: '0' }}
          >
            <option value="">-- All Statuses --</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1a3c5e' }}>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px', padding: '8px', marginTop: '4px', marginBottom: '0' }}
          >
            <option value="">-- All Categories --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1a3c5e' }}>Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: '160px', padding: '8px', marginTop: '4px', marginBottom: '0' }}
          >
            <option value="">-- All Priorities --</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredTickets.length === 0 ? (
          <p className="note">No complaints matching current filters.</p>
        ) : (
          filteredTickets.map((t) => (
            <article
              key={t._id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  t.priority === 'urgent' ? '#c0392b' : t.priority === 'high' ? '#9a7d0a' : '#2e86ab'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4 style={{ color: '#1a3c5e', fontSize: '1.1rem' }}>
                    {t.title || t.subject}
                    <span
                      style={{
                        marginLeft: '8px',
                        background: '#eef6fa',
                        color: '#2e86ab',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.category}
                    </span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '6px' }}>
                    <strong>Flat:</strong> {t.flatNumber || t.residentId?.flatNumber || 'N/A'} |{' '}
                    <strong>Resident:</strong> {t.residentId?.name} ({t.residentId?.email}) |{' '}
                    <strong>Date:</strong> {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600' }}>Status</label>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      style={{ padding: '6px', fontSize: '0.85rem', marginBottom: '0', width: '130px' }}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600' }}>Assign Staff</label>
                    <select
                      value={t.assignedTo?._id || ''}
                      onChange={(e) => handleAssignChange(t._id, e.target.value)}
                      style={{ padding: '6px', fontSize: '0.85rem', marginBottom: '0', width: '150px' }}
                    >
                      <option value="">-- Unassigned --</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} ({staff.role === 'security' ? 'Guard' : 'Admin'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#333', marginTop: '16px', borderTop: '1px solid #f0f4f8', paddingTop: '12px', whiteSpace: 'pre-line' }}>
                {t.description}
              </p>

              {t.attachment && (
                <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                  <strong>Attachment file:</strong>{' '}
                  <a href={t.attachment} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                    View Uploaded File
                  </a>
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageSupportTicketsPage;
