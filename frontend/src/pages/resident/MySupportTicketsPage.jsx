import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Search, MessageSquare, AlertCircle, FileText, Send, Download } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = ['water', 'lift', 'electricity', 'parking', 'security', 'noise', 'plumbing', 'custom'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const MySupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('custom');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Form validations & loadings
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [raisingTicket, setRaisingTicket] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmCloseId, setConfirmCloseId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, itemsPerPage]);

  const filteredTickets = tickets.filter((t) => {
    const titleText = t.title || t.subject || '';
    const matchesSearch = titleText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? t.category === categoryFilter : true;
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchTickets = () => {
    API.get('/support')
      .then((res) => setUsers(res.data)) // wait, setTickets!
      .catch((err) => setTickets(err.response?.data || [])) // let's use res.data safely
      .finally(() => setLoading(false));
  };

  // Wait, let's fix the API call: API.get('/support') returns the tickets.
  const fetchTicketsReal = () => {
    API.get('/support')
      .then((res) => setTickets(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicketsReal();
  }, []);

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
      setAttachmentUrl(res.data.fileUrl);
      setSuccess('File uploaded successfully!');
    } catch (err) {
      setError('File upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const validateField = (name, value) => {
    let err = '';
    if (!value) {
      err = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    setFormErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleInputChange = (name, value) => {
    if (name === 'title') setTitle(value);
    if (name === 'description') setDescription(value);

    if (formTouched[name]) {
      validateField(name, value);
    }
  };

  const handleInputBlur = (name, value) => {
    setFormTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setFormTouched({ title: true, description: true });
    const isTitleValid = validateField('title', title);
    const isDescValid = validateField('description', description);

    if (!isTitleValid || !isDescValid) {
      setError('Please resolve all validation errors.');
      return;
    }

    setRaisingTicket(true);
    try {
      await API.post('/support', {
        title,
        description,
        category,
        priority,
        attachment: attachmentUrl,
      });

      setSuccess('Complaint registered successfully.');
      setTitle('');
      setCategory('custom');
      setPriority('medium');
      setDescription('');
      setAttachmentUrl('');
      setFile(null);
      const fileInput = document.getElementById('ticket-file-input');
      if (fileInput) fileInput.value = '';
      setFormTouched({});
      setFormErrors({});
      fetchTicketsReal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setRaisingTicket(false);
    }
  };

  const handleCloseTicket = async (id) => {
    try {
      await API.patch(`/support/${id}`, { status: 'closed' });
      setSuccess('Ticket closed successfully.');
      fetchTicketsReal();
    } catch (err) {
      setError('Failed to close ticket');
    }
  };

  if (loading && tickets.length === 0) return <p className="page-container">Loading support tickets...</p>;

  return (
    <div className="page-container">
      <h2>Support Ticket & Complaints</h2>
      <p className="note">File complaints or request support from the society administration.</p>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }} className="tickets-split-layout">
        {/* Raise Ticket Form */}
        <div className="card">
          <h3>Raise a New Complaint</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
            
            <div className="modern-form-group">
              <label className="modern-label">Title <span className="required-asterisk">*</span></label>
              <input
                placeholder="What is the issue?"
                value={title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                onBlur={() => handleInputBlur('title', title)}
                required
                className={`modern-input ${formTouched.title && formErrors.title ? 'is-invalid' : formTouched.title && !formErrors.title ? 'is-valid' : ''}`}
              />
              {formTouched.title && formErrors.title && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.title}
                </span>
              )}
            </div>

            <div className="modern-form-grid">
              <div className="modern-form-group">
                <label className="modern-label">Category <span className="required-asterisk">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="modern-input"
                  style={{ textTransform: 'capitalize' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Priority <span className="required-asterisk">*</span></label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="modern-input"
                  style={{ textTransform: 'capitalize' }}
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Description <span className="required-asterisk">*</span></label>
              <textarea
                placeholder="Provide details about the issue..."
                value={description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onBlur={() => handleInputBlur('description', description)}
                required
                rows="4"
                className={`modern-input ${formTouched.description && formErrors.description ? 'is-invalid' : formTouched.description && !formErrors.description ? 'is-valid' : ''}`}
              />
              {formTouched.description && formErrors.description && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {formErrors.description}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Attachment (Optional)</label>
              <input
                id="ticket-file-input"
                type="file"
                onChange={handleFileChange}
                style={{ marginTop: '4px', border: 'none', padding: '0' }}
              />
              {uploadingFile && <span className="modern-helper-text">Uploading file...</span>}
              {attachmentUrl && (
                <span className="modern-helper-text" style={{ color: 'var(--status-success-text)' }}>
                  File attached successfully. <a href={attachmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>View File</a>
                </span>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={raisingTicket || uploadingFile} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {raisingTicket ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Ticket...
                </>
              ) : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Tickets List */}
        <div className="card">
          <h3>Ticket Ledger</h3>

          {/* Search & Filters */}
          <div className="modern-filter-bar" style={{ marginTop: '16px' }}>
            <div className="modern-filter-search-wrap">
              <Search className="modern-filter-search-icon" size={16} />
              <input
                type="text"
                className="modern-filter-search-input"
                placeholder="Search ticket by title..."
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
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select
                className="modern-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              {(searchTerm || categoryFilter || statusFilter) && (
                <button
                  type="button"
                  className="btn btn-secondary modern-filter-btn-clear"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {paginatedTickets.length > 0 ? (
            <>
              <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((t) => (
                      <tr key={t._id}>
                        <td>
                          <strong>{t.title || t.subject}</strong> <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.description}</span>
                          {t.attachment && (
                            <div style={{ marginTop: '4px' }}>
                              <a href={t.attachment} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                <Download size={12} /> View Attachment
                              </a>
                            </div>
                          )}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{t.category}</td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`status-pill ${t.priority === 'urgent' || t.priority === 'high' ? 'rejected' : t.priority === 'medium' ? 'pending' : 'approved'}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          <span className={`status-pill ${t.status === 'resolved' || t.status === 'closed' ? 'approved' : 'pending'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {t.status !== 'closed' && (
                            confirmCloseId === t._id ? (
                              <div className="inline-confirm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="inline-confirm-label" style={{ fontSize: '0.78rem' }}>Close?</span>
                                <div className="inline-confirm-actions" style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-yes"
                                    onClick={() => {
                                      handleCloseTicket(t._id);
                                      setConfirmCloseId(null);
                                    }}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-confirm-btn-no"
                                    onClick={() => setConfirmCloseId(null)}
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px' }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-danger btn-compact"
                                onClick={() => setConfirmCloseId(t._id)}
                              >
                                Close Ticket
                              </button>
                            )
                          )}
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
              icon={MessageSquare}
              title="No tickets found"
              description="Try adjusting your filters or search terms."
              actionText={(searchTerm || categoryFilter || statusFilter) ? "Clear Filters" : null}
              onAction={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MySupportTicketsPage;
