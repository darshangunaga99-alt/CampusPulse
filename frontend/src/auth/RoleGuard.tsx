/**
 * CampusPulse RBAC — RoleGuard
 *
 * Action/component-level access control.
 *
 * Use this to conditionally render buttons, panels, or data fields
 * that must only be visible to specific roles or permission holders.
 *
 * Examples:
 *   <RoleGuard allowedRoles={['admin', 'department_head']}>
 *     <AssignStaffButton />
 *   </RoleGuard>
 *
 *   <RoleGuard requirePermission="manage_users">
 *     <UserManagementTable />
 *   </RoleGuard>
 *
 *   <RoleGuard requirePermission="reassign_staff" fallback={<span>Read-only</span>}>
 *     <ReassignButton />
 *   </RoleGuard>
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from './roles';
import type { Permission } from './permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from './permissions';

interface RoleGuardProps {
  /** Content to show when access is granted */
  children: React.ReactNode;
  /**
   * Show children only if the current user has one of these roles.
   * Evaluated first (before permission checks).
   */
  allowedRoles?: Role[];
  /**
   * Show children only if the current user has this permission.
   */
  requirePermission?: Permission;
  /**
   * Show children only if the user has ALL of these permissions.
   */
  requireAllPermissions?: Permission[];
  /**
   * Show children only if the user has ANY of these permissions.
   */
  requireAnyPermission?: Permission[];
  /**
   * What to render when access is denied.
   * Defaults to null (renders nothing).
   */
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  fallback = null,
}) => {
  const { role } = useAuth();

  // Role check
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <>{fallback}</>;
  }

  // Single permission
  if (requirePermission && !hasPermission(role, requirePermission)) {
    return <>{fallback}</>;
  }

  // All permissions
  if (requireAllPermissions && !hasAllPermissions(role, requireAllPermissions)) {
    return <>{fallback}</>;
  }

  // Any permission
  if (requireAnyPermission && !hasAnyPermission(role, requireAnyPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Typed shorthand guards for frequently used role combinations
// ─────────────────────────────────────────────────────────────────────────────

/** Visible only to admin */
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => <RoleGuard allowedRoles={['admin']} fallback={fallback}>{children}</RoleGuard>;

/** Visible to admin and department_head */
export const ManagementOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => <RoleGuard allowedRoles={['admin', 'department_head']} fallback={fallback}>{children}</RoleGuard>;

/** Visible to admin, department_head, and staff */
export const OperationsOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <RoleGuard allowedRoles={['admin', 'department_head', 'staff']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/** Visible to students only */
export const StudentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => <RoleGuard allowedRoles={['student']} fallback={fallback}>{children}</RoleGuard>;

/** Visible to auditors only */
export const AuditorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => <RoleGuard allowedRoles={['auditor']} fallback={fallback}>{children}</RoleGuard>;

/** NOT visible to students */
export const NotStudent: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null,
}) => (
  <RoleGuard
    allowedRoles={['staff', 'department_head', 'admin', 'auditor']}
    fallback={fallback}
  >
    {children}
  </RoleGuard>
);
