import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Flame,
  Bell,
  CheckSquare,
  Building,
  MapPin,
  BarChart3,
  Layers,
  Users,
  ShieldAlert,
  Activity,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/requests', label: 'My Requests', icon: FileText },
          { to: '/student/requests/new', label: 'Report New Issue', icon: PlusCircle, highlight: true },
          { to: '/student/incidents', label: 'Campus Incidents', icon: Flame },
          { to: '/student/notifications', label: 'Notification Center', icon: Bell },
        ];
      case 'staff':
        return [
          { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
          { to: '/staff/requests', label: 'Assigned Work Queue', icon: CheckSquare },
          { to: '/staff/incidents', label: 'Active Incidents', icon: Flame },
        ];
      case 'department_head':
        return [
          { to: '/department/dashboard', label: 'Department Intelligence', icon: LayoutDashboard },
          { to: '/department/requests', label: 'Department Queue', icon: FileText },
          { to: '/department/incidents', label: 'Active Incidents', icon: Flame },
        ];
      case 'auditor':
        return [
          { to: '/auditor/dashboard', label: 'Compliance Dashboard', icon: LayoutDashboard },
          { to: '/auditor/requests', label: 'Request Directory', icon: FileText },
          { to: '/auditor/incidents', label: 'Active Incidents', icon: Flame },
        ];
      case 'admin':
      default:
        return [
          { to: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
          { to: '/admin/requests', label: 'Master Request Directory', icon: FileText },
          { to: '/admin/incidents', label: 'Incident Operations', icon: Flame },
          { to: '/admin/map', label: 'Geospatial Operations Map', icon: MapPin },
          { to: '/admin/analytics', label: 'Analytics & SLA Metrics', icon: BarChart3 },
          { to: '/admin/services', label: 'Service Catalog', icon: Layers },
          { to: '/admin/users', label: 'Users & Roles', icon: Users },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Active Role Indicator */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              <span>Operational Workspace</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-sm font-bold text-slate-100 capitalize">
              {role?.replace('_', ' ')} Portal
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-glow-brand'
                        : link.highlight
                        ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Health Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Campus SLA Health
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">94.2%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
            AI Engine: Online • Auto-Routing: Active
          </div>
        </div>
      </aside>
    </>
  );
};
