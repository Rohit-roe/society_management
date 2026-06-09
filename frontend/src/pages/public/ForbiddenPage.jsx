import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full text-center bg-[var(--bg-card)] border border-[var(--border)] shadow-lg rounded-xl p-8">
        <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
          403 — Access Denied
        </h2>
        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
          You do not have the required role permissions to access this page. Please contact the administrator if you believe this is a mistake.
        </p>
        <Link
          to="/"
          className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
