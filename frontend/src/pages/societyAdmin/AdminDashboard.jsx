import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

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

  const pendingDuesCount = maintenance.filter((r) => r.status === 'pending').length;
  const overdueDuesCount = maintenance.filter((r) => r.status === 'overdue').length;

  if (loading) return <p className="page-container">Loading admin control panel...</p>;

  return (
    <section className="page-container">
      <div className="page-header-row" style={{ background: 'linear-gradient(135deg, #1a3c5e 0%, #1a5276 100%)', padding: '32px', borderRadius: '12px', color: '#fff', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div>
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Society Administrator Panel</h2>
          <p style={{ opacity: 0.9 }}>
            Overview of operations, residents, finances, and governance logs.
          </p>
        </div>
        {wallet && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>SOCIETY WALLET</span>
            <h3 style={{ color: '#fff', fontSize: '2rem', margin: '4px 0 0 0' }}>₹{wallet.balance.toLocaleString()}</h3>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <article className="stat-card">
          <h4>Total Residents</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1a3c5e', marginTop: '8px' }}>
            {residents.filter((r) => r.role === 'resident' && r.status === 'active').length}
          </p>
        </article>
        <article className="stat-card pending">
          <h4>Pending Dues</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b7950b', marginTop: '8px' }}>
            {pendingDuesCount}
          </p>
        </article>
        <article className="stat-card overdue">
          <h4>Overdue Dues</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#c0392b', marginTop: '8px' }}>
            {overdueDuesCount}
          </p>
        </article>
        <article className="stat-card pending" style={{ borderLeftColor: '#9a7d0a' }}>
          <h4>Join Requests</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#9a7d0a', marginTop: '8px' }}>
            {requests.length}
          </p>
        </article>
        <article className="stat-card">
          <h4>Open Complaints</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e86ab', marginTop: '8px' }}>
            {tickets.length}
          </p>
        </article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Actionable alerts (Join Requests & Tickets) */}
        <div>
          {requests.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid #b7950b', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#b7950b' }}>Join Requests Pending Approval ({requests.length})</h3>
                <Link to="/admin/residents" style={{ fontSize: '0.85rem', color: '#b7950b', fontWeight: '600' }}>
                  Process Join Requests →
                </Link>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requests.slice(0, 3).map((r) => (
                  <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#fcfcfc', border: '1px solid #f0f4f8', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.9rem' }}>
                      <strong>{r.name}</strong> ({r.role}) — Flat: {r.flatNumber || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#1a3c5e' }}>Unresolved Support Tickets ({tickets.length})</h3>
              <Link to="/admin/support" style={{ fontSize: '0.85rem', color: '#2e86ab', fontWeight: '600' }}>
                Manage Tickets →
              </Link>
            </div>
            {tickets.length === 0 ? (
              <p className="note">No open support tickets. All complaints resolved!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tickets.slice(0, 3).map((t) => (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #eef6fa', borderRadius: '6px' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#333' }}>{t.title || t.subject}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#777', marginTop: '2px' }}>
                        Flat {t.flatNumber || 'N/A'} | Priority: {t.priority}
                      </span>
                    </div>
                    <span
                      style={{
                        background: t.priority === 'urgent' ? '#fadbd8' : '#eef6fa',
                        color: t.priority === 'urgent' ? '#c0392b' : '#666',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ color: '#1a3c5e' }}>Admin Shortcuts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Link to="/admin/residents" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Residents Whitelist
            </Link>
            <Link to="/admin/finances" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Upload Expenses
            </Link>
            <Link to="/admin/voting" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Events & Polls
            </Link>
            <Link to="/admin/vault" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Document Vault
            </Link>
            <Link to="/admin/penalties" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Issue Fines
            </Link>
            <Link to="/admin/audit-logs" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Audit Logs
            </Link>
            <Link to="/admin/notices" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Post notices
            </Link>
            <Link to="/admin/maintenance" style={{ padding: '14px 10px', background: '#eef6fa', color: '#1a3c5e', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
              Dues Manager
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
