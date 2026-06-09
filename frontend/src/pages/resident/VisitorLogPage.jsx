import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Search, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const VisitorLogPage = ({ showAll = false, readOnly = false, embedded = false }) => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({
    visitorName: '',
    visitorPhone: '',
    flatToVisit: user?.flatNumber || '',
    purpose: '',
  });
  
  // Roster log form states
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [logging, setLogging] = useState(false);

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch = v.visitorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? v.approvalStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredVisitors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const validateField = (name, value) => {
    let err = '';
    if (!value && name !== 'visitorPhone' && name !== 'purpose') {
      err = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'visitorPhone' && value) {
      if (!/^\+?[0-9\s-]{10,15}$/.test(value)) {
        err = 'Please enter a valid phone number';
      }
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

  const handleLog = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const fields = ['visitorName', 'flatToVisit', 'visitorPhone'];
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

    setLogging(true);
    try {
      await API.post('/visitors', form);
      setForm({
        visitorName: '',
        visitorPhone: '',
        flatToVisit: user?.flatNumber || '',
        purpose: '',
      });
      setFormTouched({});
      setFormErrors({});
      fetchVisitors();
      setMessage('Visitor request logged at gate!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log visitor');
    } finally {
      setLogging(false);
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
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Log Gated Visitor Request</h3>
          <form onSubmit={handleLog} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
            
            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">Visitor Full Name <span className="required-asterisk">*</span></label>
                <input
                  name="visitorName"
                  placeholder="Visitor Full Name"
                  onChange={handleChange}
                  onBlur={() => handleBlur('visitorName')}
                  value={form.visitorName}
                  required
                  className={`modern-input ${formTouched.visitorName && formErrors.visitorName ? 'is-invalid' : formTouched.visitorName && !formErrors.visitorName ? 'is-valid' : ''}`}
                />
                {formTouched.visitorName && formErrors.visitorName && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {formErrors.visitorName}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Flat to Visit <span className="required-asterisk">*</span></label>
                <input
                  name="flatToVisit"
                  placeholder="Flat to Visit (e.g. 101)"
                  onChange={handleChange}
                  onBlur={() => handleBlur('flatToVisit')}
                  value={form.flatToVisit}
                  required
                  className={`modern-input ${formTouched.flatToVisit && formErrors.flatToVisit ? 'is-invalid' : formTouched.flatToVisit && !formErrors.flatToVisit ? 'is-valid' : ''}`}
                />
                {formTouched.flatToVisit && formErrors.flatToVisit && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {formErrors.flatToVisit}
                  </span>
                )}
              </div>
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">Phone Number</label>
                <input
                  name="visitorPhone"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  onBlur={() => handleBlur('visitorPhone')}
                  value={form.visitorPhone}
                  className={`modern-input ${formTouched.visitorPhone && formErrors.visitorPhone ? 'is-invalid' : formTouched.visitorPhone && !formErrors.visitorPhone ? 'is-valid' : ''}`}
                />
                {formTouched.visitorPhone && formErrors.visitorPhone && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {formErrors.visitorPhone}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Purpose of Visit</label>
                <input
                  name="purpose"
                  placeholder="Purpose (e.g. Delivery, Guest)"
                  onChange={handleChange}
                  onBlur={() => handleBlur('purpose')}
                  value={form.purpose}
                  className="modern-input"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={logging} style={{ width: '200px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {logging ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging...
                </>
              ) : 'Log & Notify'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Visitor Ledger</h3>
          </div>

          {/* Search and Filters */}
          <div className="modern-filter-bar">
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search visitor by name..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
              </select>
              {(searchTerm || statusFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {paginatedVisitors.length > 0 ? (
            <>
              <div className="modern-table-wrapper visitor-ledger-table">
                <table className="modern-table">
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
                    {paginatedVisitors.map((v) => (
                      <tr key={v._id}>
                        <td><strong>{v.visitorName}</strong></td>
                        <td>{v.visitorPhone || '—'}</td>
                        <td>Flat {v.flatToVisit}</td>
                        <td>{v.purpose || '—'}</td>
                        <td>
                          <DashboardStatusBadge
                            tone={
                              v.approvalStatus === 'approved' || v.approvalStatus === 'checked_in'
                                ? 'success'
                                : v.approvalStatus === 'pending'
                                ? 'warning'
                                : v.approvalStatus === 'rejected'
                                ? 'danger'
                                : 'neutral'
                            }
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
              title={searchTerm || statusFilter ? "No matching visitors" : "No visitors logged"}
              description={
                searchTerm || statusFilter
                  ? "Try adjusting or clearing your filters to see more results."
                  : "No visitor records have been logged yet."
              }
              actionText={searchTerm || statusFilter ? "Clear Filters" : null}
              onAction={
                searchTerm || statusFilter
                  ? () => {
                      setSearchTerm('');
                      setStatusFilter('');
                    }
                  : null
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorLogPage;
