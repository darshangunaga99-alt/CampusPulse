import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';
import { hasPermission } from '../../auth/permissions';

interface StitchHeaderProps {
  onSearch?: (query: string) => void;
}

export const StitchHeader: React.FC<StitchHeaderProps> = ({ onSearch }) => {
  const { user, role, logout } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    if (showRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

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

        {/* User Profile Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowRoleDropdown((prev) => !prev)}
            aria-expanded={showRoleDropdown}
            aria-haspopup="true"
            className="flex items-center gap-space-sm bg-surface-container-low pl-space-xs pr-space-md py-space-xs rounded-full cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight truncate max-w-[120px]">
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

          {/* Clean Profile Dropdown (No Persona Switcher) */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 overflow-hidden animate-in fade-in duration-150">
              {/* Authenticated User Info Header */}
              <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low/50">
                <div className="font-headline-sm text-sm font-semibold text-on-surface truncate">
                  {user?.name ?? 'Authenticated User'}
                </div>
                <div className="font-body-sm text-xs text-on-surface-variant truncate mt-0.5">
                  {user?.email ?? 'user@campuspulse.edu'}
                </div>
                {user?.department && (
                  <div className="inline-block mt-2 font-label-sm text-[11px] text-secondary bg-secondary-container/15 border border-secondary/20 px-2 py-0.5 rounded-md font-medium">
                    Dept: {user.department}
                  </div>
                )}
              </div>

              {/* Profile Navigation Option */}
              <div className="py-1 px-2">
                <Link
                  to="/profile"
                  onClick={() => setShowRoleDropdown(false)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2.5 font-medium cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-on-surface-variant">person</span>
                  <span>Profile</span>
                </Link>
              </div>

              {/* Sign Out Option */}
              <div className="border-t border-outline-variant/20 pt-1 px-2">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-error font-semibold flex items-center gap-2.5 hover:bg-error-container/40 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
