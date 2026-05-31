import { useState, useEffect } from 'react';
import API from '../../api/axios';

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

  const handleIssuePenalty = async (e) => {
    e.preventDefault();
    if (!residentId || !title || !amount) {
      setError('Please select a resident, title, and amount.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
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
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue penalty');
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this penalty fine as paid? This will credit the society wallet.')) return;
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

  if (loading && penalties.length === 0) return <p className="page-container">Loading penalty logs...</p>;

  return (
    <div className="page-container">
      <h2>Penalty & Fines Registry</h2>
      <p className="note">Issue penalty notes to residents for rules violations and log penalty resolution ledgers.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Issue Penalty Form */}
        <div className="card">
          <h3>Issue Penalty Fine</h3>
          <form onSubmit={handleIssuePenalty} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Select Resident</label>
              <select value={residentId} onChange={(e) => setResidentId(e.target.value)} required style={{ marginTop: '4px' }}>
                <option value="">-- Select Resident --</option>
                {residents.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} (Flat: {r.flatNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Violation Title</label>
              <input
                placeholder="e.g. Speeding in parking lot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>

            <div className="form-row" style={{ marginBottom: '0' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Fine Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ textTransform: 'capitalize', marginTop: '4px' }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Details</label>
              <textarea
                placeholder="Describe details, dates, or damage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>

            <button type="submit">Issue Penalty Slip</button>
          </form>
        </div>

        {/* Penalty Ledger */}
        <div className="card">
          <h3>Penalty Ledger</h3>
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="data-table">
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
                {penalties.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }} className="note">
                      No penalties issued yet.
                    </td>
                  </tr>
                ) : (
                  penalties.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.residentId?.name}</strong></td>
                      <td>{p.flatNumber}</td>
                      <td>
                        <strong>{p.title}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</span>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{p.category.replace('_', ' ')}</td>
                      <td><strong>₹{p.amount.toLocaleString()}</strong></td>
                      <td>
                        <span
                          className={`badge ${p.status === 'paid' ? '' : 'urgent'}`}
                          style={{
                            background: p.status === 'paid' ? '#d5f5e3' : '#fadbd8',
                            color: p.status === 'paid' ? '#1e7a4a' : '#c0392b',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.status === 'pending' && (
                          <button
                            type="button"
                            style={{ background: '#1e7a4a', padding: '4px 10px', fontSize: '0.8rem' }}
                            onClick={() => handleMarkPaid(p._id)}
                          >
                            Mark Paid
                          </button>
                        )}
                        {p.status === 'paid' && p.paidOn && (
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            {new Date(p.paidOn).toLocaleDateString()}
                          </span>
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
    </div>
  );
};

export default ManagePenaltiesPage;
