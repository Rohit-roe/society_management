import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { AlertCircle, Megaphone, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const ManageNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchNotices = () => API.get('/notices').then((res) => setNotices(res.data));

  useEffect(() => {
    fetchNotices();
  }, []);

  const validateField = (name, value) => {
    let err = '';
    if (!value) {
      err = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formTouched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fields = ['title', 'body'];
    const newTouched = {};
    fields.forEach((f) => {
      newTouched[f] = true;
    });
    setFormTouched(newTouched);

    let isValid = true;
    fields.forEach((f) => {
      if (!validateField(f, form[f])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setError('Please resolve all validation errors.');
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await API.put(`/notices/${editId}`, form);
        setSuccess('Notice updated successfully!');
        setEditId(null);
      } else {
        await API.post('/notices', form);
        setSuccess('Notice posted successfully!');
      }
      setForm({ title: '', body: '', priority: 'normal' });
      setFormErrors({});
      setFormTouched({});
      fetchNotices();
    } catch (err) {
      setError('Failed to save notice');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, body: n.body, priority: n.priority });
    setEditId(n._id);
    setFormErrors({});
    setFormTouched({});
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      setSuccess('');
      await API.delete(`/notices/${id}`);
      setSuccess('Notice deleted successfully.');
      fetchNotices();
    } catch {
      setError('Failed to delete notice');
    }
  };

  return (
    <div className="page-container">
      <h2>Notice Board Management</h2>
      <p className="note">Publish global community announcements, maintenance alerts, or holiday schedules.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start', marginTop: '20px' }} className="notices-split-layout">
        
        {/* notice creation form */}
        <div className="card">
          <h3>{editId ? 'Edit Announcement' : 'Post New Notice'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
            
            <div className="modern-form-group">
              <label className="modern-label">Title <span className="required-asterisk">*</span></label>
              <input
                name="title"
                placeholder="e.g. Society AGM Meeting"
                value={form.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                required
                className={`modern-input ${formTouched.title && formErrors.title ? 'is-invalid' : formTouched.title && !formErrors.title ? 'is-valid' : ''}`}
              />
              {formTouched.title && formErrors.title && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.title}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Priority <span className="required-asterisk">*</span></label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="modern-input"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Notice Body <span className="required-asterisk">*</span></label>
              <textarea
                name="body"
                placeholder="Write your announcement notes..."
                value={form.body}
                onChange={handleChange}
                onBlur={() => handleBlur('body')}
                required
                rows="5"
                className={`modern-input ${formTouched.body && formErrors.body ? 'is-invalid' : formTouched.body && !formErrors.body ? 'is-valid' : ''}`}
              />
              {formTouched.body && formErrors.body && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.body}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </span>
                ) : editId ? 'Update Notice' : 'Post Notice'}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setEditId(null); setForm({ title: '', body: '', priority: 'normal' }); setFormErrors({}); setFormTouched({}); }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* notices list */}
        <div className="card">
          <h3>Announcements Ledger</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {notices.length === 0 ? (
              <p className="note">No notices registered yet.</p>
            ) : (
              notices.map((n) => (
                <article
                  key={n._id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '16px',
                    background: 'var(--bg-card)',
                    borderLeft: `4px solid ${n.priority === 'urgent' ? 'var(--status-danger-text)' : 'var(--status-success-text)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {n.title}
                      <DashboardStatusBadge
                        tone={n.priority === 'urgent' ? 'danger' : 'success'}
                        icon={Megaphone}
                      >
                        {n.priority.toUpperCase()}
                      </DashboardStatusBadge>
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{n.body}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-compact inline-flex items-center gap-1"
                      onClick={() => handleEdit(n)}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    {confirmDeleteId === n._id ? (
                      <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Delete?</span>
                        <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="inline-confirm-btn-yes"
                            onClick={() => {
                              handleDelete(n._id);
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
                      <button
                        type="button"
                        className="btn btn-danger btn-compact inline-flex items-center gap-1"
                        onClick={() => setConfirmDeleteId(n._id)}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageNoticesPage;
