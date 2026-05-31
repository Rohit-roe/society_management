import { useState, useEffect } from 'react';
import API from '../../api/axios';

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
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!title || !vendor || !amount) {
      setError('Title, Vendor, and Amount are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
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
      setFile(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit expense');
      setLoading(false);
    }
  };

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
          💰 Finances Ledger
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'defaulters' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('defaulters')}
        >
          ⚠️ Defaulters Aging Report
        </button>
      </div>

      {activeTab === 'finances' ? (
        <>
          {wallet && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
              <article className="stat-card" style={{ borderLeft: '4px solid #1e7a4a' }}>
                <h4>Wallet Balance</h4>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e7a4a', marginTop: '8px' }}>
                  ₹{wallet.balance.toLocaleString()}
                </p>
              </article>
              <article className="stat-card">
                <h4>Maintenance Income</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a3c5e', marginTop: '8px' }}>
                  ₹{wallet.maintenanceIncome.toLocaleString()}
                </p>
              </article>
              <article className="stat-card">
                <h4>Penalties Collected</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9a7d0a', marginTop: '8px' }}>
                  ₹{wallet.penaltiesIncome.toLocaleString()}
                </p>
              </article>
              <article className="stat-card">
                <h4>Event Funds</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e86ab', marginTop: '8px' }}>
                  ₹{wallet.eventContributions.toLocaleString()}
                </p>
              </article>
              <article className="stat-card overdue">
                <h4>Total Expenses</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginTop: '8px' }}>
                  ₹{wallet.expensesAmount.toLocaleString()}
                </p>
              </article>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
            {/* Upload Expense Form */}
            <div className="card">
              <h3>Record New Expenditure</h3>
              <form onSubmit={handleSubmitExpense} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Title</label>
                  <input
                    placeholder="What was purchased / paid?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ marginTop: '4px', marginBottom: '0' }}
                  />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '12px', marginBottom: '0' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ textTransform: 'capitalize', marginTop: '4px', marginBottom: '0' }}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      style={{ marginTop: '4px', marginBottom: '0' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Vendor / Paid To</label>
                  <input
                    placeholder="Supplier name, service provider, etc."
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    required
                    style={{ marginTop: '4px', marginBottom: '0' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Invoice / Receipt PDF (Optional)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ marginTop: '4px', marginBottom: '0', border: 'none', padding: '0' }}
                  />
                  {uploadingFile && <span style={{ fontSize: '0.8rem', color: '#777' }}>Uploading...</span>}
                  {invoiceUrl && (
                    <span style={{ fontSize: '0.8rem', color: '#1e7a4a', display: 'block', marginTop: '4px' }}>
                      Invoice attached. <a href={invoiceUrl} target="_blank" rel="noreferrer">View File</a>
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>Description</label>
                  <textarea
                    placeholder="Provide notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    style={{ marginTop: '4px', marginBottom: '0' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={uploadingFile || loading}>
                  {loading ? 'Submitting...' : 'Upload Expense'}
                </button>
              </form>
            </div>

            {/* Expenses List */}
            <div className="card">
              <h3>Expenses Ledger</h3>
              <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="smart-table">
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
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }} className="note">
                          No expenses uploaded yet.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Transaction Audit ledger */}
          <div className="card">
            <h3>Wallet Transaction History (Ledger Logs)</h3>
            <p className="note">Audit logs of all transactions updating society wallet balances.</p>
            <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="smart-table">
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }} className="note">
                        No wallet transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t._id}>
                        <td>{new Date(t.date).toLocaleString()}</td>
                        <td>
                          <span className={`status-pill ${t.type === 'income' ? 'approved' : 'rejected'}`}>
                            {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{t.category.replace('_', ' ')}</td>
                        <td>
                          <strong style={{ color: t.type === 'income' ? '#1e7a4a' : '#c0392b' }}>
                            {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                          </strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Defaulters Tab View */
        <div className="card">
          <h3>Aging Defaulters Report</h3>
          <p className="note">Detailed aging analysis of residents with unpaid maintenance bills.</p>
          <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
            <table className="smart-table">
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
                {defaulters.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }} className="note">
                      No defaulters currently! Excellent recovery rate.
                    </td>
                  </tr>
                ) : (
                  defaulters.map((item, idx) => (
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
                        <strong style={{ color: '#dc2626', fontSize: '1.05rem' }}>
                          ₹{item.totalAmount.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <a
                          href={`tel:${item.residentPhone}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          📞 Call Defaulter
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFinancesPage;
