import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import StatusBadge from '../../components/maintenance/StatusBadge';
import { Search, Wrench } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MyMaintenancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  const filteredRecords = records.filter((r) => {
    return statusFilter ? r.status === statusFilter : true;
  });

  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchRecords = () => {
    API.get('/maintenance/my')
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePayment = async (record) => {
    if (!window.Razorpay) {
      toast.error('Razorpay script not loaded');
      return;
    }
    try {
      const res = await API.post('/payments/create-order', { maintenanceId: record._id });
      const { orderId, amount, currency, keyId } = res.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Society Management App',
        description: `Maintenance — ${record.flatNumber}`,
        order_id: orderId,
        handler: async (response) => {
          await API.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            maintenanceId: record._id,
          });
          toast.success('Payment successful!');
          fetchRecords();
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#2E86AB' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  return (
    <div className="page-container">
      <h2>My Maintenance History</h2>
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
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
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

          {paginatedRecords.length > 0 ? (
            <>
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Paid On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((r) => (
                      <tr key={r._id}>
                        <td>{MONTH_NAMES[r.month - 1]}</td>
                        <td>{r.year}</td>
                        <td>₹ {r.amount}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>{r.paidOn ? new Date(r.paidOn).toLocaleDateString() : '—'}</td>
                        <td>
                          {r.status !== 'paid' && (
                            <button
                              type="button"
                              className="btn btn-primary btn-compact"
                              onClick={() => handlePayment(r)}
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
                              Pay Now
                            </button>
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
              icon={Wrench}
              title={statusFilter ? "No matching records" : "No maintenance records"}
              description={
                statusFilter
                  ? "Try clearing the filter to view all maintenance history."
                  : "You do not have any maintenance records recorded yet."
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

export default MyMaintenancePage;
