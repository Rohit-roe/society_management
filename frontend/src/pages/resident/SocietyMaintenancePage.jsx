import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/maintenance/StatusBadge';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SocietyMaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/maintenance/all')
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-container">Loading...</p>;

  const now = new Date();

  return (
    <div className="page-container">
      <h2>
        Society Maintenance — {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
      </h2>
      <p className="note">Read-only view. Contact the society admin to update payment status.</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Flat</th>
            <th>Resident</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.flatNumber}</td>
              <td>{r.residentId?.name || '—'}</td>
              <td>₹ {r.amount}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SocietyMaintenancePage;
