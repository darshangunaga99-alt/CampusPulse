/**
 * CampusPulse — Role-Driven Sidebar
 *
 * Each role receives its own curated navigation section list.
 * No role can see navigation items outside their permission scope.
 * Uses the same Stitch visual tokens and component patterns as before.
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../auth/roles';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation item types
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  to: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'primary' | 'error' | 'secondary' | 'tertiary';
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation definitions per role
// ─────────────────────────────────────────────────────────────────────────────

const STUDENT_NAV: NavSection[] = [
  {
    title: 'STUDENT SERVICES',
    items: [
      { label: 'Dashboard', to: '/student/dashboard', icon: 'dashboard', exact: true },
      {
        label: 'New Request',
        to: '/student/requests/new',
        icon: 'add_task',
        badge: '+ AI Assist',
        badgeVariant: 'tertiary',
      },
      {
        label: 'My Requests',
        to: '/student/requests',
        icon: 'inbox',
        badge: '12',
        badgeVariant: 'primary',
      },
      {
        label: 'Campus Incidents',
        to: '/student/incidents',
        icon: 'warning',
        badge: '2 Active',
        badgeVariant: 'error',
      },
      { label: 'Notifications', to: '/student/notifications', icon: 'notifications' },
    ],
  },
];

const STAFF_NAV: NavSection[] = [
  {
    title: 'MY QUEUE',
    items: [
      { label: 'Dashboard', to: '/staff/dashboard', icon: 'dashboard', exact: true },
      {
        label: 'Assigned Requests',
        to: '/staff/requests',
        icon: 'task_alt',
        badge: '8',
        badgeVariant: 'primary',
      },
    ],
  },
  {
    title: 'INCIDENT AWARENESS',
    items: [
      {
        label: 'Active Incidents',
        to: '/admin/incidents',
        icon: 'emergency',
        badge: 'Live',
        badgeVariant: 'secondary',
      },
    ],
  },
];

const DEPARTMENT_HEAD_NAV: NavSection[] = [
  {
    title: 'DEPARTMENT OPS',
    items: [
      { label: 'Dashboard', to: '/department/dashboard', icon: 'dashboard', exact: true },
      {
        label: 'Department Requests',
        to: '/department/requests',
        icon: 'inbox',
        badge: '24',
        badgeVariant: 'primary',
      },
      {
        label: 'Department Incidents',
        to: '/department/incidents',
        icon: 'emergency',
        badge: '3',
        badgeVariant: 'error',
      },
    ],
  },
  {
    title: 'STAFF MANAGEMENT',
    items: [
      { label: 'Staff Queue', to: '/staff/dashboard', icon: 'group' },
      { label: 'Smart Dispatch', to: '/staff/requests', icon: 'hub' },
    ],
  },
  {
    title: 'ANALYTICS',
    items: [
      { label: 'Department Analytics', to: '/admin/analytics', icon: 'insights' },
    ],
  },
];

const ADMIN_NAV: NavSection[] = [
  {
    title: 'STUDENT SERVICES',
    items: [
      { label: 'Student Dashboard', to: '/student/dashboard', icon: 'school' },
      { label: 'All Requests', to: '/admin/requests', icon: 'inbox' },
    ],
  },
  {
    title: 'OPERATIONS & INCIDENTS',
    items: [
      {
        label: 'Incident War Room',
        to: '/admin/incidents',
        icon: 'emergency',
        badge: 'Live',
        badgeVariant: 'secondary',
      },
      { label: 'Staff Queue', to: '/staff/dashboard', icon: 'group' },
      { label: 'Smart Dispatch', to: '/staff/requests', icon: 'hub' },
    ],
  },
  {
    title: 'CAMPUS COMMAND',
    items: [
      { label: 'Command Center', to: '/admin/dashboard', icon: 'analytics', exact: true },
      { label: 'Building Health Map', to: '/admin/map', icon: 'map' },
      { label: 'Preventive Analytics', to: '/admin/analytics', icon: 'insights' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Service Catalog', to: '/admin/services', icon: 'tune' },
      { label: 'User Management', to: '/admin/users', icon: 'manage_accounts' },
    ],
  },
];

const AUDITOR_NAV: NavSection[] = [
  {
    title: 'COMPLIANCE AUDIT',
    items: [
      { label: 'Audit Dashboard', to: '/auditor/dashboard', icon: 'verified_user', exact: true },
      { label: 'View Requests', to: '/auditor/requests', icon: 'inbox' },
      { label: 'View Incidents', to: '/auditor/incidents', icon: 'emergency' },
      { label: 'Analytics', to: '/auditor/analytics', icon: 'insights' },
      { label: 'Audit Logs', to: '/auditor/audit', icon: 'history' },
    ],
  },
];

const NAV_BY_ROLE: Partial<Record<Role, NavSection[]>> = {
  student: STUDENT_NAV,
  staff: STAFF_NAV,
  department_head: DEPARTMENT_HEAD_NAV,
  admin: ADMIN_NAV,
  auditor: AUDITOR_NAV,
};

// ─────────────────────────────────────────────────────────────────────────────
// Badge style map
// ─────────────────────────────────────────────────────────────────────────────

const BADGE_CLASSES: Record<string, string> = {
  primary: 'bg-surface-container-high text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary: 'bg-tertiary-container text-on-tertiary-container',
};

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

const SidebarNavItem: React.FC<{ item: NavItem }> = ({ item }) => {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  const baseClass =
    'flex items-center justify-between px-space-sm py-space-xs transition-colors rounded-lg';
  const activeClass = 'bg-primary-container text-on-primary-container font-semibold';
  const inactiveClass =
    'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';

  const badgeClass = item.badgeVariant
    ? BADGE_CLASSES[item.badgeVariant]
    : BADGE_CLASSES.primary;

  return (
    <NavLink to={item.to} className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}>
      <div className="flex items-center gap-space-sm">
        <span className="material-symbols-outlined text-base">{item.icon}</span>
        <span className="font-body-sm text-body-sm">{item.label}</span>
      </div>
      {item.badge && (
        <span
          className={`font-label-sm text-label-sm px-space-xs py-space-2xs rounded-full ${badgeClass}`}
        >
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StitchSidebar — Main export
// ─────────────────────────────────────────────────────────────────────────────

export const StitchSidebar: React.FC = () => {
  const { role } = useAuth();
  const sections = NAV_BY_ROLE[role ?? 'student'] ?? STUDENT_NAV;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between overflow-y-auto">
      <div className="p-space-md space-y-space-md">
        {sections.map((section) => (
          <div key={section.title} className="space-y-space-xs">
            <div className="px-space-sm py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant/70">
              {section.title}
            </div>
            <nav className="space-y-space-2xs">
              {section.items.map((item) => (
                <SidebarNavItem key={item.to} item={item} />
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* AI Engine beacon — only shown for admin/staff/dept-head */}
      {role && ['admin', 'staff', 'department_head'].includes(role) && (
        <div className="p-space-md">
          <div className="p-space-sm bg-tertiary-container text-on-tertiary rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-ping" />
              <span className="font-label-sm text-label-sm font-semibold">
                CampusPulse AI Engine Active
              </span>
            </div>
            <p className="font-mono-data-sm text-mono-data-sm text-tertiary-fixed-dim">
              Correlation Mode: On
            </p>
          </div>
        </div>
      )}

      {/* Auditor read-only badge */}
      {role === 'auditor' && (
        <div className="p-space-md">
          <div className="p-space-sm bg-secondary-container text-on-secondary-container rounded-xl">
            <div className="flex items-center gap-space-xs mb-space-2xs">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="font-label-sm text-label-sm font-semibold">Auditor Mode</span>
            </div>
            <p className="font-mono-data-sm text-mono-data-sm opacity-70">Read-only access</p>
          </div>
        </div>
      )}
    </aside>
  );
};
