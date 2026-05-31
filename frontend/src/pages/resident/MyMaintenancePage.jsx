import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import StatusBadge from '../../components/maintenance/StatusBadge';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MyMaintenancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert('Razorpay script not loaded');
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
          alert('Payment successful!');
          fetchRecords();
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#2E86AB' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  if (loading) return <p className="page-container">Loading your maintenance records...</p>;

  return (
    <div className="page-container">
      <h2>My Maintenance History</h2>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table className="data-table">
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
            {records.map((r) => (
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
                    <button type="button" className="btn-pay" onClick={() => handlePayment(r)}>
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyMaintenancePage;
