import { Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  Wrench,
  MessageSquare,
  QrCode,
  CreditCard,
  Bell,
  Calendar,
  Vote,
  Wallet,
  Bot,
  BarChart3,
  Check,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Users
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans selection:bg-indigo-100">
      {/* 1. NAVBAR */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-[var(--primary)] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--primary)] animate-pulse" />
            <span>Residio</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-gray-600 hover:text-[var(--primary)] font-semibold text-sm transition-colors py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-indigo-50/50 via-white to-white">
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase px-4 py-1.5 rounded-full mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Trusted Society Management Platform
            </span>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8 max-w-4xl">
              Your Society Deserves Better Than{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                WhatsApp Groups
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
              Residio is the all-in-one society management platform designed to automate gate security, streamline maintenance billing, handle bookings, and resolve resident complaints in real-time.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-base px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-center active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-base px-8 py-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center active:scale-[0.98]"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1">✓ Free to start</span>
              <span className="flex items-center gap-1">✓ No credit card</span>
              <span className="flex items-center gap-1">✓ Setup in minutes</span>
            </div>
          </div>
        </section>

        {/* 3. ROLE-BASED PITCH */}
        <section className="py-20 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Built for Everyone in Your Society
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                A unified hub that coordinates residents, security guards, and administrators under one synchronized system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* For Society Admins */}
              <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-2xl flex flex-col items-start transition-all hover:bg-white hover:shadow-md">
                <div className="bg-indigo-50 p-3 rounded-xl mb-6">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">For Society Admins</h3>
                <ul className="space-y-3.5 text-gray-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Generate monthly bills and track defaults in real-time.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Approve vendor and resident registry requests instantly.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Publish official notices and host community polls securely.</span>
                  </li>
                </ul>
              </div>

              {/* For Residents */}
              <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-2xl flex flex-col items-start transition-all hover:bg-white hover:shadow-md">
                <div className="bg-indigo-50 p-3 rounded-xl mb-6">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">For Residents</h3>
                <ul className="space-y-3.5 text-gray-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Pre-approve visitors to bypass gate register delays.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Pay maintenance charges online via automated gateway.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Book facilities and log support tickets from your dashboard.</span>
                  </li>
                </ul>
              </div>

              {/* For Security Staff */}
              <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-2xl flex flex-col items-start transition-all hover:bg-white hover:shadow-md">
                <div className="bg-indigo-50 p-3 rounded-xl mb-6">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">For Security Staff</h3>
                <ul className="space-y-3.5 text-gray-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Log unknown visitor entries and trigger resident alerts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Verify guest entries instantly via QR code scanning.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Record guard attendance rosters and gate shift logs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURE GRID */}
        <section id="features" className="py-20 bg-gray-50/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Everything You Need to Run Your Society
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                Discover the deep functional capabilities engineered directly into Residio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <QrCode className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Gate Security & QR Codes</h3>
                <p className="text-gray-500 text-sm">
                  Seamless check-ins via visitor log records and secure guest-specific pre-approved QR passcodes.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <CreditCard className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Maintenance Billing</h3>
                <p className="text-gray-500 text-sm">
                  Automatic monthly statement generation, real-time receipt logs, and integrated online gateway.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Bell className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Helpdesk & Notices</h3>
                <p className="text-gray-500 text-sm">
                  Categorized ticket logs, urgency tracking, and an announcement noticeboard for broadcast messages.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Calendar className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Facility Booking</h3>
                <p className="text-gray-500 text-sm">
                  Real-time slot availability maps for clubhouses, gyms, and sports courts to eliminate double-bookings.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Vote className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Community Polls & Events</h3>
                <p className="text-gray-500 text-sm">
                  Secure governance voting system for society decisions, management meetings, and events.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Wallet className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Resident Wallet</h3>
                <p className="text-gray-500 text-sm">
                  Top-up community balances for minor transactions, penalties, and direct utility fees.
                </p>
              </div>

              {/* Feature 7 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <Bot className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">AI Assistant</h3>
                <p className="text-gray-500 text-sm">
                  An intelligent chatbot widget available to residents for answering society dues and rule queries.
                </p>
              </div>

              {/* Feature 8 */}
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                <BarChart3 className="w-8 h-8 text-[var(--primary)] mb-4" />
                <h3 className="text-base font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500 text-sm">
                  Interactive graphs showing financial trends, maintenance logs, and guard shift parameters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-white scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                Up and running in three steps
              </h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                No complex local servers or custom installations needed. Residio is entirely cloud-based.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-md mb-6">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Admin Registers Society</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Society Admin registers online, adds flat lists, and uploads a directory whitelist of valid residents.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-md mb-6">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Residents Join</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Residents sign up by matching their name/flat against the admin's pre-approved whitelist database.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-md mb-6">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">System Runs Automatically</h3>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Notifications trigger automatically on guest arrivals, maintenance schedules, and security shifts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. STATS BAR */}
        <section className="bg-indigo-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <strong className="block text-4xl md:text-5xl font-black mb-1">10,000+</strong>
                <span className="text-indigo-100 font-medium text-sm tracking-wide uppercase">Residents Logged</span>
              </div>
              <div>
                <strong className="block text-4xl md:text-5xl font-black mb-1">500+</strong>
                <span className="text-indigo-100 font-medium text-sm tracking-wide uppercase">Active Societies</span>
              </div>
              <div>
                <strong className="block text-4xl md:text-5xl font-black mb-1">99.9%</strong>
                <span className="text-indigo-100 font-medium text-sm tracking-wide uppercase">System Uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA SECTION */}
        <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-indigo-50/30 text-center">
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
            <h2 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
              Ready to modernise your society?
            </h2>
            <p className="text-gray-600 text-base md:text-lg mb-10 max-w-xl">
              Ditch the outdated spreadsheets and disjointed chat logs. Bring digital security and operational clarity to your community.
            </p>
            <Link
              to="/register"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Create Your Society
            </Link>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-gray-100">
            <div className="text-center md:text-left">
              <span className="text-lg font-black text-gray-900 flex items-center justify-center md:justify-start gap-1.5 mb-2">
                <Building2 className="w-5 h-5 text-[var(--primary)]" />
                Residio
              </span>
              <p className="text-xs text-gray-400">
                Premium MERN properties & community workflows interface.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-medium">
              <a href="#privacy" className="hover:text-[var(--primary)] transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-[var(--primary)] transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-[var(--primary)] transition-colors">Contact</a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--primary)] transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} Residio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
