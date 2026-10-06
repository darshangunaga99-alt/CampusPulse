import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
  CheckCircle,
  Activity,
  Menu,
} from 'lucide-react';
import { getNotifications, markNotificationRead } from '../../api/notifications';
import { NotificationItem, Role } from '../../types';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, switchRolePreview, role } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications({ limit: 5 });
        setNotifications(data.items);
        setUnreadCount(data.unread_count);
      } catch {
        // Fallback gracefully
      }
    };
    fetchNotifs();
  }, [role]);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignored
    }
  };

  const handleRoleChange = (newRole: Role) => {
    switchRolePreview(newRole);
    setShowRoleSelector(false);
    if (newRole === 'student') navigate('/student/dashboard');
    else if (newRole === 'staff') navigate('/staff/dashboard');
    else if (newRole === 'department_head') navigate('/department/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'auditor') navigate('/admin/analytics');
  };

  const rolesList: { role: Role; label: string }[] = [
    { role: 'student', label: 'Student (Rahul Kumar)' },
    { role: 'staff', label: 'Field Staff (Anil Sharma)' },
    { role: 'department_head', label: 'Dept Head (Dr. Priya Sundaram)' },
    { role: 'admin', label: 'Ops Admin (Vikram Mehta)' },
    { role: 'auditor', label: 'Compliance Auditor (Sneha Patel)' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
      {/* Left branding / sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-base shadow-glow-brand">
            CP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-100">
                Campus<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 API
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right toolbar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Hackathon Role Switcher Preview Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 text-xs text-indigo-300 hover:bg-indigo-900/40 transition-all font-medium"
            title="Preview different roles during evaluation"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Role:</span>
            <span className="font-semibold uppercase tracking-wider text-indigo-200">
              {role?.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-800 mb-1">
                Quick Role Switcher (Evaluation Mode)
              </div>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleChange(item.role)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                    role === item.role
                      ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {role === item.role && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Notifications ({unreadCount} unread)
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setShowNotifs(false);
                    navigate(`/${role === 'student' ? 'student' : 'staff'}/notifications`);
                  }}
                  className="text-[11px] text-indigo-400 hover:underline"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                          : 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CP'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
