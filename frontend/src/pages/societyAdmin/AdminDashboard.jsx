import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Coins,
  FileText,
  FolderLock,
  ListChecks,
  MessageSquare,
  Plus,
  Siren,
  Ticket,
  Users,
  Vote,
  Wallet,
  Wrench,
} from 'lucide-react';
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

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [usersRes, noticesRes, maintenanceRes, walletRes, requestsRes, ticketsRes] = await Promise.all([
          API.get('/users/society'),
          API.get('/notices'),
          API.get('/maintenance'),
          API.get('/finances/wallet').catch(() => ({ data: null })),
          API.get('/residents/requests').catch(() => ({ data: [] })),
          API.get('/support').catch(() => ({ data: [] })),
        ]);
        setResidents(usersRes.data);
        setNotices(noticesRes.data);
        setMaintenance(maintenanceRes.data);
        setWallet(walletRes.data);
        setRequests(requestsRes.data);
        setTickets(ticketsRes.data.filter((t) => t.status === 'open' || t.status === 'in_progress'));
      } catch (err) {
        console.error('Error loading dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <p className="page-container">Loading admin control panel...</p>;

  const activeResidents = residents.filter((r) => r.role === 'resident' && r.status === 'active').length;
  const pendingDuesCount = maintenance.filter((r) => r.status === 'pending').length;
  const overdueDuesCount = maintenance.filter((r) => r.status === 'overdue').length;
  const openWorkCount = requests.length + tickets.length + overdueDuesCount;
  const recentMaintenance = maintenance.slice(0, 3);
  const recentNotices = notices.slice(0, 3);

  return (
    <DashboardPage>
      <DashboardHeader
        title="Society Administrator Panel"
        subtitle="Overview of operations, residents, finances, and governance logs."
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
        <DashboardKpiCard icon={Users} label="Active Residents" value={activeResidents} helper="Approved resident users" />
        <DashboardKpiCard icon={Wrench} label="Pending Dues" value={pendingDuesCount} helper="Maintenance records" tone={pendingDuesCount ? 'warning' : 'default'} />
        <DashboardKpiCard icon={Siren} label="Overdue Dues" value={overdueDuesCount} helper="Needs follow-up" tone={overdueDuesCount ? 'danger' : 'default'} />
        <DashboardKpiCard icon={Users} label="Join Requests" value={requests.length} helper="Pending approvals" tone={requests.length ? 'warning' : 'default'} />
        <DashboardKpiCard icon={Ticket} label="Open Complaints" value={tickets.length} helper="Unresolved support" tone={tickets.length ? 'warning' : 'default'} />
        <DashboardKpiCard icon={Wallet} label="Wallet" value={wallet ? formatCurrency(wallet.balance) : 'Unavailable'} helper="Society balance" />
      </DashboardKpiGrid>

      <DashboardSection
        title="Urgent Work"
        description={`${openWorkCount} operational item${openWorkCount === 1 ? '' : 's'} need attention.`}
        icon={ListChecks}
        priority="urgent"
      >
        <div className="dashboard-two-column">
          <DashboardCard emphasis={requests.length ? 'urgent' : 'normal'}>
            <h4>Join Requests Pending Approval</h4>
            {requests.length === 0 ? (
              <DashboardEmptyState title="No join requests" message="Resident approval queue is clear." />
            ) : (
              <ul className="dashboard-list">
                {requests.slice(0, 3).map((request) => (
                  <li key={request._id} className="dashboard-list-item">
                    <div>
                      <strong>{request.name}</strong>
                      <span>{request.role} | Flat {request.flatNumber || 'N/A'}</span>
                    </div>
                    <Link to="/admin/residents" className="dashboard-link">Process -&gt;</Link>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard emphasis={tickets.length ? 'urgent' : 'normal'}>
            <h4>Unresolved Support Tickets</h4>
            {tickets.length === 0 ? (
              <DashboardEmptyState title="No unresolved tickets" message="All visible complaints are resolved." />
            ) : (
              <ul className="dashboard-list">
                {tickets.slice(0, 3).map((ticket) => (
                  <li key={ticket._id} className="dashboard-list-item">
                    <div>
                      <strong>{ticket.title || ticket.subject}</strong>
                      <span>Flat {ticket.flatNumber || 'N/A'} | Priority: {ticket.priority}</span>
                    </div>
                    <DashboardStatusBadge tone={statusTone(ticket.priority || ticket.status)} icon={Ticket}>{ticket.status}</DashboardStatusBadge>
                  </li>
                ))}
              </ul>
            )}
            {tickets.length > 0 && (
              <div className="dashboard-inline-actions">
                <Link to="/admin/support" className="dashboard-link">Manage Tickets -&gt;</Link>
              </div>
            )}
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Recent Activity"
        description="Latest notices and maintenance records."
        icon={MessageSquare}
      >
        <div className="dashboard-two-column">
          <DashboardCard>
            <h4>Recent Notices</h4>
            {recentNotices.length === 0 ? (
              <DashboardEmptyState title="No notices posted" message="Published notices will appear here." />
            ) : (
              <ul className="dashboard-list">
                {recentNotices.map((notice) => (
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
            <h4>Maintenance Snapshot</h4>
            {recentMaintenance.length === 0 ? (
              <DashboardEmptyState title="No maintenance records" message="Uploaded dues will appear here." />
            ) : (
              <ul className="dashboard-list">
                {recentMaintenance.map((record) => (
                  <li key={record._id} className="dashboard-list-item">
                    <div>
                      <strong>{formatCurrency(record.amount)}</strong>
                      <span>Flat {record.flatNumber || 'N/A'} | {record.month}/{record.year}</span>
                    </div>
                    <DashboardStatusBadge tone={statusTone(record.status)} icon={Wrench}>{record.status}</DashboardStatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Quick Actions"
        description="High-frequency society administration tools."
        icon={Plus}
        priority="tertiary"
      >
        <DashboardActionGrid>
          <DashboardActionLink to="/admin/residents" icon={Users} title="Residents" description="Approve and manage users" />
          <DashboardActionLink to="/admin/finances" icon={Coins} title="Finances" description="Wallet and expenses" />
          <DashboardActionLink to="/admin/voting" icon={Vote} title="Events & Polls" description="Community decisions" />
          <DashboardActionLink to="/admin/vault" icon={FolderLock} title="Document Vault" description="Society documents" />
          <DashboardActionLink to="/admin/penalties" icon={Siren} title="Issue Fines" description="Penalties ledger" />
          <DashboardActionLink to="/admin/audit-logs" icon={FileText} title="Audit Logs" description="Governance trail" />
          <DashboardActionLink to="/admin/notices" icon={Bell} title="Post Notices" description="Resident announcements" />
          <DashboardActionLink to="/admin/maintenance" icon={Wrench} title="Dues Manager" description="Maintenance billing" />
        </DashboardActionGrid>
      </DashboardSection>

      <DashboardSection
        title="Secondary Content"
        description="Operational summary for the current society."
        icon={BarChart3}
      >
        <div className="dashboard-card-grid">
          <DashboardCard>
            <h4>Resident Base</h4>
            <p>{activeResidents} active resident accounts are currently available for society workflows.</p>
          </DashboardCard>
          <DashboardCard>
            <h4>Financial Follow-up</h4>
            <p>{pendingDuesCount + overdueDuesCount} dues records are pending or overdue.</p>
          </DashboardCard>
          <DashboardCard>
            <h4>Support Load</h4>
            <p>{tickets.length} complaint{tickets.length === 1 ? '' : 's'} remain open or in progress.</p>
          </DashboardCard>
        </div>
      </DashboardSection>
    </DashboardPage>
  );
};

export default AdminDashboard;
