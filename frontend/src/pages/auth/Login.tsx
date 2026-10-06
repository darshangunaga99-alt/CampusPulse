import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES, Role } from '../../auth/roles';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<{ code?: string; message: string; isNetwork?: boolean } | null>(null);

  // Restore remembered email on initial load if available
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('campuspulse_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  // If already authenticated, redirect to appropriate role home or intended destination
  useEffect(() => {
    if (isAuthenticated && user && role) {
      const from = (location.state as any)?.from?.pathname;
      const destination = from && from !== '/login' ? from : ROLE_HOME_ROUTES[role];
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, role, navigate, location]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Campus email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const authenticatedUser = await login({ email: email.trim(), password });
      
      if (rememberMe) {
        localStorage.setItem('campuspulse_remembered_email', email.trim());
      } else {
        localStorage.removeItem('campuspulse_remembered_email');
      }

      // Check if user was redirected from a protected route
      const from = (location.state as any)?.from?.pathname;
      const targetHome = ROLE_HOME_ROUTES[authenticatedUser.role] || '/student/dashboard';
      const destination = from && from !== '/login' ? from : targetHome;
      
      navigate(destination, { replace: true });
    } catch (err: any) {
      const isNet = err.isNetworkError || err.code === 'NETWORK_ERROR';
      const msg =
        err.message ||
        (err.code === 'INVALID_CREDENTIALS'
          ? 'Invalid email or password. Please verify your credentials.'
          : err.code === 'ACCOUNT_INACTIVE'
          ? 'Your account has been deactivated. Please contact campus administration.'
          : isNet
          ? 'Cannot connect to backend server. Please verify the service is running.'
          : 'Authentication failed. Please verify your credentials.');
      
      setServerError({
        code: err.code || (isNet ? 'NETWORK_ERROR' : 'AUTH_FAILED'),
        message: msg,
        isNetwork: isNet,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Seeded demo accounts matching backend database
  const quickLogins: { role: Role; name: string; email: string; pass: string; desc: string }[] = [
    {
      role: 'student',
      name: 'Student',
      email: 'rahul@example.com',
      pass: 'Student123!',
      desc: 'Report issues, track SLA & AI triage',
    },
    {
      role: 'staff',
      name: 'Field Staff',
      email: 'anil.kumar@campuspulse.edu',
      pass: 'Staff123!',
      desc: 'Work queue & update resolution',
    },
    {
      role: 'department_head',
      name: 'Dept Head',
      email: 'it.head@campuspulse.edu',
      pass: 'Head123!',
      desc: 'Dept analytics & workload',
    },
    {
      role: 'admin',
      name: 'Admin Command',
      email: 'admin@campuspulse.edu',
      pass: 'Admin123!',
      desc: 'Command center, Map & SLA tracking',
    },
  ];

  const handleQuickFill = (item: typeof quickLogins[0]) => {
    setEmail(item.email);
    setPassword(item.pass);
    setValidationErrors({});
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-100">
      {/* Background ambient atmospheric lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30">
            CP
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-100">
            Campus<span className="text-indigo-400">Pulse</span>
          </span>
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          INTELLIGENT OPERATIONS PLATFORM
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          AI-Powered Incident Routing, SLA Tracking &amp; Campus Intelligence
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-md">
          
          {/* Server / Authentication Error Display */}
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold mb-0.5">
                  {serverError.isNetwork ? 'Connection Error' : 'Authentication Error'}
                </div>
                <div className="leading-relaxed opacity-90">{serverError.message}</div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Campus Email Address */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                CAMPUS EMAIL ADDRESS
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                    validationErrors.email
                      ? 'border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  placeholder="name@campuspulse.edu"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                PASSWORD
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`block w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all ${
                    validationErrors.password
                      ? 'border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Encrypted Session */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-700 rounded focus:ring-indigo-500 focus:ring-1 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>

              <span className="text-xs text-slate-500">
                Encrypted Session
              </span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Profiles (Hackathon Demo) */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              ONE-CLICK ROLE PROFILES (HACKATHON DEMO)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickFill(item)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              New to CampusPulse?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Register Student Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
