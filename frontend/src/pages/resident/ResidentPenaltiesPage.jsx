import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ResidentPenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPenalties = () => {
    setLoading(true);
    API.get('/penalties')
      .then((res) => setPenalties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const handlePayPenalty = async (id) => {
    if (!window.confirm('Simulate penalty payment of this fine?')) return;
    try {
      setError('');
      setSuccess('');
      await API.post(`/penalties/${id}/pay`);
      setSuccess('Penalty paid successfully! Wallet credited.');
      fetchPenalties();
    } catch (err) {
      setError('Failed to pay penalty');
    }
  };

  if (loading && penalties.length === 0) return <p className="page-container">Loading penalties ledger...</p>;

  return (
    <div className="page-container">
      <h2>My Penalties & Fines Ledger</h2>
      <p className="note">Audits, guidelines, rules violations, and payment resolution ledger.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div className="card">
        <h3>Violations Ledger</h3>
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Violation Title</th>
                <th>Category</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Settle Date / Action</th>
              </tr>
            </thead>
            <tbody>
              {penalties.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }} className="note">
                    Congratulations! You have no recorded rule violations or pending penalty fines.
                  </td>
                </tr>
              ) : (
                penalties.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <strong>{p.title}</strong>
                      {p.description && (
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                          {p.description}
                        </span>
                      )}
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
                      {p.status === 'pending' ? (
                        <button
                          type="button"
                          className="btn-pay"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={() => handlePayPenalty(p._id)}
                        >
                          Pay Fine
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#555' }}>
                          Paid on {new Date(p.paidOn).toLocaleDateString()}
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
  );
};

export default ResidentPenaltiesPage;
