import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Coins, AlertTriangle, Phone, Search, FileText, CheckCircle2 } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const CATEGORIES = ['repairs', 'electricity', 'water', 'security', 'salary', 'cleaning', 'events', 'emergency', 'custom'];

const ManageFinancesPage = () => {
  const [activeTab, setActiveTab] = useState('finances');
  const [wallet, setWallet] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('repairs');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expenseErrors, setExpenseErrors] = useState({});
  const [expenseTouched, setExpenseTouched] = useState({});
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const validateExpense = (values) => {
    const errors = {};
    if (!values.title || !values.title.trim()) {
      errors.title = 'Title is required';
    } else if (values.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!values.amount) {
      errors.amount = 'Amount is required';
    } else if (Number(values.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero';
    }
    if (!values.vendor || !values.vendor.trim()) {
      errors.vendor = 'Vendor is required';
    } else if (values.vendor.trim().length < 2) {
      errors.vendor = 'Vendor must be at least 2 characters';
    }
    return errors;
  };

  // Search & Filter States
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [expenseLimit, setExpenseLimit] = useState(5);

  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txLimit, setTxLimit] = useState(5);

  const [defSearch, setDefSearch] = useState('');
  const [defPage, setDefPage] = useState(1);
  const [defLimit, setDefLimit] = useState(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, expensesRes, transactionsRes, defaultersRes] = await Promise.all([
        API.get('/finances/wallet'),
        API.get('/finances/expenses'),
        API.get('/finances/transactions'),
        API.get('/maintenance/defaulters').catch(() => ({ data: [] })),
      ]);
      setWallet(walletRes.data);
      setExpenses(expensesRes.data);
      setTransactions(transactionsRes.data);
      setDefaulters(defaultersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setExpensePage(1);
  }, [expenseSearch, expenseCategoryFilter, expenseLimit]);

  useEffect(() => {
    setTxPage(1);
  }, [txSearch, txTypeFilter, txLimit]);

  useEffect(() => {
    setDefPage(1);
  }, [defSearch, defLimit]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploadingFile(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setInvoiceUrl(res.data.fileUrl);
      setSuccess('Invoice file uploaded successfully.');
    } catch (err) {
      setError('Failed to upload invoice file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const touched = { title: true, vendor: true, amount: true };
    setExpenseTouched(touched);

    const errs = validateExpense({ title, vendor, amount });
    if (Object.keys(errs).length > 0) {
      setExpenseErrors(errs);
      setError('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingExpense(true);
      await API.post('/finances/expenses', {
        title,
        category,
        vendor,
        amount: Number(amount),
        description,
        invoice: invoiceUrl,
      });

      setSuccess('Expense uploaded successfully.');
      setTitle('');
      setCategory('repairs');
      setVendor('');
      setAmount('');
      setDescription('');
      setInvoiceUrl('');
      setExpenseTouched({});
      setExpenseErrors({});
      const fileInput = document.getElementById('expense-file-input');
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Filtered lists processing
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.vendor?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      exp.description?.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory = expenseCategoryFilter ? exp.category === expenseCategoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const expenseTotal = filteredExpenses.length;
  const expenseTotalPages = Math.ceil(expenseTotal / expenseLimit);
  const paginatedExpenses = filteredExpenses.slice(
    (expensePage - 1) * expenseLimit,
    expensePage * expenseLimit
  );

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.category?.toLowerCase().includes(txSearch.toLowerCase());
    const matchesType = txTypeFilter ? t.type === txTypeFilter : true;
    return matchesSearch && matchesType;
  });

  const txTotal = filteredTransactions.length;
  const txTotalPages = Math.ceil(txTotal / txLimit);
  const paginatedTransactions = filteredTransactions.slice(
    (txPage - 1) * txLimit,
    txPage * txLimit
  );

  const filteredDefaulters = defaulters.filter((d) => {
    const searchLower = defSearch.toLowerCase();
    return (
      d.flatNumber?.toString().toLowerCase().includes(searchLower) ||
      d.residentName?.toLowerCase().includes(searchLower) ||
      d.residentEmail?.toLowerCase().includes(searchLower) ||
      d.residentPhone?.toLowerCase().includes(searchLower)
    );
  });

  const defTotal = filteredDefaulters.length;
  const defTotalPages = Math.ceil(defTotal / defLimit);
  const paginatedDefaulters = filteredDefaulters.slice(
    (defPage - 1) * defLimit,
    defPage * defLimit
  );

  if (loading && !wallet) return <p className="page-container">Loading finances...</p>;

  return (
    <div className="page-container">
      <h2>Society Wallet & Finances</h2>
      <p className="note">Upload expenses, review balances, and trace audit ledgers.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '12px', margin: '20px 0', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'finances' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('finances')}
        >
          <Coins className="w-4 h-4 mr-1.5" /> Finances Ledger
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'defaulters' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('defaulters')}
        >
          <AlertTriangle className="w-4 h-4 mr-1.5" /> Defaulters Aging Report
        </button>
      </div>

      {activeTab === 'finances' ? (
        <>
          {wallet && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
              <article className="stat-card success">
                <h4>Wallet Balance</h4>
                <p className="text-success" style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '8px' }}>
                  ₹{wallet.balance.toLocaleString()}
                </p>
              </article>
              <article className="stat-card info">
                <h4>Maintenance Income</h4>
                <p className="text-info" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>
                  ₹{wallet.maintenanceIncome.toLocaleString()}
                </p>
              </article>
              <article className="stat-card pending">
                <h4>Penalties Collected</h4>
                <p className="text-warning" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>
                  ₹{wallet.penaltiesIncome.toLocaleString()}
                </p>
              </article>
              <article className="stat-card info">
                <h4>Event Funds</h4>
                <p className="text-info" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>
                  ₹{wallet.eventContributions.toLocaleString()}
                </p>
              </article>
              <article className="stat-card overdue">
                <h4>Total Expenses</h4>
                <p className="text-danger" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>
                  ₹{wallet.expensesAmount.toLocaleString()}
                </p>
              </article>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }} className="finance-split-layout">
            {/* Upload Expense Form */}
            <div className="card">
              <h3>Record New Expenditure</h3>
              <form onSubmit={handleSubmitExpense} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="modern-form-group">
                  <label className="modern-label">
                    Title <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className={`modern-input ${expenseTouched.title && expenseErrors.title ? 'is-invalid' : ''}`}
                    placeholder="What was purchased / paid?"
                    value={title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTitle(val);
                      if (expenseTouched.title) {
                        setExpenseErrors(validateExpense({ title: val, vendor, amount }));
                      }
                    }}
                    onBlur={() => {
                      setExpenseTouched(prev => ({ ...prev, title: true }));
                      setExpenseErrors(validateExpense({ title, vendor, amount }));
                    }}
                    required
                  />
                  {expenseTouched.title && expenseErrors.title && (
                    <span className="modern-error-text">{expenseErrors.title}</span>
                  )}
                </div>

                <div className="modern-form-grid">
                  <div className="modern-form-group">
                    <label className="modern-label">
                      Category <span className="required-asterisk">*</span>
                    </label>
                    <select
                      className="modern-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modern-form-group">
                    <label className="modern-label">
                      Amount (INR) <span className="required-asterisk">*</span>
                    </label>
                    <input
                      type="number"
                      className={`modern-input ${expenseTouched.amount && expenseErrors.amount ? 'is-invalid' : ''}`}
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAmount(val);
                        if (expenseTouched.amount) {
                          setExpenseErrors(validateExpense({ title, vendor, amount: val }));
                        }
                      }}
                      onBlur={() => {
                        setExpenseTouched(prev => ({ ...prev, amount: true }));
                        setExpenseErrors(validateExpense({ title, vendor, amount }));
                      }}
                      required
                    />
                    {expenseTouched.amount && expenseErrors.amount && (
                      <span className="modern-error-text">{expenseErrors.amount}</span>
                    )}
                  </div>
                </div>

                <div className="modern-form-group">
                  <label className="modern-label">
                    Vendor / Paid To <span className="required-asterisk">*</span>
                  </label>
                  <input
                    className={`modern-input ${expenseTouched.vendor && expenseErrors.vendor ? 'is-invalid' : ''}`}
                    placeholder="Supplier name, service provider, etc."
                    value={vendor}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVendor(val);
                      if (expenseTouched.vendor) {
                        setExpenseErrors(validateExpense({ title, vendor: val, amount }));
                      }
                    }}
                    onBlur={() => {
                      setExpenseTouched(prev => ({ ...prev, vendor: true }));
                      setExpenseErrors(validateExpense({ title, vendor, amount }));
                    }}
                    required
                  />
                  {expenseTouched.vendor && expenseErrors.vendor && (
                    <span className="modern-error-text">{expenseErrors.vendor}</span>
                  )}
                </div>

                <div className="modern-form-group">
                  <label className="modern-label">Invoice / Receipt PDF (Optional)</label>
                  <input
                    id="expense-file-input"
                    type="file"
                    className="modern-input"
                    onChange={handleFileChange}
                    style={{ border: 'none', padding: '0', background: 'transparent' }}
                  />
                  {uploadingFile && <span className="modern-helper-text">Uploading...</span>}
                  {invoiceUrl && (
                    <span className="modern-helper-text" style={{ color: 'var(--status-success-text)' }}>
                      Invoice attached. <a href={invoiceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>View File</a>
                    </span>
                  )}
                </div>

                <div className="modern-form-group">
                  <label className="modern-label">Description</label>
                  <textarea
                    className="modern-input"
                    placeholder="Provide notes..."
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
                  disabled={uploadingFile || submittingExpense}
                >
                  {submittingExpense ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading Expense...
                    </>
                  ) : (
                    'Upload Expense'
                  )}
                </button>
              </form>
            </div>

            {/* Expenses List */}
            <div className="card">
              <h3>Expenses Ledger</h3>
              
              {/* Search & Filters */}
              <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
                <div className="modern-filter-search-wrap">
                  <Search className="modern-filter-search-icon" size={16} />
                  <input
                    type="text"
                    className="modern-filter-search-input"
                    placeholder="Search expenses..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                  />
                </div>
                <div className="modern-filter-group">
                  <select
                    className="modern-filter-select"
                    value={expenseCategoryFilter}
                    onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  {(expenseSearch || expenseCategoryFilter) && (
                    <button
                      type="button"
                      className="btn btn-secondary modern-filter-btn-clear"
                      onClick={() => {
                        setExpenseSearch('');
                        setExpenseCategoryFilter('');
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {paginatedExpenses.length > 0 ? (
                <>
                  <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Vendor</th>
                          <th>Amount</th>
                          <th>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExpenses.map((exp) => (
                          <tr key={exp._id}>
                            <td>{new Date(exp.date).toLocaleDateString()}</td>
                            <td>
                              <strong>{exp.title}</strong> <br />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.description}</span>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{exp.category}</td>
                            <td>{exp.vendor}</td>
                            <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                            <td>
                              {exp.invoice ? (
                                <a href={exp.invoice} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                  View Bill
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={expensePage}
                    totalPages={expenseTotalPages}
                    totalItems={expenseTotal}
                    itemsPerPage={expenseLimit}
                    onPageChange={setExpensePage}
                    onItemsPerPageChange={setExpenseLimit}
                  />
                </>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No expenses found"
                  description="Try adjusting your filters or search terms."
                  actionText={(expenseSearch || expenseCategoryFilter) ? "Clear Filters" : null}
                  onAction={() => {
                    setExpenseSearch('');
                    setExpenseCategoryFilter('');
                  }}
                />
              )}
            </div>
          </div>

          {/* Transaction Audit ledger */}
          <div className="card">
            <h3>Wallet Transaction History (Ledger Logs)</h3>
            <p className="note">Audit logs of all transactions updating society wallet balances.</p>

            {/* Search & Filters */}
            <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
              <div className="modern-filter-search-wrap">
                <Search className="modern-filter-search-icon" size={16} />
                <input
                  type="text"
                  className="modern-filter-search-input"
                  placeholder="Search transactions..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
              <div className="modern-filter-group">
                <select
                  className="modern-filter-select"
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                {(txSearch || txTypeFilter) && (
                  <button
                    type="button"
                    className="btn btn-secondary modern-filter-btn-clear"
                    onClick={() => {
                      setTxSearch('');
                      setTxTypeFilter('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {paginatedTransactions.length > 0 ? (
              <>
                <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((t) => (
                        <tr key={t._id}>
                          <td>{new Date(t.date).toLocaleString()}</td>
                          <td>
                            <DashboardStatusBadge
                              tone={t.type === 'income' ? 'success' : 'danger'}
                              icon={t.type === 'income' ? CheckCircle2 : AlertTriangle}
                            >
                              {t.type.toUpperCase()}
                            </DashboardStatusBadge>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{t.category.replace('_', ' ')}</td>
                          <td>
                            <strong className={t.type === 'income' ? 'text-success' : 'text-danger'}>
                              {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                            </strong>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{t.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={txPage}
                  totalPages={txTotalPages}
                  totalItems={txTotal}
                  itemsPerPage={txLimit}
                  onPageChange={setTxPage}
                  onItemsPerPageChange={setTxLimit}
                />
              </>
            ) : (
              <EmptyState
                icon={Coins}
                title="No transactions found"
                description="Try adjusting your filters or search terms."
                actionText={(txSearch || txTypeFilter) ? "Clear Filters" : null}
                onAction={() => {
                  setTxSearch('');
                  setTxTypeFilter('');
                }}
              />
            )}
          </div>
        </>
      ) : (
        /* Defaulters Tab View */
        <div className="card">
          <h3>Aging Defaulters Report</h3>
          <p className="note">Detailed aging analysis of residents with unpaid maintenance bills.</p>

          {/* Search & Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search flat or resident name..."
                value={defSearch}
                onChange={(e) => setDefSearch(e.target.value)}
              />
            </div>
            {defSearch && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => setDefSearch('')}
              >
                Clear
              </button>
            )}
          </div>

          {paginatedDefaulters.length > 0 ? (
            <>
              <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Flat Number</th>
                      <th>Resident Name</th>
                      <th>Contact Info</th>
                      <th>Unpaid Months Count</th>
                      <th>Overdue Months List</th>
                      <th>Total Dues Owed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDefaulters.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>Flat {item.flatNumber}</strong></td>
                        <td>{item.residentName}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{item.residentEmail}</span> <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.residentPhone}</span>
                        </td>
                        <td>
                          <span className="badge emergency" style={{ fontSize: '0.8rem' }}>
                            {item.unpaidCount} Month(s)
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {item.unpaidMonths.map((m, i) => (
                              <span key={i} className="status-pill pending" style={{ fontSize: '0.75rem' }}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong className="text-danger" style={{ fontSize: '1.05rem' }}>
                            ₹{item.totalAmount.toLocaleString()}
                          </strong>
                        </td>
                        <td>
                          <a
                            href={`tel:${item.residentPhone}`}
                            className="btn btn-secondary inline-flex items-center gap-1.5"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Phone className="w-4 h-4" /> Call Defaulter
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={defPage}
                totalPages={defTotalPages}
                totalItems={defTotal}
                itemsPerPage={defLimit}
                onPageChange={setDefPage}
                onItemsPerPageChange={setDefLimit}
              />
            </>
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="No defaulters found"
              description={defSearch ? "Try adjusting your search query." : "No defaulters currently! Excellent recovery rate."}
              actionText={defSearch ? "Clear Search" : null}
              onAction={() => setDefSearch('')}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ManageFinancesPage;
