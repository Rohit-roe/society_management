import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/maintenance/StatusBadge';
import { Search, Wrench, AlertCircle } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const STATUS_OPTIONS = ['pending', 'paid', 'overdue'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ManageMaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [form, setForm] = useState({
    flatNumber: '',
    residentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
  });

  // Form validations & loadings
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [creating, setCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const filteredRecords = records.filter((r) => {
    const flatStr = r.flatNumber || '';
    const resName = r.residentId?.name || '';
    const matchesSearch =
      flatStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchRecords = () =>
    API.get('/maintenance')
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.patch(`/maintenance/${id}`, { status: newStatus });
      fetchRecords();
    } finally {
      setUpdating(null);
    }
  };

  const validateField = (name, value) => {
    let err = '';
    if (!value && name !== 'residentId') {
      err = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'month' && (Number(value) < 1 || Number(value) > 12)) {
      err = 'Month must be between 1 and 12';
    } else if (name === 'year' && Number(value) < 2000) {
      err = 'Year must be greater than or equal to 2000';
    } else if (name === 'amount' && Number(value) <= 0) {
      err = 'Amount must be greater than 0';
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

  const handleCreate = async (e) => {
    e.preventDefault();

    const fields = ['flatNumber', 'month', 'year', 'amount'];
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

    if (!isValid) return;

    setCreating(true);
    try {
      await API.post('/maintenance', {
        ...form,
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
      });
      setForm({
        flatNumber: '',
        residentId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: '',
      });
      setFormTouched({});
      setFormErrors({});
      fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="page-container"><div className="skeleton card-skeleton" /></div>;

  return (
    <section className="page-container">
      <h2>Manage Maintenance</h2>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3>Add Maintenance Record</h3>
        <form onSubmit={handleCreate} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
          
          <div className="modern-form-grid">
            <div className="modern-form-group">
              <label className="modern-label">Flat Number <span className="required-asterisk">*</span></label>
              <input
                placeholder="e.g. 101"
                value={form.flatNumber}
                onChange={(e) => handleInputChange('flatNumber', e.target.value)}
                onBlur={() => handleInputBlur('flatNumber')}
                required
                className={`modern-input ${formTouched.flatNumber && formErrors.flatNumber ? 'is-invalid' : formTouched.flatNumber && !formErrors.flatNumber ? 'is-valid' : ''}`}
              />
              {formTouched.flatNumber && formErrors.flatNumber && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.flatNumber}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Resident User ID (Optional)</label>
              <input
                placeholder="Resident User ID (optional)"
                value={form.residentId}
                onChange={(e) => handleInputChange('residentId', e.target.value)}
                className="modern-input"
              />
            </div>
          </div>

          <div className="modern-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1.5fr' }}>
            <div className="modern-form-group">
              <label className="modern-label">Billing Month <span className="required-asterisk">*</span></label>
              <input
                type="number"
                min="1"
                max="12"
                placeholder="Month"
                value={form.month}
                onChange={(e) => handleInputChange('month', e.target.value)}
                onBlur={() => handleInputBlur('month')}
                required
                className={`modern-input ${formTouched.month && formErrors.month ? 'is-invalid' : formTouched.month && !formErrors.month ? 'is-valid' : ''}`}
              />
              {formTouched.month && formErrors.month && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.month}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Billing Year <span className="required-asterisk">*</span></label>
              <input
                type="number"
                placeholder="Year"
                value={form.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                onBlur={() => handleInputBlur('year')}
                required
                className={`modern-input ${formTouched.year && formErrors.year ? 'is-invalid' : formTouched.year && !formErrors.year ? 'is-valid' : ''}`}
              />
              {formTouched.year && formErrors.year && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.year}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Invoiced Amount (₹) <span className="required-asterisk">*</span></label>
              <input
                type="number"
                placeholder="Invoiced Amount"
                value={form.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                onBlur={() => handleInputBlur('amount')}
                required
                className={`modern-input ${formTouched.amount && formErrors.amount ? 'is-invalid' : formTouched.amount && !formErrors.amount ? 'is-valid' : ''}`}
              />
              {formTouched.amount && formErrors.amount && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.amount}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating}
            style={{ width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' }}
          >
            {creating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </>
            ) : 'Add Record'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Maintenance Ledger</h3>
        </div>

        {/* Search & Filters */}
        <div className="modern-filter-bar">
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by flat or resident..."
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
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
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

        {paginatedRecords.length > 0 ? (
          <>
            <div className="modern-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Flat</th>
                    <th>Resident</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((r) => (
                    <tr key={r._id}>
                      <td>{r.flatNumber}</td>
                      <td>{r.residentId?.name || '—'}</td>
                      <td>
                        {MONTH_NAMES[r.month - 1]} {r.year}
                      </td>
                      <td><strong>₹ {r.amount.toLocaleString()}</strong></td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        <select
                          value={r.status}
                          disabled={updating === r._id}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className="modern-input"
                          style={{
                            padding: '6px 12px',
                            width: 'auto',
                            fontSize: '0.85rem',
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
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
            icon={Wrench}
            title={searchTerm || statusFilter ? "No matching records" : "No maintenance records"}
            description={
              searchTerm || statusFilter
                ? "Try adjusting or clearing your filters to see more results."
                : "No maintenance records have been generated yet."
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
    </section>
  );
};

export default ManageMaintenancePage;
