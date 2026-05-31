import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const fetchNotices = () => API.get('/notices').then((res) => setNotices(res.data));

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await API.put(`/notices/${editId}`, form);
        setEditId(null);
      } else {
        await API.post('/notices', form);
      }
      setForm({ title: '', body: '', priority: 'normal' });
      fetchNotices();
    } catch {
      setError('Failed to save notice');
    }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, body: n.body, priority: n.priority });
    setEditId(n._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    await API.delete(`/notices/${id}`);
    fetchNotices();
  };

  return (
    <section className="page-container">
      <h2>{editId ? 'Edit Notice' : 'Post a Notice'}</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="body" placeholder="Notice content..." value={form.body} onChange={handleChange} required />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit">{editId ? 'Update Notice' : 'Post Notice'}</button>
        {editId && (
          <button type="button" onClick={() => setEditId(null)}>
            Cancel
          </button>
        )}
      </form>
      <h3>All Notices</h3>
      {notices.map((n) => (
        <article key={n._id} className="notice-card">
          <h4>
            {n.title} <span className={`badge ${n.priority}`}>{n.priority}</span>
          </h4>
          <p>{n.body}</p>
          <button type="button" onClick={() => handleEdit(n)}>
            Edit
          </button>
          <button type="button" className="btn-danger" onClick={() => handleDelete(n._id)}>
            Delete
          </button>
        </article>
      ))}
    </section>
  );
};

export default ManageNoticesPage;
