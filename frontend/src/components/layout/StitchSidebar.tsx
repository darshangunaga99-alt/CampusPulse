import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export const StitchSidebar: React.FC = () => {
  const location = useLocation();

  const getNavLinkClass = (path: string, exact = false) => {
    const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
    return `flex items-center justify-between px-space-sm py-space-xs transition-colors rounded-lg ${
      isActive
        ? 'bg-primary-container text-on-primary-container font-semibold'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`;
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between overflow-y-auto">
      <div className="p-space-md space-y-space-md">
        {/* Section 1: STUDENT SERVICES */}
        <div className="space-y-space-xs">
          <div className="px-space-sm py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
            STUDENT SERVICES
          </div>
          <nav className="space-y-space-2xs">
            <NavLink
              to="/student/dashboard"
              className={getNavLinkClass('/student/dashboard', true)}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">dashboard</span>
                <span className="font-body-sm text-body-sm">Dashboard</span>
              </div>
            </NavLink>

            <NavLink
              to="/student/requests/new"
              className={getNavLinkClass('/student/requests/new')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">add_task</span>
                <span className="font-body-sm text-body-sm">New Request</span>
              </div>
              <span className="font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container px-space-xs py-space-2xs rounded-full">
                + AI Assist
              </span>
            </NavLink>

            <NavLink
              to="/student/requests"
              className={({ isActive }) =>
                `flex items-center justify-between px-space-sm py-space-xs transition-colors rounded-lg ${
                  isActive && location.pathname === '/student/requests'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">inbox</span>
                <span className="font-body-sm text-body-sm">My Requests</span>
              </div>
              <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high text-on-surface-variant px-space-xs rounded-full">
                12
              </span>
            </NavLink>

            <NavLink
              to="/student/incidents"
              className={getNavLinkClass('/student/incidents')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">warning</span>
                <span className="font-body-sm text-body-sm">Campus Incidents</span>
              </div>
              <span className="font-label-sm text-label-sm bg-error-container text-on-error-container px-space-xs rounded-full">
                2 Active
              </span>
            </NavLink>
          </nav>
        </div>

        {/* Section 2: OPERATIONS & INCIDENTS */}
        <div className="space-y-space-xs">
          <div className="px-space-sm py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
            OPERATIONS &amp; INCIDENTS
          </div>
          <nav className="space-y-space-2xs">
            <NavLink
              to="/admin/incidents"
              className={getNavLinkClass('/admin/incidents')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">emergency</span>
                <span className="font-body-sm text-body-sm">Incident War Room</span>
              </div>
              <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-space-xs rounded-full">
                Live
              </span>
            </NavLink>

            <NavLink
              to="/staff/dashboard"
              className={getNavLinkClass('/staff/dashboard')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">group</span>
                <span className="font-body-sm text-body-sm">Staff Queue</span>
              </div>
            </NavLink>

            <NavLink
              to="/staff/requests"
              className={getNavLinkClass('/staff/requests')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">hub</span>
                <span className="font-body-sm text-body-sm">Smart Dispatch</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Section 3: CAMPUS COMMAND */}
        <div className="space-y-space-xs">
          <div className="px-space-sm py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
            CAMPUS COMMAND
          </div>
          <nav className="space-y-space-2xs">
            <NavLink
              to="/admin/dashboard"
              className={getNavLinkClass('/admin/dashboard')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">analytics</span>
                <span className="font-body-sm text-body-sm">Command Center</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/map"
              className={getNavLinkClass('/admin/map')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">map</span>
                <span className="font-body-sm text-body-sm">Building Health Map</span>
              </div>
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={getNavLinkClass('/admin/analytics')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">insights</span>
                <span className="font-body-sm text-body-sm">Preventive Analytics</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Section 4: SYSTEM */}
        <div className="space-y-space-xs">
          <div className="px-space-sm py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
            SYSTEM
          </div>
          <nav className="space-y-space-2xs">
            <NavLink
              to="/admin/services"
              className={getNavLinkClass('/admin/services')}
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-base">tune</span>
                <span className="font-body-sm text-body-sm">Settings</span>
              </div>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Live AI Engine Active beacon */}
      <div className="p-space-md">
        <div className="p-space-sm bg-tertiary-container text-on-tertiary rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-space-xs mb-space-2xs">
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-ping"></span>
            <span className="font-label-sm text-label-sm font-semibold">CampusPulse AI Engine Active</span>
          </div>
          <p className="font-mono-data-sm text-mono-data-sm text-tertiary-fixed-dim">Correlation Mode: On</p>
        </div>
      </div>
    </aside>
  );
};
