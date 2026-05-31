import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Family management state
  const [family, setFamily] = useState([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [newFamilyForm, setNewFamilyForm] = useState({
    name: '',
    relation: 'spouse',
    phone: '',
    isEmergencyContact: false,
  });

  const loadFamily = async () => {
    try {
      const res = await API.get('/residents/family');
      setFamily(res.data);
    } catch (err) {
      console.error('Failed to load family members:', err);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [noticesRes, maintenanceRes, walletRes, supportRes, pollsRes] = await Promise.all([
          API.get('/notices'),
          API.get('/maintenance/my'),
          API.get('/finances/wallet').catch(() => ({ data: null })),
          API.get('/support').catch(() => ({ data: [] })),
          API.get('/voting/polls').catch(() => ({ data: [] })),
        ]);

        setNotices(noticesRes.data.slice(0, 3));
        setMyRecord(maintenanceRes.data[0] || null);
        setWallet(walletRes.data);
        setTickets(supportRes.data.slice(0, 3));
        setPolls(pollsRes.data.filter((p) => p.status === 'active'));
        await loadFamily();
      } catch (err) {
        console.error('Error loading dashboard data', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const handleAddFamily = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/residents/family', newFamilyForm);
      setFamily(res.data);
      setNewFamilyForm({ name: '', relation: 'spouse', phone: '', isEmergencyContact: false });
      setShowFamilyModal(false);
      toast.success('Family member added successfully!');
    } catch (err) {
      console.error('Failed to add family member', err);
      toast.error('Failed to add family member');
    }
  };

  const handleDeleteFamily = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    try {
      const res = await API.delete(`/residents/family/${memberId}`);
      setFamily(res.data);
      toast.success('Family member removed.');
    } catch (err) {
      console.error('Failed to delete family member', err);
      toast.error('Failed to remove family member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-slate-600 text-sm font-semibold flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading your dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between shadow-lg gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome Home, {user?.name}!</h2>
          <p className="text-white/80 font-medium mt-1">
            Flat {user?.flatNumber || 'N/A'} | Society Resident Portal
          </p>
        </div>
        {wallet && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:text-right border border-white/15">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">SOCIETY WALLET</span>
            <h3 className="text-2xl md:text-3xl font-black mt-0.5">₹{wallet.balance.toLocaleString()}</h3>
          </div>
        )}
      </div>

      {/* 3-Column Core Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Maintenance */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-md font-bold text-slate-800">Maintenance Dues</h3>
            </div>
            {myRecord ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600">
                  Billing Cycle: <span className="text-slate-900 font-bold">{myRecord.month}/{myRecord.year}</span>
                </p>
                <p className="text-2xl font-black text-slate-900">₹{myRecord.amount}</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                    myRecord.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {myRecord.status.toUpperCase()}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No maintenance records logged.</p>
            )}
          </div>
          <Link
            to="/maintenance/my"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-6 inline-flex items-center gap-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded w-fit"
          >
            View Statement & Pay &rarr;
          </Link>
        </div>

        {/* Notices */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-md font-bold text-slate-800">Recent Notices</h3>
            </div>
            {notices.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No announcements posted yet.</p>
            ) : (
              <ul className="space-y-3 list-none">
                {notices.map((n) => (
                  <li key={n._id} className="border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <strong className="text-sm text-slate-950 font-bold hover:text-indigo-600 transition-colors block">
                      {n.title}
                    </strong>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      📅 {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            to="/notices"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-6 inline-flex items-center gap-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded w-fit"
          >
            Open Notice Board &rarr;
          </Link>
        </div>

        {/* Complaints */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-md font-bold text-slate-800">Support Complaints</h3>
            </div>
            {tickets.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No active support complaints.</p>
            ) : (
              <ul className="space-y-3 list-none">
                {tickets.map((t) => (
                  <li key={t._id} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">
                      {t.title || t.subject}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            to="/support/my"
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mt-6 inline-flex items-center gap-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded w-fit"
          >
            File or Track Tickets &rarr;
          </Link>
        </div>
      </div>

      {/* 2-Column Grid: Polls & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Votes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">🗳️ Community Votes</h3>
          {polls.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No active decision polls require your vote.</p>
          ) : (
            <div className="space-y-3">
              {polls.map((p) => (
                <div key={p._id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">{p.title}</strong>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Deadline: {new Date(p.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to="/voting"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                  >
                    Cast Vote
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Operations</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/visitors"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-4 rounded-lg text-center text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
            >
              Log Visitor
            </Link>
            <Link
              to="/visitors/pre-approve"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-4 rounded-lg text-center text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
            >
              Pre-Approve Guest
            </Link>
            <Link
              to="/bookings"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-4 rounded-lg text-center text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
            >
              Book Facility
            </Link>
            <Link
              to="/vault"
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold p-4 rounded-lg text-center text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:-translate-y-0.5 active:translate-y-0"
            >
              Bylaws Vault
            </Link>
          </div>
        </div>
      </div>

      {/* Family Roster */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">👨‍👩‍👧‍👦 Family Members & Emergency Contacts</h3>
            <p className="text-xs text-slate-500 mt-1">Configure emergency links and household registry.</p>
          </div>
          <button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm active:scale-95 self-start sm:self-auto"
            onClick={() => setShowFamilyModal(true)}
          >
            ➕ Add Family Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {family.length > 0 ? (
            family.map((m) => (
              <div
                key={m._id}
                className={`bg-slate-50 border rounded-xl p-5 shadow-sm hover:shadow relative flex flex-col justify-between transition-all ${
                  m.isEmergencyContact ? 'border-rose-300 border-l-4 border-l-rose-500' : 'border-slate-200'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-slate-950 text-md capitalize">{m.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold capitalize mt-1">Relation: {m.relation}</p>
                  <p className="text-xs text-slate-500 mt-1">Phone: {m.phone || 'N/A'}</p>
                  {m.isEmergencyContact && (
                    <span className="inline-flex mt-3 text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                      🚨 EMERGENCY LINK
                    </span>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition-colors focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    onClick={() => handleDeleteFamily(m._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic text-sm col-span-full">No family members registered. Add entries to verify gated approvals.</p>
          )}
        </div>
      </div>

      {/* Add Family Modal */}
      {showFamilyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Family Member</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowFamilyModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFamily} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma"
                  value={newFamilyForm.name}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, name: e.target.value })}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-950"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Relation</label>
                <select
                  value={newFamilyForm.relation}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, relation: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-950"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="elderly">Elderly Parent</option>
                  <option value="tenant">Tenant</option>
                  <option value="dependent">Other Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={newFamilyForm.phone}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, phone: e.target.value })}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-950"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="emergency"
                  type="checkbox"
                  checked={newFamilyForm.isEmergencyContact}
                  onChange={(e) => setNewFamilyForm({ ...newFamilyForm, isEmergencyContact: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="emergency" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                  Mark as Emergency Contact
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  onClick={() => setShowFamilyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
