import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { Search, Vote, Calendar } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [pollsPage, setPollsPage] = useState(1);
  const [pollsLimit, setPollsLimit] = useState(5);

  const [proposedPage, setProposedPage] = useState(1);
  const [proposedLimit, setProposedLimit] = useState(5);

  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedLimit, setApprovedLimit] = useState(5);

  useEffect(() => {
    setPollsPage(1);
  }, [searchTerm, typeFilter, pollsLimit]);

  useEffect(() => {
    setProposedPage(1);
  }, [searchTerm, typeFilter, proposedLimit]);

  useEffect(() => {
    setApprovedPage(1);
  }, [searchTerm, typeFilter, approvedLimit]);

  // Filtered lists
  const filteredActivePolls = polls.filter((p) => {
    if (typeFilter === 'event') return false;
    if (p.status !== 'active') return false;
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredProposedEvents = events.filter((e) => {
    if (typeFilter === 'poll') return false;
    if (e.status !== 'proposed') return false;
    const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredApprovedEvents = events.filter((e) => {
    if (typeFilter === 'poll') return false;
    if (e.status !== 'approved' && e.status !== 'completed') return false;
    const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginated lists
  const paginatedActivePolls = filteredActivePolls.slice(
    (pollsPage - 1) * pollsLimit,
    pollsPage * pollsLimit
  );

  const paginatedProposedEvents = filteredProposedEvents.slice(
    (proposedPage - 1) * proposedLimit,
    proposedPage * proposedLimit
  );

  const paginatedApprovedEvents = filteredApprovedEvents.slice(
    (approvedPage - 1) * approvedLimit,
    approvedPage * approvedLimit
  );

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

      {/* Global Filter Bar */}
      <div className="modern-filter-bar" style={{ marginBottom: '24px' }}>
        <div className="modern-filter-search-wrap">
          <Search className="modern-filter-search-icon" size={16} />
          <input
            type="text"
            className="modern-filter-search-input"
            placeholder="Search events or polls by title..."
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
            <option value="all">All Types</option>
            <option value="event">Events Only</option>
            <option value="poll">Polls Only</option>
          </select>
          {(searchTerm || typeFilter !== 'all') && (
            <button
              type="button"
              className="btn btn-secondary modern-filter-btn-clear"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
        {/* Propose Event Form */}
        <div className="card">
          <h3>Propose New Event</h3>
          <form onSubmit={handleProposeEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Event Title</label>
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
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ textTransform: 'capitalize', marginTop: '4px' }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Estimated Budget (₹)</label>
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
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Contrib / Flat (Optional)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  style={{ marginTop: '4px', marginBottom: '0' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Voting Deadline</label>
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
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Description</label>
              <textarea
                placeholder="Give details about your event proposal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="3"
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Submit Event Proposal
            </button>
          </form>
        </div>

        {/* Polling List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Polls */}
          {typeFilter !== 'event' && (
            <div className="card">
              <h3>Active Decision Polls</h3>
              <p className="note">Vote on important society policies.</p>
              {paginatedActivePolls.length === 0 ? (
                <EmptyState
                  icon={Vote}
                  title="No active polls"
                  description="There are no active polls matching your search."
                />
              ) : (
                <>
                  <div style={{ display: 'grid', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
                    {paginatedActivePolls.map((p) => {
                      const hasVoted = p.votesYes.includes(flatNumber) || p.votesNo.includes(flatNumber);
                      return (
                        <article
                          key={p._id}
                          style={{
                            border: '1px solid var(--border)',
                            padding: '16px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--bg-card)',
                          }}
                        >
                          <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>{p.title}</h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{p.description}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '8px', margin: '8px 0 0' }}>
                            Deadline: {new Date(p.deadline).toLocaleString()}
                          </p>
                          {hasVoted ? (
                            <p style={{ marginTop: '12px', color: 'var(--status-success-text)', fontWeight: '600', fontSize: '0.9rem', margin: '12px 0 0' }}>
                              Your flat ({flatNumber}) has already voted on this decision.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                              <button
                                type="button"
                                style={{
                                  background: 'var(--status-success-bg)',
                                  color: 'var(--status-success-text)',
                                  border: '1px solid var(--status-success-border)',
                                  padding: '6px 16px',
                                  borderRadius: 'var(--radius)',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handlePollVote(p._id, 'yes')}
                              >
                                Vote Yes
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: 'var(--status-danger-bg)',
                                  color: 'var(--status-danger-text)',
                                  border: '1px solid var(--status-danger-border)',
                                  padding: '6px 16px',
                                  borderRadius: 'var(--radius)',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
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
                  <Pagination
                    currentPage={pollsPage}
                    totalPages={Math.ceil(filteredActivePolls.length / pollsLimit)}
                    totalItems={filteredActivePolls.length}
                    itemsPerPage={pollsLimit}
                    onPageChange={setPollsPage}
                    onItemsPerPageChange={setPollsLimit}
                  />
                </>
              )}
            </div>
          )}

          {/* Proposed Event List */}
          {typeFilter !== 'poll' && (
            <div className="card">
              <h3>Event Proposals (In Voting)</h3>
              <p className="note">Cast your flat's vote to support proposals.</p>
              {paginatedProposedEvents.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No active event proposals"
                  description="There are no proposed events matching your search."
                />
              ) : (
                <>
                  <div style={{ display: 'grid', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
                    {paginatedProposedEvents.map((ev) => {
                      const hasVoted = ev.votesYes.includes(flatNumber) || ev.votesNo.includes(flatNumber);
                      return (
                        <article
                          key={ev._id}
                          style={{
                            border: '1px solid var(--border)',
                            padding: '16px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--bg-card)',
                          }}
                        >
                          <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>
                            {ev.title}{' '}
                            <span
                              style={{
                                fontSize: '0.75rem',
                                background: 'var(--status-neutral-bg)',
                                color: 'var(--status-neutral-text)',
                                border: '1px solid var(--status-neutral-border)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                marginLeft: '6px',
                              }}
                            >
                              {ev.category}
                            </span>
                          </h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
                            Proposed Budget: <strong>₹{ev.budget}</strong> | Fee / Flat: <strong>₹{ev.contributionRequirement}</strong>
                          </p>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0' }}>{ev.description}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '8px', margin: '8px 0 0' }}>
                            Deadline: {new Date(ev.deadline).toLocaleString()}
                          </p>
                          {hasVoted ? (
                            <p style={{ marginTop: '12px', color: 'var(--status-success-text)', fontWeight: '600', fontSize: '0.9rem', margin: '12px 0 0' }}>
                              Your flat ({flatNumber}) has already voted on this event.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                              <button
                                type="button"
                                style={{
                                  background: 'var(--status-success-bg)',
                                  color: 'var(--status-success-text)',
                                  border: '1px solid var(--status-success-border)',
                                  padding: '6px 16px',
                                  borderRadius: 'var(--radius)',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleEventVote(ev._id, 'yes')}
                              >
                                Support (Yes)
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: 'var(--status-danger-bg)',
                                  color: 'var(--status-danger-text)',
                                  border: '1px solid var(--status-danger-border)',
                                  padding: '6px 16px',
                                  borderRadius: 'var(--radius)',
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
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
                  <Pagination
                    currentPage={proposedPage}
                    totalPages={Math.ceil(filteredProposedEvents.length / proposedLimit)}
                    totalItems={filteredProposedEvents.length}
                    itemsPerPage={proposedLimit}
                    onPageChange={setProposedPage}
                    onItemsPerPageChange={setProposedLimit}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approved Events (Event Board) */}
      {typeFilter !== 'poll' && (
        <div className="card">
          <h3>Society Event Board (Approved Events)</h3>
          <p className="note">View logistics and plan details for upcoming approved events.</p>
          {paginatedApprovedEvents.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No approved events"
              description="There are no approved events on the board."
            />
          ) : (
            <>
              <div style={{ marginTop: '16px', display: 'grid', gap: '16px', marginBottom: '16px' }}>
                {paginatedApprovedEvents.map((ev) => (
                  <article
                    key={ev._id}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '16px',
                      borderRadius: 'var(--radius)',
                      background: 'var(--bg-card)',
                      borderLeft: `4px solid ${ev.status === 'completed' ? 'var(--text-secondary)' : 'var(--status-success-text)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: 0 }}>
                        {ev.title}{' '}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            background: ev.status === 'completed' ? 'var(--status-neutral-bg)' : 'var(--status-success-bg)',
                            color: ev.status === 'completed' ? 'var(--status-neutral-text)' : 'var(--status-success-text)',
                            border: `1px solid ${ev.status === 'completed' ? 'var(--status-neutral-border)' : 'var(--status-success-border)'}`,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            marginLeft: '6px',
                          }}
                        >
                          {ev.category}
                        </span>
                      </h4>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          color: ev.status === 'completed' ? 'var(--text-secondary)' : 'var(--status-success-text)',
                        }}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', margin: '4px 0 0' }}>
                      Budget: <strong>₹{ev.budget}</strong> | Fee / Flat: <strong>₹{ev.contributionRequirement}</strong>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '8px', margin: '8px 0 0' }}>{ev.description}</p>
                    {ev.logistics && (
                      <div
                        style={{
                          marginTop: '12px',
                          background: 'var(--bg-primary)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.9rem',
                          borderLeft: '3px solid var(--primary)',
                          color: 'var(--text-secondary)',
                          margin: '12px 0 0',
                        }}
                      >
                        <strong>Logistics & Planning Notes:</strong> <br />
                        {ev.logistics}
                      </div>
                    )}
                  </article>
                ))}
              </div>
              <Pagination
                currentPage={approvedPage}
                totalPages={Math.ceil(filteredApprovedEvents.length / approvedLimit)}
                totalItems={filteredApprovedEvents.length}
                itemsPerPage={approvedLimit}
                onPageChange={setApprovedPage}
                onItemsPerPageChange={setApprovedLimit}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentEventsPollsPage;
