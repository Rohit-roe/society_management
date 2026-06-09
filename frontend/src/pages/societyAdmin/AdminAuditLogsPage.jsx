import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Clock, ShieldAlert } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    API.get('/residents/audit-logs')
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.details?.toLowerCase().includes(term) ||
      log.performedBy?.name?.toLowerCase().includes(term)
    );
  });

  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Society Audit Trail</h2>
      <p className="note">Searchable logging history of administrative events inside your society.</p>

      {/* Search & Filters */}
      <div className="modern-filter-bar" style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div className="modern-filter-search-wrap">
          <Search className="modern-filter-search-icon" size={16} />
          <input
            type="text"
            className="modern-filter-search-input"
            placeholder="Search by action, performer, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button
            type="button"
            className="btn btn-secondary modern-filter-btn-clear"
            onClick={() => setSearch('')}
          >
            Clear
          </button>
        )}
      </div>

      {loading && logs.length === 0 ? (
        <div className="skeleton card-skeleton" />
      ) : paginatedLogs.length > 0 ? (
        <div className="card">
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Action Code</th>
                  <th>Executed By</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="status-pill info" style={{ fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <strong>{log.performedBy?.name}</strong> <br />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({log.performedBy?.role})</span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{log.details}</td>
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
        </div>
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="No audit logs found"
          description={search ? "Try adjusting your search query." : "No local audit logs registered yet."}
          actionText={search ? "Clear Search" : null}
          onAction={() => setSearch('')}
        />
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
