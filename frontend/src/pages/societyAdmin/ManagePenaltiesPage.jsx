import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { AlertTriangle, CheckCircle2, Clock, Search, FileText, PlusCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const CATEGORIES = ['late_maintenance', 'parking_violation', 'damage_penalty', 'rule_violation', 'other'];

const ManagePenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [residentId, setResidentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('rule_violation');
  const [amount, setAmount] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingPenalty, setSubmittingPenalty] = useState(false);
  const [penaltyErrors, setPenaltyErrors] = useState({});
  const [penaltyTouched, setPenaltyTouched] = useState({});
  const [confirmPaidId, setConfirmPaidId] = useState(null);

  const validatePenalty = (values) => {
    const errors = {};
    if (!values.residentId) {
      errors.residentId = 'Please select a resident';
    }
    if (!values.title || !values.title.trim()) {
      errors.title = 'Violation Title is required';
    } else if (values.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!values.amount) {
      errors.amount = 'Amount is required';
    } else if (Number(values.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    return errors;
  };

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [penaltiesRes, usersRes] = await Promise.all([
        API.get('/penalties'),
        API.get('/users/society'),
      ]);
      setPenalties(penaltiesRes.data);
      // Whitelist only active residents
      setResidents(usersRes.data.filter((u) => u.role === 'resident' && u.status === 'active'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch penalty ledger records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, itemsPerPage]);

  const handleIssuePenalty = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const touched = { residentId: true, title: true, amount: true };
    setPenaltyTouched(touched);

    const errs = validatePenalty({ residentId, title, amount });
    if (Object.keys(errs).length > 0) {
      setPenaltyErrors(errs);
      setError('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingPenalty(true);
      await API.post('/penalties', {
        residentId,
        title,
        description,
        category,
        amount: Number(amount),
      });

      setSuccess('Penalty issued successfully.');
      setResidentId('');
      setTitle('');
      setDescription('');
      setCategory('rule_violation');
      setAmount('');
      setPenaltyTouched({});
      setPenaltyErrors({});
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue penalty');
    } finally {
      setSubmittingPenalty(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      setError('');
      setSuccess('');
      await API.post(`/penalties/${id}/pay`);
      setSuccess('Penalty marked as paid and wallet credited.');
      fetchData();
    } catch (err) {
      setError('Failed to settle penalty');
    }
  };

  const filteredPenalties = penalties.filter((p) => {
    const matchesSearch =
      p.residentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.flatNumber?.toString().includes(searchTerm) ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = filteredPenalties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPenalties = filteredPenalties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Penalty & Fines Registry</h2>
      <p className="note">Issue penalty notes to residents for rules violations and log penalty resolution ledgers.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }} className="penalties-split-layout">
        {/* Issue Penalty Form */}
        <div className="card">
          <h3>Issue Penalty Fine</h3>
          <form onSubmit={handleIssuePenalty} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '16px' }}>
            <div className="modern-form-group">
              <label className="modern-label">
                Select Resident <span className="required-asterisk">*</span>
              </label>
              <select
                className={`modern-input ${penaltyTouched.residentId && penaltyErrors.residentId ? 'is-invalid' : ''}`}
                value={residentId}
                onChange={(e) => {
                  const val = e.target.value;
                  setResidentId(val);
                  if (penaltyTouched.residentId) {
                    setPenaltyErrors(validatePenalty({ residentId: val, title, amount }));
                  }
                }}
                onBlur={() => {
                  setPenaltyTouched(prev => ({ ...prev, residentId: true }));
                  setPenaltyErrors(validatePenalty({ residentId, title, amount }));
                }}
                required
              >
                <option value="">-- Select Resident --</option>
                {residents.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} (Flat: {r.flatNumber})
                  </option>
                ))}
              </select>
              {penaltyTouched.residentId && penaltyErrors.residentId && (
                <span className="modern-error-text">{penaltyErrors.residentId}</span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">
                Violation Title <span className="required-asterisk">*</span>
              </label>
              <input
                className={`modern-input ${penaltyTouched.title && penaltyErrors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Speeding in parking lot"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (penaltyTouched.title) {
                    setPenaltyErrors(validatePenalty({ residentId, title: val, amount }));
                  }
                }}
                onBlur={() => {
                  setPenaltyTouched(prev => ({ ...prev, title: true }));
                  setPenaltyErrors(validatePenalty({ residentId, title, amount }));
                }}
                required
              />
              {penaltyTouched.title && penaltyErrors.title && (
                <span className="modern-error-text">{penaltyErrors.title}</span>
              )}
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">
                  Fine Category <span className="required-asterisk">*</span>
                </label>
                <select
                  className="modern-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">
                  Amount (₹) <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  className={`modern-input ${penaltyTouched.amount && penaltyErrors.amount ? 'is-invalid' : ''}`}
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val);
                    if (penaltyTouched.amount) {
                      setPenaltyErrors(validatePenalty({ residentId, title, amount: val }));
                    }
                  }}
                  onBlur={() => {
                    setPenaltyTouched(prev => ({ ...prev, amount: true }));
                    setPenaltyErrors(validatePenalty({ residentId, title, amount }));
                  }}
                  required
                />
                {penaltyTouched.amount && penaltyErrors.amount && (
                  <span className="modern-error-text">{penaltyErrors.amount}</span>
                )}
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Details</label>
              <textarea
                className="modern-input"
                placeholder="Describe details, dates, or damage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
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
              disabled={submittingPenalty}
            >
              {submittingPenalty ? (
                <>
                  <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Issuing Fine...
                </>
              ) : (
                'Issue Penalty Slip'
              )}
            </button>
          </form>
        </div>

        {/* Penalty Ledger */}
        <div className="card">
          <h3>Penalty Ledger</h3>

          {/* Search & Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search flat, name, or violation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="modern-filter-group">
              <select
                className="modern-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                className="modern-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
              {(searchTerm || categoryFilter || statusFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading && penalties.length === 0 ? (
            <div className="skeleton card-skeleton" style={{ marginTop: '16px' }} />
          ) : paginatedPenalties.length > 0 ? (
            <>
              <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Resident</th>
                      <th>Flat</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPenalties.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.residentId?.name}</strong></td>
                        <td>{p.flatNumber}</td>
                        <td>
                          <strong>{p.title}</strong> <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.description}</span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category.replace('_', ' ')}</td>
                        <td><strong>₹{p.amount.toLocaleString()}</strong></td>
                        <td>
                          <DashboardStatusBadge
                            tone={p.status === 'paid' ? 'success' : 'danger'}
                            icon={p.status === 'paid' ? CheckCircle2 : Clock}
                          >
                            {p.status.toUpperCase()}
                          </DashboardStatusBadge>
                        </td>
                        <td>
                          {p.status === 'pending' && (
                            confirmPaidId === p._id ? (
                              <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Confirm?</span>
                                <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-yes"
                                    onClick={() => {
                                      handleMarkPaid(p._id);
                                      setConfirmPaidId(null);
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-no"
                                    onClick={() => setConfirmPaidId(null)}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-primary btn-compact"
                                onClick={() => setConfirmPaidId(p._id)}
                              >
                                Mark Paid
                              </button>
                            )
                          )}
                          {p.status === 'paid' && p.paidOn && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {new Date(p.paidOn).toLocaleDateString()}
                            </span>
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
              icon={AlertTriangle}
              title="No penalties found"
              description="Try adjusting your filters or search terms."
              actionText={(searchTerm || categoryFilter || statusFilter) ? "Clear Filters" : null}
              onAction={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePenaltiesPage;
