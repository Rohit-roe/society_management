import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-slate-600 text-lg flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading entry pass...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <span className="text-3xl font-extrabold text-indigo-600">🏢 SocietyApp</span>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
          Visitor Entry Pass Verification
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl border border-slate-200">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4 mb-4 text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {pass && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-800">Pass Details</span>
                <h3 className="text-xl font-extrabold text-indigo-900 mt-1">{pass.visitorName}</h3>
              </div>

              <div className="space-y-3 text-sm border-t border-slate-100 pt-4 text-slate-800">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Flat / House to Visit:</span>
                  <span className="font-bold text-slate-900">Flat {pass.flatToVisit}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500 font-semibold">Expected Arrival:</span>
                  <span className="font-bold text-slate-900">
                    {pass.expectedAt ? new Date(pass.expectedAt).toLocaleString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Visit Purpose:</span>
                  <span className="font-bold text-slate-900">{pass.purpose || 'General Visit'}</span>
                </div>
              </div>

              {pass.alreadyCheckedIn ? (
                <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-sm font-bold text-center">
                  ✅ Guest has already checked in at the gate.
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm font-semibold text-center leading-relaxed">
                  📢 Show this verification screen to security at the gate for QR pass check-in approval.
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center border-t border-slate-100 pt-4">
            <Link
              to="/"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyVisitorPage;
