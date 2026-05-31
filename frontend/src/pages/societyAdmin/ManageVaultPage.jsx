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

const ManageVaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('bylaws');
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setUploadingFile(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await API.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFileUrl(res.data.fileUrl);
      setSuccess('Document file uploaded to storage successfully.');
    } catch (err) {
      setError('File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !fileUrl) {
      setError('Title and File upload are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await API.post('/vault', {
        title,
        category,
        fileUrl,
      });

      setSuccess('Document registered in vault successfully.');
      setTitle('');
      setCategory('bylaws');
      setFileUrl('');
      setFile(null);
      fetchDocuments();
    } catch (err) {
      setError('Failed to save document in vault');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Document Vault</h2>
      <p className="note">Upload and categorize community guidelines, contracts, security protocols, and AGM notes.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Upload Form */}
        <div className="card">
          <h3>Upload New Document</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Document Title</label>
              <input
                placeholder="e.g. AGM Minutes Oct 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ marginTop: '4px', marginBottom: '0' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ marginTop: '4px', textTransform: 'capitalize', marginBottom: '0' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>File (PDF/Image/Word)</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                style={{ marginTop: '4px', marginBottom: '0', border: 'none', padding: '0' }}
              />
              {uploadingFile && <span style={{ fontSize: '0.8rem', color: '#777' }}>Uploading to server...</span>}
              {fileUrl && (
                <span style={{ fontSize: '0.8rem', color: '#1e7a4a', display: 'block', marginTop: '4px' }}>
                  File attached successfully. <a href={fileUrl} target="_blank" rel="noreferrer">Open Link</a>
                </span>
              )}
            </div>

            <button type="submit" disabled={uploadingFile || loading}>
              {loading ? 'Registering...' : 'Add to Vault'}
            </button>
          </form>
        </div>

        {/* Vault list */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3>Vault Registry</h3>
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
                  <th>Title</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Link</th>
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
                      No documents found in vault.
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
                      <td><strong>{doc.title}</strong></td>
                      <td>
                        {doc.uploadedBy?.name} <span style={{ fontSize: '0.75rem', color: '#777' }}>({doc.uploadedBy?.role})</span>
                      </td>
                      <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                          Download
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
    </div>
  );
};

export default ManageVaultPage;
