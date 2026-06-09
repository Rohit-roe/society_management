import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { Building2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Join Form states & validations
  const [joinForm, setJoinForm] = useState({
    email: '',
    password: '',
    phone: '',
    name: '', // for security
  });
  const [joinErrors, setJoinErrors] = useState({});
  const [joinTouched, setJoinTouched] = useState({});

  // Society Request form states & validations
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
  const [requestErrors, setRequestErrors] = useState({});
  const [requestTouched, setRequestTouched] = useState({});

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

  // Inline validation for Join Form
  const validateJoinField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Invalid email format';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    } else if (name === 'name') {
      if (role === 'security' && !value) {
        error = 'Full name is required';
      }
    } else if (name === 'phone') {
      if (value && !/^\+?[0-9\s-]{10,15}$/.test(value)) {
        error = 'Please enter a valid phone number (min 10 digits)';
      }
    }
    setJoinErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinForm((prev) => ({ ...prev, [name]: value }));
    if (joinTouched[name]) {
      validateJoinField(name, value);
    }
  };

  const handleJoinBlur = (name) => {
    setJoinTouched((prev) => ({ ...prev, [name]: true }));
    validateJoinField(name, joinForm[name]);
  };

  // Inline validation for Society Request Form
  const validateRequestField = (name, value) => {
    let error = '';
    if (['name', 'email', 'password', 'societyName', 'city', 'address', 'totalFlats'].includes(name) && !value) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
    } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email format';
    } else if (name === 'password' && value && value.length < 6) {
      error = 'Password must be at least 6 characters';
    } else if (name === 'totalFlats' && value && Number(value) <= 0) {
      error = 'Total flats must be greater than 0';
    } else if (name === 'phone' || name === 'contactNumber') {
      if (value && !/^\+?[0-9\s-]{8,15}$/.test(value)) {
        error = 'Please enter a valid contact number';
      }
    }
    setRequestErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleSocietyRequestChange = (e) => {
    const { name, value } = e.target;
    setSocietyRequestForm((prev) => ({ ...prev, [name]: value }));
    if (requestTouched[name]) {
      validateRequestField(name, value);
    }
  };

  const handleRequestBlur = (name) => {
    setRequestTouched((prev) => ({ ...prev, [name]: true }));
    validateRequestField(name, societyRequestForm[name]);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const fields = ['email', 'password', 'phone'];
    if (role === 'security') fields.push('name');
    const newTouched = {};
    fields.forEach((f) => {
      newTouched[f] = true;
    });
    setJoinTouched(newTouched);

    let isValid = true;
    fields.forEach((f) => {
      if (!validateJoinField(f, joinForm[f])) {
        isValid = false;
      }
    });

    if (role === 'resident' && (!selectedSocietyId || !selectedFlat || !selectedName)) {
      toast.error('Please select your society, flat, and name.');
      return;
    }
    if (role === 'security' && !selectedSocietyId) {
      toast.error('Please select a society.');
      return;
    }

    if (!isValid) {
      toast.error('Please fix the validation errors in the form.');
      return;
    }

    setLoading(true);
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

    // Mark all fields touched
    const fields = ['name', 'email', 'password', 'phone', 'societyName', 'city', 'address', 'totalFlats', 'contactNumber', 'proofDocument', 'description'];
    const newTouched = {};
    fields.forEach((f) => {
      newTouched[f] = true;
    });
    setRequestTouched(newTouched);

    let isValid = true;
    fields.forEach((f) => {
      if (!validateRequestField(f, societyRequestForm[f])) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error('Please fix the validation errors in the form.');
      return;
    }

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
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="text-3xl font-extrabold text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-lg px-2 py-1 inline-flex items-center gap-2">
          <Building2 className="w-8 h-8" /> Residio
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 w-full" style={{ maxWidth: '640px' }}>
        <div className="bg-[var(--bg-card)] py-8 px-6 shadow-md sm:rounded-xl border border-[var(--border)]">
          
          {/* Dual Tabs */}
          <div className="flex bg-[var(--bg-primary)] p-1 rounded-lg mb-8">
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`flex-1 text-center py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                activeTab === 'join'
                  ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Join Existing Society
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 text-center py-2 px-3 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                activeTab === 'create'
                  ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Propose New Society
            </button>
          </div>

          {activeTab === 'join' ? (
            <form onSubmit={handleJoinSubmit} className="space-y-5 px-4 sm:px-8" noValidate>
              <div className="modern-form-group">
                <label className="modern-label">Select Role <span className="required-asterisk">*</span></label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="modern-input"
                >
                  <option value="resident">Resident</option>
                  <option value="security">Security Guard</option>
                </select>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Select Society <span className="required-asterisk">*</span></label>
                <select
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                  required
                  className="modern-input"
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
                <div className="modern-form-grid">
                  <div className="modern-form-group">
                    <label className="modern-label">Select Flat / House No <span className="required-asterisk">*</span></label>
                    <select
                      value={selectedFlat}
                      onChange={(e) => setSelectedFlat(e.target.value)}
                      required
                      className="modern-input"
                    >
                      <option value="">-- Select Flat --</option>
                      {flatNumbers.map((flat) => (
                        <option key={flat} value={flat}>
                          {flat}
                        </option>
                      ))}
                    </select>
                    {flatNumbers.length === 0 && (
                      <p className="modern-error-text">
                        No unregistered flats available. Admin must pre-add your entry first.
                      </p>
                    )}
                  </div>

                  {selectedFlat && (
                    <div className="modern-form-group">
                      <label className="modern-label">Select Your Name <span className="required-asterisk">*</span></label>
                      <select
                        value={selectedName}
                        onChange={(e) => setSelectedName(e.target.value)}
                        required
                        className="modern-input"
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
                <div className="modern-form-group">
                  <label className="modern-label">Full Name <span className="required-asterisk">*</span></label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Ram Singh"
                    value={joinForm.name}
                    onChange={handleJoinChange}
                    onBlur={() => handleJoinBlur('name')}
                    required
                    className={`modern-input ${joinTouched.name && joinErrors.name ? 'is-invalid' : joinTouched.name && !joinErrors.name ? 'is-valid' : ''}`}
                  />
                  {joinTouched.name && joinErrors.name && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {joinErrors.name}
                    </span>
                  )}
                </div>
              )}

              <div className="modern-form-group">
                <label className="modern-label">Email Address <span className="required-asterisk">*</span></label>
                <input
                  name="email"
                  type="email"
                  placeholder="e.g. user@domain.com"
                  value={joinForm.email}
                  onChange={handleJoinChange}
                  onBlur={() => handleJoinBlur('email')}
                  required
                  className={`modern-input ${joinTouched.email && joinErrors.email ? 'is-invalid' : joinTouched.email && !joinErrors.email ? 'is-valid' : ''}`}
                />
                {joinTouched.email && joinErrors.email && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {joinErrors.email}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Password <span className="required-asterisk">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="•••••••• (Min 6 chars)"
                    value={joinForm.password}
                    onChange={handleJoinChange}
                    onBlur={() => handleJoinBlur('password')}
                    required
                    className={`modern-input ${joinTouched.password && joinErrors.password ? 'is-invalid' : joinTouched.password && !joinErrors.password ? 'is-valid' : ''}`}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {joinTouched.password && joinErrors.password && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {joinErrors.password}
                  </span>
                )}
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Phone Number</label>
                <input
                  name="phone"
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={joinForm.phone}
                  onChange={handleJoinChange}
                  onBlur={() => handleJoinBlur('phone')}
                  className={`modern-input ${joinTouched.phone && joinErrors.phone ? 'is-invalid' : joinTouched.phone && !joinErrors.phone ? 'is-valid' : ''}`}
                />
                {joinTouched.phone && joinErrors.phone ? (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {joinErrors.phone}
                  </span>
                ) : (
                  <span className="modern-helper-text">Optional. Enter standard mobile number.</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting request...
                  </span>
                ) : (
                  'Submit Join Request'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSocietyRequestSubmit} className="space-y-5" noValidate>
              <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2">
                Admin Personal Details
              </h3>
              
              <div className="modern-form-grid">
                <div className="modern-form-group">
                  <label className="modern-label">Admin Full Name <span className="required-asterisk">*</span></label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={societyRequestForm.name}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('name')}
                    required
                    className={`modern-input ${requestTouched.name && requestErrors.name ? 'is-invalid' : requestTouched.name && !requestErrors.name ? 'is-valid' : ''}`}
                  />
                  {requestTouched.name && requestErrors.name && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.name}
                    </span>
                  )}
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Email Address <span className="required-asterisk">*</span></label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. admin@society.com"
                    value={societyRequestForm.email}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('email')}
                    required
                    className={`modern-input ${requestTouched.email && requestErrors.email ? 'is-invalid' : requestTouched.email && !requestErrors.email ? 'is-valid' : ''}`}
                  />
                  {requestTouched.email && requestErrors.email && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="modern-form-grid">
                <div className="modern-form-group">
                  <label className="modern-label">Password <span className="required-asterisk">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="•••••••• (Min 6 chars)"
                      value={societyRequestForm.password}
                      onChange={handleSocietyRequestChange}
                      onBlur={() => handleRequestBlur('password')}
                      required
                      className={`modern-input ${requestTouched.password && requestErrors.password ? 'is-invalid' : requestTouched.password && !requestErrors.password ? 'is-valid' : ''}`}
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {requestTouched.password && requestErrors.password && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.password}
                    </span>
                  )}
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Phone Number</label>
                  <input
                    name="phone"
                    type="text"
                    placeholder="e.g. 9999988888"
                    value={societyRequestForm.phone}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('phone')}
                    className={`modern-input ${requestTouched.phone && requestErrors.phone ? 'is-invalid' : requestTouched.phone && !requestErrors.phone ? 'is-valid' : ''}`}
                  />
                  {requestTouched.phone && requestErrors.phone && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.phone}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider border-b border-[var(--border)] pb-2 pt-4">
                Society/Community Information
              </h3>

              <div className="modern-form-grid">
                <div className="modern-form-group">
                  <label className="modern-label">Society Name <span className="required-asterisk">*</span></label>
                  <input
                    name="societyName"
                    type="text"
                    placeholder="e.g. Green Valley Apartments"
                    value={societyRequestForm.societyName}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('societyName')}
                    required
                    className={`modern-input ${requestTouched.societyName && requestErrors.societyName ? 'is-invalid' : requestTouched.societyName && !requestErrors.societyName ? 'is-valid' : ''}`}
                  />
                  {requestTouched.societyName && requestErrors.societyName && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.societyName}
                    </span>
                  )}
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">City <span className="required-asterisk">*</span></label>
                  <input
                    name="city"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={societyRequestForm.city}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('city')}
                    required
                    className={`modern-input ${requestTouched.city && requestErrors.city ? 'is-invalid' : requestTouched.city && !requestErrors.city ? 'is-valid' : ''}`}
                  />
                  {requestTouched.city && requestErrors.city && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.city}
                    </span>
                  )}
                </div>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Full Address <span className="required-asterisk">*</span></label>
                <input
                  name="address"
                  type="text"
                  placeholder="e.g. Sector-4, Dwarka, Plot 12"
                  value={societyRequestForm.address}
                  onChange={handleSocietyRequestChange}
                  onBlur={() => handleRequestBlur('address')}
                  required
                  className={`modern-input ${requestTouched.address && requestErrors.address ? 'is-invalid' : requestTouched.address && !requestErrors.address ? 'is-valid' : ''}`}
                />
                {requestTouched.address && requestErrors.address && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {requestErrors.address}
                  </span>
                )}
              </div>

              <div className="modern-form-grid">
                <div className="modern-form-group">
                  <label className="modern-label">Number of Flats <span className="required-asterisk">*</span></label>
                  <input
                    name="totalFlats"
                    type="number"
                    placeholder="e.g. 120"
                    value={societyRequestForm.totalFlats}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('totalFlats')}
                    required
                    className={`modern-input ${requestTouched.totalFlats && requestErrors.totalFlats ? 'is-invalid' : requestTouched.totalFlats && !requestErrors.totalFlats ? 'is-valid' : ''}`}
                  />
                  {requestTouched.totalFlats && requestErrors.totalFlats && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.totalFlats}
                    </span>
                  )}
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Est. Residents</label>
                  <input
                    name="estimatedResidents"
                    type="number"
                    placeholder="e.g. 450"
                    value={societyRequestForm.estimatedResidents}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('estimatedResidents')}
                    className={`modern-input ${requestTouched.estimatedResidents && requestErrors.estimatedResidents ? 'is-invalid' : requestTouched.estimatedResidents && !requestErrors.estimatedResidents ? 'is-valid' : ''}`}
                  />
                  {requestTouched.estimatedResidents && requestErrors.estimatedResidents && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.estimatedResidents}
                    </span>
                  )}
                </div>
              </div>

              <div className="modern-form-grid">
                <div className="modern-form-group">
                  <label className="modern-label">Society Phone</label>
                  <input
                    name="contactNumber"
                    type="text"
                    placeholder="e.g. 011-2345678"
                    value={societyRequestForm.contactNumber}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('contactNumber')}
                    className={`modern-input ${requestTouched.contactNumber && requestErrors.contactNumber ? 'is-invalid' : requestTouched.contactNumber && !requestErrors.contactNumber ? 'is-valid' : ''}`}
                  />
                  {requestTouched.contactNumber && requestErrors.contactNumber && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.contactNumber}
                    </span>
                  )}
                </div>
                <div className="modern-form-group">
                  <label className="modern-label">Proof Doc Link</label>
                  <input
                    name="proofDocument"
                    type="text"
                    placeholder="e.g. https://link-to-doc.com/doc.pdf"
                    value={societyRequestForm.proofDocument}
                    onChange={handleSocietyRequestChange}
                    onBlur={() => handleRequestBlur('proofDocument')}
                    className={`modern-input ${requestTouched.proofDocument && requestErrors.proofDocument ? 'is-invalid' : requestTouched.proofDocument && !requestErrors.proofDocument ? 'is-valid' : ''}`}
                  />
                  {requestTouched.proofDocument && requestErrors.proofDocument && (
                    <span className="modern-error-text" role="alert">
                      <AlertCircle size={14} /> {requestErrors.proofDocument}
                    </span>
                  )}
                </div>
              </div>

              <div className="modern-form-group">
                <label className="modern-label">Brief Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe your society operations..."
                  value={societyRequestForm.description}
                  onChange={handleSocietyRequestChange}
                  onBlur={() => handleRequestBlur('description')}
                  className={`modern-input ${requestTouched.description && requestErrors.description ? 'is-invalid' : requestTouched.description && !requestErrors.description ? 'is-valid' : ''}`}
                />
                {requestTouched.description && requestErrors.description && (
                  <span className="modern-error-text" role="alert">
                    <AlertCircle size={14} /> {requestErrors.description}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting society request...
                  </span>
                ) : (
                  'Propose New Society'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded px-1">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
