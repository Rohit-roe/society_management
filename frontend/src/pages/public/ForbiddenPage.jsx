import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full text-center bg-white border border-slate-200 shadow-lg rounded-xl p-8">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          403 — Access Denied
        </h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          You do not have the required role permissions to access this page. Please contact the administrator if you believe this is a mistake.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
