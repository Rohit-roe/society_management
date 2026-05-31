import { useState, useEffect } from 'react';
import API from '../../api/axios';

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

  return (
    <div className="page-container">
      <h2>Society Document Vault</h2>
      <p className="note">Browse and download bylaws, safety certificates, AGM reports, and event summaries.</p>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3>Official Documents</h3>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '180px', padding: '6px', fontSize: '0.85rem', marginBottom: '0' }}
          >
            <option value="">-- All Categories --</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
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
              {loading && documents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }} className="note">
                    Loading files...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }} className="note">
                    No documents found in the vault.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id}>
                    <td style={{ textTransform: 'capitalize' }}>
                      <span
                        style={{
                          background: '#eef6fa',
                          color: '#2e86ab',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                        }}
                      >
                        {doc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <strong>{doc.title}</strong>
                    </td>
                    <td>
                      {doc.uploadedBy?.name}{' '}
                      <span style={{ fontSize: '0.75rem', color: '#777' }}>({doc.uploadedBy?.role})</span>
                    </td>
                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                        View / Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResidentVaultPage;
