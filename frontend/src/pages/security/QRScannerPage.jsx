import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api/axios';

const QRScannerPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        try {
          const url = new URL(decodedText);
          const token = url.searchParams.get('token');
          if (!token) {
            setError('Invalid QR code');
            return;
          }
          const res = await API.get(`/visitors/verify/${token}`);
          setResult(res.data.visitor);
        } catch (err) {
          setError(err.response?.data?.message || 'Verification failed');
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  const reset = () => {
    setResult(null);
    setError('');
    window.location.reload();
  };

  return (
    <div className="page-container">
      <h2>Scan Visitor QR Code</h2>
      {!result && !error && <div id="qr-reader" style={{ maxWidth: 400 }} />}
      {error && <p className="error-msg">{error}</p>}
      {result && (
        <div className="approved-card">
          <h3>Visitor approved</h3>
          <p>
            <strong>Name:</strong> {result.visitorName}
          </p>
          <p>
            <strong>Flat:</strong> {result.flatToVisit}
          </p>
          <p>
            <strong>Check-in:</strong> {new Date(result.checkIn).toLocaleString()}
          </p>
          <button type="button" onClick={reset}>
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage;
