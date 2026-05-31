import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ResidentFinancesPage = () => {
  const [wallet, setWallet] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <article className="stat-card" style={{ borderLeft: '4px solid #1e7a4a' }}>
            <h4>Current Wallet Balance</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e7a4a', marginTop: '8px' }}>
              ₹{wallet.balance.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Maintenance Collected</h4>
            <p style={{ fontSize: '1.4rem', color: '#555', marginTop: '8px' }}>
              ₹{wallet.maintenanceIncome.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Reserve Fund</h4>
            <p style={{ fontSize: '1.4rem', color: '#555', marginTop: '8px' }}>
              ₹{wallet.reserveFund.toLocaleString()}
            </p>
          </article>
          <article className="stat-card">
            <h4>Penalties Income</h4>
            <p style={{ fontSize: '1.4rem', color: '#555', marginTop: '8px' }}>
              ₹{wallet.penaltiesIncome.toLocaleString()}
            </p>
          </article>
          <article className="stat-card overdue">
            <h4>Total Expenditures</h4>
            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#c0392b', marginTop: '8px' }}>
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
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="data-table">
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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }} className="note">
                      No expense records registered yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span
                          style={{
                            background: '#eef6fa',
                            color: '#2e86ab',
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
                          <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                            {exp.description}
                          </span>
                        )}
                      </td>
                      <td>{exp.vendor}</td>
                      <td><strong>₹{exp.amount.toLocaleString()}</strong></td>
                      <td>
                        {exp.invoice ? (
                          <a href={exp.invoice} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                            View Bill
                          </a>
                        ) : (
                          <span style={{ color: '#aaa', fontStyle: 'italic' }}>No Receipt</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <h3>Full Ledger Logs (Wallet History)</h3>
          <p className="note">Traces all monetary inflows (maintenance, penalty collection) and outflows (expenses).</p>
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="data-table">
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }} className="note">
                      No ledger transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{new Date(t.date).toLocaleString()}</td>
                      <td>
                        <span
                          style={{
                            background: t.type === 'income' ? '#d5f5e3' : '#fadbd8',
                            color: t.type === 'income' ? '#1e7a4a' : '#c0392b',
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
                      <td style={{ textTransform: 'capitalize' }}>{t.category.replace('_', ' ')}</td>
                      <td>
                        <strong style={{ color: t.type === 'income' ? '#1e7a4a' : '#c0392b' }}>
                          {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                        </strong>
                      </td>
                      <td style={{ color: '#444' }}>{t.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentFinancesPage;
