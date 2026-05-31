import { useState } from 'react';
import API from '../../api/axios';

const PreApproveVisitorPage = () => {
  const [form, setForm] = useState({ visitorName: '', guestEmail: '', expectedAt: '', purpose: '' });
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setQrCode(null);
    try {
      const res = await API.post('/visitors/pre-approve', form);
      setQrCode(res.data.qrDataUrl);
    } catch {
      setError('Failed to pre-approve visitor');
    }
  };

  return (
    <div className="page-container">
      <h2>Pre-Approve a Visitor</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="visitorName" placeholder="Guest Name" onChange={handleChange} required />
        <input name="guestEmail" type="email" placeholder="Guest Email" onChange={handleChange} required />
        <input name="expectedAt" type="datetime-local" onChange={handleChange} required />
        <input name="purpose" placeholder="Purpose of Visit" onChange={handleChange} />
        <button type="submit">Generate QR Pass</button>
      </form>
      {qrCode && (
        <div className="qr-result">
          <h3>QR pass created</h3>
          <p>QR code emailed to guest (if email is configured).</p>
          <img src={qrCode} alt="Visitor QR Code" style={{ width: 200 }} />
        </div>
      )}
    </div>
  );
};

export default PreApproveVisitorPage;
