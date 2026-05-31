import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageSecurityPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState(null);

  const [newRoster, setNewRoster] = useState({
    guardName: '',
    shift: 'morning',
    assignedZone: '',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    status: 'present',
    clockIn: '',
    clockOut: '',
  });

  const [message, setMessage] = useState('');

  const loadShifts = async () => {
    try {
      const res = await API.get('/security-shifts');
      setShifts(res.data);
    } catch (err) {
      console.error('Failed to load shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const handleAddRoster = async (e) => {
    e.preventDefault();
    try {
      await API.post('/security-shifts', newRoster);
      setMessage('Guard shift roster created successfully!');
      setNewRoster({ guardName: '', shift: 'morning', assignedZone: '' });
      setShowAddModal(false);
      loadShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create roster');
    }
  };

  const handleOpenAttendance = (roster) => {
    setSelectedRoster(roster);
    setAttendanceForm({
      status: 'present',
      clockIn: new Date().toISOString().substring(0, 16),
      clockOut: '',
    });
    setShowAttendanceModal(true);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/security-shifts/${selectedRoster._id}/attendance`, attendanceForm);
      setMessage('Attendance logged successfully!');
      setShowAttendanceModal(false);
      setSelectedRoster(null);
      loadShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to log attendance');
    }
  };

  if (loading) return <div className="skeleton card-skeleton" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🛡️ Gated Security Guard Roster</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add Guard / Shift
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Security Guards & Shift Roster</h3>
        <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="smart-table">
            <thead>
              <tr>
                <th>Guard Name</th>
                <th>Shift</th>
                <th>Assigned Zone</th>
                <th>Status</th>
                <th>Today's Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length > 0 ? (
                shifts.map((item) => {
                  const today = new Date().toDateString();
                  const todayRecord = item.attendance?.find(
                    (a) => new Date(a.date).toDateString() === today
                  );

                  return (
                    <tr key={item._id}>
                      <td><strong>{item.guardName}</strong></td>
                      <td>
                        <span className="badge normal" style={{ textTransform: 'capitalize' }}>
                          {item.shift}
                        </span>
                      </td>
                      <td>{item.assignedZone}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'active' ? 'approved' : 'rejected'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {todayRecord ? (
                          <span className={`status-pill ${todayRecord.status === 'present' ? 'approved' : 'rejected'}`}>
                            {todayRecord.status === 'present'
                              ? `Present (In: ${new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                                  todayRecord.clockOut
                                    ? `, Out: ${new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : ''
                                })`
                              : 'Absent'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Not marked</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => handleOpenAttendance(item)}
                          >
                            Mark Attendance
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">No guards registered yet.</td>
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
              <h3 className="modal-title">Roster Guard & Shift</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddRoster}>
              <label>Guard Name</label>
              <input
                type="text"
                placeholder="e.g. Inspector John Doe"
                value={newRoster.guardName}
                onChange={(e) => setNewRoster({ ...newRoster, guardName: e.target.value })}
                required
              />

              <label>Shift Timing</label>
              <select
                value={newRoster.shift}
                onChange={(e) => setNewRoster({ ...newRoster, shift: e.target.value })}
              >
                <option value="morning">Morning (06:00 AM - 02:00 PM)</option>
                <option value="afternoon">Afternoon (02:00 PM - 10:00 PM)</option>
                <option value="night">Night (10:00 PM - 06:00 AM)</option>
              </select>

              <label>Assigned Zone / Gated Area</label>
              <input
                type="text"
                placeholder="e.g. Main Gate, Tower A Parking, Clubhouse Area"
                value={newRoster.assignedZone}
                onChange={(e) => setNewRoster({ ...newRoster, assignedZone: e.target.value })}
                required
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Roster</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendanceModal && selectedRoster && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Mark Attendance: {selectedRoster.guardName}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowAttendanceModal(false); setSelectedRoster(null); }}>✕</button>
            </div>
            <form onSubmit={handleLogAttendance}>
              <label>Attendance Status</label>
              <select
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>

              {attendanceForm.status === 'present' && (
                <>
                  <label>Clock In Time</label>
                  <input
                    type="datetime-local"
                    value={attendanceForm.clockIn}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, clockIn: e.target.value })}
                  />

                  <label>Clock Out Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={attendanceForm.clockOut}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, clockOut: e.target.value })}
                  />
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAttendanceModal(false); setSelectedRoster(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSecurityPage;
