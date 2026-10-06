/**
 * AuditorDashboard — Read-only compliance view for auditors.
 * Auditors can view requests, incidents, analytics, and audit logs.
 * They CANNOT modify any operational data.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AuditorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <main className="p-space-lg space-y-space-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
            Compliance Audit Dashboard
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs">
            Read-only view · {user?.name} · {user?.department}
          </p>
        </div>
        <div className="flex items-center gap-space-xs px-space-md py-space-xs bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          Auditor Mode — Read Only
        </div>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-space-sm bg-tertiary-container/40 border border-tertiary/20 rounded-xl p-space-md">
        <span className="material-symbols-outlined text-tertiary mt-0.5">info</span>
        <div>
          <p className="font-label-md text-label-md font-semibold text-on-surface">
            Auditor Access
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-2xs">
            You have read-only access to requests, incidents, analytics, and audit logs.
            You cannot submit, update, assign, or modify any operational data.
            All your access actions are logged for compliance.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {[
          { label: 'View Requests', icon: 'inbox', to: '/auditor/requests', color: 'bg-primary-container text-on-primary-container' },
          { label: 'View Incidents', icon: 'emergency', to: '/auditor/incidents', color: 'bg-error-container text-on-error-container' },
          { label: 'Analytics', icon: 'insights', to: '/auditor/analytics', color: 'bg-secondary-container text-on-secondary-container' },
          { label: 'Audit Logs', icon: 'history', to: '/auditor/audit', color: 'bg-tertiary-container text-on-tertiary-container' },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center p-space-lg rounded-2xl ${item.color} hover:opacity-90 transition-opacity gap-space-sm`}
          >
            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
            <span className="font-label-lg text-label-lg font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </main>
  );
};
