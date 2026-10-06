import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Shield, Zap, Sparkles, CheckCircle } from 'lucide-react';
import { Role } from '../../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRolePreview } = useAuth();

  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('SecurePassword123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await login({ email, password });
      // Redirect according to role
      if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else if (user.role === 'department_head') navigate('/department/dashboard');
      else navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogins: { role: Role; name: string; email: string; desc: string }[] = [
    { role: 'student', name: 'Student', email: 'rahul@example.com', desc: 'Report issues, track SLA & AI triage' },
    { role: 'staff', name: 'Field Staff', email: 'anil.staff@campus.edu', desc: 'Work queue & update resolution' },
    { role: 'department_head', name: 'Dept Head', email: 'priya.head@campus.edu', desc: 'Dept analytics & workload' },
    { role: 'admin', name: 'Admin Command', email: 'admin.ops@campus.edu', desc: 'Command center, Map & SLA tracking' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-glow-brand">
            CP
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-100">
            Campus<span className="text-indigo-400">Pulse</span>
          </span>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          Intelligent Operations Platform
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          AI-Powered Incident Routing, SLA Tracking & Campus Intelligence
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-md">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@campus.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-glow-brand"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Mock Login Profiles for Hackathon Judges */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Role Profiles (Hackathon Demo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickLogins.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setEmail(item.email);
                    setPassword('SecurePassword123');
                    switchRolePreview(item.role);
                    if (item.role === 'student') navigate('/student/dashboard');
                    else if (item.role === 'staff') navigate('/staff/dashboard');
                    else if (item.role === 'department_head') navigate('/department/dashboard');
                    else navigate('/admin/dashboard');
                  }}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight truncate">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              New to CampusPulse?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Register Student Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
