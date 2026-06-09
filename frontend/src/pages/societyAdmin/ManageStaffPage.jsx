import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { Hammer, Plus, Search, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

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
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [staffErrors, setStaffErrors] = useState({});
  const [staffTouched, setStaffTouched] = useState({});
  const [taskErrors, setTaskErrors] = useState({});
  const [taskTouched, setTaskTouched] = useState({});

  // Refs for modal focus trap
  const staffNameInputRef = useRef(null);
  const taskTitleInputRef = useRef(null);

  const validateStaff = (values) => {
    const errors = {};
    if (!values.name || !values.name.trim()) {
      errors.name = 'Staff Name is required';
    } else if (values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (values.phone && !/^\+?\d{10,12}$/.test(values.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Phone number must be between 10 and 12 digits';
    }
    if (!values.salary) {
      errors.salary = 'Salary is required';
    } else if (Number(values.salary) <= 0) {
      errors.salary = 'Salary must be greater than zero';
    }
    return errors;
  };

  const validateTask = (values) => {
    const errors = {};
    if (!values.title || !values.title.trim()) {
      errors.title = 'Task Title is required';
    } else if (values.title.trim().length < 3) {
      errors.title = 'Task title must be at least 3 characters';
    }
    if (values.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(values.dueDate) < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }
    return errors;
  };

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage]);

  // ESC Key listener for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowTaskModal(false);
        setSelectedStaff(null);
      }
    };
    if (showAddModal || showTaskModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showTaskModal]);

  // Focus traps
  useEffect(() => {
    if (showAddModal) {
      staffNameInputRef.current?.focus();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showTaskModal) {
      taskTitleInputRef.current?.focus();
    }
  }, [showTaskModal]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setMessage('');

    setStaffTouched({ name: true, phone: true, salary: true });
    const errs = validateStaff(newStaff);
    if (Object.keys(errs).length > 0) {
      setStaffErrors(errs);
      setMessage('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingStaff(true);
      await API.post('/staff', newStaff);
      setMessage('Staff member added successfully!');
      setNewStaff({ name: '', role: 'cleaner', phone: '', salary: '' });
      setStaffErrors({});
      setStaffTouched({});
      setShowAddModal(false);
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleOpenTask = (member) => {
    setSelectedStaff(member);
    setTaskForm({ title: '', description: '', dueDate: '' });
    setTaskErrors({});
    setTaskTouched({});
    setShowTaskModal(true);
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    setMessage('');

    setTaskTouched({ title: true, dueDate: true });
    const errs = validateTask(taskForm);
    if (Object.keys(errs).length > 0) {
      setTaskErrors(errs);
      setMessage('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingTask(true);
      await API.post(`/staff/${selectedStaff._id}/tasks`, taskForm);
      setMessage('Task assigned successfully!');
      setTaskErrors({});
      setTaskTouched({});
      setShowTaskModal(false);
      setSelectedStaff(null);
      loadStaff();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setSubmittingTask(false);
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

  const filteredStaff = staff.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tasks?.some((t) => t.title?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter ? item.role === roleFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalItems = filteredStaff.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="skeleton card-skeleton" style={{ margin: '24px' }} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="inline-flex items-center gap-2">
          <Hammer className="w-8 h-8 text-primary" /> Gated Society Staff & Operations
        </h2>
        <button type="button" className="btn btn-primary inline-flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Hire / Roster Staff
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Operational Staff Ledger</h3>

        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by name, phone, tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="cleaner">Cleaner</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="gardener">Gardener</option>
              <option value="maintenance_worker">Maintenance Worker</option>
            </select>
            <select
              className="modern-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {(searchTerm || roleFilter || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedStaff.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
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
                  {paginatedStaff.map((item) => {
                    const today = new Date().toDateString();
                    const todayRecord = item.attendance?.find(
                      (a) => new Date(a.date).toDateString() === today
                    );

                    const activeTasks = item.tasks?.filter((t) => t.status !== 'completed') || [];

                    return (
                      <tr key={item._id}>
                        <td><strong>{item.name}</strong></td>
                        <td>
                          <span className="status-pill info" style={{ textTransform: 'capitalize' }}>
                            {item.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{item.phone || 'N/A'}</td>
                        <td>₹{item.salary.toLocaleString()}</td>
                        <td>
                          <DashboardStatusBadge
                            tone={item.status === 'active' ? 'success' : 'danger'}
                            icon={item.status === 'active' ? CheckCircle2 : Clock}
                          >
                            {item.status.toUpperCase()}
                          </DashboardStatusBadge>
                        </td>
                        <td>
                          {todayRecord ? (
                            <DashboardStatusBadge
                              tone={todayRecord.status === 'present' ? 'success' : 'danger'}
                              icon={todayRecord.status === 'present' ? CheckCircle2 : AlertTriangle}
                            >
                              {todayRecord.status.toUpperCase()}
                            </DashboardStatusBadge>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-compact"
                                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                onClick={() => logAttendance(item._id, 'present')}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-compact"
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
                                  <strong>{t.title}</strong> <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({t.status.replace('_', ' ')})</span>
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
                            className="btn btn-secondary btn-compact inline-flex items-center gap-1"
                            onClick={() => handleOpenTask(item)}
                          >
                            <Plus className="w-3.5 h-3.5" /> Assign Task
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        ) : (
          <EmptyState
            icon={Hammer}
            title="No staff members found"
            description="Try adjusting your filters or search terms."
            actionText={(searchTerm || roleFilter || statusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setSearchTerm('');
              setRoleFilter('');
              setStatusFilter('');
            }}
          />
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Hire / Roster Staff</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">
                  Staff Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  ref={staffNameInputRef}
                  className={`modern-input ${staffTouched.name && staffErrors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Ramesh Kumar"
                  value={newStaff.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewStaff(prev => ({ ...prev, name: val }));
                    if (staffTouched.name) {
                      setStaffErrors(validateStaff({ ...newStaff, name: val }));
                    }
                  }}
                  onBlur={() => {
                    setStaffTouched(prev => ({ ...prev, name: true }));
                    setStaffErrors(validateStaff(newStaff));
                  }}
                  required
                />
                {staffTouched.name && staffErrors.name && (
                  <span className="modern-error-text">{staffErrors.name}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Role</label>
                <select
                  className="modern-input"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="cleaner">Cleaner</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="gardener">Gardener</option>
                  <option value="maintenance_worker">General Maintenance Worker</option>
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Phone Number</label>
                <input
                  type="text"
                  className={`modern-input ${staffTouched.phone && staffErrors.phone ? 'is-invalid' : ''}`}
                  placeholder="e.g. +91 9876543210"
                  value={newStaff.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewStaff(prev => ({ ...prev, phone: val }));
                    if (staffTouched.phone) {
                      setStaffErrors(validateStaff({ ...newStaff, phone: val }));
                    }
                  }}
                  onBlur={() => {
                    setStaffTouched(prev => ({ ...prev, phone: true }));
                    setStaffErrors(validateStaff(newStaff));
                  }}
                />
                {staffTouched.phone && staffErrors.phone && (
                  <span className="modern-error-text">{staffErrors.phone}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">
                  Salary (Monthly ₹) <span className="required-asterisk">*</span>
                </label>
                <input
                  type="number"
                  className={`modern-input ${staffTouched.salary && staffErrors.salary ? 'is-invalid' : ''}`}
                  placeholder="e.g. 15000"
                  value={newStaff.salary}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewStaff(prev => ({ ...prev, salary: val }));
                    if (staffTouched.salary) {
                      setStaffErrors(validateStaff({ ...newStaff, salary: val }));
                    }
                  }}
                  onBlur={() => {
                    setStaffTouched(prev => ({ ...prev, salary: true }));
                    setStaffErrors(validateStaff(newStaff));
                  }}
                  required
                />
                {staffTouched.salary && staffErrors.salary && (
                  <span className="modern-error-text">{staffErrors.salary}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingStaff}
                >
                  {submittingStaff ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Hiring...
                    </>
                  ) : (
                    'Hire Staff'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && selectedStaff && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Assign Task to: {selectedStaff.name}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowTaskModal(false); setSelectedStaff(null); }} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">
                  Task Title <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  ref={taskTitleInputRef}
                  className={`modern-input ${taskTouched.title && taskErrors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Fix Leak in Block B Entrance"
                  value={taskForm.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTaskForm(prev => ({ ...prev, title: val }));
                    if (taskTouched.title) {
                      setTaskErrors(validateTask({ ...taskForm, title: val }));
                    }
                  }}
                  onBlur={() => {
                    setTaskTouched(prev => ({ ...prev, title: true }));
                    setTaskErrors(validateTask(taskForm));
                  }}
                  required
                />
                {taskTouched.title && taskErrors.title && (
                  <span className="modern-error-text">{taskErrors.title}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Task Description (Optional)</label>
                <textarea
                  className="modern-input"
                  placeholder="e.g. Needs specialized pipe sealants. Inspect under the stairs..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Due Date</label>
                <input
                  type="date"
                  className={`modern-input ${taskTouched.dueDate && taskErrors.dueDate ? 'is-invalid' : ''}`}
                  value={taskForm.dueDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTaskForm(prev => ({ ...prev, dueDate: val }));
                    if (taskTouched.dueDate) {
                      setTaskErrors(validateTask({ ...taskForm, dueDate: val }));
                    }
                  }}
                  onBlur={() => {
                    setTaskTouched(prev => ({ ...prev, dueDate: true }));
                    setTaskErrors(validateTask(taskForm));
                  }}
                />
                {taskTouched.dueDate && taskErrors.dueDate && (
                  <span className="modern-error-text">{taskErrors.dueDate}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowTaskModal(false); setSelectedStaff(null); }}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingTask}
                >
                  {submittingTask ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    'Assign Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaffPage;
