import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Users, UserCheck } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const ManageResidentsPage = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [preAddedResidents, setPreAddedResidents] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [preAddForm, setPreAddForm] = useState({
    houseNo: '',
    name: '',
    phone: '',
    email: '',
    familyCount: 0,
    residentType: 'owner',
  });

  const [transferTargetId, setTransferTargetId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingPreAdd, setSubmittingPreAdd] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [preAddErrors, setPreAddErrors] = useState({});
  const [preAddTouched, setPreAddTouched] = useState({});
  
  // Custom Confirmation States
  const [confirmRejectId, setConfirmRejectId] = useState(null);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);

  const validatePreAdd = (values) => {
    const errors = {};
    if (!values.houseNo || !values.houseNo.trim()) {
      errors.houseNo = 'House/Flat No is required';
    }
    if (!values.name || !values.name.trim()) {
      errors.name = 'Resident Name is required';
    } else if (values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (values.phone && !/^\d{10}$/.test(values.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    if (values.familyCount !== undefined && values.familyCount < 0) {
      errors.familyCount = 'Family count cannot be negative';
    }
    return errors;
  };

  const [activeSearch, setActiveSearch] = useState('');
  const [activeRole, setActiveRole] = useState('');
  const [activeFlat, setActiveFlat] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [activeLimit, setActiveLimit] = useState(5);

  const [reqSearch, setReqSearch] = useState('');
  const [reqPage, setReqPage] = useState(1);
  const [reqLimit, setReqLimit] = useState(5);

  const [preSearch, setPreSearch] = useState('');
  const [prePage, setPrePage] = useState(1);
  const [preLimit, setPreLimit] = useState(5);

  useEffect(() => {
    setActivePage(1);
  }, [activeSearch, activeRole, activeFlat, activeLimit]);

  useEffect(() => {
    setReqPage(1);
  }, [reqSearch, reqLimit]);

  useEffect(() => {
    setPrePage(1);
  }, [preSearch, preLimit]);

  // Filter activeUsers
  const filteredActive = activeUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(activeSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(activeSearch.toLowerCase());
    const matchesRole = activeRole ? u.role === activeRole : true;
    const matchesFlat = activeFlat ? u.flatNumber?.toLowerCase().includes(activeFlat.toLowerCase()) : true;
    return matchesSearch && matchesRole && matchesFlat;
  });

  const totalActive = filteredActive.length;
  const totalActivePages = Math.ceil(totalActive / activeLimit);
  const paginatedActive = filteredActive.slice(
    (activePage - 1) * activeLimit,
    activePage * activeLimit
  );

  // Filter joinRequests
  const filteredRequests = joinRequests.filter((req) => {
    const matchesSearch =
      req.name?.toLowerCase().includes(reqSearch.toLowerCase()) ||
      req.email?.toLowerCase().includes(reqSearch.toLowerCase());
    return matchesSearch;
  });

  const totalRequests = filteredRequests.length;
  const totalRequestsPages = Math.ceil(totalRequests / reqLimit);
  const paginatedRequests = filteredRequests.slice(
    (reqPage - 1) * reqLimit,
    reqPage * reqLimit
  );

  // Filter preAddedResidents
  const filteredPreAdded = preAddedResidents.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(preSearch.toLowerCase()) ||
      r.email?.toLowerCase().includes(preSearch.toLowerCase()) ||
      r.houseNo?.toLowerCase().includes(preSearch.toLowerCase());
    return matchesSearch;
  });

  const totalPreAdded = filteredPreAdded.length;
  const totalPrePages = Math.ceil(totalPreAdded / preLimit);
  const paginatedPreAdded = filteredPreAdded.slice(
    (prePage - 1) * preLimit,
    prePage * preLimit
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, preAddedRes, requestsRes] = await Promise.all([
        API.get('/users/society'),
        API.get('/residents/pre-added'),
        API.get('/residents/requests'),
      ]);
      // Active users: status is active and user is not self (or is self but we can show them)
      setActiveUsers(usersRes.data.filter((u) => u.status === 'active'));
      setPreAddedResidents(preAddedRes.data);
      setJoinRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch resident management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePreAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const touched = { houseNo: true, name: true, phone: true, email: true, familyCount: true };
    setPreAddTouched(touched);

    const errs = validatePreAdd(preAddForm);
    if (Object.keys(errs).length > 0) {
      setPreAddErrors(errs);
      setError('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingPreAdd(true);
      await API.post('/residents/pre-add', preAddForm);
      setSuccess(`Pre-added resident "${preAddForm.name}" successfully.`);
      setPreAddForm({
        houseNo: '',
        name: '',
        phone: '',
        email: '',
        familyCount: 0,
        residentType: 'owner',
      });
      setPreAddTouched({});
      setPreAddErrors({});
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pre-add resident');
    } finally {
      setSubmittingPreAdd(false);
    }
  };

  const handleApproveJoin = async (id) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/residents/requests/${id}/approve`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve join request');
    }
  };

  const handleRejectJoin = async (id) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/residents/requests/${id}/reject`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject join request');
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferTargetId) return;
    setShowTransferConfirm(true);
  };

  const executeTransfer = async () => {
    try {
      setError('');
      setSuccess('');
      setSubmittingTransfer(true);
      const res = await API.post('/residents/transfer-admin', { targetUserId: transferTargetId });
      setSuccess(res.data.message);
      // Wait for user to read success then redirect / logout
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer admin privileges');
      setSubmittingTransfer(false);
    }
  };

  if (loading) return <div className="page-container"><div className="skeleton card-skeleton" /></div>;

  return (
    <section className="page-container">
      <h2>Resident & Staff Management</h2>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Pre-add Whitelist Resident */}
        <div className="card">
          <h3>Pre-Add Resident Entry</h3>
          <p className="note" style={{ marginBottom: '16px' }}>Add residents here so they can choose their details during self-registration.</p>
          <form onSubmit={handlePreAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">
                  Flat No <span className="required-asterisk">*</span>
                </label>
                <input
                  className={`modern-input ${preAddTouched.houseNo && preAddErrors.houseNo ? 'is-invalid' : ''}`}
                  placeholder="e.g. A-101"
                  value={preAddForm.houseNo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreAddForm(prev => ({ ...prev, houseNo: val }));
                    if (preAddTouched.houseNo) {
                      setPreAddErrors(validatePreAdd({ ...preAddForm, houseNo: val }));
                    }
                  }}
                  onBlur={() => {
                    setPreAddTouched(prev => ({ ...prev, houseNo: true }));
                    setPreAddErrors(validatePreAdd(preAddForm));
                  }}
                  required
                />
                {preAddTouched.houseNo && preAddErrors.houseNo && (
                  <span className="modern-error-text">{preAddErrors.houseNo}</span>
                )}
              </div>
              <div className="modern-form-group">
                <label className="modern-label">
                  Resident Name <span className="required-asterisk">*</span>
                </label>
                <input
                  className={`modern-input ${preAddTouched.name && preAddErrors.name ? 'is-invalid' : ''}`}
                  placeholder="Full Name"
                  value={preAddForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreAddForm(prev => ({ ...prev, name: val }));
                    if (preAddTouched.name) {
                      setPreAddErrors(validatePreAdd({ ...preAddForm, name: val }));
                    }
                  }}
                  onBlur={() => {
                    setPreAddTouched(prev => ({ ...prev, name: true }));
                    setPreAddErrors(validatePreAdd(preAddForm));
                  }}
                  required
                />
                {preAddTouched.name && preAddErrors.name && (
                  <span className="modern-error-text">{preAddErrors.name}</span>
                )}
              </div>
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">Phone (optional)</label>
                <input
                  className={`modern-input ${preAddTouched.phone && preAddErrors.phone ? 'is-invalid' : ''}`}
                  placeholder="10-digit number"
                  value={preAddForm.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreAddForm(prev => ({ ...prev, phone: val }));
                    if (preAddTouched.phone) {
                      setPreAddErrors(validatePreAdd({ ...preAddForm, phone: val }));
                    }
                  }}
                  onBlur={() => {
                    setPreAddTouched(prev => ({ ...prev, phone: true }));
                    setPreAddErrors(validatePreAdd(preAddForm));
                  }}
                />
                {preAddTouched.phone && preAddErrors.phone && (
                  <span className="modern-error-text">{preAddErrors.phone}</span>
                )}
              </div>
              <div className="modern-form-group">
                <label className="modern-label">Email (optional)</label>
                <input
                  type="email"
                  className={`modern-input ${preAddTouched.email && preAddErrors.email ? 'is-invalid' : ''}`}
                  placeholder="name@domain.com"
                  value={preAddForm.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreAddForm(prev => ({ ...prev, email: val }));
                    if (preAddTouched.email) {
                      setPreAddErrors(validatePreAdd({ ...preAddForm, email: val }));
                    }
                  }}
                  onBlur={() => {
                    setPreAddTouched(prev => ({ ...prev, email: true }));
                    setPreAddErrors(validatePreAdd(preAddForm));
                  }}
                />
                {preAddTouched.email && preAddErrors.email && (
                  <span className="modern-error-text">{preAddErrors.email}</span>
                )}
              </div>
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">Family Count</label>
                <input
                  type="number"
                  className={`modern-input ${preAddTouched.familyCount && preAddErrors.familyCount ? 'is-invalid' : ''}`}
                  placeholder="0"
                  value={preAddForm.familyCount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPreAddForm(prev => ({ ...prev, familyCount: val }));
                    if (preAddTouched.familyCount) {
                      setPreAddErrors(validatePreAdd({ ...preAddForm, familyCount: val }));
                    }
                  }}
                  onBlur={() => {
                    setPreAddTouched(prev => ({ ...prev, familyCount: true }));
                    setPreAddErrors(validatePreAdd(preAddForm));
                  }}
                />
                {preAddTouched.familyCount && preAddErrors.familyCount && (
                  <span className="modern-error-text">{preAddErrors.familyCount}</span>
                )}
              </div>
              <div className="modern-form-group">
                <label className="modern-label">Resident Type</label>
                <select
                  className="modern-input"
                  value={preAddForm.residentType}
                  onChange={(e) => setPreAddForm(prev => ({ ...prev, residentType: e.target.value }))}
                >
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="family_member">Family Member</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '12px',
              }}
              disabled={submittingPreAdd}
            >
              {submittingPreAdd ? (
                <>
                  <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Adding Resident...
                </>
              ) : (
                'Pre-Add Resident'
              )}
            </button>
          </form>
        </div>

        {/* Transfer Privileges */}
        <div className="card">
          <h3>Transfer Admin Privilege</h3>
          <p className="note" style={{ marginBottom: '16px' }}>Promote another active resident to Society Admin. You will lose admin status.</p>
          <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="modern-form-group">
              <label className="modern-label">
                Active Resident <span className="required-asterisk">*</span>
              </label>
              <select
                className="modern-input"
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                required
              >
                <option value="">-- Select Active Resident --</option>
                {activeUsers
                  .filter((u) => u.role === 'resident')
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} (Flat: {u.flatNumber})
                    </option>
                  ))}
              </select>
            </div>
            {showTransferConfirm ? (
              <div className="inline-confirm" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', borderRadius: 'var(--radius)' }}>
                <span className="inline-confirm-label" style={{ color: 'var(--status-danger-text)', fontWeight: 'bold', fontSize: '0.825rem', textAlign: 'center' }}>
                  Confirm promotion? You will be demoted and logged out immediately.
                </span>
                <div className="inline-confirm-actions" style={{ justifyContent: 'center', width: '100%', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="inline-confirm-btn-yes"
                    onClick={() => {
                      setShowTransferConfirm(false);
                      executeTransfer();
                    }}
                    style={{ background: 'var(--status-danger-text)', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Yes, Transfer
                  </button>
                  <button
                    type="button"
                    className="inline-confirm-btn-no"
                    onClick={() => setShowTransferConfirm(false)}
                    style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="btn btn-danger"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 'auto',
                }}
                disabled={!transferTargetId || submittingTransfer}
              >
                {submittingTransfer ? (
                  <>
                    <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Transferring Admin...
                  </>
                ) : (
                  'Transfer Admin Privileges'
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Join Requests */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Pending Join Requests</h3>
        <p className="note">Approve or reject residents/guards trying to register for your society.</p>
        
        {/* Join Requests Filter Bar */}
        <div className="modern-filter-bar">
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search join requests by name..."
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
            />
          </div>
          {reqSearch && (
            <button
              type="button"
              className="btn btn-secondary modern-filter-btn-clear"
              onClick={() => setReqSearch('')}
            >
              Clear
            </button>
          )}
        </div>

        {paginatedRequests.length > 0 ? (
          <>
            <div className="modern-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Flat</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((req) => (
                    <tr key={req._id}>
                      <td><strong>{req.name}</strong></td>
                      <td>{req.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{req.role}</td>
                      <td>{req.flatNumber || '—'}</td>
                      <td>{req.phone || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-compact"
                            style={{
                              background: 'var(--status-success-bg)',
                              color: 'var(--status-success-text)',
                              border: '1px solid var(--status-success-border)',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius)',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleApproveJoin(req._id)}
                          >
                            Approve
                          </button>
                          {confirmRejectId === req._id ? (
                            <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Reject?</span>
                              <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  className="inline-confirm-btn-yes"
                                  onClick={() => {
                                    handleRejectJoin(req._id);
                                    setConfirmRejectId(null);
                                  }}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  className="inline-confirm-btn-no"
                                  onClick={() => setConfirmRejectId(null)}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-compact"
                              style={{
                                background: 'var(--status-danger-bg)',
                                color: 'var(--status-danger-text)',
                                border: '1px solid var(--status-danger-border)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius)',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                              onClick={() => setConfirmRejectId(req._id)}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={reqPage}
              totalPages={totalRequestsPages}
              totalItems={totalRequests}
              itemsPerPage={reqLimit}
              onPageChange={setReqPage}
              onItemsPerPageChange={setReqLimit}
            />
          </>
        ) : (
          <EmptyState
            icon={UserCheck}
            title={reqSearch ? "No matching join requests" : "No pending requests"}
            description={
              reqSearch
                ? "Try adjusting your search filters to find requests."
                : "All join requests have been processed!"
            }
            actionText={reqSearch ? "Clear Filter" : null}
            onAction={reqSearch ? () => setReqSearch('') : null}
          />
        )}
      </div>

      {/* Pre-Added Whitelist Members */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Pre-Added Resident Whitelist</h3>
        
        {/* Pre-Added Filter Bar */}
        <div className="modern-filter-bar">
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search whitelist by name, flat, or email..."
              value={preSearch}
              onChange={(e) => setPreSearch(e.target.value)}
            />
          </div>
          {preSearch && (
            <button
              type="button"
              className="btn btn-secondary modern-filter-btn-clear"
              onClick={() => setPreSearch('')}
            >
              Clear
            </button>
          )}
        </div>

        {paginatedPreAdded.length > 0 ? (
          <>
            <div className="modern-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Registration Link Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPreAdded.map((r) => (
                    <tr key={r._id}>
                      <td><strong>{r.houseNo}</strong></td>
                      <td>{r.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{r.residentType}</td>
                      <td>{r.phone || '—'}</td>
                      <td>{r.email || '—'}</td>
                      <td>
                        {r.userId ? (
                          <span
                            style={{
                              background: 'var(--status-success-bg)',
                              color: 'var(--status-success-text)',
                              border: '1px solid var(--status-success-border)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            Linked (Registered)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'var(--status-warning-bg)',
                              color: 'var(--status-warning-text)',
                              border: '1px solid var(--status-warning-border)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            Pending Resident Signup
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={prePage}
              totalPages={totalPrePages}
              totalItems={totalPreAdded}
              itemsPerPage={preLimit}
              onPageChange={setPrePage}
              onItemsPerPageChange={setPreLimit}
            />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={preSearch ? "No matching whitelist entries" : "Whitelist empty"}
            description={
              preSearch
                ? "Try adjusting your search criteria."
                : "No residents have been pre-added to the whitelist yet."
            }
            actionText={preSearch ? "Clear Filter" : null}
            onAction={preSearch ? () => setPreSearch('') : null}
          />
        )}
      </div>

      {/* Active Users */}
      <div className="card">
        <h3>Active Residents & Staff</h3>
        
        {/* Active Residents Filters */}
        <div className="modern-filter-bar">
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by name or email..."
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <input
              type="text"
              placeholder="Flat No..."
              value={activeFlat}
              onChange={(e) => setActiveFlat(e.target.value)}
              style={{
                width: '120px',
                padding: '10px 16px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
            <select
              className="modern-filter-select"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="resident">Resident</option>
              <option value="security">Security Guard</option>
              <option value="society_admin">Society Admin</option>
            </select>
            {(activeSearch || activeRole || activeFlat) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setActiveSearch('');
                  setActiveRole('');
                  setActiveFlat('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedActive.length > 0 ? (
          <>
            <div className="modern-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Flat</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActive.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ textTransform: 'capitalize' }}>{u.role?.replace('_', ' ')}</td>
                      <td>{u.flatNumber || '—'}</td>
                      <td>{u.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={activePage}
              totalPages={totalActivePages}
              totalItems={totalActive}
              itemsPerPage={activeLimit}
              onPageChange={setActivePage}
              onItemsPerPageChange={setActiveLimit}
            />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title={activeSearch || activeRole || activeFlat ? "No matching residents" : "No active members"}
            description={
              activeSearch || activeRole || activeFlat
                ? "Try adjusting your filters to find active members."
                : "There are no active residents or staff registered in the society."
            }
            actionText={activeSearch || activeRole || activeFlat ? "Clear Filters" : null}
            onAction={
              activeSearch || activeRole || activeFlat
                ? () => {
                    setActiveSearch('');
                    setActiveRole('');
                    setActiveFlat('');
                  }
                : null
            }
          />
        )}
      </div>
    </section>
  );
};

export default ManageResidentsPage;
