import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

const ManageStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'cleaner',
    phone: '',
    salary: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [message, setMessage] = useState('');

  const loadStaff = async () => {
    try {
      const res = await API.get('/staff');
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await API.post('/staff', newStaff);
      setMessage('Staff member added successfully!');
      setNewStaff({ name: '', role: 'cleaner', phone: '', salary: '' });
      setShowAddModal(false);
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleOpenTask = (member) => {
    setSelectedStaff(member);
    setTaskForm({ title: '', description: '', dueDate: '' });
    setShowTaskModal(true);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/staff/${selectedStaff._id}/tasks`, taskForm);
      setMessage('Task assigned successfully!');
      setShowTaskModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const logAttendance = async (staffId, status) => {
    try {
      const today = new Date().toISOString().substring(0, 10);
      await API.post(`/staff/${staffId}/attendance`, { date: today, status });
      setMessage(`Attendance marked: ${status}`);
      loadStaff();
    } catch (err) {
      setMessage('Failed to log attendance');
    }
  };

  const updateTaskStatus = async (staffId, taskId, status) => {
    try {
      await API.patch(`/staff/${staffId}/tasks/${taskId}`, { status });
      setMessage(`Task status updated to: ${status}`);
      loadStaff();
    } catch (err) {
      setMessage('Failed to update task status');
    }
  };

  if (loading) return <div className="skeleton card-skeleton" />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🛠️ Gated Society Staff & Operations</h2>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Hire / Roster Staff
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Operational Staff Ledger</h3>
        <div className="smart-table-wrapper" style={{ marginTop: '16px' }}>
          <table className="smart-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Today's Attendance</th>
                <th>Active Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length > 0 ? (
                staff.map((item) => {
                  const today = new Date().toDateString();
                  const todayRecord = item.attendance?.find(
                    (a) => new Date(a.date).toDateString() === today
                  );

                  const activeTasks = item.tasks?.filter((t) => t.status !== 'completed') || [];

                  return (
                    <tr key={item._id}>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <span className="badge normal" style={{ textTransform: 'capitalize' }}>
                          {item.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{item.phone || 'N/A'}</td>
                      <td>₹{item.salary}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'active' ? 'approved' : 'rejected'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {todayRecord ? (
                          <span className={`status-pill ${todayRecord.status === 'present' ? 'approved' : 'rejected'}`}>
                            {todayRecord.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => logAttendance(item._id, 'present')}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                              onClick={() => logAttendance(item._id, 'absent')}
                            >
                              Absent
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {activeTasks.length > 0 ? (
                          <div style={{ fontSize: '0.85rem' }}>
                            {activeTasks.map((t) => (
                              <div key={t._id} style={{ marginBottom: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                                <strong>{t.title}</strong> ({t.status.replace('_', ' ')})
                                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    style={{ padding: '1px 4px', fontSize: '0.7rem' }}
                                    onClick={() => updateTaskStatus(item._id, t._id, 'in_progress')}
                                  >
                                    In Progress
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ padding: '1px 4px', fontSize: '0.7rem' }}
                                    onClick={() => updateTaskStatus(item._id, t._id, 'completed')}
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>No active tasks</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenTask(item)}
                        >
                          ➕ Assign Task
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">No staff rostered yet.</td>
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
              <h3 className="modal-title">Hire / Roster Staff</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStaff}>
              <label>Staff Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={newStaff.name}
                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                required
              />

              <label>Role</label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                <option value="cleaner">Cleaner</option>
                <option value="plumber">Plumber</option>
                <option value="electrician">Electrician</option>
                <option value="gardener">Gardener</option>
                <option value="maintenance_worker">General Maintenance Worker</option>
              </select>

              <label>Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              />

              <label>Salary (Monthly ₹)</label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={newStaff.salary}
                onChange={(e) => setNewStaff({ ...newStaff, salary: e.target.value })}
                required
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Hire Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Task to: {selectedStaff.name}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowTaskModal(false); setSelectedStaff(null); }}>✕</button>
            </div>
            <form onSubmit={handleAssignTask}>
              <label>Task Title</label>
              <input
                type="text"
                placeholder="e.g. Fix Leak in Block B Entrance"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
              />

              <label>Task Description (Optional)</label>
              <textarea
                placeholder="e.g. Needs specialized pipe sealants. Inspect under the stairs..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />

              <label>Due Date</label>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskModal(false); setSelectedStaff(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaffPage;
