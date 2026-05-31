import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold text-indigo-600 flex items-center gap-2">
            🏢 SocietyApp
          </span>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-700 hover:text-indigo-600 font-semibold px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:shadow-md active:scale-95"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl">
          <span className="bg-indigo-50 text-indigo-800 text-xs uppercase font-extrabold tracking-widest px-3 py-1.5 rounded-full inline-block mb-6 border border-indigo-200">
            SaaS Property Management
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Society Management <span className="text-indigo-600">Simplified</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            A comprehensive MERN stack platform designed to streamline notices, gated visitor approvals, facility bookings, maintenance billing, and support ticketing for your apartment society.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-center active:scale-95 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              Get Started
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center active:scale-95 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              Register Society
            </Link>
          </div>
        </div>

        {/* Feature Cards Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-left">
            <span className="text-3xl mb-4 block">🛡️</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gate Security & QR Codes</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Real-time gate check-ins, pre-approved visitor passes, and QR code scans for resident security and ease.
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-left">
            <span className="text-3xl mb-4 block">🔧</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Maintenance & Expenses</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Online billing logs, dues rosters, automated cycle generation, and manual status overrides for admins.
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-left">
            <span className="text-3xl mb-4 block">💬</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Helpdesk & Notices</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fast ticketing systems, categorization, priority tracking, and dynamic announcement noticeboards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-500 text-xs">
        <p>&copy; {new Date().getFullYear()} SocietyApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
