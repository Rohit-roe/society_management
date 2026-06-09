import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Calendar } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  const fetchBookings = () => {
    API.get('/bookings')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    return statusFilter ? b.status === statusFilter : true;
  });

  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>My Facility Bookings</h2>
      
      {loading ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <div className="card">
          {/* Status Filter Bar */}
          <div className="modern-filter-bar">
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
              {statusFilter && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => setStatusFilter('')}
                >
                  Clear Filter
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
                      <th>Facility</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((b) => (
                      <tr key={b._id}>
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
                            }}
                          >
                            {b.status}
                          </span>
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
              title={statusFilter ? "No matching bookings" : "No bookings yet"}
              description={
                statusFilter
                  ? "Try adjusting your filter selection."
                  : "You have not scheduled any facility bookings yet."
              }
              actionText={statusFilter ? "Clear Filter" : null}
              onAction={statusFilter ? () => setStatusFilter('') : null}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
