import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import API from '../../api/axios';
import { Calendar, AlertCircle } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

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
      setError('Please select a start and end time by clicking slot numbers below.');
      return;
    }
    const startIdx = TIME_SLOTS.indexOf(startTime);
    const endIdx = TIME_SLOTS.indexOf(endTime);
    const durationHours = endIdx > startIdx ? (endIdx - startIdx) * 2 : 2;

    setLoading(true);
    try {
      await API.post('/bookings', { facility, date, startTime, endTime, durationHours });
      setMessage('Booking submitted — awaiting admin approval.');
      const dateStr = date.toISOString().split('T')[0];
      const res = await API.get(`/bookings?facility=${facility}&date=${dateStr}`);
      setBooked(res.data);
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Book a Facility</h2>
      <p className="note">Select a shared society facility, date, and time slot to reserve it.</p>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}

      <div className="booking-split-layout" style={{ gap: '24px', alignItems: 'flex-start', marginTop: '20px' }}>
        <div className="card">
          <h3>Reservation Configurator</h3>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="modern-form-group">
              <label className="modern-label">Select Facility <span className="required-asterisk">*</span></label>
              <select value={facility} onChange={(e) => setFacility(e.target.value)} className="modern-input" style={{ textTransform: 'capitalize' }}>
                {FACILITIES.map((f) => (
                  <option key={f} value={f}>
                    {f.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Choose Date <span className="required-asterisk">*</span></label>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'inline-block', width: '100%' }}>
                <DatePicker selected={date} onChange={setDate} minDate={new Date()} inline />
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Available Time Slots</h3>
            <p className="note" style={{ marginBottom: '16px' }}>Select an available starting slot (Gray slots are already reserved).</p>

            <div className="time-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
              {TIME_SLOTS.map((slot) => {
                const taken = isSlotTaken(slot);
                const selected = startTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={taken}
                    className={`time-slot ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      setStartTime(slot);
                      const idx = TIME_SLOTS.indexOf(slot);
                      setEndTime(TIME_SLOTS[idx + 1] || '');
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: selected ? 'var(--primary)' : taken ? 'var(--status-neutral-bg)' : 'var(--bg-card)',
                      color: selected ? '#fff' : taken ? 'var(--text-secondary)' : 'var(--text-primary)',
                      cursor: taken ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      opacity: taken ? 0.6 : 1
                    }}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>

            {(startTime && endTime) && (
              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <strong>Selected Reservation Time:</strong> <br />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{startTime} to {endTime} ({date.toDateString()})</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBook}
            disabled={loading}
            style={{ width: '100%', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Confirming Reservation...
              </>
            ) : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacilityBookingPage;
