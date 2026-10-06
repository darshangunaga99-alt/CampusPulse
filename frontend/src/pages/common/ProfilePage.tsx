import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  const currentRole = role ?? 'student';

  return (
    <div className="space-y-space-xl max-w-4xl mx-auto pb-space-2xl">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-mono-data-sm">
          <span>CampusPulse</span>
          <span>/</span>
          <span className="text-secondary font-semibold">User Profile</span>
        </div>
        <h1 className="font-display-lg text-2xl font-bold text-on-surface">
          Account Profile &amp; Settings
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Manage your campus account details, role permissions, and session security.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-lg pb-space-lg border-b border-outline-variant/20">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-on-secondary font-extrabold text-3xl shadow-md shadow-secondary/20 shrink-0">
            {user?.name?.charAt(0) ?? 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-headline-lg text-xl font-bold text-on-surface truncate">
                {user?.name ?? 'Authenticated User'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/20 font-label-sm">
                {ROLE_LABELS[currentRole]}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>

            <p className="font-body-md text-sm text-on-surface-variant truncate">
              {user?.email ?? 'user@campuspulse.edu'}
            </p>

            {user?.department && (
              <div className="mt-2 inline-flex items-center gap-1.5 font-label-sm text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg">
                <span className="material-symbols-outlined text-sm text-secondary">business</span>
                <span>Department: <strong className="text-on-surface font-semibold">{user.department}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg pt-space-lg">
          <div className="space-y-1">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
              User ID
            </span>
            <div className="font-mono-data-sm text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
              {user?.id ?? 'usr_authenticated'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
              Assigned Role
            </span>
            <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20 flex items-center justify-between">
              <span className="font-semibold">{ROLE_LABELS[currentRole]}</span>
              <span className="font-mono-data-sm text-xs text-on-surface-variant">({currentRole})</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
              Campus Email
            </span>
            <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
              {user?.email ?? 'user@campuspulse.edu'}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
              Authentication Method
            </span>
            <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-secondary">key</span>
              <span>FastAPI Stateless JWT Bearer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Access Overview */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <h3 className="font-headline-md text-base font-bold text-on-surface mb-space-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">shield</span>
          Role Permissions &amp; Access Controls
        </h3>
        <p className="font-body-sm text-sm text-on-surface-variant mb-space-md">
          Access privileges are enforced securely by the FastAPI backend based on your authenticated role token.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="font-label-sm text-xs font-semibold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
              Incident Reports
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              {currentRole === 'student' ? 'Submit and track own incident requests' : 'Full triage and dispatch access'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="font-label-sm text-xs font-semibold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
              SLA Monitoring
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Automated real-time SLA tracking and alerts
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div className="font-label-sm text-xs font-semibold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
              Audit Trails
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Immutable logging on all operational state transitions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
