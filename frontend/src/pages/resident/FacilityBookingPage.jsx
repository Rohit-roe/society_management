import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import API from '../../api/axios';

const FACILITIES = ['clubhouse', 'gym', 'terrace', 'meeting_hall', 'badminton_court', 'guest_parking_slot'];
const TIME_SLOTS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

const FacilityBookingPage = () => {
  const [facility, setFacility] = useState('clubhouse');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [booked, setBooked] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dateStr = date.toISOString().split('T')[0];
    API.get(`/bookings?facility=${facility}&date=${dateStr}`).then((res) => setBooked(res.data));
  }, [facility, date]);

  const isSlotTaken = (slot) =>
    booked.some((b) => b.status !== 'rejected' && b.startTime <= slot && b.endTime > slot);

  const handleBook = async () => {
    setError('');
    setMessage('');
    if (!startTime || !endTime) {
      setError('Select a start and end time');
      return;
    }
    const startIdx = TIME_SLOTS.indexOf(startTime);
    const endIdx = TIME_SLOTS.indexOf(endTime);
    const durationHours = endIdx > startIdx ? (endIdx - startIdx) * 2 : 2;

    try {
      await API.post('/bookings', { facility, date, startTime, endTime, durationHours });
      setMessage('Booking submitted — awaiting admin approval.');
      const dateStr = date.toISOString().split('T')[0];
      const res = await API.get(`/bookings?facility=${facility}&date=${dateStr}`);
      setBooked(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="page-container">
      <h2>Book a Facility</h2>
      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}
      <select value={facility} onChange={(e) => setFacility(e.target.value)}>
        {FACILITIES.map((f) => (
          <option key={f} value={f}>
            {f.replace('_', ' ')}
          </option>
        ))}
      </select>
      <DatePicker selected={date} onChange={setDate} minDate={new Date()} inline />
      <div className="time-grid">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            disabled={isSlotTaken(slot)}
            className={`time-slot ${isSlotTaken(slot) ? 'taken' : ''} ${startTime === slot ? 'selected' : ''}`}
            onClick={() => {
              setStartTime(slot);
              const idx = TIME_SLOTS.indexOf(slot);
              setEndTime(TIME_SLOTS[idx + 1] || '');
            }}
          >
            {slot}
          </button>
        ))}
      </div>
      <button type="button" onClick={handleBook}>
        Confirm Booking
      </button>
    </div>
  );
};

export default FacilityBookingPage;
