import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ParkingStatusPage = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [complaintText, setComplaintText] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadSlots = async () => {
    try {
      const res = await API.get('/parking');
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    if (!complaintText.trim() || !selectedSlot) return;
    try {
      await API.post(`/parking/${selectedSlot._id}/complaint`, { complaint: complaintText });
      setMessage('Complaint filed successfully!');
      setComplaintText('');
      setSelectedSlot(null);
      loadSlots();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to file complaint');
    }
  };

  const mySlots = slots.filter((s) => s.ownerId?._id === user._id);

  if (loading) return <div className="skeleton card-skeleton" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🚗 Parking Slots Status</h2>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>My Assigned Slots</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {mySlots.length > 0 ? (
            mySlots.map((slot) => (
              <div key={slot._id} className="card" style={{ borderLeft: '4px solid var(--primary)', margin: 0 }}>
                <h4 style={{ fontSize: '1.2rem' }}>Slot: {slot.slotNumber}</h4>
                <p>Type: <span className="badge normal">{slot.type}</span></p>
                <p>Vehicle: {slot.vehicleNumber || 'No vehicle registered'}</p>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => setSelectedSlot(slot)}
                >
                  ⚠️ Report Issue
                </button>
              </div>
            ))
          ) : (
            <p>You do not have any assigned slots.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Gated Community Parking Grid</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {slots.map((slot) => {
            const isMine = slot.ownerId?._id === user._id;
            const bg = isMine ? 'rgba(37, 99, 235, 0.15)' : slot.isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            const border = isMine ? '2px solid var(--primary)' : '1px solid var(--border)';
            return (
              <div
                key={slot._id}
                style={{
                  background: bg,
                  border: border,
                  borderRadius: 'var(--radius)',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{slot.slotNumber}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  {isMine ? 'Mine' : slot.type}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {slot.isAvailable ? 'Available' : 'Occupied'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Report Parking Issue for {selectedSlot.slotNumber}</h3>
              <button type="button" className="modal-close" onClick={() => setSelectedSlot(null)}>✕</button>
            </div>
            <form onSubmit={handleReport}>
              <textarea
                placeholder="Describe the parking issue (e.g. unauthorized vehicle MH-12-AB-1234 parked in my slot)..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                required
                rows={4}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingStatusPage;
