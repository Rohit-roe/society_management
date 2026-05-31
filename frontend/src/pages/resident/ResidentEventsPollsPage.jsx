import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const CATEGORIES = ['festival', 'sports_day', 'society_dinner', 'cultural_event', 'custom'];

const ResidentEventsPollsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('custom');
  const [budget, setBudget] = useState('');
  const [contribution, setContribution] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

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

  const handleProposeEvent = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !budget || !deadline) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/voting/events', {
        title,
        description,
        category,
        budget: Number(budget),
        contributionRequirement: Number(contribution) || 0,
        deadline,
      });

      setSuccess('Event proposed successfully! Voting is now open.');
      setTitle('');
      setCategory('custom');
      setBudget('');
      setContribution('');
      setDeadline('');
      setDescription('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to propose event');
      setLoading(false);
    }
  };

  const handleEventVote = async (id, voteType) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/voting/events/${id}/vote`, { vote: voteType });
      setSuccess('Your vote has been recorded.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vote');
    }
  };

  const handlePollVote = async (id, voteType) => {
    try {
      setError('');
      setSuccess('');
      const res = await API.post(`/voting/polls/${id}/vote`, { vote: voteType });
      setSuccess('Your vote has been recorded.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vote');
    }
  };

  if (loading && events.length === 0) return <p className="page-container">Loading voting board...</p>;

  const flatNumber = user?.flatNumber || '';

  return (
    <div className="page-container">
      <h2>Events Board & Decision Polls</h2>
      <p className="note">Propose events, vote on community decisions, and track approved event logistics. (Voting is 1 vote per flat).</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Propose Event Form */}
        <div className="card">
          <h3>Propose New Event</h3>
          <form onSubmit={handleProposeEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Event Title</label>
              <input
                placeholder="e.g. Diwali Celebration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <div className="form-row" style={{ marginBottom: '0' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ textTransform: 'capitalize', marginTop: '4px' }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Estimated Budget (₹)</label>
                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: '0' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Contrib / Flat (Optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Voting Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Description</label>
              <textarea
                placeholder="Give details about your event proposal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <button type="submit">Submit Event Proposal</button>
          </form>
        </div>

        {/* Polling List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Polls */}
          <div className="card">
            <h3>Active Decision Polls</h3>
            <p className="note">Vote on important society policies.</p>
            {polls.filter((p) => p.status === 'active').length === 0 ? (
              <p className="note">No active polls at this time.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
                {polls.filter((p) => p.status === 'active').map((p) => {
                  const hasVoted = p.votesYes.includes(flatNumber) || p.votesNo.includes(flatNumber);
                  return (
                    <article key={p._id} style={{ border: '1px solid #eef6fa', padding: '16px', borderRadius: '8px', background: '#fff' }}>
                      <h4 style={{ color: '#1a3c5e' }}>{p.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '6px' }}>{p.description}</p>
                      <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '8px' }}>
                        Deadline: {new Date(p.deadline).toLocaleString()}
                      </p>
                      {hasVoted ? (
                        <p style={{ marginTop: '12px', color: '#1e7a4a', fontWeight: '600', fontSize: '0.9rem' }}>
                          Your flat ({flatNumber}) has already voted on this decision.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <button
                            type="button"
                            style={{ background: '#1e7a4a', padding: '6px 16px', fontSize: '0.85rem' }}
                            onClick={() => handlePollVote(p._id, 'yes')}
                          >
                            Vote Yes
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                            onClick={() => handlePollVote(p._id, 'no')}
                          >
                            Vote No
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Proposed Event List */}
          <div className="card">
            <h3>Event Proposals (In Voting)</h3>
            <p className="note">Cast your flat's vote to support proposals.</p>
            {events.filter((e) => e.status === 'proposed').length === 0 ? (
              <p className="note">No active event proposals awaiting votes.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
                {events.filter((e) => e.status === 'proposed').map((ev) => {
                  const hasVoted = ev.votesYes.includes(flatNumber) || ev.votesNo.includes(flatNumber);
                  return (
                    <article key={ev._id} style={{ border: '1px solid #eef6fa', padding: '16px', borderRadius: '8px', background: '#fff' }}>
                      <h4 style={{ color: '#1a3c5e' }}>
                        {ev.title}{' '}
                        <span style={{ fontSize: '0.75rem', background: '#eef6fa', color: '#2e86ab', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', marginLeft: '6px' }}>
                          {ev.category}
                        </span>
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>
                        Proposed Budget: <strong>₹{ev.budget}</strong> | Fee / Flat: <strong>₹{ev.contributionRequirement}</strong>
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '8px' }}>{ev.description}</p>
                      <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '8px' }}>
                        Deadline: {new Date(ev.deadline).toLocaleString()}
                      </p>
                      {hasVoted ? (
                        <p style={{ marginTop: '12px', color: '#1e7a4a', fontWeight: '600', fontSize: '0.9rem' }}>
                          Your flat ({flatNumber}) has already voted on this event.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <button
                            type="button"
                            style={{ background: '#1e7a4a', padding: '6px 16px', fontSize: '0.85rem' }}
                            onClick={() => handleEventVote(ev._id, 'yes')}
                          >
                            Support (Yes)
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                            onClick={() => handleEventVote(ev._id, 'no')}
                          >
                            Object (No)
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approved Events (Event Board) */}
      <div className="card">
        <h3>Society Event Board (Approved Events)</h3>
        <p className="note">View logistics and plan details for upcoming approved events.</p>
        <div style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
          {events.filter((e) => e.status === 'approved' || e.status === 'completed').length === 0 ? (
            <p className="note">No approved events on the board.</p>
          ) : (
            events.filter((e) => e.status === 'approved' || e.status === 'completed').map((ev) => (
              <article key={ev._id} style={{ border: '1px solid #d5f5e3', padding: '16px', borderRadius: '8px', background: '#fff', borderLeft: `4px solid ${ev.status === 'completed' ? '#777' : '#1e7a4a'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ color: '#1a3c5e' }}>
                    {ev.title}{' '}
                    <span style={{ fontSize: '0.75rem', background: '#d5f5e3', color: '#1e7a4a', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', marginLeft: '6px' }}>
                      {ev.category}
                    </span>
                  </h4>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: ev.status === 'completed' ? '#777' : '#1e7a4a' }}>
                    {ev.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '4px' }}>
                  Budget: <strong>₹{ev.budget}</strong> | Fee / Flat: <strong>₹{ev.contributionRequirement}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '8px' }}>{ev.description}</p>
                {ev.logistics && (
                  <div style={{ marginTop: '12px', background: '#eaf2f8', padding: '10px 14px', borderRadius: '4px', fontSize: '0.9rem', borderLeft: '3px solid #2e86ab' }}>
                    <strong>Logistics & Planning Notes:</strong> <br />
                    {ev.logistics}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentEventsPollsPage;
