import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="page-container">Loading bookings...</p>;

  return (
    <div className="page-container">
      <h2>Manage Facility Bookings</h2>
      <table className="data-table">
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
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.residentId?.name || '—'}</td>
              <td>{b.residentId?.flatNumber || '—'}</td>
              <td>{b.facility.replace('_', ' ')}</td>
              <td>{new Date(b.date).toLocaleDateString()}</td>
              <td>
                {b.startTime} – {b.endTime}
              </td>
              <td>{b.status}</td>
              <td>
                {b.status === 'pending' && (
                  <>
                    <button type="button" onClick={() => updateStatus(b._id, 'approved')}>
                      Approve
                    </button>
                    <button type="button" className="btn-danger" onClick={() => updateStatus(b._id, 'rejected')}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageBookingsPage;
