import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarPlus, FolderLock, Home, ListChecks, MessageSquare, Plus, Ticket, Vote, Wallet, Wrench, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import ActivityFeed from '../../components/common/ActivityFeed';
import {
  DashboardActionGrid,
  DashboardActionLink,
  DashboardCard,
  DashboardCardSkeleton,
  DashboardEmptyState,
  DashboardHeader,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardKpiSkeleton,
  DashboardPage,
  DashboardSection,
  DashboardStatusBadge,
} from '../../components/common/DashboardSections';

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString()}`;

const statusTone = (status) => {
  if (status === 'paid' || status === 'resolved') return 'success';
  if (status === 'overdue' || status === 'urgent') return 'danger';
  if (status === 'pending' || status === 'open' || status === 'in_progress') return 'warning';
  return 'neutral';
};

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Household Family Member States
  const [family, setFamily] = useState([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyForm, setNewFamilyForm] = useState({
    name: '',
    relation: 'spouse',
    phone: '',
    isEmergencyContact: false,
  });
  const [familyErrors, setFamilyErrors] = useState({});
  const [familyTouched, setFamilyTouched] = useState({});
  const [addingFamily, setAddingFamily] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Onboarding state
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    localStorage.getItem(`residio_onboarding_dismissed_${user?._id}`) === 'true'
  );

  // Focus trap ref
  const familyNameInputRef = useRef(null);

  const validateFamilyField = (name, value) => {
    let err = '';
    if (name === 'name' && !value) {
      err = 'Full name is required';
    } else if (name === 'phone' && value) {
      if (!/^\+?[0-9\s-]{10,15}$/.test(value)) {
        err = 'Please enter a valid phone number';
      }
    }
    setFamilyErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const loadFamily = async () => {
    try {
      const res = await API.get('/residents/family');
      setFamily(res.data);
    } catch (err) {
      console.error('Failed to load family members:', err);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setActivitiesLoading(true);
        const [noticesRes, maintenanceRes, walletRes, supportRes, pollsRes, notifsRes] = await Promise.all([
          API.get('/notices'),
          API.get('/maintenance/my'),
          API.get('/finances/wallet').catch(() => ({ data: null })),
          API.get('/support').catch(() => ({ data: [] })),
          API.get('/voting/polls').catch(() => ({ data: [] })),
          API.get('/notifications').catch(() => ({ data: [] })),
        ]);

        setNotices(noticesRes.data.slice(0, 3));
        setMyRecord(maintenanceRes.data[0] || null);
        setWallet(walletRes.data);
        setTickets(supportRes.data.slice(0, 3));
        setPolls(pollsRes.data.filter((p) => p.status === 'active'));

        const mappedActivities = notifsRes.data.slice(0, 5).map((n) => ({
          _id: n._id,
          actor: n.type === 'visitor' ? 'Security Gate' : n.type === 'maintenance' ? 'Billing' : 'Admin',
          action: `${n.title}: ${n.message}`,
          timestamp: n.createdAt,
          status: n.isRead ? 'read' : 'unread',
          priority: n.priority || 'normal'
        }));
        setActivities(mappedActivities);
        setActivitiesLoading(false);

        await loadFamily();
      } catch (err) {
        console.error('Error loading dashboard data', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Modal ESC Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowFamilyModal(false);
        setFamilyErrors({});
        setFamilyTouched({});
      }
    };
    if (showFamilyModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFamilyModal]);

  // Modal Focus Trap
  useEffect(() => {
    if (showFamilyModal) {
      familyNameInputRef.current?.focus();
    }
  }, [showFamilyModal]);

  const handleAddFamily = async (e) => {
    e.preventDefault();
    
    setFamilyTouched({ name: true, phone: true });
    const isNameValid = validateFamilyField('name', newFamilyForm.name);
    const isPhoneValid = validateFamilyField('phone', newFamilyForm.phone);

    if (!isNameValid || !isPhoneValid) {
      toast.error('Please fix validation errors.');
      return;
    }

    setAddingFamily(true);
    try {
      const res = await API.post('/residents/family', newFamilyForm);
      setFamily(res.data);
      setNewFamilyForm({ name: '', relation: 'spouse', phone: '', isEmergencyContact: false });
      setFamilyTouched({});
      setFamilyErrors({});
      setShowFamilyModal(false);
      toast.success('Family member added successfully!');
    } catch (err) {
      console.error('Failed to add family member', err);
      toast.error('Failed to add family member');
    } finally {
      setAddingFamily(false);
    }
  };

  const handleDeleteFamily = async (memberId) => {
    try {
      const res = await API.delete(`/residents/family/${memberId}`);
      setFamily(res.data);
      setConfirmDeleteId(null);
      toast.success('Family member removed.');
    } catch (err) {
      console.error('Failed to delete family member', err);
      toast.error('Failed to remove family member');
    }
  };

  const handleDismissOnboarding = () => {
    setOnboardingDismissed(true);
    localStorage.setItem(`residio_onboarding_dismissed_${user?._id}`, 'true');
  };

  if (loading) {
    return (
      <DashboardPage>
        <div className="page-skeleton">
          <div className="skeleton-box" style={{ height: 110, borderRadius: 'var(--radius)' }} />
          <DashboardKpiSkeleton count={4} />
          <DashboardCardSkeleton rows={4} />
          <DashboardCardSkeleton rows={3} />
        </div>
      </DashboardPage>
    );
  }

  const openTickets = tickets.filter((t) => t.status !== 'resolved');
  const needsPayment = myRecord && myRecord.status !== 'paid';

  // Detect New User Condition
  const showOnboarding =
    !onboardingDismissed &&
    notices.length === 0 &&
    myRecord === null &&
    tickets.length === 0 &&
    polls.length === 0;

  return (
    <DashboardPage>
      <DashboardHeader
        title={`Welcome Home, ${user?.name || 'Resident'}`}
        subtitle={`Flat ${user?.flatNumber || 'N/A'} | Society Resident Portal`}
        summary={
          wallet && (
            <div className="dashboard-header-summary">
              <span>Society Wallet</span>
              <strong>{formatCurrency(wallet.balance)}</strong>
            </div>
          )
        }
      />

      {/* Onboarding Empty State Banner */}
      {showOnboarding && (
        <div
          className="onboarding-card"
          style={{
            background: 'rgba(var(--primary-rgb), 0.08)',
            border: '1px solid rgba(var(--primary-rgb), 0.15)',
            padding: '20px',
            borderRadius: 'var(--radius)',
            position: 'relative',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            className="onboarding-dismiss-btn"
            onClick={handleDismissOnboarding}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            aria-label="Dismiss onboarding"
          >
            <X size={18} />
          </button>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: '800' }}>
            Welcome to Residio, {user?.name}!
          </h3>
          <p className="note" style={{ margin: '8px 0 16px 0', color: 'var(--text-secondary)' }}>
            Your society portal is set up. Here's how to get started:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/notices" className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: '700', padding: '8px 16px' }}>
              View Society Notices →
            </Link>
            <Link to="/visitors/pre-approve" className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: '700', padding: '8px 16px' }}>
              Log a Visitor →
            </Link>
            <Link to="/bookings" className="btn btn-secondary" style={{ fontSize: '0.85rem', fontWeight: '700', padding: '8px 16px' }}>
              Book a Facility →
            </Link>
          </div>
        </div>
      )}

      <DashboardKpiGrid>
        <DashboardKpiCard
          icon={Wallet}
          label="Wallet Balance"
          value={wallet ? formatCurrency(wallet.balance) : 'Unavailable'}
          helper="Resident society wallet"
        />
        <DashboardKpiCard
          icon={Wrench}
          label="Maintenance"
          value={myRecord ? formatCurrency(myRecord.amount) : 'No Record'}
          helper={myRecord ? `${myRecord.month}/${myRecord.year} - ${myRecord.status}` : 'No maintenance logged'}
          tone={statusTone(myRecord?.status)}
        />
        <DashboardKpiCard
          icon={Vote}
          label="Active Polls"
          value={polls.length}
          helper="Community decisions awaiting votes"
          tone={polls.length ? 'warning' : 'default'}
        />
        <DashboardKpiCard
          icon={Ticket}
          label="Support Tickets"
          value={openTickets.length}
          helper="Open or in-progress requests"
          tone={openTickets.length ? 'warning' : 'default'}
        />
      </DashboardKpiGrid>

      <DashboardSection
        title="Urgent Work"
        description="Items that may need your action today."
        icon={ListChecks}
        priority="urgent"
      >
        <div className="dashboard-card-grid">
          {needsPayment && (
            <DashboardCard emphasis="urgent">
              <h4>Maintenance payment due</h4>
              <p>
                Billing cycle {myRecord.month}/{myRecord.year} has an outstanding amount of{' '}
                <strong>{formatCurrency(myRecord.amount)}</strong>.
              </p>
              <div className="dashboard-inline-actions">
                <DashboardStatusBadge tone={statusTone(myRecord.status)} icon={Wrench}>{myRecord.status}</DashboardStatusBadge>
                <Link to="/maintenance/my" className="dashboard-link">View Statement -&gt;</Link>
              </div>
            </DashboardCard>
          )}

          {polls.slice(0, 2).map((poll) => (
            <DashboardCard key={poll._id} emphasis="urgent">
              <h4>{poll.title}</h4>
              <p>Deadline: {new Date(poll.deadline).toLocaleDateString()}</p>
              <div className="dashboard-inline-actions">
                <DashboardStatusBadge tone="warning" icon={Vote}>Vote Needed</DashboardStatusBadge>
                <Link to="/voting" className="dashboard-link">Cast Vote -&gt;</Link>
              </div>
            </DashboardCard>
          ))}

          {openTickets.slice(0, 2).map((ticket) => (
            <DashboardCard key={ticket._id} emphasis="urgent">
              <h4>{ticket.title || ticket.subject}</h4>
              <p>Track the latest response from society administration.</p>
              <div className="dashboard-inline-actions">
                <DashboardStatusBadge tone={statusTone(ticket.status)} icon={Ticket}>{ticket.status}</DashboardStatusBadge>
                <Link to="/support/my" className="dashboard-link">Track Ticket -&gt;</Link>
              </div>
            </DashboardCard>
          ))}

          {!needsPayment && polls.length === 0 && openTickets.length === 0 && (
            <DashboardEmptyState
              title="No urgent resident actions"
              message="Maintenance, voting, and support queues are clear."
            />
          )}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Latest society updates and resident support movement."
        icon={MessageSquare}
      >
        <div className="dashboard-two-column">
          <DashboardCard>
            <h4>Personal Activity Feed</h4>
            <ActivityFeed
              activities={activities}
              loading={activitiesLoading}
              emptyTitle="No recent activities"
              emptyMessage="Announcements, visitor gate check-ins, and complaint updates will be logged here."
            />
          </DashboardCard>

          <DashboardCard>
            <h4>Recent Notices</h4>
            {notices.length === 0 ? (
              <DashboardEmptyState title="No notices posted" message="New announcements will appear here." />
            ) : (
              <ul className="dashboard-list">
                {notices.map((notice) => (
                  <li key={notice._id} className="dashboard-list-item">
                    <div>
                      <strong>{notice.title}</strong>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Quick Actions"
        description="Common resident tasks."
        icon={Plus}
        priority="tertiary"
      >
        <DashboardActionGrid>
          <DashboardActionLink to="/visitors" icon={BookOpen} title="Log Visitor" description="Review gate entries" />
          <DashboardActionLink to="/visitors/pre-approve" icon={Plus} title="Pre-Approve Guest" description="Notify gate staff" />
          <DashboardActionLink to="/bookings" icon={CalendarPlus} title="Book Facility" description="Reserve shared spaces" />
          <DashboardActionLink to="/vault" icon={FolderLock} title="Bylaws Vault" description="Open resident documents" />
        </DashboardActionGrid>
      </DashboardSection>

      <DashboardSection
        title="Your Household"
        description="Registered family members and emergency contacts."
        icon={Home}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowFamilyModal(true)}>
            + Add Family Member
          </button>
        }
      >
        {family.length > 0 ? (
          <div className="dashboard-card-grid">
            {family.map((member) => (
              <DashboardCard key={member._id}>
                <h4>{member.name}</h4>
                <p>Relation: {member.relation}</p>
                <p>Phone: {member.phone || 'N/A'}</p>
                <div className="dashboard-inline-actions">
                  {member.isEmergencyContact && (
                    <DashboardStatusBadge tone="danger" icon={Home}>Emergency Contact</DashboardStatusBadge>
                  )}
                  {confirmDeleteId === member._id ? (
                    <div className="inline-confirm">
                      <span className="inline-confirm-label">Remove {member.name}?</span>
                      <div className="inline-confirm-actions">
                        <button
                          type="button"
                          className="inline-confirm-btn-yes"
                          onClick={() => handleDeleteFamily(member._id)}
                        >
                          Yes, Remove
                        </button>
                        <button
                          type="button"
                          className="inline-confirm-btn-no"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setConfirmDeleteId(member._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            title="No family members registered"
            message="Add household contacts to support emergency and gated approvals."
          />
        )}
      </DashboardSection>

      {showFamilyModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Family Member</h3>
              <button type="button" className="modal-close" onClick={() => { setShowFamilyModal(false); setFamilyErrors({}); setFamilyTouched({}); }} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddFamily} noValidate>
              <div className="modern-form-group">
                <label className="modern-label">Full Name <span className="required-asterisk">*</span></label>
                <input
                  type="text"
                  ref={familyNameInputRef}
                  placeholder="e.g. Sunita Sharma"
                  value={newFamilyForm.name}
                  onChange={(e) => {
                    setNewFamilyForm({ ...newFamilyForm, name: e.target.value });
                    if (familyTouched.name) validateFamilyField('name', e.target.value);
                  }}
                  onBlur={() => {
                    setFamilyTouched((prev) => ({ ...prev, name: true }));
                    validateFamilyField('name', newFamilyForm.name);
                  }}
                  required
                  className={`modern-input ${familyTouched.name && familyErrors.name ? 'is-invalid' : familyTouched.name && !familyErrors.name ? 'is-valid' : ''}`}
                />
                {familyTouched.name && familyErrors.name && (
                  <span className="modern-error-text" role="alert">
                    {familyErrors.name}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Relation <span className="required-asterisk">*</span></label>
                <select
                  value={newFamilyForm.relation}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, relation: e.target.value })}
                  className="modern-input"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="elderly">Elderly Parent</option>
                  <option value="tenant">Tenant</option>
                  <option value="dependent">Other Dependent</option>
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={newFamilyForm.phone}
                  onChange={(e) => {
                    setNewFamilyForm({ ...newFamilyForm, phone: e.target.value });
                    if (familyTouched.phone) validateFamilyField('phone', e.target.value);
                  }}
                  onBlur={() => {
                    setFamilyTouched((prev) => ({ ...prev, phone: true }));
                    validateFamilyField('phone', newFamilyForm.phone);
                  }}
                  className={`modern-input ${familyTouched.phone && familyErrors.phone ? 'is-invalid' : familyTouched.phone && !familyErrors.phone ? 'is-valid' : ''}`}
                />
                {familyTouched.phone && familyErrors.phone && (
                  <span className="modern-error-text" role="alert">
                    {familyErrors.phone}
                  </span>
                )}
              </div>

              <div className="modern-checkbox-group" style={{ margin: '16px 0' }}>
                <input
                  id="emergency"
                  type="checkbox"
                  checked={newFamilyForm.isEmergencyContact}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, isEmergencyContact: e.target.checked })}
                  className="modern-checkbox-input"
                />
                <label htmlFor="emergency" style={{ cursor: 'pointer' }}>Mark as Emergency Contact</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowFamilyModal(false); setFamilyErrors({}); setFamilyTouched({}); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addingFamily} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {addingFamily ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </>
                  ) : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardPage>
  );
};

export default ResidentDashboard;
