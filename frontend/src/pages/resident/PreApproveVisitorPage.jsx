import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { AlertCircle, Calendar, Send, CheckCircle2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PreApproveVisitorPage = () => {
  const [form, setForm] = useState({ visitorName: '', guestEmail: '', expectedAt: '', purpose: '' });
  const [qrCode, setQrCode] = useState(null);
  
  // Form Validations & Loadings
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Table Requests & Modal States
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [qrModalRequest, setQrModalRequest] = useState(null);

  // Modal Close Button Ref for Focus Trap
  const qrCloseButtonRef = useRef(null);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await API.get('/visitors/flat');
      // Filter only pre-approved entries
      setRequests(res.data.filter((v) => v.preApproved));
    } catch (err) {
      console.error('Failed to fetch pre-approved requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Modal Escape Key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setQrModalRequest(null);
      }
    };
    if (qrModalRequest) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qrModalRequest]);

  // Modal Focus Trap
  useEffect(() => {
    if (qrModalRequest) {
      qrCloseButtonRef.current?.focus();
    }
  }, [qrModalRequest]);

  const validateField = (name, value) => {
    let error = '';
    if (!value && name !== 'purpose') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'guestEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Please enter a valid email address';
    } else if (name === 'expectedAt' && value) {
      const selectedDate = new Date(value);
      const now = new Date();
      if (selectedDate < now) {
        error = 'Expected arrival date cannot be in the past';
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, form[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQrCode(null);

    const fields = ['visitorName', 'guestEmail', 'expectedAt'];
    const newTouched = {};
    fields.forEach((f) => {
      newTouched[f] = true;
    });
    setTouched(newTouched);

    let isValid = true;
    fields.forEach((f) => {
      if (!validateField(f, form[f])) {
        isValid = false;
      }
    });

    if (!isValid) return;

    setLoading(true);
    try {
      const res = await API.post('/visitors/pre-approve', form);
      setQrCode(res.data.qrDataUrl);
      setForm({ visitorName: '', guestEmail: '', expectedAt: '', purpose: '' });
      setTouched({});
      setErrors({});
      fetchRequests(); // dynamically reload requests table list
    } catch (err) {
      setErrors({ form: err.response?.data?.message || 'Failed to pre-approve visitor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Pre-Approve a Visitor</h2>
      <p className="note">Provide guest details to pre-register gate entry and generate a secure QR Pass.</p>

      {errors.form && <p className="error-msg">{errors.form}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'flex-start', marginTop: '20px' }} className="visitor-split-layout">
        <div className="card">
          <h3>Visitor Request Information</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }} noValidate>
            
            <div className="modern-form-group">
              <label className="modern-label">Visitor Full Name <span className="required-asterisk">*</span></label>
              <input
                name="visitorName"
                type="text"
                placeholder="e.g. Amit Sharma"
                value={form.visitorName}
                onChange={handleChange}
                onBlur={() => handleBlur('visitorName')}
                required
                className={`modern-input ${touched.visitorName && errors.visitorName ? 'is-invalid' : touched.visitorName && !errors.visitorName ? 'is-valid' : ''}`}
              />
              {touched.visitorName && errors.visitorName && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {errors.visitorName}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Visitor Email <span className="required-asterisk">*</span></label>
              <input
                name="guestEmail"
                type="email"
                placeholder="e.g. guest@domain.com"
                value={form.guestEmail}
                onChange={handleChange}
                onBlur={() => handleBlur('guestEmail')}
                required
                className={`modern-input ${touched.guestEmail && errors.guestEmail ? 'is-invalid' : touched.guestEmail && !errors.guestEmail ? 'is-valid' : ''}`}
              />
              {touched.guestEmail && errors.guestEmail && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {errors.guestEmail}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Expected Arrival Time <span className="required-asterisk">*</span></label>
              <input
                name="expectedAt"
                type="datetime-local"
                value={form.expectedAt}
                onChange={handleChange}
                onBlur={() => handleBlur('expectedAt')}
                required
                className={`modern-input ${touched.expectedAt && errors.expectedAt ? 'is-invalid' : touched.expectedAt && !errors.expectedAt ? 'is-valid' : ''}`}
              />
              {touched.expectedAt && errors.expectedAt && (
                <span className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {errors.expectedAt}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <label className="modern-label">Purpose of Visit</label>
              <input
                name="purpose"
                type="text"
                placeholder="e.g. Dinner Guest, Delivery"
                value={form.purpose}
                onChange={handleChange}
                onBlur={() => handleBlur('purpose')}
                className="modern-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white btn-loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Pass...
                </>
              ) : (
                <>
                  <Send size={16} /> Generate QR Pass
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Code Pass display */}
        <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {qrCode ? (
            <div className="qr-result">
              <div style={{ color: 'var(--status-success-text)', marginBottom: '12px' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 8px' }} />
                <h3 style={{ margin: 0 }}>QR Pass Created Successfully!</h3>
              </div>
              <p className="note" style={{ marginBottom: '16px' }}>QR code emailed to guest (if email is configured).</p>
              <img src={qrCode} alt="Visitor QR Code" style={{ width: 200, height: 200, border: '4px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px', background: '#fff', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h3>Awaiting Pass Generation</h3>
              <p className="note" style={{ maxWidth: '300px', margin: '8px auto 0' }}>Provide guest information on the left side to issue a secure digital entry pass.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Approved Requests Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Pre-Approved Guest Passes</h3>
        {requestsLoading ? (
          <p className="note">Loading guest passes...</p>
        ) : requests.length === 0 ? (
          <p className="note" style={{ marginTop: '12px' }}>No pre-approved guest requests found.</p>
        ) : (
          <div className="modern-table-wrapper" style={{ marginTop: '16px' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Visitor Name</th>
                  <th>Email Address</th>
                  <th>Expected Arrival</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.visitorName}</strong></td>
                    <td>{r.guestEmail || '—'}</td>
                    <td>{new Date(r.expectedAt).toLocaleString()}</td>
                    <td>{r.purpose || '—'}</td>
                    <td>
                      <span className={`status-pill ${r.approvalStatus}`} style={{
                        background: r.approvalStatus === 'expired' ? 'var(--status-neutral-bg)' : 'var(--status-success-bg)',
                        color: r.approvalStatus === 'expired' ? 'var(--status-neutral-text)' : 'var(--status-success-text)',
                        border: `1px solid ${r.approvalStatus === 'expired' ? 'var(--status-neutral-border)' : 'var(--status-success-border)'}`,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {r.approvalStatus}
                      </span>
                    </td>
                    <td>
                      {r.approvalStatus !== 'expired' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-compact"
                          onClick={() => setQrModalRequest(r)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '700',
                            padding: '6px 12px',
                            fontSize: '0.8rem'
                          }}
                        >
                          View QR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accessible QR Modal */}
      {qrModalRequest && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 className="modal-title">Visitor Entry QR Pass</h3>
              <button
                type="button"
                className="modal-close"
                ref={qrCloseButtonRef}
                onClick={() => setQrModalRequest(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{qrModalRequest.visitorName}</strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Expected: {new Date(qrModalRequest.expectedAt).toLocaleString()}
              </span>
              <div style={{ padding: '12px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'inline-block', marginTop: '12px' }}>
                <QRCodeSVG value={`${window.location.origin}/verify-visitor?token=${qrModalRequest.approvalToken}`} size={180} />
              </div>
              <p className="note" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Provide this QR pass to the security guard at the gate for fast check-in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreApproveVisitorPage;
