import { useState, useEffect } from 'react';
import API from '../../api/axios';

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

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollTitle || !pollDesc || !pollDeadline) {
      setError('Please fill in all poll fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create poll');
      setLoading(false);
    }
  };

  const handleCloseEventVoting = async (id) => {
    if (!window.confirm('Close voting and compute majority decision for this event proposal?')) return;
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

  const handleUpdateLogisticsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;

    setLoading(true);
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
      fetchData();
    } catch (err) {
      setError('Failed to update event logistics');
      setLoading(false);
    }
  };

  if (loading && events.length === 0) return <p className="page-container">Loading voting board...</p>;

  return (
    <div className="page-container">
      <h2>Events Proposal & Polling Dashboard</h2>
      <p className="note">Oversee community event proposals, close active voting sessions, and launch general decision polls.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Create Poll */}
        <div className="card">
          <h3>Launch General Decision Poll</h3>
          <p className="note">Allow residents to vote yes/no on society policies, maintenance hikes, repainting, etc.</p>
          <form onSubmit={handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Poll Title</label>
              <input
                placeholder="e.g. Install CCTV in South block"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                required
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Description</label>
              <textarea
                placeholder="Provide notes and details..."
                value={pollDesc}
                onChange={(e) => setPollDesc(e.target.value)}
                required
                rows="3"
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Voting Deadline</label>
              <input
                type="datetime-local"
                value={pollDeadline}
                onChange={(e) => setPollDeadline(e.target.value)}
                required
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <button type="submit">Create Poll</button>
          </form>
        </div>

        {/* Edit Event Logistics */}
        {selectedEventId && (
          <div className="card" style={{ borderLeft: '4px solid #1e7a4a' }}>
            <h3>Manage Logistics: {events.find((e) => e._id === selectedEventId)?.title}</h3>
            <form onSubmit={handleUpdateLogisticsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Logistics Description</label>
                <textarea
                  placeholder="e.g. DJ booked, Catering setup, timings..."
                  value={logisticsText}
                  onChange={(e) => setLogisticsText(e.target.value)}
                  required
                  rows="4"
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Event Status</label>
                <select value={eventStatus} onChange={(e) => setEventStatus(e.target.value)}>
                  <option value="approved">Approved (Ongoing / Planning)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ flex: 1 }}>Save Event Logistics</button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventId('');
                    setLogisticsText('');
                  }}
                  style={{ background: '#777', color: '#fff' }}
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
        <div style={{ marginTop: '16px' }}>
          {polls.length === 0 ? (
            <p className="note">No decision polls launched yet.</p>
          ) : (
            <table className="data-table">
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
                {polls.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.title}</strong> <br />
                      <span style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</span>
                    </td>
                    <td>{p.votesYes.length} ({p.votesYes.join(', ') || 'None'})</td>
                    <td>{p.votesNo.length} ({p.votesNo.join(', ') || 'None'})</td>
                    <td>{new Date(p.deadline).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${p.status === 'active' ? '' : 'urgent'}`}
                        style={{
                          background: p.status === 'active' ? '#d5f5e3' : '#fadbd8',
                          color: p.status === 'active' ? '#1e7a4a' : '#c0392b',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Event Proposals & Event Board */}
      <div className="card">
        <h3>Proposed Events & Board</h3>
        <p className="note">Close votes on resident proposals, or manage planning logistics for approved ones.</p>
        <div style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
          {events.length === 0 ? (
            <p className="note">No event proposals registered.</p>
          ) : (
            events.map((ev) => (
              <article
                key={ev._id}
                style={{
                  border: '1px solid #eef6fa',
                  borderRadius: '8px',
                  padding: '16px',
                  background: '#fff',
                  borderLeft: `4px solid ${
                    ev.status === 'approved'
                      ? '#1e7a4a'
                      : ev.status === 'rejected'
                      ? '#c0392b'
                      : ev.status === 'completed'
                      ? '#777'
                      : '#9a7d0a'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ color: '#1a3c5e', fontSize: '1.1rem' }}>
                      {ev.title}{' '}
                      <span
                        style={{
                          background: '#eef6fa',
                          color: '#2e86ab',
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {ev.category}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>
                      Proposer: <strong>Flat {ev.proposedBy?.flatNumber || 'Admin'}</strong> ({ev.proposedBy?.name}) | Budget: <strong>₹{ev.budget}</strong> | Fee/Flat: <strong>₹{ev.contributionRequirement}</strong>
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        background:
                          ev.status === 'proposed'
                            ? '#fef9e7'
                            : ev.status === 'approved'
                            ? '#d5f5e3'
                            : ev.status === 'completed'
                            ? '#eef6fa'
                            : '#fadbd8',
                        color:
                          ev.status === 'proposed'
                            ? '#b7950b'
                            : ev.status === 'approved'
                            ? '#1e7a4a'
                            : ev.status === 'completed'
                            ? '#444'
                            : '#c0392b',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                      }}
                    >
                      {ev.status}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '12px' }}>{ev.description}</p>

                {/* Vote tallies */}
                <div style={{ marginTop: '12px', background: '#f5fbff', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', color: '#555' }}>
                  <strong>Vote tallies (Flat Based):</strong> Yes: {ev.votesYes.length} (Flats: {ev.votesYes.join(', ') || 'none'}) | No: {ev.votesNo.length} (Flats: {ev.votesNo.join(', ') || 'none'})
                </div>

                {ev.logistics && (
                  <div style={{ marginTop: '12px', background: '#eaf2f8', padding: '10px 14px', borderRadius: '4px', fontSize: '0.9rem', borderLeft: '3px solid #2e86ab' }}>
                    <strong>Admin Planning & Logistics Notes:</strong> <br />
                    {ev.logistics}
                  </div>
                )}

                {/* Action panel */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {ev.status === 'proposed' && (
                    <button
                      type="button"
                      style={{ background: '#9a7d0a', padding: '6px 12px', fontSize: '0.85rem' }}
                      onClick={() => handleCloseEventVoting(ev._id)}
                    >
                      Close Voting & Decide Majority
                    </button>
                  )}
                  {(ev.status === 'approved' || ev.status === 'completed') && (
                    <button
                      type="button"
                      style={{ background: '#2e86ab', padding: '6px 12px', fontSize: '0.85rem' }}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageEventsPollsPage;
