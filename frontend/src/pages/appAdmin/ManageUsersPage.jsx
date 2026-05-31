import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ROLES = ['resident', 'security', 'society_admin'];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => {
    API.get('/users')
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    const action = isCurrentlySuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} user "${name}"?`)) return;
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
    if (!window.confirm('Delete this user?')) return;
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
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.flatNumber && u.flatNumber.toLowerCase().includes(term)) ||
      (u.societyId?.name && u.societyId.name.toLowerCase().includes(term));

    const matchesRole = roleFilter === '' ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) return <p className="page-container">Loading users...</p>;

  return (
    <section className="page-container">
      <h2>Manage Users</h2>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, email, flat, society..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', flex: 1, minWidth: '240px', marginBottom: '0' }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: '10px', width: '200px', marginBottom: '0' }}
        >
          <option value="">-- All Roles --</option>
          <option value="app_admin">App Admin</option>
          <option value="society_admin">Society Admin</option>
          <option value="resident">Resident</option>
          <option value="security">Security</option>
        </select>
      </div>

      <table className="data-table">
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
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }} className="note">
                No users found.
              </td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>{u.societyId?.name || '—'}</td>
                <td>{u.flatNumber || '—'}</td>
                <td>
                  {u.role === 'app_admin' ? (
                    <span style={{ fontWeight: '600', color: '#6c3483' }}>App Admin</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{ padding: '4px', width: '130px', marginBottom: '0' }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${u.status === 'suspended' ? 'urgent' : u.status === 'pending' ? 'pending' : ''}`}
                    style={{
                      background:
                        u.status === 'suspended'
                          ? '#fadbd8'
                          : u.status === 'pending'
                          ? '#fef9e7'
                          : '#d5f5e3',
                      color:
                        u.status === 'suspended'
                          ? '#c0392b'
                          : u.status === 'pending'
                          ? '#b7950b'
                          : '#1e7a4a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    {u.status || 'active'}
                  </span>
                </td>
                <td>
                  {u.role !== 'app_admin' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        style={{
                          background: u.status === 'suspended' ? '#1e7a4a' : '#9a7d0a',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                        }}
                        onClick={() => handleToggleSuspend(u._id, u.name, u.status === 'suspended')}
                      >
                        {u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(u._id)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ManageUsersPage;
