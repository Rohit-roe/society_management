import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, FolderLock } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = [
  'bylaws',
  'agm_reports',
  'maintenance_notices',
  'contracts',
  'vendor_docs',
  'safety_docs',
  'event_docs',
  'other',
];

const ResidentVaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, itemsPerPage]);

  const fetchDocuments = () => {
    setLoading(true);
    const url = categoryFilter ? `/vault?category=${categoryFilter}` : '/vault';
    API.get(url)
      .then((res) => setDocuments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter]);

  const filteredDocuments = documents.filter((doc) => {
    return doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalItems = filteredDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Society Document Vault</h2>
      <p className="note">Browse and download bylaws, safety certificates, AGM reports, and event summaries.</p>

      {loading && documents.length === 0 ? (
        <div className="skeleton card-skeleton" />
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Official Documents</h3>
          </div>

          {/* Search & Filters */}
          <div className="modern-filter-bar">
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search documents by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="modern-filter-group">
              <select
                className="modern-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ textTransform: 'capitalize' }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {(searchTerm || categoryFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {paginatedDocuments.length > 0 ? (
            <>
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Document Title</th>
                      <th>Uploaded By</th>
                      <th>Upload Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocuments.map((doc) => (
                      <tr key={doc._id}>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span
                            style={{
                              background: 'var(--status-neutral-bg)',
                              color: 'var(--status-neutral-text)',
                              border: '1px solid var(--status-neutral-border)',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                            }}
                          >
                            {doc.category?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <strong>{doc.title}</strong>
                        </td>
                        <td>
                          {doc.uploadedBy?.name}{' '}
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            ({doc.uploadedBy?.role})
                          </span>
                        </td>
                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                            View / Download
                          </a>
                        </td>
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
            </>
          ) : (
            <EmptyState
              icon={FolderLock}
              title={searchTerm || categoryFilter ? "No matching documents" : "Vault empty"}
              description={
                searchTerm || categoryFilter
                  ? "Try adjusting or clearing your filters to view more files."
                  : "No official documents have been uploaded to the society vault yet."
              }
              actionText={searchTerm || categoryFilter ? "Clear Filters" : null}
              onAction={
                searchTerm || categoryFilter
                  ? () => {
                      setSearchTerm('');
                      setCategoryFilter('');
                    }
                  : null
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentVaultPage;
