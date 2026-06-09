import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Coins, FileText } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const ResidentFinancesPage = () => {
  const [wallet, setWallet] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [expenseLimit, setExpenseLimit] = useState(5);

  const [txType, setTxType] = useState('');
  const [txPage, setTxPage] = useState(1);
  const [txLimit, setTxLimit] = useState(5);

  useEffect(() => {
    setExpensePage(1);
  }, [expenseSearch, expenseCategory, expenseLimit]);

  useEffect(() => {
    setTxPage(1);
  }, [txType, txLimit]);

  // Expenditure filtering
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesCategory = expenseCategory ? e.category === expenseCategory : true;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseItems = filteredExpenses.length;
  const totalExpensePages = Math.ceil(totalExpenseItems / expenseLimit);
  const paginatedExpenses = filteredExpenses.slice(
    (expensePage - 1) * expenseLimit,
    expensePage * expenseLimit
  );

  // Transactions filtering
  const filteredTx = transactions.filter((t) => {
    return txType ? t.type === txType : true;
  });

  const totalTxItems = filteredTx.length;
  const totalTxPages = Math.ceil(totalTxItems / txLimit);
  const paginatedTx = filteredTx.slice((txPage - 1) * txLimit, txPage * txLimit);

  // Get unique categories for expenses
  const expenseCategories = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, expensesRes, transactionsRes] = await Promise.all([
        API.get('/finances/wallet'),
        API.get('/finances/expenses'),
        API.get('/finances/transactions'),
      ]);
      setWallet(walletRes.data);
      setExpenses(expensesRes.data);
      setTransactions(transactionsRes.data);
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

  if (loading && !wallet) return <p className="page-container">Loading finances...</p>;

  return (
    <div className="page-container">
      <h2>Society Fund & Spending Transparency</h2>
      <p className="note">Real-time transparency reports of society funds, income sources, and expenditures.</p>

      {error && <p className="error-msg">{error}</p>}

      {wallet && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '32px' }}>
          <article className="stat-card" style={{ borderLeft: '4px solid var(--status-success-text)' }}>
            <h4>Current Wallet Balance</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--status-success-text)', marginTop: '8px' }}>
              ₹{wallet.balance.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Maintenance Collected</h4>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              ₹{wallet.maintenanceIncome.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Reserve Fund</h4>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              ₹{wallet.reserveFund.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Penalties Income</h4>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              ₹{wallet.penaltiesIncome.toLocaleString()}
            </p>
          </article>
          <article className="stat-card overdue">
            <h4>Total Expenditures</h4>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--status-danger-text)', marginTop: '8px' }}>
              ₹{wallet.expensesAmount.toLocaleString()}
            </p>
          </article>
        </div>
      )}

      {/* Society spending categories transparency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', marginBottom: '32px' }}>
        <div className="card">
          <h3>Expenditure Ledger (Bills & Invoices)</h3>
          <p className="note">List of all expenditures registered by society admins. Click "View Bill" to audit the invoice.</p>
          
          {/* Expenditure Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search by title or vendor..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
              />
            </div>
            <div className="modern-filter-group">
              <select
                className="modern-filter-select"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                style={{ textTransform: 'capitalize' }}
              >
                <option value="">All Categories</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {(expenseSearch || expenseCategory) && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => {
                    setExpenseSearch('');
                    setExpenseCategory('');
                  }}
                >
                  Clear Filters
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
                      <th>Expense Category</th>
                      <th>Title</th>
                      <th>Paid To (Vendor)</th>
                      <th>Amount</th>
                      <th>Invoice Proof</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenses.map((exp) => (
                      <tr key={exp._id}>
                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span
                            style={{
                              background: 'var(--status-neutral-bg)',
                              color: 'var(--status-neutral-text)',
                              border: '1px solid var(--status-neutral-border)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.8rem',
                            }}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td>
                          <strong>{exp.title}</strong>
                          {exp.description && (
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {exp.description}
                            </span>
                          )}
                        </td>
                        <td>{exp.vendor}</td>
                        <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                        <td>
                          {exp.invoice ? (
                            <a href={exp.invoice} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                              View Bill
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', opacity: 0.6, fontStyle: 'italic' }}>No Receipt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={expensePage}
                totalPages={totalExpensePages}
                totalItems={totalExpenseItems}
                itemsPerPage={expenseLimit}
                onPageChange={setExpensePage}
                onItemsPerPageChange={setExpenseLimit}
              />
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title={expenseSearch || expenseCategory ? "No matching expenses" : "No expense records"}
              description={
                expenseSearch || expenseCategory
                  ? "Try adjusting or clearing your filters to view more records."
                  : "No expense records have been registered for this society yet."
              }
              actionText={expenseSearch || expenseCategory ? "Clear Filters" : null}
              onAction={
                expenseSearch || expenseCategory
                  ? () => {
                      setExpenseSearch('');
                      setExpenseCategory('');
                    }
                  : null
              }
            />
          )}
        </div>

        {/* Transaction History */}
        <div className="card">
          <h3>Full Ledger Logs (Wallet History)</h3>
          <p className="note">Traces all monetary inflows (maintenance, penalty collection) and outflows (expenses).</p>
          
          {/* Wallet Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-group">
              <select
                className="modern-filter-select"
                value={txType}
                onChange={(e) => setTxType(e.target.value)}
              >
                <option value="">All Types (In / Out)</option>
                <option value="income">Inflow (Income)</option>
                <option value="expense">Outflow (Expense)</option>
              </select>
              {txType && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => setTxType('')}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {paginatedTx.length > 0 ? (
            <>
              <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Transaction Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTx.map((t) => (
                      <tr key={t._id}>
                        <td>{new Date(t.date).toLocaleString()}</td>
                        <td>
                          <span
                            style={{
                              background: t.type === 'income' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                              color: t.type === 'income' ? 'var(--status-success-text)' : 'var(--status-danger-text)',
                              border: `1px solid ${t.type === 'income' ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                            }}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{t.category?.replace('_', ' ')}</td>
                        <td>
                          <strong style={{ color: t.type === 'income' ? 'var(--status-success-text)' : 'var(--status-danger-text)' }}>
                            {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                          </strong>
                        </td>
                        <td>{t.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={txPage}
                totalPages={totalTxPages}
                totalItems={totalTxItems}
                itemsPerPage={txLimit}
                onPageChange={setTxPage}
                onItemsPerPageChange={setTxLimit}
              />
            </>
          ) : (
            <EmptyState
              icon={Coins}
              title={txType ? "No matching transactions" : "No transaction records"}
              description={
                txType
                  ? "Try clearing the type filter to view all ledger history."
                  : "No financial transactions have occurred on the society ledger yet."
              }
              actionText={txType ? "Clear Filter" : null}
              onAction={txType ? () => setTxType('') : null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentFinancesPage;
