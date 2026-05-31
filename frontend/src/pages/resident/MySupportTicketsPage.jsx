import { useState, useEffect } from 'react';
import API from '../../api/axios';

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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTickets = () => {
    API.get('/support')
      .then((res) => setTickets(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

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
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async (id) => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;
    try {
      await API.patch(`/support/${id}`, { status: 'closed' });
      setSuccess('Ticket closed successfully.');
      fetchTickets();
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Raise Ticket Form */}
        <div className="card">
          <h3>Raise a New Complaint</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Title</label>
              <input
                placeholder="What is the issue?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ marginBottom: '0', marginTop: '4px' }}
              />
            </div>

            <div className="form-row" style={{ marginBottom: '0' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ textTransform: 'capitalize', marginTop: '4px', marginBottom: '0' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ textTransform: 'capitalize', marginTop: '4px', marginBottom: '0' }}
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Description</label>
              <textarea
                placeholder="Provide details about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="4"
                style={{ marginBottom: '0', marginTop: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1a3c5e' }}>Attachment (Optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ marginTop: '4px', marginBottom: '0', border: 'none', padding: '0' }}
              />
              {uploadingFile && <span style={{ fontSize: '0.8rem', color: '#777' }}>Uploading file...</span>}
              {attachmentUrl && (
                <span style={{ fontSize: '0.8rem', color: '#1e7a4a', display: 'block', marginTop: '4px' }}>
                  File attached. <a href={attachmentUrl} target="_blank" rel="noreferrer">View</a>
                </span>
              )}
            </div>

            <button type="submit" disabled={uploadingFile || loading}>
              {loading ? 'Submitting...' : 'File Complaint'}
            </button>
          </form>
        </div>

        {/* Tickets Ledger */}
        <div className="card">
          <h3>Complaint History</h3>
          <div style={{ marginTop: '16px' }}>
            {tickets.length === 0 ? (
              <p className="note">You have not raised any tickets yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {tickets.map((t) => (
                  <article
                    key={t._id}
                    style={{
                      border: '1px solid #eef6fa',
                      borderRadius: '8px',
                      padding: '16px',
                      background: '#fff',
                      borderLeft: `4px solid ${
                        t.priority === 'urgent' ? '#c0392b' : t.priority === 'high' ? '#9a7d0a' : '#2e86ab'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h4 style={{ color: '#1a3c5e', fontSize: '1.05rem' }}>{t.title || t.subject}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '4px' }}>
                          Category: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{t.category}</span> | Raised: {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span
                          style={{
                            background:
                              t.status === 'open'
                                ? '#fadbd8'
                                : t.status === 'in_progress'
                                ? '#fef9e7'
                                : t.status === 'resolved'
                                ? '#d5f5e3'
                                : '#eef6fa',
                            color:
                              t.status === 'open'
                                ? '#c0392b'
                                : t.status === 'in_progress'
                                ? '#b7950b'
                                : t.status === 'resolved'
                                ? '#1e7a4a'
                                : '#666',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                          }}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#444', marginTop: '12px', whiteSpace: 'pre-line' }}>
                      {t.description}
                    </p>
                    {t.attachment && (
                      <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                        <strong>Attachment:</strong>{' '}
                        <a href={t.attachment} target="_blank" rel="noreferrer" style={{ color: '#2e86ab', fontWeight: '600' }}>
                          View Attachment File
                        </a>
                      </p>
                    )}
                    {t.assignedTo && (
                      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '12px', borderTop: '1px solid #f0f4f8', paddingTop: '8px' }}>
                        Assigned To: <strong>{t.assignedTo.name}</strong> ({t.assignedTo.role})
                      </p>
                    )}
                    {t.status !== 'closed' && t.status !== 'resolved' && (
                      <button
                        type="button"
                        style={{
                          marginTop: '12px',
                          background: '#777',
                          color: '#fff',
                          padding: '4px 10px',
                          fontSize: '0.8rem',
                        }}
                        onClick={() => handleCloseTicket(t._id)}
                      >
                        Close Ticket
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySupportTicketsPage;
