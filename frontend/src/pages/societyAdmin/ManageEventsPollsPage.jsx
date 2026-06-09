import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Calendar, AlertTriangle, CheckCircle2, Clock, Search, FileText } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

const CATEGORIES = ['festival', 'sports_day', 'society_dinner', 'cultural_event', 'custom'];

const ManageEventsPollsPage = () => {
  const [events, setEvents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll Form states
  const [pollTitle, setPollTitle] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [pollDeadline, setPollDeadline] = useState('');

  // Event logistics update state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [logisticsText, setLogisticsText] = useState('');
  const [eventStatus, setEventStatus] = useState('approved');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form validations & loadings
  const [pollErrors, setPollErrors] = useState({});
  const [pollTouched, setPollTouched] = useState({});
  const [creatingPoll, setCreatingPoll] = useState(false);

  const [logisticsErrors, setLogisticsErrors] = useState({});
  const [logisticsTouched, setLogisticsTouched] = useState({});
  const [savingLogistics, setSavingLogistics] = useState(false);

  // Poll filters & pagination
  const [pollSearch, setPollSearch] = useState('');
  const [pollStatusFilter, setPollStatusFilter] = useState('');
  const [pollPage, setPollPage] = useState(1);
  const [pollLimit, setPollLimit] = useState(5);

  // Event filters & pagination
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('');
  const [eventPage, setEventPage] = useState(5);
  const [eventLimit, setEventLimit] = useState(5);
  const [confirmCloseEventId, setConfirmCloseEventId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, pollsRes] = await Promise.all([
        API.get('/voting/events'),
        API.get('/voting/polls'),
      ]);
      setEvents(eventsRes.data);
      setPolls(pollsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events and polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pages when filters change
  useEffect(() => {
    setPollPage(1);
  }, [pollSearch, pollStatusFilter, pollLimit]);

  useEffect(() => {
    setEventPage(1);
  }, [eventSearch, eventStatusFilter, eventLimit]);

  const validatePollField = (name, value) => {
    let err = '';
    if (!value) {
      err = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'pollDeadline') {
      const deadlineDate = new Date(value);
      if (deadlineDate < new Date()) {
        err = 'Deadline date cannot be in the past';
      }
    }
    setPollErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handlePollInputChange = (name, value) => {
    if (name === 'pollTitle') setPollTitle(value);
    if (name === 'pollDesc') setPollDesc(value);
    if (name === 'pollDeadline') setPollDeadline(value);

    if (pollTouched[name]) {
      validatePollField(name, value);
    }
  };

  const handlePollInputBlur = (name, value) => {
    setPollTouched((prev) => ({ ...prev, [name]: true }));
    validatePollField(name, value);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setPollTouched({ pollTitle: true, pollDesc: true, pollDeadline: true });
    const isTitleValid = validatePollField('pollTitle', pollTitle);
    const isDescValid = validatePollField('pollDesc', pollDesc);
    const isDeadlineValid = validatePollField('pollDeadline', pollDeadline);

    if (!isTitleValid || !isDescValid || !isDeadlineValid) {
      setError('Please resolve all validation errors.');
      return;
    }

    setCreatingPoll(true);
    try {
      await API.post('/voting/polls', {
        title: pollTitle,
        description: pollDesc,
        deadline: pollDeadline,
      });

      setSuccess('Decision poll created successfully.');
      setPollTitle('');
      setPollDesc('');
      setPollDeadline('');
      setPollTouched({});
      setPollErrors({});
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleCloseEventVoting = async (id) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/voting/events/${id}/close`);
      const status = res.data.status;
      setSuccess(`Voting closed. Event was ${status === 'approved' ? 'APPROVED (moved to Event Board)' : 'REJECTED'}.`);
      fetchData();
    } catch (err) {
      setError('Failed to close voting');
    }
  };

  const validateLogisticsField = (name, value) => {
    let err = '';
    if (!value) {
      err = 'Logistics notes description is required';
    }
    setLogisticsErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleUpdateLogisticsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    setLogisticsTouched({ logisticsText: true });
    if (!validateLogisticsField('logisticsText', logisticsText)) {
      setError('Please enter logistics notes.');
      return;
    }

    setSavingLogistics(true);
    setError('');
    setSuccess('');

    try {
      await API.put(`/voting/events/${selectedEventId}/logistics`, {
        logistics: logisticsText,
        status: eventStatus,
      });
      setSuccess('Event board logistics updated successfully.');
      setSelectedEventId('');
      setLogisticsText('');
      setEventStatus('approved');
      setLogisticsTouched({});
      setLogisticsErrors({});
      fetchData();
    } catch (err) {
      setError('Failed to update event logistics');
    } finally {
      setSavingLogistics(false);
    }
  };

  // Filtered lists
  const filteredPolls = polls.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(pollSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(pollSearch.toLowerCase());
    const matchesStatus = pollStatusFilter ? p.status === pollStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const pollTotal = filteredPolls.length;
  const pollTotalPages = Math.ceil(pollTotal / pollLimit);
  const paginatedPolls = filteredPolls.slice(
    (pollPage - 1) * pollLimit,
    pollPage * pollLimit
  );

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      ev.description?.toLowerCase().includes(eventSearch.toLowerCase()) ||
      ev.category?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesStatus = eventStatusFilter ? ev.status === eventStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const eventTotal = filteredEvents.length;
  const eventTotalPages = Math.ceil(eventTotal / eventLimit);
  const paginatedEvents = filteredEvents.slice(
    (eventPage - 1) * eventLimit,
    eventPage * eventLimit
  );

  if (loading && events.length === 0) return <p className="page-container">Loading voting board...</p>;

  return (
    <div className="page-container">
      <h2>Events Proposal & Polling Dashboard</h2>
      <p className="note">Oversee community event proposals, close active voting sessions, and launch general decision polls.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }} className="events-split-layout">
        {/* Create Poll */}
        <div className="card">
          <h3>Launch General Decision Poll</h3>
          <p className="note">Allow residents to vote yes/no on society policies, maintenance hikes, repainting, etc.</p>
          <form onSubmit={handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }} noValidate>
            
            <div className="modern-form-group">
              <label className="modern-label">Poll Title <span className="required-asterisk">*</span></label>
              <input
                placeholder="e.g. Install CCTV in South block"
                value={pollTitle}
                onChange={(e) => handlePollInputChange('pollTitle', e.target.value)}
                onBlur={() => handlePollInputBlur('pollTitle', pollTitle)}
                required
                className={`modern-input ${pollTouched.pollTitle && pollErrors.pollTitle ? 'is-invalid' : pollTouched.pollTitle && !pollErrors.pollTitle ? 'is-valid' : ''}`}
              />
              {pollTouched.pollTitle && pollErrors.pollTitle && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {pollErrors.pollTitle}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Description <span className="required-asterisk">*</span></label>
              <textarea
                placeholder="Provide notes and details..."
                value={pollDesc}
                onChange={(e) => handlePollInputChange('pollDesc', e.target.value)}
                onBlur={() => handlePollInputBlur('pollDesc', pollDesc)}
                required
                rows="3"
                className={`modern-input ${pollTouched.pollDesc && pollErrors.pollDesc ? 'is-invalid' : pollTouched.pollDesc && !pollErrors.pollDesc ? 'is-valid' : ''}`}
              />
              {pollTouched.pollDesc && pollErrors.pollDesc && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {pollErrors.pollDesc}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Voting Deadline <span className="required-asterisk">*</span></label>
              <input
                type="datetime-local"
                value={pollDeadline}
                onChange={(e) => handlePollInputChange('pollDeadline', e.target.value)}
                onBlur={() => handlePollInputBlur('pollDeadline', pollDeadline)}
                required
                className={`modern-input ${pollTouched.pollDeadline && pollErrors.pollDeadline ? 'is-invalid' : pollTouched.pollDeadline && !pollErrors.pollDeadline ? 'is-valid' : ''}`}
              />
              {pollTouched.pollDeadline && pollErrors.pollDeadline && (
                <span className="modern-error-text" role="alert">
                  <AlertTriangle size={14} /> {pollErrors.pollDeadline}
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={creatingPoll}>
              {creatingPoll ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Launching...
                </span>
              ) : 'Create Poll'}
            </button>
          </form>
        </div>

        {/* Edit Event Logistics */}
        {selectedEventId && (
          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3>Manage Logistics: {events.find((e) => e._id === selectedEventId)?.title}</h3>
            <form onSubmit={handleUpdateLogisticsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }} noValidate>
              
              <div className="modern-form-group">
                <label className="modern-label">Logistics Description <span className="required-asterisk">*</span></label>
                <textarea
                  placeholder="e.g. DJ booked, Catering setup, timings..."
                  value={logisticsText}
                  onChange={(e) => {
                    setLogisticsText(e.target.value);
                    if (logisticsTouched.logisticsText) validateLogisticsField('logisticsText', e.target.value);
                  }}
                  onBlur={() => {
                    setLogisticsTouched((prev) => ({ ...prev, logisticsText: true }));
                    validateLogisticsField('logisticsText', logisticsText);
                  }}
                  required
                  rows="4"
                  className={`modern-input ${logisticsTouched.logisticsText && logisticsErrors.logisticsText ? 'is-invalid' : logisticsTouched.logisticsText && !logisticsErrors.logisticsText ? 'is-valid' : ''}`}
                />
                {logisticsTouched.logisticsText && logisticsErrors.logisticsText && (
                  <span className="modern-error-text" role="alert">
                    <AlertTriangle size={14} /> {logisticsErrors.logisticsText}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Event Status <span className="required-asterisk">*</span></label>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)} className="modern-input">
                  <option value="approved">Approved (Ongoing / Planning)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingLogistics}>
                  {savingLogistics ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save Event Logistics'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedEventId('');
                    setLogisticsText('');
                    setLogisticsErrors({});
                    setLogisticsTouched({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Decision Polls Ledger */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Decision Polls Summary</h3>
        
        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search polls..."
              value={pollSearch}
              onChange={(e) => setPollSearch(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={pollStatusFilter}
              onChange={(e) => setPollStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
            {(pollSearch || pollStatusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setPollSearch('');
                  setPollStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedPolls.length > 0 ? (
          <>
            <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Yes Votes (Flats)</th>
                    <th>No Votes (Flats)</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPolls.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.title}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.description}</span>
                      </td>
                      <td>{p.votesYes.length} ({p.votesYes.join(', ') || 'None'})</td>
                      <td>{p.votesNo.length} ({p.votesNo.join(', ') || 'None'})</td>
                      <td>{new Date(p.deadline).toLocaleString()}</td>
                      <td>
                        <DashboardStatusBadge
                          tone={p.status === 'active' ? 'success' : 'danger'}
                          icon={p.status === 'active' ? CheckCircle2 : Clock}
                        >
                          {p.status.toUpperCase()}
                        </DashboardStatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={pollPage}
              totalPages={pollTotalPages}
              totalItems={pollTotal}
              itemsPerPage={pollLimit}
              onPageChange={setPollPage}
              onItemsPerPageChange={setPollLimit}
            />
          </>
        ) : (
          <EmptyState
            icon={FileText}
            title="No polls found"
            description="Try adjusting your filters or search terms."
            actionText={(pollSearch || pollStatusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setPollSearch('');
              setPollStatusFilter('');
            }}
          />
        )}
      </div>

      {/* Event Proposals & Event Board */}
      <div className="card">
        <h3>Proposed Events & Board</h3>
        <p className="note">Close votes on resident proposals, or manage planning logistics for approved ones.</p>

        {/* Search & Filters */}
        <div className="modern-filter-bar" style={{ marginTop: '16px', marginBottom: '16px' }}>
          <div className="modern-filter-search-wrap">
            <Search className="modern-filter-search-icon" size={16} />
            <input
              type="text"
              className="modern-filter-search-input"
              placeholder="Search event proposals..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
            />
          </div>
          <div className="modern-filter-group">
            <select
              className="modern-filter-select"
              value={eventStatusFilter}
              onChange={(e) => setEventStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="proposed">Proposed</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            {(eventSearch || eventStatusFilter) && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => {
                  setEventSearch('');
                  setEventStatusFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {paginatedEvents.length > 0 ? (
          <>
            <div style={{ display: 'grid', gap: '16px' }}>
              {paginatedEvents.map((ev) => {
                let statusTone = 'neutral';
                let statusIcon = Clock;
                if (ev.status === 'approved') {
                  statusTone = 'success';
                  statusIcon = CheckCircle2;
                } else if (ev.status === 'rejected') {
                  statusTone = 'danger';
                  statusIcon = AlertTriangle;
                } else if (ev.status === 'proposed') {
                  statusTone = 'warning';
                  statusIcon = Clock;
                }

                return (
                  <article
                    key={ev._id}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      background: 'var(--bg-card)',
                      borderLeft: `4px solid ${
                        ev.status === 'approved'
                          ? 'var(--status-success-text)'
                          : ev.status === 'rejected'
                          ? 'var(--status-danger-text)'
                          : ev.status === 'completed'
                          ? 'var(--text-secondary)'
                          : 'var(--status-warning-text)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {ev.title}
                          <span
                            style={{
                              background: 'var(--bg-primary)',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              fontWeight: '600'
                            }}
                          >
                            {ev.category.replace('_', ' ')}
                          </span>
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Proposer: <strong>Flat {ev.proposedBy?.flatNumber || 'Admin'}</strong> ({ev.proposedBy?.name}) | Budget: <strong>₹{ev.budget}</strong> | Fee/Flat: <strong>₹{ev.contributionRequirement}</strong>
                        </p>
                      </div>
                      <div>
                        <DashboardStatusBadge tone={statusTone} icon={statusIcon}>
                          {ev.status.toUpperCase()}
                        </DashboardStatusBadge>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '12px' }}>{ev.description}</p>

                    {/* Vote tallies */}
                    <div style={{ marginTop: '12px', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Vote tallies (Flat Based):</strong> Yes: {ev.votesYes.length} (Flats: {ev.votesYes.join(', ') || 'none'}) | No: {ev.votesNo.length} (Flats: {ev.votesNo.join(', ') || 'none'})
                    </div>

                    {ev.logistics && (
                      <div style={{ marginTop: '12px', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.9rem', borderLeft: '3px solid var(--primary)', color: 'var(--text-primary)' }}>
                        <strong>Admin Planning & Logistics Notes:</strong> <br />
                        {ev.logistics}
                      </div>
                    )}

                    {/* Action panel */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      {ev.status === 'proposed' && (
                        confirmCloseEventId === ev._id ? (
                          <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Close voting?</span>
                            <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                className="inline-confirm-btn-yes"
                                onClick={() => {
                                  handleCloseEventVoting(ev._id);
                                  setConfirmCloseEventId(null);
                                }}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                className="inline-confirm-btn-no"
                                onClick={() => setConfirmCloseEventId(null)}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => setConfirmCloseEventId(ev._id)}
                          >
                            Close Voting & Decide Majority
                          </button>
                        )
                      )}
                      {(ev.status === 'approved' || ev.status === 'completed') && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSelectedEventId(ev._id);
                            setLogisticsText(ev.logistics || '');
                            setEventStatus(ev.status);
                          }}
                        >
                          Update Logistics
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination
              currentPage={eventPage}
              totalPages={eventTotalPages}
              totalItems={eventTotal}
              itemsPerPage={eventLimit}
              onPageChange={setEventPage}
              onItemsPerPageChange={setEventLimit}
            />
          </>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No event proposals found"
            description="Try adjusting your filters or search terms."
            actionText={(eventSearch || eventStatusFilter) ? "Clear Filters" : null}
            onAction={() => {
              setEventSearch('');
              setEventStatusFilter('');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManageEventsPollsPage;
