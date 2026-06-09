import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import { Building2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ROLE_PATHS = {
  app_admin: '/app-admin/dashboard',
  society_admin: '/admin/dashboard',
  resident: '/dashboard',
  security: '/security/dashboard',
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    if (!val) {
      setEmailError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) validateEmail(val);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) validatePassword(val);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') validateEmail(email);
    if (field === 'password') validatePassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data, res.data.token);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate(ROLE_PATHS[res.data.role] || '/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
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
          Sign in to your dashboard
        </h2>
      </div>

      <div className="mt-8 w-full max-w-md">
        <div className="bg-[var(--bg-card)] py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-[var(--border)]">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            <div className="modern-form-group">
              <label htmlFor="email" className="modern-label">
                Email Address <span className="required-asterisk">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder="e.g. resident@society.com"
                className={`modern-input ${touched.email && emailError ? 'is-invalid' : touched.email && !emailError ? 'is-valid' : ''}`}
                aria-invalid={touched.email && emailError ? 'true' : 'false'}
                aria-describedby={touched.email && emailError ? 'email-error' : undefined}
                required
              />
              {touched.email && emailError && (
                <span id="email-error" className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {emailError}
                </span>
              )}
            </div>

            <div className="modern-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="password" className="modern-label" style={{ margin: 0 }}>
                  Password <span className="required-asterisk">*</span>
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`modern-input ${touched.password && passwordError ? 'is-invalid' : touched.password && !passwordError ? 'is-valid' : ''}`}
                  aria-invalid={touched.password && passwordError ? 'true' : 'false'}
                  aria-describedby={touched.password && passwordError ? 'password-error' : undefined}
                  style={{ paddingRight: '44px' }}
                  required
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
              {touched.password && passwordError && (
                <span id="password-error" className="modern-error-text" role="alert">
                  <AlertCircle size={14} /> {passwordError}
                </span>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded px-1">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
