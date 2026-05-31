import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [societies, setSocieties] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [flatNumbers, setFlatNumbers] = useState([]);
  const [namesForFlat, setNamesForFlat] = useState([]);

  const [activeTab, setActiveTab] = useState('join'); // 'join' or 'create'
  const [role, setRole] = useState('resident'); // 'resident' or 'security'
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [selectedName, setSelectedName] = useState('');

  const [loading, setLoading] = useState(false);

  // Form states
  const [joinForm, setJoinForm] = useState({
    email: '',
    password: '',
    phone: '',
    name: '', // for security
  });

  const [societyRequestForm, setSocietyRequestForm] = useState({
    name: '', // user's name
    email: '',
    password: '',
    phone: '',
    societyName: '',
    address: '',
    city: '',
    totalFlats: '',
    estimatedResidents: '',
    contactNumber: '',
    proofDocument: '',
    description: '',
  });

  useEffect(() => {
    API.get('/societies').then((res) => setSocieties(res.data));
  }, []);

  // Fetch whitelist members when society is selected
  useEffect(() => {
    if (selectedSocietyId && role === 'resident') {
      API.get(`/societies/${selectedSocietyId}/available-residents`)
        .then((res) => {
          setAvailableMembers(res.data);
          const flats = [...new Set(res.data.map((m) => m.houseNo))];
          setFlatNumbers(flats.sort());
          setSelectedFlat('');
          setSelectedName('');
          setNamesForFlat([]);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to fetch resident whitelist');
        });
    } else {
      setAvailableMembers([]);
      setFlatNumbers([]);
      setSelectedFlat('');
      setSelectedName('');
      setNamesForFlat([]);
    }
  }, [selectedSocietyId, role]);

  // Update names list when flat is selected
  useEffect(() => {
    if (selectedFlat) {
      const names = availableMembers
        .filter((m) => m.houseNo === selectedFlat)
        .map((m) => m.name);
      setNamesForFlat(names);
      setSelectedName('');
    } else {
      setNamesForFlat([]);
      setSelectedName('');
    }
  }, [selectedFlat, availableMembers]);

  const handleJoinChange = (e) => {
    setJoinForm({ ...joinForm, [e.target.name]: e.target.value });
  };

  const handleSocietyRequestChange = (e) => {
    setSocietyRequestForm({ ...societyRequestForm, [e.target.name]: e.target.value });
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'resident' && (!selectedSocietyId || !selectedFlat || !selectedName)) {
      toast.error('Please select your society, flat, and name.');
      setLoading(false);
      return;
    }
    if (role === 'security' && !selectedSocietyId) {
      toast.error('Please select a society.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...joinForm,
        role,
        societyId: selectedSocietyId,
        flatNumber: role === 'resident' ? selectedFlat : undefined,
        name: role === 'resident' ? selectedName : joinForm.name,
      };

      const res = await API.post('/auth/register', payload);
      toast.success(res.data.message || 'Registration successful! Request pending admin approval.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocietyRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/register-society-request', societyRequestForm);
      toast.success(res.data.message || 'Society request submitted successfully! Pending approval.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Society request submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="text-3xl font-extrabold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
          🏢 SocietyApp
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 w-full" style={{ maxWidth: activeTab === 'create' ? '640px' : '480px' }}>
        <div className="bg-white py-8 px-6 shadow-md sm:rounded-xl border border-slate-200">
          
          {/* Dual Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
            <button
              type="button"
              onClick={() => {
                setActiveTab('join');
              }}
              className={`flex-1 text-center py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeTab === 'join'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Join Existing Society
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
              }}
              className={`flex-1 text-center py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                activeTab === 'create'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Propose New Society
            </button>
          </div>

          {activeTab === 'join' ? (
            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                >
                  <option value="resident">Resident</option>
                  <option value="security">Security Guard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Society</label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                >
                  <option value="">-- Choose Your Society --</option>
                  {societies.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              {role === 'resident' && selectedSocietyId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Select Flat / House No</label>
                    <select
                      value={selectedFlat}
                      onChange={(e) => setSelectedFlat(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                    >
                      <option value="">-- Select Flat --</option>
                      {flatNumbers.map((flat) => (
                        <option key={flat} value={flat}>
                          {flat}
                        </option>
                      ))}
                    </select>
                    {flatNumbers.length === 0 && (
                      <p className="text-xs text-rose-600 mt-1">
                        No unregistered flats available. Admin must pre-add your entry first.
                      </p>
                    )}
                  </div>

                  {selectedFlat && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Select Your Name</label>
                      <select
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                      >
                        <option value="">-- Select Your Name --</option>
                        {namesForFlat.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {role === 'security' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Ram Singh"
                    onChange={handleJoinChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. user@domain.com"
                  onChange={handleJoinChange}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleJoinChange}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  name="phone"
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  onChange={handleJoinChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] mt-2"
              >
                {loading ? 'Submitting request...' : 'Submit Join Request'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSocietyRequestSubmit} className="space-y-5">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2">
                Admin Personal Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Admin Full Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={societyRequestForm.name}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. admin@society.com"
                    value={societyRequestForm.email}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={societyRequestForm.password}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    name="phone"
                    type="text"
                    placeholder="e.g. +91 9999988888"
                    value={societyRequestForm.phone}
                    onChange={handleSocietyRequestChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-slate-200 pb-2 pt-4">
                Society/Community Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Society Name</label>
                  <input
                    name="societyName"
                    type="text"
                    placeholder="e.g. Green Valley Apartments"
                    value={societyRequestForm.societyName}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input
                    name="city"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={societyRequestForm.city}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  name="address"
                  type="text"
                  placeholder="e.g. Sector-4, Dwarka, Plot 12"
                  value={societyRequestForm.address}
                  onChange={handleSocietyRequestChange}
                  required
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Flats</label>
                  <input
                    name="totalFlats"
                    type="number"
                    placeholder="e.g. 120"
                    value={societyRequestForm.totalFlats}
                    onChange={handleSocietyRequestChange}
                    required
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Est. Residents</label>
                  <input
                    name="estimatedResidents"
                    type="number"
                    placeholder="e.g. 450"
                    value={societyRequestForm.estimatedResidents}
                    onChange={handleSocietyRequestChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Society Phone</label>
                  <input
                    name="contactNumber"
                    type="text"
                    placeholder="e.g. 011-2345678"
                    value={societyRequestForm.contactNumber}
                    onChange={handleSocietyRequestChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Proof Doc Link</label>
                  <input
                    name="proofDocument"
                    type="text"
                    placeholder="e.g. https://link-to-doc.com/doc.pdf"
                    value={societyRequestForm.proofDocument}
                    onChange={handleSocietyRequestChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe your society operations..."
                  value={societyRequestForm.description}
                  onChange={handleSocietyRequestChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
              >
                {loading ? 'Submitting society request...' : 'Propose New Society'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-1">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
