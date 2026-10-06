import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface StitchHeaderProps {
  onSearch?: (query: string) => void;
}

export const StitchHeader: React.FC<StitchHeaderProps> = ({ onSearch }) => {
  const { user, role, switchRolePreview } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onSearch) onSearch(searchVal);
    }
  };

  const roleDisplayNames: Record<string, string> = {
    student: 'Student / Ops Admin',
    staff: 'Field Specialist / Staff',
    admin: 'Ops Commander / Admin',
  };

  const currentRole = role || 'student';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-space-lg">
      {/* Brand & Version Badge */}
      <div className="flex items-center gap-space-md w-72 shrink-0">
        <Link to="/" className="flex items-center gap-space-sm group">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">CampusPulse</span>
            <span className="font-mono-data-sm text-mono-data-sm bg-surface-container-high text-on-surface-variant px-space-xs py-space-2xs rounded">
              OPS COMMAND v2.4
            </span>
          </div>
        </Link>
      </div>

      {/* Global Search Bar (⌘K) */}
      <div className="flex-1 max-w-xl mx-space-lg">
        <div className="relative flex items-center w-full bg-surface-container-low rounded-xl px-space-md py-space-xs shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
          <span className="material-symbols-outlined text-on-surface-variant text-lg mr-space-xs">search</span>
          <input
            className="w-full bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60"
            placeholder="Search tickets, master incidents, staff, buildings..."
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

      {/* Right Stats & Profile Controls */}
      <div className="flex items-center gap-space-md shrink-0">
        <div className="hidden xl:flex items-center gap-space-xs font-mono-data-sm text-mono-data-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>99.8% Systems Operational</span>
        </div>

        <Link
          to="/admin/dashboard"
          className="hidden lg:flex items-center gap-space-xs bg-surface-container px-space-sm py-space-2xs rounded-full"
        >
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Health:</span>
          <span className="font-mono-data-sm text-mono-data-sm font-semibold text-secondary">87/100</span>
        </Link>

        {/* Notifications */}
        <Link
          to="/student/incidents"
          className="relative p-space-xs rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          <span className="absolute top-1 right-1 font-mono-data-sm text-mono-data-sm bg-error text-on-error w-4 h-4 rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </Link>

        {/* User / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-space-sm bg-surface-container-low pl-space-xs pr-space-md py-space-xs rounded-full cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                {user?.name || 'Rahul Sharma'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight">
                {roleDisplayNames[currentRole] || 'Student / Ops Admin'}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">unfold_more</span>
          </button>

          {/* Persona Switch Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container-high py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-surface-container-high">
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
                  Switch Persona View
                </p>
              </div>
              <button
                onClick={() => {
                  switchRolePreview('student');
                  setShowRoleDropdown(false);
                  navigate('/student/dashboard');
                }}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentRole === 'student'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Student View</span>
                {currentRole === 'student' && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
              <button
                onClick={() => {
                  switchRolePreview('staff');
                  setShowRoleDropdown(false);
                  navigate('/staff/dashboard');
                }}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentRole === 'staff'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Staff &amp; Dispatch Queue</span>
                {currentRole === 'staff' && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
              <button
                onClick={() => {
                  switchRolePreview('admin');
                  setShowRoleDropdown(false);
                  navigate('/admin/dashboard');
                }}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>Campus Command / Admin</span>
                {currentRole === 'admin' && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
