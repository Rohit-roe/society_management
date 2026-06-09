import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, Bell } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, urgentOnly, itemsPerPage]);

  useEffect(() => {
    API.get('/notices')
      .then((res) => setNotices(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.body?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgent = urgentOnly ? n.priority === 'urgent' : true;
    return matchesSearch && matchesUrgent;
  });

  const totalItems = filteredNotices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Notice Board</h2>
      
      {loading ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <>
          {/* Search bar and Urgent Toggle */}
          <div className="modern-filter-bar" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="modern-filter-search-wrap" style={{ flex: 1 }}>
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search notices by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Urgent Only Filter Toggle */}
            <button
              type="button"
              onClick={() => setUrgentOnly(!urgentOnly)}
              className="btn"
              style={{
                background: urgentOnly ? 'var(--status-danger-bg)' : 'var(--bg-card)',
                color: urgentOnly ? 'var(--status-danger-text)' : 'var(--text-secondary)',
                border: `1px solid ${urgentOnly ? 'var(--status-danger-border)' : 'var(--border)'}`,
                padding: '10px 16px',
                borderRadius: 'var(--radius)',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: urgentOnly ? 'var(--status-danger-text)' : 'var(--text-secondary)',
                display: 'inline-block'
              }} />
              Urgent Only
            </button>

            {searchTerm && (
              <button
                type="button"
                className="btn btn-secondary modern-filter-btn-clear"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>

          {paginatedNotices.length > 0 ? (
            <>
              <div className="notice-board-list">
                {paginatedNotices.map((n) => (
                  <div key={n._id} className={`notice-card ${n.priority}`}>
                    {n.priority === 'urgent' && (
                      <span className="notice-badge-urgent">
                        URGENT
                      </span>
                    )}
                    <h3 className="notice-card-title" style={{ marginTop: n.priority === 'urgent' ? '8px' : '0' }}>{n.title}</h3>
                    <p className="notice-card-body">{n.body}</p>
                    <small className="notice-card-meta">
                      Posted by {n.postedBy?.name} on {new Date(n.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          ) : (
            <div className="card" style={{ padding: '24px' }}>
              <EmptyState
                icon={Bell}
                title={searchTerm || urgentOnly ? "No matching notices" : "Notice board empty"}
                description={
                  searchTerm || urgentOnly
                    ? "Try adjusting your search query or filter to see other notices."
                    : "No announcements have been published to the notice board yet."
                }
                actionText={searchTerm || urgentOnly ? "Reset Filters" : null}
                onAction={searchTerm || urgentOnly ? () => { setSearchTerm(''); setUrgentOnly(false); } : null}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NoticeBoardPage;
