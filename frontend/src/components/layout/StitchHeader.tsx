/**
 * CampusPulse — StitchHeader
 *
 * The top navigation bar. Includes:
 * - Brand logo / version
 * - Global search
 * - Campus health score (admin only)
 * - Notifications bell (role-aware destination)
 * - Persona switcher (dev convenience) — shows all 5 roles
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME_ROUTES, ROLE_LABELS } from '../../auth/roles';
import { hasPermission } from '../../auth/permissions';
import type { Role } from '../../auth/roles';

interface StitchHeaderProps {
  onSearch?: (query: string) => void;
}

// Persona entries for the dev switcher
const PERSONAS: { role: Role; label: string; subtitle: string }[] = [
  { role: 'student', label: 'Student View', subtitle: 'Rahul Kumar · CS Dept' },
  { role: 'staff', label: 'Staff & Dispatch Queue', subtitle: 'Anil Sharma · IT' },
  { role: 'department_head', label: 'Department Head', subtitle: 'Dr. Priya Sundaram · IT Support' },
  { role: 'admin', label: 'Campus Command / Admin', subtitle: 'Vikram Mehta · Operations' },
  { role: 'auditor', label: 'Compliance Auditor', subtitle: 'Sneha Patel · Quality Cell' },
];

export const StitchHeader: React.FC<StitchHeaderProps> = ({ onSearch }) => {
  const { user, role, switchRolePreview } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) onSearch(searchVal);
  };

  const currentRole = role ?? 'student';

  // Notification destination per role
  const notifLink =
    currentRole === 'student'
      ? '/student/notifications'
      : currentRole === 'admin'
      ? '/admin/dashboard'
      : '/staff/dashboard';

  // Health score link only for admin
  const showHealthScore = hasPermission(currentRole, 'view_campus_analytics');

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-space-lg">
      {/* Brand & Version Badge */}
      <div className="flex items-center gap-space-md w-72 shrink-0">
        <Link to="/" className="flex items-center gap-space-sm group">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              CampusPulse
            </span>
            <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high text-on-surface-variant px-space-xs py-space-2xs rounded">
              OPS COMMAND v2.4
            </span>
          </div>
        </Link>
      </div>

      {/* Global Search Bar (⌘K) */}
      <div className="flex-1 max-w-xl mx-space-lg">
        <div className="relative flex items-center w-full bg-surface-container-low rounded-xl px-space-md py-space-xs shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <span className="material-symbols-outlined text-on-surface-variant text-lg mr-space-xs">
            search
          </span>
          <input
            className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60"
            placeholder={
              currentRole === 'student'
                ? 'Search your tickets, incidents...'
                : 'Search tickets, incidents, staff, buildings...'
            }
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            type="text"
          />
          <div className="flex items-center gap-space-2xs ml-space-xs">
            <kbd className="font-mono-data-sm text-mono-data-sm bg-surface-container-lowest text-on-surface-variant px-space-xs py-space-2xs rounded shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-space-md shrink-0">
        {/* System status — shown to all */}
        <div className="hidden xl:flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>99.8% Systems Operational</span>
        </div>

        {/* Campus Health Score — admin only */}
        {showHealthScore && (
          <Link
            to="/admin/dashboard"
            className="hidden lg:flex items-center gap-space-xs bg-surface-container px-space-sm py-space-2xs rounded-full"
          >
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Health:
            </span>
            <span className="font-mono-data-sm text-mono-data-sm font-semibold text-secondary">
              87/100
            </span>
          </Link>
        )}

        {/* Notifications */}
        <Link
          to={notifLink}
          className="relative p-space-xs rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-1 right-1 font-mono-data-sm text-mono-data-sm bg-error text-on-error w-4 h-4 rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </Link>

        {/* Role badge chip */}
        <div className="hidden lg:flex items-center gap-space-xs px-space-sm py-space-2xs bg-surface-container rounded-full">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">badge</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {ROLE_LABELS[currentRole]}
          </span>
        </div>

        {/* User / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-space-sm bg-surface-container-low pl-space-xs pr-space-md py-space-xs rounded-full cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                {user?.name ?? 'User'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                {ROLE_LABELS[currentRole]}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">
              unfold_more
            </span>
          </button>

          {/* Persona Switch Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high py-2 z-50">
              <div className="px-4 py-2 border-b border-surface-container-high">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
                  Switch Persona (Dev Preview)
                </p>
              </div>
              {PERSONAS.map(({ role: pRole, label, subtitle }) => (
                <button
                  key={pRole}
                  onClick={() => {
                    switchRolePreview(pRole);
                    setShowRoleDropdown(false);
                    navigate(ROLE_HOME_ROUTES[pRole]);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentRole === pRole
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <div>
                    <div className="font-label-md text-label-md">{label}</div>
                    <div className="font-label-sm text-label-sm opacity-70">{subtitle}</div>
                  </div>
                  {currentRole === pRole && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
