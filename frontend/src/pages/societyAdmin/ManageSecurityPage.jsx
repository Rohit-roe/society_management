import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { ShieldCheck, Plus, Search, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

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
  const [submittingRoster, setSubmittingRoster] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [rosterErrors, setRosterErrors] = useState({});
  const [rosterTouched, setRosterTouched] = useState({});
  const [attendanceErrors, setAttendanceErrors] = useState({});
  const [attendanceTouched, setAttendanceTouched] = useState({});

  // Refs for modal focus traps
  const guardNameInputRef = useRef(null);
  const attendanceStatusSelectRef = useRef(null);

  const validateRoster = (values) => {
    const errors = {};
    if (!values.guardName || !values.guardName.trim()) {
      errors.guardName = 'Guard Name is required';
    } else if (values.guardName.trim().length < 3) {
      errors.guardName = 'Guard name must be at least 3 characters';
    }
    if (!values.assignedZone || !values.assignedZone.trim()) {
      errors.assignedZone = 'Assigned Zone is required';
    } else if (values.assignedZone.trim().length < 2) {
      errors.assignedZone = 'Assigned zone must be at least 2 characters';
    }
    return errors;
  };

  const validateAttendance = (values) => {
    const errors = {};
    if (values.status === 'present') {
      if (!values.clockIn) {
        errors.clockIn = 'Clock In time is required';
      }
      if (values.clockIn && values.clockOut && new Date(values.clockOut) < new Date(values.clockIn)) {
        errors.clockOut = 'Clock Out time cannot be before Clock In time';
      }
    }
    return errors;
  };

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, shiftFilter, statusFilter, itemsPerPage]);

  // ESC Key listener for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowAttendanceModal(false);
        setSelectedRoster(null);
      }
    };
    if (showAddModal || showAttendanceModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showAttendanceModal]);

  // Focus traps
  useEffect(() => {
    if (showAddModal) {
      guardNameInputRef.current?.focus();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAttendanceModal) {
      attendanceStatusSelectRef.current?.focus();
    }
  }, [showAttendanceModal]);

  const handleAddRoster = async (e) => {
    e.preventDefault();
    setMessage('');

    setRosterTouched({ guardName: true, assignedZone: true });
    const errs = validateRoster(newRoster);
    if (Object.keys(errs).length > 0) {
      setRosterErrors(errs);
      setMessage('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingRoster(true);
      await API.post('/security-shifts', newRoster);
      setMessage('Guard shift roster created successfully!');
      setNewRoster({ guardName: '', shift: 'morning', assignedZone: '' });
      setRosterErrors({});
      setRosterTouched({});
      setShowAddModal(false);
      loadShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create roster');
    } finally {
      setSubmittingRoster(false);
    }
  };

  const handleOpenAttendance = (roster) => {
    setSelectedRoster(roster);
    setAttendanceForm({
      status: 'present',
      clockIn: new Date().toISOString().substring(0, 16),
      clockOut: '',
    });
    setAttendanceErrors({});
    setAttendanceTouched({});
    setShowAttendanceModal(true);
  };

  const handleLogAttendance = async (e) => {
    e.preventDefault();
    setMessage('');

    setAttendanceTouched({ status: true, clockIn: true, clockOut: true });
    const errs = validateAttendance(attendanceForm);
    if (Object.keys(errs).length > 0) {
      setAttendanceErrors(errs);
      setMessage('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingAttendance(true);
      await API.post(`/security-shifts/${selectedRoster._id}/attendance`, attendanceForm);
      setMessage('Attendance logged successfully!');
      setAttendanceErrors({});
      setAttendanceTouched({});
      setShowAttendanceModal(false);
      setSelectedRoster(null);
      loadShifts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to log attendance');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const filteredShifts = shifts.filter((item) => {
    const matchesSearch =
      item.guardName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignedZone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = shiftFilter ? item.shift === shiftFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesShift && matchesStatus;
  });

  const totalItems = filteredShifts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="skeleton card-skeleton" style={{ margin: '24px' }} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="inline-flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" /> Gated Security Guard Roster
        </h2>
        <button type="button" className="btn btn-primary inline-flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Guard / Shift
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Security Guards & Shift Roster</h3>

        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by guard name or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
            >
              <option value="">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
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
            {(searchTerm || shiftFilter || statusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  setShiftFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedShifts.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
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
                  {paginatedShifts.map((item) => {
                    const today = new Date().toDateString();
                    const todayRecord = item.attendance?.find(
                      (a) => new Date(a.date).toDateString() === today
                    );

                    return (
                      <tr key={item._id}>
                        <td><strong>{item.guardName}</strong></td>
                        <td>
                          <span className="status-pill info" style={{ textTransform: 'capitalize' }}>
                            {item.shift}
                          </span>
                        </td>
                        <td>{item.assignedZone}</td>
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
                              {todayRecord.status === 'present'
                                ? `Present (In: ${new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${
                                    todayRecord.clockOut
                                      ? `, Out: ${new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                      : ''
                                  })`
                                : 'Absent'}
                            </DashboardStatusBadge>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>Not marked</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-secondary btn-compact"
                            onClick={() => handleOpenAttendance(item)}
                          >
                            Mark Attendance
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
            icon={ShieldCheck}
            title="No guards found"
            description="Try adjusting your filters or search terms."
            actionText={(searchTerm || shiftFilter || statusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setSearchTerm('');
              setShiftFilter('');
              setStatusFilter('');
            }}
          />
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Roster Guard & Shift</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddRoster} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">
                  Guard Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  ref={guardNameInputRef}
                  className={`modern-input ${rosterTouched.guardName && rosterErrors.guardName ? 'is-invalid' : ''}`}
                  placeholder="e.g. Inspector John Doe"
                  value={newRoster.guardName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewRoster(prev => ({ ...prev, guardName: val }));
                    if (rosterTouched.guardName) {
                      setRosterErrors(validateRoster({ ...newRoster, guardName: val }));
                    }
                  }}
                  onBlur={() => {
                    setRosterTouched(prev => ({ ...prev, guardName: true }));
                    setRosterErrors(validateRoster(newRoster));
                  }}
                  required
                />
                {rosterTouched.guardName && rosterErrors.guardName && (
                  <span className="modern-error-text">{rosterErrors.guardName}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Shift Timing</label>
                <select
                  className="modern-input"
                  value={newRoster.shift}
                  onChange={(e) => setNewRoster(prev => ({ ...prev, shift: e.target.value }))}
                >
                  <option value="morning">Morning (06:00 AM - 02:00 PM)</option>
                  <option value="afternoon">Afternoon (02:00 PM - 10:00 PM)</option>
                  <option value="night">Night (10:00 PM - 06:00 AM)</option>
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">
                  Assigned Zone / Gated Area <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  className={`modern-input ${rosterTouched.assignedZone && rosterErrors.assignedZone ? 'is-invalid' : ''}`}
                  placeholder="e.g. Main Gate, Tower A Parking"
                  value={newRoster.assignedZone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewRoster(prev => ({ ...prev, assignedZone: val }));
                    if (rosterTouched.assignedZone) {
                      setRosterErrors(validateRoster({ ...newRoster, assignedZone: val }));
                    }
                  }}
                  onBlur={() => {
                    setRosterTouched(prev => ({ ...prev, assignedZone: true }));
                    setRosterErrors(validateRoster(newRoster));
                  }}
                  required
                />
                {rosterTouched.assignedZone && rosterErrors.assignedZone && (
                  <span className="modern-error-text">{rosterErrors.assignedZone}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingRoster}
                >
                  {submittingRoster ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Roster'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendanceModal && selectedRoster && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Mark Attendance: {selectedRoster.guardName}</h3>
              <button type="button" className="modal-close" onClick={() => { setShowAttendanceModal(false); setSelectedRoster(null); }} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleLogAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">Attendance Status</label>
                <select
                  ref={attendanceStatusSelectRef}
                  className="modern-input"
                  value={attendanceForm.status}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {attendanceForm.status === 'present' && (
                <>
                  <div className="modern-form-group">
                    <label className="modern-label">
                      Clock In Time <span className="required-asterisk">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className={`modern-input ${attendanceTouched.clockIn && attendanceErrors.clockIn ? 'is-invalid' : ''}`}
                      value={attendanceForm.clockIn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttendanceForm(prev => ({ ...prev, clockIn: val }));
                        if (attendanceTouched.clockIn) {
                          setAttendanceErrors(validateAttendance({ ...attendanceForm, clockIn: val }));
                        }
                      }}
                      onBlur={() => {
                        setAttendanceTouched(prev => ({ ...prev, clockIn: true }));
                        setAttendanceErrors(validateAttendance(attendanceForm));
                      }}
                      required
                    />
                    {attendanceTouched.clockIn && attendanceErrors.clockIn && (
                      <span className="modern-error-text">{attendanceErrors.clockIn}</span>
                    )}
                  </div>

                  <div className="modern-form-group">
                    <label className="modern-label">Clock Out Time (Optional)</label>
                    <input
                      type="datetime-local"
                      className={`modern-input ${attendanceTouched.clockOut && attendanceErrors.clockOut ? 'is-invalid' : ''}`}
                      value={attendanceForm.clockOut}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAttendanceForm(prev => ({ ...prev, clockOut: val }));
                        if (attendanceTouched.clockOut) {
                          setAttendanceErrors(validateAttendance({ ...attendanceForm, clockOut: val }));
                        }
                      }}
                      onBlur={() => {
                        setAttendanceTouched(prev => ({ ...prev, clockOut: true }));
                        setAttendanceErrors(validateAttendance(attendanceForm));
                      }}
                    />
                    {attendanceTouched.clockOut && attendanceErrors.clockOut && (
                      <span className="modern-error-text">{attendanceErrors.clockOut}</span>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAttendanceModal(false); setSelectedRoster(null); }}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingAttendance}
                >
                  {submittingAttendance ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Marking...
                    </>
                  ) : (
                    'Log Attendance'
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

export default ManageSecurityPage;
