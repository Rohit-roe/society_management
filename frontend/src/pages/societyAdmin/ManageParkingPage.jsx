import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageParkingPage = () => {
  const [slots, setSlots] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [newSlot, setNewSlot] = useState({ slotNumber: '', type: 'resident' });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [assignForm, setAssignForm] = useState({
    ownerId: '',
    ownerName: '',
    vehicleNumber: '',
    isAvailable: false,
  });

  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const [slotsRes, residentsRes] = await Promise.all([
        API.get('/parking'),
        API.get('/residents/pre-added'),
      ]);
      setSlots(slotsRes.data);
      setResidents(residentsRes.data.filter((r) => r.userId));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await API.post('/parking', newSlot);
      setMessage('Parking slot added successfully!');
      setNewSlot({ slotNumber: '', type: 'resident' });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleOpenAssign = (slot) => {
    setSelectedSlot(slot);
    setAssignForm({
      ownerId: slot.ownerId?._id || '',
      ownerName: slot.ownerName || '',
      vehicleNumber: slot.vehicleNumber || '',
      isAvailable: slot.isAvailable,
    });
    setShowAssignModal(true);
  };

  const handleAssignSlot = async (e) => {
    e.preventDefault();
    try {
      let finalName = assignForm.ownerName;
      if (assignForm.ownerId) {
        const res = residents.find((r) => r.userId?._id === assignForm.ownerId);
        if (res) finalName = res.name;
      }

      await API.put(`/parking/${selectedSlot._id}/assign`, {
        ...assignForm,
        ownerName: finalName,
      });

      setMessage('Parking slot assigned successfully!');
      setShowAssignModal(false);
      setSelectedSlot(null);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign slot');
    }
  };

  const clearComplaints = async (slotId) => {
    try {
      await API.put(`/parking/${slotId}/assign`, { complaints: [] });
      setMessage('Complaints cleared');
      loadData();
    } catch (err) {
      setMessage('Failed to clear complaints');
    }
  };

  if (loading) return <div className="skeleton card-skeleton" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🚗 Manage Parking Slots</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add Parking Slot
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Gated Slots Ledger</h3>
        <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="smart-table">
            <thead>
              <tr>
                <th>Slot Number</th>
                <th>Type</th>
                <th>Status</th>
                <th>Owner / Flat</th>
                <th>Vehicle Number</th>
                <th>Issues / Complaints</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <tr key={slot._id}>
                    <td><strong>{slot.slotNumber}</strong></td>
                    <td><span className="badge normal">{slot.type}</span></td>
                    <td>
                      <span className={`status-pill ${slot.isAvailable ? 'approved' : 'rejected'}`}>
                        {slot.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </td>
                    <td>
                      {slot.ownerId ? `${slot.ownerId.name} (Flat ${slot.ownerId.flatNumber})` : slot.ownerName || 'N/A'}
                    </td>
                    <td>{slot.vehicleNumber || 'N/A'}</td>
                    <td>
                      {slot.complaints && slot.complaints.length > 0 ? (
                        <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                          {slot.complaints.map((c, i) => <div key={i}>• {c}</div>)}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '0.75rem', marginTop: '4px' }}
                            onClick={() => clearComplaints(slot._id)}
                          >
                            Resolve
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'green' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleOpenAssign(slot)}
                      >
                        Edit / Assign
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No parking slots rostered.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Parking Slot</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSlot}>
              <label>Slot Number</label>
              <input
                type="text"
                placeholder="e.g. P-101, V-12"
                value={newSlot.slotNumber}
                onChange={(e) => setNewSlot({ ...newSlot, slotNumber: e.target.value })}
                required
              />

              <label>Slot Type</label>
              <select
                value={newSlot.type}
                onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
              >
                <option value="resident">Resident Slot</option>
                <option value="visitor">Visitor Parking</option>
                <option value="guest">Guest Parking</option>
                <option value="reserved">Reserved / Admin</option>
              </select>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Slot: {selectedSlot.slotNumber}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowAssignModal(false); setSelectedSlot(null); }}>✕</button>
            </div>
            <form onSubmit={handleAssignSlot}>
              <label>Link Active Resident</label>
              <select
                value={assignForm.ownerId}
                onChange={(e) => setAssignForm({ ...assignForm, ownerId: e.target.value, ownerName: e.target.value ? '' : assignForm.ownerName })}
              >
                <option value="">-- Select Resident (Optional) --</option>
                {residents.map((r) => (
                  <option key={r.userId?._id} value={r.userId?._id}>
                    {r.name} (Flat {r.houseNo})
                  </option>
                ))}
              </select>

              <label>Or Enter Custom Owner Name</label>
              <input
                type="text"
                placeholder="e.g. Guest Name or Staff"
                value={assignForm.ownerName}
                onChange={(e) => setAssignForm({ ...assignForm, ownerName: e.target.value, ownerId: e.target.value ? '' : assignForm.ownerId })}
                disabled={Boolean(assignForm.ownerId)}
              />

              <label>Vehicle Number</label>
              <input
                type="text"
                placeholder="e.g. MH-12-AB-1234"
                value={assignForm.vehicleNumber}
                onChange={(e) => setAssignForm({ ...assignForm, vehicleNumber: e.target.value })}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                <input
                  type="checkbox"
                  checked={assignForm.isAvailable}
                  onChange={(e) => setAssignForm({ ...assignForm, isAvailable: e.target.checked })}
                  style={{ width: 'auto', marginBottom: 0 }}
                />
                Slot is Available
              </label>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAssignModal(false); setSelectedSlot(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParkingPage;
