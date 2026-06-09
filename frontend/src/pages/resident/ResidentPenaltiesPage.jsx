import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Siren } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const ResidentPenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmPayId, setConfirmPayId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

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

  const filteredPenalties = penalties.filter((p) => {
    const titleText = p.title || '';
    const descText = p.description || '';
    const matchesSearch =
      titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredPenalties.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedPenalties = filteredPenalties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>My Penalties & Fines Ledger</h2>
      <p className="note">Audits, guidelines, rules violations, and payment resolution ledger.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {loading && penalties.length === 0 ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Violations Ledger</h3>
          </div>

          {/* Search & Filters */}
          <div className="modern-filter-bar">
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search violations by title..."
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

          {paginatedPenalties.length > 0 ? (
            <>
              <div className="modern-table-wrapper">
                <table className="modern-table">
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
                    {paginatedPenalties.map((p) => (
                      <tr key={p._id}>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong>{p.title}</strong>
                          {p.description && (
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {p.description}
                            </span>
                          )}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category?.replace('_', ' ')}</td>
                        <td><strong>₹{p.amount.toLocaleString()}</strong></td>
                        <td>
                          <span
                            style={{
                              background: p.status === 'paid' ? 'var(--status-success-bg)' : 'var(--status-danger-bg)',
                              color: p.status === 'paid' ? 'var(--status-success-text)' : 'var(--status-danger-text)',
                              border: `1px solid ${p.status === 'paid' ? 'var(--status-success-border)' : 'var(--status-danger-border)'}`,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              display: 'inline-block',
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          {p.status === 'pending' ? (
                            confirmPayId === p._id ? (
                              <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Pay?</span>
                                <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-yes"
                                    onClick={() => {
                                      handlePayPenalty(p._id);
                                      setConfirmPayId(null);
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-no"
                                    onClick={() => setConfirmPayId(null)}
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
                                onClick={() => setConfirmPayId(p._id)}
                                style={{
                                  background: 'var(--primary)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius)',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                }}
                              >
                                Pay Fine
                              </button>
                            )
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              Paid on {new Date(p.paidOn).toLocaleDateString()}
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
              icon={Siren}
              title={searchTerm || statusFilter ? "No matching violations" : "No violations found"}
              description={
                searchTerm || statusFilter
                  ? "Try adjusting or clearing your filters to view more penalty details."
                  : "Congratulations! You have no recorded rule violations or pending penalty fines."
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

export default ResidentPenaltiesPage;
