import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, AlertTriangle, CheckCircle2, Megaphone, ArrowLeft } from 'lucide-react';

const getNormalizedApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) {
      return `http://${url}`;
    }
    return `https://${url}`;
  }
  return url;
};

const API_BASE = getNormalizedApiUrl();

const VerifyVisitorPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('No entry token provided.');
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE}/visitors/public/${token}`)
      .then((res) => setPass(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Invalid entry pass'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-sans">
        <div className="text-[var(--text-secondary)] text-lg flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading entry pass...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <span className="text-3xl font-extrabold text-[var(--primary)] inline-flex items-center gap-2">
          <Building2 className="w-8 h-8" /> SocietyApp
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-[var(--text-primary)]">
          Visitor Entry Pass Verification
        </h2>
      </div>
 
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-6 shadow-md rounded-xl border border-[var(--border)]">
          {error && (
            <div className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger-text)] rounded-lg p-4 mb-4 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
 
          {pass && (
            <div className="space-y-6">
              <div className="bg-[rgba(var(--primary-rgb),0.1)] border border-[rgba(var(--primary-rgb),0.15)] rounded-lg p-4 text-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--primary)]">Pass Details</span>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{pass.visitorName}</h3>
              </div>
 
              <div className="space-y-3 text-sm border-t border-[var(--border)] pt-4 text-[var(--text-primary)]">
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] font-semibold">Flat / House to Visit:</span>
                  <span className="font-bold text-[var(--text-primary)]">Flat {pass.flatToVisit}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] font-semibold">Expected Arrival:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {pass.expectedAt ? new Date(pass.expectedAt).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[var(--text-secondary)] font-semibold">Visit Purpose:</span>
                  <span className="font-bold text-[var(--text-primary)]">{pass.purpose || 'General Visit'}</span>
                </div>
              </div>
 
              {pass.alreadyCheckedIn ? (
                <div className="bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success-text)] rounded-lg p-4 text-sm font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Guest has already checked in at the gate.
                </div>
              ) : (
                <div className="bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning-text)] rounded-lg p-4 text-sm font-semibold flex items-center gap-2 leading-relaxed">
                  <Megaphone className="w-5 h-5 flex-shrink-0" />
                  <span>Show this verification screen to security at the gate for QR pass check-in approval.</span>
                </div>
              )}
            </div>
          )}
 
          <div className="mt-8 text-center border-t border-[var(--border)] pt-4">
            <Link
              to="/"
              className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded px-2 py-1 inline-flex items-center"
            >
              <span className="inline-flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyVisitorPage;
