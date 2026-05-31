import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/maintenance/StatusBadge';

const STATUS_OPTIONS = ['pending', 'paid', 'overdue'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ManageMaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [form, setForm] = useState({
    flatNumber: '',
    residentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
  });

  const fetchRecords = () =>
    API.get('/maintenance')
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.patch(`/maintenance/${id}`, { status: newStatus });
      fetchRecords();
    } finally {
      setUpdating(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await API.post('/maintenance', {
      ...form,
      month: Number(form.month),
      year: Number(form.year),
      amount: Number(form.amount),
    });
    setForm({
      flatNumber: '',
      residentId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: '',
    });
    fetchRecords();
  };

  if (loading) return <p className="page-container">Loading records...</p>;

  return (
    <section className="page-container">
      <h2>Manage Maintenance</h2>
      <form onSubmit={handleCreate} className="form-row">
        <input
          placeholder="Flat"
          value={form.flatNumber}
          onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
          required
        />
        <input
          placeholder="Resident User ID (optional)"
          value={form.residentId}
          onChange={(e) => setForm({ ...form, residentId: e.target.value })}
        />
        <input
          type="number"
          min="1"
          max="12"
          placeholder="Month"
          value={form.month}
          onChange={(e) => setForm({ ...form, month: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <button type="submit">Add Record</button>
      </form>
      <table className="data-table">
        <thead>
          <tr>
            <th>Flat</th>
            <th>Resident</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.flatNumber}</td>
              <td>{r.residentId?.name || '—'}</td>
              <td>
                {MONTH_NAMES[r.month - 1]} {r.year}
              </td>
              <td>₹ {r.amount}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>
                <select
                  value={r.status}
                  disabled={updating === r._id}
                  onChange={(e) => handleStatusChange(r._id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default ManageMaintenancePage;
