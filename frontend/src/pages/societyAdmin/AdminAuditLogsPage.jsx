import { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/residents/audit-logs')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      (log.performedBy?.name && log.performedBy.name.toLowerCase().includes(term))
    );
  });

  if (loading) return <p className="page-container">Loading society audit logs...</p>;

  return (
    <section className="page-container">
      <h2>Society Audit Trail</h2>
      <p className="note">Searchable logging history of administrative events inside your society.</p>

      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search by action, performer, notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px', width: '100%', maxWidth: '400px', marginBottom: '0' }}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Action Code</th>
            <th>Executed By</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }} className="note">
                No local audit logs registered yet.
              </td>
            </tr>
          ) : (
            filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>
                  <span
                    style={{
                      background: '#eef6fa',
                      color: '#2e86ab',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td>
                  <strong>{log.performedBy?.name}</strong> <br />
                  <span style={{ fontSize: '0.75rem', color: '#777' }}>({log.performedBy?.role})</span>
                </td>
                <td style={{ fontSize: '0.9rem', color: '#444' }}>{log.details}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default AdminAuditLogsPage;
