import React, { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { Car, Plus, Search, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

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
  const [submittingAddSlot, setSubmittingAddSlot] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [addSlotErrors, setAddSlotErrors] = useState({});
  const [addSlotTouched, setAddSlotTouched] = useState({});

  // Refs for modal focus trap
  const addSlotInputRef = useRef(null);
  const assignSlotSelectRef = useRef(null);

  // ESC Key listener for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowAssignModal(false);
        setSelectedSlot(null);
      }
    };
    if (showAddModal || showAssignModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, showAssignModal]);

  // Focus traps
  useEffect(() => {
    if (showAddModal) {
      addSlotInputRef.current?.focus();
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAssignModal) {
      assignSlotSelectRef.current?.focus();
    }
  }, [showAssignModal]);

  const validateAddSlot = (values) => {
    const errors = {};
    if (!values.slotNumber || !values.slotNumber.trim()) {
      errors.slotNumber = 'Slot Number is required';
    } else if (values.slotNumber.trim().length < 2) {
      errors.slotNumber = 'Slot number must be at least 2 characters';
    }
    return errors;
  };

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, availabilityFilter, itemsPerPage]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setMessage('');
    
    setAddSlotTouched({ slotNumber: true });
    const errs = validateAddSlot(newSlot);
    if (Object.keys(errs).length > 0) {
      setAddSlotErrors(errs);
      setMessage('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingAddSlot(true);
      await API.post('/parking', newSlot);
      setMessage('Parking slot added successfully!');
      setNewSlot({ slotNumber: '', type: 'resident' });
      setAddSlotErrors({});
      setAddSlotTouched({});
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setSubmittingAddSlot(false);
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
    setMessage('');
    try {
      setSubmittingAssign(true);
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
    } finally {
      setSubmittingAssign(false);
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

  const filteredSlots = slots.filter((slot) => {
    const matchesSearch =
      slot.slotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.ownerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slot.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? slot.type === typeFilter : true;
    const matchesAvailability =
      availabilityFilter !== ''
        ? slot.isAvailable === (availabilityFilter === 'true')
        : true;
    return matchesSearch && matchesType && matchesAvailability;
  });

  const totalItems = filteredSlots.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSlots = filteredSlots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="skeleton card-skeleton" style={{ margin: '24px' }} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="inline-flex items-center gap-2">
          <Car className="w-8 h-8 text-primary" /> Manage Parking Slots
        </h2>
        <button type="button" className="btn btn-primary inline-flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Parking Slot
        </button>
      </div>

      {message && <div className="card" style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

      <div className="card">
        <h3>Gated Slots Ledger</h3>

        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search by slot, owner, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="resident">Resident</option>
              <option value="visitor">Visitor</option>
              <option value="guest">Guest</option>
              <option value="reserved">Reserved</option>
            </select>
            <select
              className="modern-filter-select"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="true">Available</option>
              <option value="false">Occupied</option>
            </select>
            {(searchTerm || typeFilter || availabilityFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
                  setAvailabilityFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedSlots.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
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
                  {paginatedSlots.map((slot) => (
                    <tr key={slot._id}>
                      <td><strong>{slot.slotNumber}</strong></td>
                      <td>
                        <span className="status-pill info">
                          {slot.type.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <DashboardStatusBadge
                          tone={slot.isAvailable ? 'success' : 'danger'}
                          icon={slot.isAvailable ? CheckCircle2 : Clock}
                        >
                          {slot.isAvailable ? 'Available' : 'Occupied'}
                        </DashboardStatusBadge>
                      </td>
                      <td>
                        {slot.ownerId ? `${slot.ownerId.name} (Flat ${slot.ownerId.flatNumber})` : slot.ownerName || 'N/A'}
                      </td>
                      <td>{slot.vehicleNumber || 'N/A'}</td>
                      <td>
                        {slot.complaints && slot.complaints.length > 0 ? (
                          <div className="text-danger" style={{ fontSize: '0.85rem' }}>
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
                          <span className="text-success" style={{ fontWeight: 600 }}>None</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-compact"
                          onClick={() => handleOpenAssign(slot)}
                        >
                          Edit / Assign
                        </button>
                      </td>
                    </tr>
                  ))}
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
            icon={Car}
            title="No parking slots found"
            description="Try adjusting your filters or search terms."
            actionText={(searchTerm || typeFilter || availabilityFilter) ? "Clear Filters" : null}
            onAction={() => {
              setSearchTerm('');
              setTypeFilter('');
              setAvailabilityFilter('');
            }}
          />
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Parking Slot</h3>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">
                  Slot Number <span className="required-asterisk">*</span>
                </label>
                <input
                  ref={addSlotInputRef}
                  type="text"
                  className={`modern-input ${addSlotTouched.slotNumber && addSlotErrors.slotNumber ? 'is-invalid' : ''}`}
                  placeholder="e.g. P-101, V-12"
                  value={newSlot.slotNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewSlot(prev => ({ ...prev, slotNumber: val }));
                    if (addSlotTouched.slotNumber) {
                      setAddSlotErrors(validateAddSlot({ ...newSlot, slotNumber: val }));
                    }
                  }}
                  onBlur={() => {
                    setAddSlotTouched(prev => ({ ...prev, slotNumber: true }));
                    setAddSlotErrors(validateAddSlot(newSlot));
                  }}
                  required
                />
                {addSlotTouched.slotNumber && addSlotErrors.slotNumber && (
                  <span className="modern-error-text">{addSlotErrors.slotNumber}</span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Slot Type</label>
                <select
                  className="modern-input"
                  value={newSlot.type}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="resident">Resident Slot</option>
                  <option value="visitor">Visitor Parking</option>
                  <option value="guest">Guest Parking</option>
                  <option value="reserved">Reserved / Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingAddSlot}
                >
                  {submittingAddSlot ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Slot'
                  )}
                </button>
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
              <button type="button" className="modal-close" onClick={() => { setShowAssignModal(false); setSelectedSlot(null); }} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignSlot} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="modern-form-group">
                <label className="modern-label">Link Active Resident</label>
                <select
                  ref={assignSlotSelectRef}
                  className="modern-input"
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
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Or Enter Custom Owner Name</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="e.g. Guest Name or Staff"
                  value={assignForm.ownerName}
                  onChange={(e) => setAssignForm({ ...assignForm, ownerName: e.target.value, ownerId: e.target.value ? '' : assignForm.ownerId })}
                  disabled={Boolean(assignForm.ownerId)}
                />
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Vehicle Number</label>
                <input
                  type="text"
                  className="modern-input"
                  placeholder="e.g. MH-12-AB-1234"
                  value={assignForm.vehicleNumber}
                  onChange={(e) => setAssignForm({ ...assignForm, vehicleNumber: e.target.value })}
                />
              </div>

              <div className="modern-form-group" style={{ margin: '8px 0 16px' }}>
                <label className="modern-checkbox-group">
                  <input
                    type="checkbox"
                    className="modern-checkbox-input"
                    checked={assignForm.isAvailable}
                    onChange={(e) => setAssignForm({ ...assignForm, isAvailable: e.target.checked })}
                  />
                  Slot is Available
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAssignModal(false); setSelectedSlot(null); }}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  disabled={submittingAssign}
                >
                  {submittingAssign ? (
                    <>
                      <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Assignment'
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

export default ManageParkingPage;
