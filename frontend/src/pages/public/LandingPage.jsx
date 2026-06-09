import { Link } from 'react-router-dom';
import {
  Building2,
  Shield,
  MessageSquare,
  QrCode,
  CreditCard,
  Calendar,
  Wallet,
  Bot,
  Check,
  ArrowRight,
  ShieldCheck,
  Users,
  Settings
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      
      {/* NAVBAR */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-[var(--primary)] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--primary)]" />
            <span>Residio</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--text-secondary)]">
            <a href="#benefits" className="hover:text-[var(--primary)] transition-colors">Benefits</a>
            <a href="#roles" className="hover:text-[var(--primary)] transition-colors">Roles</a>
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[var(--text-secondary)] hover:text-[var(--primary)] font-semibold text-sm transition-colors px-3 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center text-center py-16 md:py-24 min-h-[70vh] max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-[rgba(var(--primary-rgb),0.08)] border border-[rgba(var(--primary-rgb),0.15)] text-[var(--primary)] text-xs font-bold tracking-wide uppercase px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Modern Society Management Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
            Your Gated Community,{" "}
            <span className="text-[var(--primary)]">
              Modernised
            </span>
          </h1>

          <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
            Residio is a premium dashboard that streamlines gate security, automates maintenance invoicing, schedules amenity bookings, and manages resident databases.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-base px-6 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-primary)] font-bold text-base px-6 py-3.5 rounded-lg shadow-sm transition-all text-center"
            >
              Explore Features
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1">✓ Setup in minutes</span>
            <span className="flex items-center gap-1">✓ Role-based access control</span>
            <span className="flex items-center gap-1">✓ Integrated digital payments</span>
          </div>
        </section>

        {/* PLATFORM BENEFITS */}
        <section id="benefits" className="py-16 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left p-6">
              <div className="w-10 h-10 rounded-lg bg-[rgba(var(--primary-rgb),0.08)] flex items-center justify-center text-[var(--primary)] mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secure Gate Operations</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Verify visitors seamlessly using resident-generated QR codes, replacing messy paper logbooks.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left p-6">
              <div className="w-10 h-10 rounded-lg bg-[rgba(var(--primary-rgb),0.08)] flex items-center justify-center text-[var(--primary)] mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Automated Billing</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Generate monthly maintenance invoices and accept digital payments directly with zero manual overhead.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left p-6">
              <div className="w-10 h-10 rounded-lg bg-[rgba(var(--primary-rgb),0.08)] flex items-center justify-center text-[var(--primary)] mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Centralized Hub</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Notice boards, facility slots, penalty logs, and helper registers in a single, high-contrast interface.
              </p>
            </div>
          </div>
        </section>

        {/* ROLE OVERVIEW */}
        <section id="roles" className="py-16 border-t border-[var(--border)]">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Designed for the Entire Community</h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl mx-auto">
              Custom-tailored role dashboards keep security staff, residents, and admins perfectly aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Resident Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl flex flex-col hover:border-[var(--border-strong)] transition-all">
              <div className="bg-[rgba(var(--primary-rgb),0.08)] p-2.5 rounded-lg w-fit text-[var(--primary)] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Residents</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                Manage household accounts, pay society invoices, and invite guests easily.
              </p>
              <ul className="space-y-2 mt-auto text-xs text-[var(--text-secondary)] font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Pay dues online</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Pre-approve guests</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Book amenities</li>
              </ul>
            </div>

            {/* Society Admin Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl flex flex-col hover:border-[var(--border-strong)] transition-all">
              <div className="bg-[rgba(var(--primary-rgb),0.08)] p-2.5 rounded-lg w-fit text-[var(--primary)] mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Society Admins</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                Direct daily administration, tracking finances, and posting circulars.
              </p>
              <ul className="space-y-2 mt-auto text-xs text-[var(--text-secondary)] font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Track billing metrics</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Broadcast notices</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Manage guard shifts</li>
              </ul>
            </div>

            {/* Security Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl flex flex-col hover:border-[var(--border-strong)] transition-all">
              <div className="bg-[rgba(var(--primary-rgb),0.08)] p-2.5 rounded-lg w-fit text-[var(--primary)] mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Security Guards</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                Enforce gate entry rules with camera scans and check-in logs.
              </p>
              <ul className="space-y-2 mt-auto text-xs text-[var(--text-secondary)] font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Scan visitor QR codes</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Log unknown entries</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Record attendance</li>
              </ul>
            </div>

            {/* App Admin Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-xl flex flex-col hover:border-[var(--border-strong)] transition-all">
              <div className="bg-[rgba(var(--primary-rgb),0.08)] p-2.5 rounded-lg w-fit text-[var(--primary)] mb-4">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">App Admins</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                Approve new societies and coordinate platform-wide profiles.
              </p>
              <ul className="space-y-2 mt-auto text-xs text-[var(--text-secondary)] font-medium">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Setup societies</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Handle platform logs</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" /> Manage accounts</li>
              </ul>
            </div>

          </div>
        </section>

        {/* CORE FEATURES */}
        <section id="features" className="py-16 border-t border-[var(--border)]">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Core Platform Capabilities</h2>
            <p className="text-[var(--text-secondary)] text-sm md:text-base max-w-xl mx-auto">
              Everything required to run community workflows in a single optimized package.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <QrCode className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Visitor Management</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Secure check-ins using scanner passes and walk-in logs directly at the guard gate.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <CreditCard className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Maintenance Tracking</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Automated monthly statements, receipts tracking, and direct online billing setups.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <MessageSquare className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Community Communication</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Direct official notices boards, urgent filter flags, and organized feedback tickets.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <Calendar className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Facility Booking</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Reserve clubhouses, tennis courts, and party areas dynamically to avoid double schedules.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <Wallet className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">Society Finance</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Keep track of balances, logs, and penalty invoices in a clear, accessible ledger.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-xl hover:border-[var(--primary)] transition-all shadow-sm">
              <Bot className="w-8 h-8 text-[var(--primary)] mb-4" />
              <h3 className="text-lg font-bold mb-2">AI Assistant</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                OpenAI-powered conversational chatbot to answer community rules and account questions.
              </p>
            </div>

          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 border-t border-[var(--border)]">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Ready to Modernise Your Society?</h2>
            <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">
              Ditch messy WhatsApp groups and paper logbooks. Create an account to register your gated community today.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold px-6 py-3 rounded-lg shadow transition-all active:scale-[0.98]"
            >
              Get Started Free <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border)] py-12 mt-12 text-sm text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-extrabold text-[var(--text-primary)]">Residio</span>
          </div>
          <div className="flex flex-wrap gap-6 font-medium">
            <a href="#privacy" className="hover:text-[var(--primary)] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[var(--primary)] transition-colors">Terms</a>
            <a href="#contact" className="hover:text-[var(--primary)] transition-colors">Contact</a>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Residio. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
