import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  Shield, 
  CreditCard, 
  Bell, 
  FileText, 
  CheckCircle, 
  User, 
  Users, 
  Calendar, 
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* AMBIENT GLOW EFFECTS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      {/* NAVBAR */}
      <header className="border-b border-slate-900 sticky top-0 z-50 backdrop-blur-md bg-[#0b0c10]/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-white flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-2 py-1">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="tracking-tight font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Residio</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-400 hover:text-white font-medium text-sm transition-colors duration-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-800 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4.5 py-2 rounded-lg shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b0c10]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Copy & CTAs */}
          <div className="flex flex-col space-y-6 lg:max-w-xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Society Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Manage your society. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Built for modern living.
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
              Residio brings security, transparency, and convenience to your community. Automate maintenance dues, secure visitor checks, and centralize communication in a gorgeous digital portal designed for modern residents.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0b0c10]"
              >
                Get Started Free 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/login"
                className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-base px-8 py-3.5 rounded-xl transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-slate-800"
              >
                Sign In
              </Link>
            </div>
            
            {/* Key Value Props */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-6 border-t border-slate-900 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-500" /> Fully Responsive
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-500" /> Role-Based Portals
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-indigo-500" /> Integrated Razorpay
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: The High-Fidelity App Preview Mockup */}
          <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[520px] flex items-center justify-center">
            
            {/* Outer blur effect behind window */}
            <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-2xl -z-10 transform translate-x-4 translate-y-4 scale-95" />
            
            {/* Floating Glass Window Mockup */}
            <div className="w-full h-full bg-[#12141a]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans select-none text-left">
              
              {/* Fake App Window Titlebar */}
              <div className="bg-[#161920] px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="text-xs text-slate-500 font-semibold bg-slate-900/60 px-4 py-1 rounded-full border border-slate-800/40">
                  app.residio.in/resident/dashboard
                </div>
                <div className="w-12" />
              </div>

              {/* Fake App Main Container */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* Fake App Sidebar */}
                <div className="w-44 bg-[#12141a] border-r border-slate-800/40 p-4 flex flex-col justify-between hidden sm:flex">
                  <div className="space-y-5">
                    {/* User profile capsule */}
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                        R
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-200 truncate">Rohit Reddy</p>
                        <p className="text-[10px] text-indigo-400 font-medium">Flat A-402</p>
                      </div>
                    </div>

                    {/* Navigation list */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-2.5">
                        Overview
                      </div>
                      <div className="bg-indigo-600/10 text-indigo-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-indigo-500/15">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        Dashboard
                      </div>
                      <div className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        Gate Approvals
                      </div>
                      <div className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        Finance Ledger
                      </div>
                      <div className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        Notice Board
                      </div>
                    </div>
                  </div>

                  {/* Sidebar bottom */}
                  <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                    <p className="text-[10px] text-slate-500 text-center font-medium">Society: Mandadi Mansion</p>
                  </div>
                </div>

                {/* Fake App Main Viewport */}
                <div className="flex-1 bg-[#16181f]/40 p-5 overflow-y-auto space-y-5">
                  
                  {/* Mock Dashboard Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/40">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Welcome back, Rohit! <span className="animate-pulse">👋</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Society updates for Mandadi Mansion</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer relative">
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    </div>
                  </div>

                  {/* Grid Content */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Card 1: Maintenance Dues */}
                    <div className="bg-[#12141a]/60 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Maintenance</p>
                          <h4 className="text-base font-extrabold text-white mt-1">₹4,500</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5">Due date: June 15, 2026</p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                          PAID
                        </span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">Transaction Ref: TXN-89021</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    {/* Card 2: Gate Approvals */}
                    <div className="bg-[#12141a]/60 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recent Visitor</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-[9px]">
                            DK
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200">Dev Kumar</p>
                            <p className="text-[9px] text-slate-500">Visitor Pass ID: #G-201</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3.5 pt-2.5 border-t border-slate-800/40 flex items-center justify-between text-[9px]">
                        <span className="text-indigo-400 font-medium">Checked-in: 10:14 AM</span>
                        <span className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold">ACTIVE</span>
                      </div>
                    </div>

                  </div>

                  {/* Recent Notice Snippet */}
                  <div className="bg-[#12141a]/40 border border-slate-800/60 p-4 rounded-xl hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latest Circular</p>
                    </div>
                    <h5 className="text-xs font-bold text-slate-200">Scheduled Water Supply Maintenance</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Water supply will be temporarily suspended on June 11 from 10:00 AM to 02:00 PM for pipeline repairs. Please plan accordingly.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                      <span>Posted by: Society Admin</span>
                      <span>•</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>

                </div>
                
              </div>
            </div>
            
          </div>
          
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-[#0b0c10]/40 py-10 mt-10 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/10 p-1.5 rounded-lg text-indigo-400 border border-indigo-500/15">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-white tracking-tight">Residio</span>
          </div>
          <div className="flex gap-6 text-xs font-medium text-slate-400">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Residio. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
