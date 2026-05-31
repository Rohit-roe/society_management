import { useState, useEffect } from 'react';
import API from '../../api/axios';

const emptyForm = { name: '', address: '', city: '', totalFlats: '' };

const ManageSocietiesPage = () => {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSocieties = () => {
    API.get('/societies').then((res) => {
      // Fetch latest statuses for these societies, or let the GET /societies include status
      // In backend/controllers/societyController.js, status is selected!
      // Let's populate it
      setSocieties(res.data);
    });
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form, totalFlats: Number(form.totalFlats) };
      if (editId) {
        await API.put(`/societies/${editId}`, payload);
        setSuccess('Society updated successfully');
        setEditId(null);
      } else {
        await API.post('/societies', payload);
        setSuccess('Society created successfully');
      }
      setForm(emptyForm);
      fetchSocieties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save society');
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name,
      address: s.address || '',
      city: s.city || '',
      totalFlats: s.totalFlats || '',
    });
    setEditId(s._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this society?')) return;
    try {
      await API.delete(`/societies/${id}`);
      setSuccess('Society deleted successfully');
      fetchSocieties();
    } catch (err) {
      setError('Failed to delete society');
    }
  };

  const handleToggleSuspend = async (id, name, isSuspended) => {
    const action = isSuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} society "${name}"?`)) return;
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/app-admin/societies/${id}/suspend`);
      setSuccess(res.data.message);
      fetchSocieties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle suspension');
    }
  };

  const filteredSocieties = societies.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.city && s.city.toLowerCase().includes(term)) ||
      (s.address && s.address.toLowerCase().includes(term))
    );
  });

  return (
    <section className="page-container">
      <h2>Manage Societies</h2>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h4>{editId ? 'Edit Society' : 'Create Society'}</h4>
        <form onSubmit={handleSubmit} className="form-row" style={{ marginTop: '12px' }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Total Flats"
            value={form.totalFlats}
            onChange={(e) => setForm({ ...form, totalFlats: e.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ flex: 1 }}>{editId ? 'Update' : 'Create'}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }} style={{ background: '#777' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search societies by name, city, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '100%', maxWidth: '400px', marginBottom: '0' }}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>City</th>
            <th>Flats</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSocieties.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }} className="note">
                No societies found.
              </td>
            </tr>
          ) : (
            filteredSocieties.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.address || 'N/A'}</td>
                <td>{s.city}</td>
                <td>{s.totalFlats}</td>
                <td>
                  <span
                    className={`badge ${s.status === 'suspended' ? 'urgent' : ''}`}
                    style={{
                      background: s.status === 'suspended' ? '#fadbd8' : '#d5f5e3',
                      color: s.status === 'suspended' ? '#c0392b' : '#1e7a4a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                    }}
                  >
                    {s.status === 'suspended' ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => handleEdit(s)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{
                      background: s.status === 'suspended' ? '#1e7a4a' : '#9a7d0a',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                    }}
                    onClick={() => handleToggleSuspend(s._id, s.name, s.status === 'suspended')}
                  >
                    {s.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(s._id)}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ManageSocietiesPage;
