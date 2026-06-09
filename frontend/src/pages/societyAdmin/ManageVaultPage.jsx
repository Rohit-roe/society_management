import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { FileText, Search, PlusCircle, Download, Clock } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { DashboardStatusBadge } from '../../components/common/DashboardSections';

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
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [docErrors, setDocErrors] = useState({});
  const [docTouched, setDocTouched] = useState({});

  const validateDoc = (values) => {
    const errors = {};
    if (!values.title || !values.title.trim()) {
      errors.title = 'Document Title is required';
    } else if (values.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!values.fileUrl) {
      errors.fileUrl = 'Please upload a file first';
    }
    return errors;
  };

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, itemsPerPage]);

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
      setDocErrors(prev => {
        const next = { ...prev };
        delete next.fileUrl;
        return next;
      });
    } catch (err) {
      setError('File upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const touched = { title: true, fileUrl: true };
    setDocTouched(touched);

    const errs = validateDoc({ title, fileUrl });
    if (Object.keys(errs).length > 0) {
      setDocErrors(errs);
      setError('Please resolve all validation errors first.');
      return;
    }

    try {
      setSubmittingDoc(true);
      await API.post('/vault', {
        title,
        category,
        fileUrl,
      });

      setSuccess('Document registered in vault successfully.');
      setTitle('');
      setCategory('bylaws');
      setFileUrl('');
      setDocTouched({});
      setDocErrors({});
      const fileInput = document.getElementById('vault-file-input');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err) {
      setError('Failed to save document in vault');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    return (
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalItems = filteredDocs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="page-container">
      <h2>Document Vault</h2>
      <p className="note">Upload and categorize community guidelines, contracts, security protocols, and AGM notes.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }} className="vault-split-layout">
        {/* Upload Form */}
        <div className="card">
          <h3>Upload New Document</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="modern-form-group">
              <label className="modern-label">
                Document Title <span className="required-asterisk">*</span>
              </label>
              <input
                className={`modern-input ${docTouched.title && docErrors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. AGM Minutes Oct 2025"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (docTouched.title) {
                    setDocErrors(validateDoc({ title: val, fileUrl }));
                  }
                }}
                onBlur={() => {
                  setDocTouched(prev => ({ ...prev, title: true }));
                  setDocErrors(validateDoc({ title, fileUrl }));
                }}
                required
              />
              {docTouched.title && docErrors.title && (
                <span className="modern-error-text">{docErrors.title}</span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">
                Category <span className="required-asterisk">*</span>
              </label>
              <select
                className="modern-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ textTransform: 'capitalize' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">
                File (PDF/Image/Word) <span className="required-asterisk">*</span>
              </label>
              <input
                id="vault-file-input"
                type="file"
                className="modern-input"
                onChange={handleFileChange}
                style={{ border: 'none', padding: '0', background: 'transparent' }}
                required
              />
              {uploadingFile && <span className="modern-helper-text">Uploading to server...</span>}
              {fileUrl && (
                <span className="modern-helper-text" style={{ color: 'var(--status-success-text)' }}>
                  File attached successfully. <a href={fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Open Link</a>
                </span>
              )}
              {docTouched.fileUrl && docErrors.fileUrl && (
                <span className="modern-error-text">{docErrors.fileUrl}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '12px',
              }}
              disabled={uploadingFile || submittingDoc}
            >
              {submittingDoc ? (
                <>
                  <svg className="animate-spin btn-loading-spinner" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </>
              ) : (
                'Add to Vault'
              )}
            </button>
          </form>
        </div>

        {/* Vault list */}
        <div className="card">
          <h3>Vault Registry</h3>

          {/* Search & Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search documents or uploader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="modern-filter-group">
              <select
                className="modern-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase().replace('_', ' ')}
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
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading && documents.length === 0 ? (
            <div className="skeleton card-skeleton" style={{ marginTop: '16px' }} />
          ) : paginatedDocs.length > 0 ? (
            <>
              <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Uploaded By</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDocs.map((doc) => (
                      <tr key={doc._id}>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className="status-pill info">
                            {doc.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td><strong>{doc.title}</strong></td>
                        <td>
                          {doc.uploadedBy?.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({doc.uploadedBy?.role})</span>
                        </td>
                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary inline-flex items-center gap-1.5" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            <Download size={14} /> Download
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
              icon={FileText}
              title="No documents found"
              description="Try adjusting your filters or search terms."
              actionText={(searchTerm || categoryFilter) ? "Clear Filters" : null}
              onAction={() => {
                setSearchTerm('');
                setCategoryFilter('');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVaultPage;
