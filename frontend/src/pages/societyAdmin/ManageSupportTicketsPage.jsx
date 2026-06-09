import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, MessageSquare } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter, itemsPerPage]);

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
    const titleText = t.title || t.subject || '';
    const descText = t.description || '';
    const matchesSearch =
      titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : t.status === statusFilter;
    const matchesCategory = categoryFilter === '' ? true : t.category === categoryFilter;
    const matchesPriority = priorityFilter === '' ? true : t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading && tickets.length === 0) return <div className="page-container"><div className="skeleton card-skeleton" /></div>;

  return (
    <div className="page-container">
      <h2>Manage Complaints & Tickets</h2>
      <p className="note">Oversee resident complaints, assign tasks, and track resolutions.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {/* Filters Toolbar */}
      <div className="modern-filter-bar" style={{ marginBottom: '24px' }}>
        <div className="modern-filter-search-wrap">
          <Search className="modern-filter-search-icon" size={16} />
          <input
            type="text"
            className="modern-filter-search-input"
            placeholder="Search tickets by subject or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="modern-filter-group">
          <select
            className="modern-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            className="modern-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ textTransform: 'capitalize' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            className="modern-filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.toUpperCase()}
              </option>
            ))}
          </select>
          {(searchTerm || statusFilter || categoryFilter || priorityFilter) && (
            <button
              type="button"
              className="btn btn-secondary modern-filter-btn-clear"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {paginatedTickets.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={searchTerm || statusFilter || categoryFilter || priorityFilter ? "No matching complaints" : "No complaints raised"}
            description={
              searchTerm || statusFilter || categoryFilter || priorityFilter
                ? "Try clearing or adjusting your filters to find more complaints."
                : "No complaints or support tickets have been submitted yet."
            }
            actionText={searchTerm || statusFilter || categoryFilter || priorityFilter ? "Clear Filters" : null}
            onAction={
              searchTerm || statusFilter || categoryFilter || priorityFilter
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setCategoryFilter('');
                    setPriorityFilter('');
                  }
                : null
            }
          />
        ) : (
          <>
            {paginatedTickets.map((t) => (
              <article
                key={t._id}
                className="card"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  borderLeft: `4px solid ${
                    t.priority === 'urgent'
                      ? 'var(--status-danger-text)'
                      : t.priority === 'high'
                      ? 'var(--status-warning-text)'
                      : 'var(--primary)'
                  }`,
                  padding: '20px',
                  borderRadius: 'var(--radius)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0 }}>
                      {t.title || t.subject}
                      <span
                        style={{
                          marginLeft: '8px',
                          background: 'var(--status-neutral-bg)',
                          color: 'var(--status-neutral-text)',
                          border: '1px solid var(--status-neutral-border)',
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {t.category}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', margin: '6px 0 0' }}>
                      <strong>Flat:</strong> {t.flatNumber || t.residentId?.flatNumber || 'N/A'} |{' '}
                      <strong>Resident:</strong> {t.residentId?.name} ({t.residentId?.email}) |{' '}
                      <strong>Date:</strong> {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</label>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t._id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          width: '130px',
                        }}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase().replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Assign Staff</label>
                      <select
                        value={t.assignedTo?._id || ''}
                        onChange={(e) => handleAssignChange(t._id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          width: '150px',
                        }}
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

                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', whiteSpace: 'pre-line' }}>
                  {t.description}
                </p>

                {t.attachment && (
                  <p style={{ marginTop: '12px', fontSize: '0.85rem', margin: '12px 0 0' }}>
                    <strong>Attachment file:</strong>{' '}
                    <a href={t.attachment} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                      View Uploaded File
                    </a>
                  </p>
                )}
              </article>
            ))}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ManageSupportTicketsPage;
