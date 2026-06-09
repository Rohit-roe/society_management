import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, User, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const ROLES = ['resident', 'security', 'society_admin'];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmSuspendId, setConfirmSuspendId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchUsers = () => {
    API.get('/users')
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, itemsPerPage]);

  const handleRoleChange = async (id, role) => {
    try {
      setError('');
      setSuccess('');
      await API.put(`/users/${id}/role`, { role });
      setSuccess('User role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleToggleSuspend = async (id, name, isCurrentlySuspended) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/app-admin/users/${id}/suspend`);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle suspension');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      setSuccess('');
      await API.delete(`/users/${id}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      (u.flatNumber && u.flatNumber.toLowerCase().includes(term)) ||
      (u.societyId?.name && u.societyId.name.toLowerCase().includes(term));

    const matchesRole = roleFilter === '' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === '' ? true : u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Manage Users</h2>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="card">
        <h3>User Registry</h3>
        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by name, email, flat, society..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="app_admin">App Admin</option>
              <option value="society_admin">Society Admin</option>
              <option value="resident">Resident</option>
              <option value="security">Security</option>
            </select>
            <select
              className="modern-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            {(search || roleFilter || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="skeleton card-skeleton" style={{ marginTop: '16px' }} />
        ) : paginatedUsers.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Society</th>
                    <th>Flat</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((u) => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.societyId?.name || '—'}</td>
                      <td>{u.flatNumber || '—'}</td>
                      <td>
                        {u.role === 'app_admin' ? (
                          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>App Admin</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="modern-input"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto', minWidth: '130px' }}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <DashboardStatusBadge
                          tone={
                            u.status === 'suspended'
                              ? 'danger'
                              : u.status === 'pending'
                              ? 'warning'
                              : 'success'
                          }
                          icon={
                            u.status === 'suspended'
                              ? AlertTriangle
                              : u.status === 'pending'
                              ? Clock
                              : CheckCircle2
                          }
                        >
                          {(u.status || 'active').toUpperCase()}
                        </DashboardStatusBadge>
                      </td>
                      <td>
                        {u.role !== 'app_admin' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {confirmSuspendId === u._id ? (
                              <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>{u.status === 'suspended' ? 'Unsuspend?' : 'Suspend?'}</span>
                                <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-yes"
                                    onClick={() => {
                                      handleToggleSuspend(u._id, u.name, u.status === 'suspended');
                                      setConfirmSuspendId(null);
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-no"
                                    onClick={() => setConfirmSuspendId(null)}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : confirmDeleteId === u._id ? (
                              <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Delete?</span>
                                <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-yes"
                                    onClick={() => {
                                      handleDelete(u._id);
                                      setConfirmDeleteId(null);
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-no"
                                    onClick={() => setConfirmDeleteId(null)}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className={`btn ${u.status === 'suspended' ? 'btn-primary' : 'btn-danger'} btn-compact`}
                                  onClick={() => setConfirmSuspendId(u._id)}
                                >
                                  {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-compact"
                                  onClick={() => setConfirmDeleteId(u._id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        ) : (
          <EmptyState
            icon={User}
            title="No users found"
            description="Try adjusting your filters or search terms."
            actionText={(search || roleFilter || statusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setSearch('');
              setRoleFilter('');
              setStatusFilter('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageUsersPage;
