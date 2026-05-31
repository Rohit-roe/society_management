import { useState, useEffect } from 'react';
import API from '../../api/axios';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/bookings')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-container">Loading bookings...</p>;

  return (
    <div className="page-container">
      <h2>My Facility Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.facility.replace('_', ' ')}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>
                  {b.startTime} – {b.endTime}
                </td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBookingsPage;
