import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api/axios';

const QRScannerPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);

  const setupScanner = () => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 });
    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        try {
          await scanner.clear();
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
  };

  useEffect(() => {
    setupScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const reset = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
    setResult(null);
    setError('');
    // Wait for the DOM element #qr-reader to be re-rendered before starting scanner
    setTimeout(() => {
      setupScanner();
    }, 100);
  };

  return (
    <div className="page-container">
      <h2>Scan Visitor QR Code</h2>
      {!result && !error && <div id="qr-reader" style={{ maxWidth: 400 }} />}
      {error && (
        <div style={{ marginTop: '16px' }}>
          <p className="error-msg" style={{ marginBottom: '16px' }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try Again / Scan Next
          </button>
        </div>
      )}
      {result && (
        <div className="approved-card" style={{ marginTop: '16px' }}>
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
          <button type="button" className="btn btn-primary" onClick={reset} style={{ marginTop: '16px' }}>
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScannerPage;
