import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Building, Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const emptyForm = { name: '', address: '', city: '', totalFlats: '' };

const ManageSocietiesPage = () => {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmSuspendId, setConfirmSuspendId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form Validations & Loadings
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [loadingForm, setLoadingForm] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchSocieties = () => {
    API.get('/societies').then((res) => {
      setSocieties(res.data);
    });
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, itemsPerPage]);

  const validateField = (name, value) => {
    let err = '';
    if (!value) {
      err = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'totalFlats' && Number(value) <= 0) {
      err = 'Total flats must be greater than 0';
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formTouched[field]) {
      validateField(field, value);
    }
  };

  const handleInputBlur = (field) => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fields = ['name', 'totalFlats', 'address', 'city'];
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

    setLoadingForm(true);
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
      setFormTouched({});
      setFormErrors({});
      fetchSocieties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save society');
    } finally {
      setLoadingForm(false);
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
    setFormErrors({});
    setFormTouched({});
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/societies/${id}`);
      setSuccess('Society deleted successfully');
      fetchSocieties();
    } catch (err) {
      setError('Failed to delete society');
    }
  };

  const handleToggleSuspend = async (id, name, isSuspended) => {
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
    const matchesSearch =
      s.name?.toLowerCase().includes(term) ||
      (s.city && s.city.toLowerCase().includes(term)) ||
      (s.address && s.address.toLowerCase().includes(term));
    const matchesStatus = statusFilter
      ? (statusFilter === 'suspended' ? s.status === 'suspended' : s.status !== 'suspended')
      : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredSocieties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSocieties = filteredSocieties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Manage Societies</h2>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>{editId ? 'Edit Society' : 'Create Society'}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="modern-form-grid">
            <div className="modern-form-group">
              <label className="modern-label">Society Name <span className="required-asterisk">*</span></label>
              <input
                placeholder="Society Name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleInputBlur('name')}
                required
                className={`modern-input ${formTouched.name && formErrors.name ? 'is-invalid' : formTouched.name && !formErrors.name ? 'is-valid' : ''}`}
              />
              {formTouched.name && formErrors.name && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {formErrors.name}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Total Flats <span className="required-asterisk">*</span></label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={form.totalFlats}
                onChange={(e) => handleInputChange('totalFlats', e.target.value)}
                onBlur={() => handleInputBlur('totalFlats')}
                required
                className={`modern-input ${formTouched.totalFlats && formErrors.totalFlats ? 'is-invalid' : formTouched.totalFlats && !formErrors.totalFlats ? 'is-valid' : ''}`}
              />
              {formTouched.totalFlats && formErrors.totalFlats && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {formErrors.totalFlats}
                </span>
              )}
            </div>
          </div>

          <div className="modern-form-grid">
            <div className="modern-form-group">
              <label className="modern-label">Address <span className="required-asterisk">*</span></label>
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                onBlur={() => handleInputBlur('address')}
                required
                className={`modern-input ${formTouched.address && formErrors.address ? 'is-invalid' : formTouched.address && !formErrors.address ? 'is-valid' : ''}`}
              />
              {formTouched.address && formErrors.address && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {formErrors.address}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">City <span className="required-asterisk">*</span></label>
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                onBlur={() => handleInputBlur('city')}
                required
                className={`modern-input ${formTouched.city && formErrors.city ? 'is-invalid' : formTouched.city && !formErrors.city ? 'is-valid' : ''}`}
              />
              {formTouched.city && formErrors.city && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {formErrors.city}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loadingForm}>
              {loadingForm ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : editId ? 'Update Society' : 'Create Society'}
            </button>
            {editId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setEditId(null); setForm(emptyForm); setFormErrors({}); setFormTouched({}); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Society Registrations</h3>
        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search societies by name, city, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            {(search || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedSocieties.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
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
                  {paginatedSocieties.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.address || 'N/A'}</td>
                      <td>{s.city}</td>
                      <td>{s.totalFlats}</td>
                      <td>
                        <DashboardStatusBadge
                          tone={s.status === 'suspended' ? 'danger' : 'success'}
                          icon={s.status === 'suspended' ? AlertTriangle : CheckCircle2}
                        >
                          {s.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                        </DashboardStatusBadge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-compact"
                            onClick={() => handleEdit(s)}
                          >
                            Edit
                          </button>
                          {confirmSuspendId === s._id ? (
                            <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>{s.status === 'suspended' ? 'Unsuspend?' : 'Suspend?'}</span>
                              <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  className="inline-confirm-btn-yes"
                                  onClick={() => {
                                    handleToggleSuspend(s._id, s.name, s.status === 'suspended');
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
                          ) : confirmDeleteId === s._id ? (
                            <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Delete?</span>
                              <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  className="inline-confirm-btn-yes"
                                  onClick={() => {
                                    handleDelete(s._id);
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
                                className={`btn ${s.status === 'suspended' ? 'btn-primary' : 'btn-danger'} btn-compact`}
                                onClick={() => setConfirmSuspendId(s._id)}
                              >
                                {s.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-compact"
                                onClick={() => setConfirmDeleteId(s._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
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
            icon={Building}
            title="No societies found"
            description="Try adjusting your filters or search terms."
            actionText={(search || statusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setSearch('');
              setStatusFilter('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageSocietiesPage;
