import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Calendar } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const fetchBookings = () =>
    API.get('/bookings')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, status) => {
    await API.patch(`/bookings/${id}`, { status });
    fetchBookings();
  };

  const filteredBookings = bookings.filter((b) => {
    const resName = b.residentId?.name || '';
    const facName = b.facility || '';
    const matchesSearch =
      resName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="page-container"><div className="skeleton card-skeleton" /></div>;

  return (
    <div className="page-container">
      <h2>Manage Facility Bookings</h2>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Bookings Ledger</h3>
        </div>

        {/* Search & Filters */}
        <div className="modern-filter-bar">
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by facility or resident..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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

        {paginatedBookings.length > 0 ? (
          <>
            <div className="modern-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Resident</th>
                    <th>Flat</th>
                    <th>Facility</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => (
                    <tr key={b._id}>
                      <td><strong>{b.residentId?.name || '—'}</strong></td>
                      <td>Flat {b.residentId?.flatNumber || '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{b.facility?.replace('_', ' ')}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td>
                        {b.startTime} – {b.endTime}
                      </td>
                      <td>
                        <span
                          style={{
                            background:
                              b.status === 'approved'
                                ? 'var(--status-success-bg)'
                                : b.status === 'pending'
                                ? 'var(--status-warning-bg)'
                                : 'var(--status-danger-bg)',
                            color:
                              b.status === 'approved'
                                ? 'var(--status-success-text)'
                                : b.status === 'pending'
                                ? 'var(--status-warning-text)'
                                : 'var(--status-danger-text)',
                            border: `1px solid ${
                              b.status === 'approved'
                                ? 'var(--status-success-border)'
                                : b.status === 'pending'
                                ? 'var(--status-warning-border)'
                                : 'var(--status-danger-border)'
                            }`,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            display: 'inline-block',
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'pending' && (
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
                              onClick={() => updateStatus(b._id, 'approved')}
                            >
                              Approve
                            </button>
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
                              onClick={() => updateStatus(b._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
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
            icon={Calendar}
            title={searchTerm || statusFilter ? "No matching bookings" : "No bookings registered"}
            description={
              searchTerm || statusFilter
                ? "Try adjusting or clearing your filters to see more results."
                : "No residents have requested facility bookings yet."
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
    </div>
  );
};

export default ManageBookingsPage;
