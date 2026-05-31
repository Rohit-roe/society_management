import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarPlus, FolderLock, Home, ListChecks, MessageSquare, Plus, Ticket, Vote, Wallet, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import {
  DashboardActionGrid,
  DashboardActionLink,
  DashboardCard,
  DashboardEmptyState,
  DashboardHeader,
  DashboardKpiCard,
  DashboardKpiGrid,
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
  const [loading, setLoading] = useState(true);

  const [family, setFamily] = useState([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyForm, setNewFamilyForm] = useState({
    name: '',
    relation: 'spouse',
    phone: '',
    isEmergencyContact: false,
  });

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
        const [noticesRes, maintenanceRes, walletRes, supportRes, pollsRes] = await Promise.all([
          API.get('/notices'),
          API.get('/maintenance/my'),
          API.get('/finances/wallet').catch(() => ({ data: null })),
          API.get('/support').catch(() => ({ data: [] })),
          API.get('/voting/polls').catch(() => ({ data: [] })),
        ]);

        setNotices(noticesRes.data.slice(0, 3));
        setMyRecord(maintenanceRes.data[0] || null);
        setWallet(walletRes.data);
        setTickets(supportRes.data.slice(0, 3));
        setPolls(pollsRes.data.filter((p) => p.status === 'active'));
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

  const handleAddFamily = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/residents/family', newFamilyForm);
      setFamily(res.data);
      setNewFamilyForm({ name: '', relation: 'spouse', phone: '', isEmergencyContact: false });
      setShowFamilyModal(false);
      toast.success('Family member added successfully!');
    } catch (err) {
      console.error('Failed to add family member', err);
      toast.error('Failed to add family member');
    }
  };

  const handleDeleteFamily = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    try {
      const res = await API.delete(`/residents/family/${memberId}`);
      setFamily(res.data);
      toast.success('Family member removed.');
    } catch (err) {
      console.error('Failed to delete family member', err);
      toast.error('Failed to remove family member');
    }
  };

  if (loading) {
    return <p className="page-container">Loading your dashboard...</p>;
  }

  const openTickets = tickets.filter((t) => t.status !== 'resolved');
  const needsPayment = myRecord && myRecord.status !== 'paid';

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

          <DashboardCard>
            <h4>Support Complaints</h4>
            {tickets.length === 0 ? (
              <DashboardEmptyState title="No active complaints" message="Filed tickets and responses will appear here." />
            ) : (
              <ul className="dashboard-list">
                {tickets.map((ticket) => (
                  <li key={ticket._id} className="dashboard-list-item">
                    <div>
                      <strong>{ticket.title || ticket.subject}</strong>
                      <span>Support request</span>
                    </div>
                    <DashboardStatusBadge tone={statusTone(ticket.status)} icon={Ticket}>{ticket.status}</DashboardStatusBadge>
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
        title="Secondary Content"
        description="Household registry and emergency contacts."
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
                  <button type="button" className="btn btn-danger" onClick={() => handleDeleteFamily(member._id)}>
                    Remove
                  </button>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Family Member</h3>
              <button type="button" className="modal-close" onClick={() => setShowFamilyModal(false)}>
                x
              </button>
            </div>
            <form onSubmit={handleAddFamily}>
              <div>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma"
                  value={newFamilyForm.name}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label>Relation</label>
                <select
                  value={newFamilyForm.relation}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, relation: e.target.value })}
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="elderly">Elderly Parent</option>
                  <option value="tenant">Tenant</option>
                  <option value="dependent">Other Dependent</option>
                </select>
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={newFamilyForm.phone}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, phone: e.target.value })}
                />
              </div>

              <div className="dashboard-inline-actions">
                <input
                  id="emergency"
                  type="checkbox"
                  checked={newFamilyForm.isEmergencyContact}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, isEmergencyContact: e.target.checked })}
                />
                <label htmlFor="emergency">Mark as Emergency Contact</label>
              </div>

              <div className="dashboard-inline-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowFamilyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Member
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
