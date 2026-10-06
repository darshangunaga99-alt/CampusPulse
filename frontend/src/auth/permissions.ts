/**
 * CampusPulse RBAC — Permission Definitions
 *
 * Permissions are granular capabilities. Each role is granted a specific set.
 * This mirrors the permission model expected on the FastAPI backend.
 *
 * IMPORTANT:
 *  - Frontend RBAC is a UX layer, NOT the security boundary.
 *  - The FastAPI backend must independently enforce these same permissions.
 *  - Never trust frontend-only checks for sensitive operations.
 */

import type { Role } from './roles';

// ─────────────────────────────────────────────────────────────────────────────
// Permission Tokens
// ─────────────────────────────────────────────────────────────────────────────

export type Permission =
  // ── Student Permissions ──────────────────────────────────────
  | 'submit_request'
  | 'view_own_requests'
  | 'view_own_request_detail'
  | 'submit_feedback'
  | 'follow_incident'
  | 'view_student_incidents'
  | 'view_notifications'
  | 'update_profile'

  // ── Staff Permissions ─────────────────────────────────────────
  | 'view_assigned_requests'
  | 'update_assigned_request'
  | 'update_request_status'
  | 'add_request_comment'
  | 'upload_request_evidence'
  | 'view_relevant_incidents'
  | 'view_own_workload'

  // ── Department Head Permissions ───────────────────────────────
  | 'view_department_requests'
  | 'assign_staff'
  | 'reassign_staff'
  | 'escalate_request'
  | 'view_department_incidents'
  | 'view_department_analytics'
  | 'view_staff_workload'
  | 'manage_department_services'

  // ── Admin Permissions ─────────────────────────────────────────
  | 'view_all_requests'
  | 'view_all_incidents'
  | 'manage_incidents'
  | 'view_campus_map'
  | 'view_campus_analytics'
  | 'manage_services'
  | 'manage_users'
  | 'manage_departments'
  | 'view_audit_logs'
  | 'manage_system_settings'
  | 'view_ai_intelligence'
  | 'view_preventive_analytics'

  // ── Auditor Permissions ───────────────────────────────────────
  | 'audit_read_requests'
  | 'audit_read_incidents'
  | 'audit_read_analytics'
  | 'audit_read_logs';

// ─────────────────────────────────────────────────────────────────────────────
// Role → Permission Map
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    'submit_request',
    'view_own_requests',
    'view_own_request_detail',
    'submit_feedback',
    'follow_incident',
    'view_student_incidents',
    'view_notifications',
    'update_profile',
  ],

  staff: [
    'view_assigned_requests',
    'update_assigned_request',
    'update_request_status',
    'add_request_comment',
    'upload_request_evidence',
    'view_relevant_incidents',
    'view_own_workload',
    'view_notifications',
    'update_profile',
  ],

  department_head: [
    'view_department_requests',
    'view_assigned_requests',
    'update_assigned_request',
    'update_request_status',
    'add_request_comment',
    'upload_request_evidence',
    'assign_staff',
    'reassign_staff',
    'escalate_request',
    'view_department_incidents',
    'view_relevant_incidents',
    'view_department_analytics',
    'view_staff_workload',
    'manage_department_services',
    'view_notifications',
    'update_profile',
  ],

  admin: [
    // All student/staff/dept-head permissions
    'submit_request',
    'view_own_requests',
    'view_own_request_detail',
    'submit_feedback',
    'follow_incident',
    'view_student_incidents',
    'view_assigned_requests',
    'update_assigned_request',
    'update_request_status',
    'add_request_comment',
    'upload_request_evidence',
    'view_relevant_incidents',
    'view_own_workload',
    'view_department_requests',
    'assign_staff',
    'reassign_staff',
    'escalate_request',
    'view_department_incidents',
    'view_department_analytics',
    'view_staff_workload',
    'manage_department_services',
    // Admin-only
    'view_all_requests',
    'view_all_incidents',
    'manage_incidents',
    'view_campus_map',
    'view_campus_analytics',
    'manage_services',
    'manage_users',
    'manage_departments',
    'view_audit_logs',
    'manage_system_settings',
    'view_ai_intelligence',
    'view_preventive_analytics',
    'view_notifications',
    'update_profile',
  ],

  auditor: [
    'audit_read_requests',
    'audit_read_incidents',
    'audit_read_analytics',
    'audit_read_logs',
    'view_notifications',
    'update_profile',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the given role has the requested permission.
 * This is the single entry point for all permission checks in the frontend.
 */
export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Returns true if the given role has ALL of the requested permissions.
 */
export function hasAllPermissions(role: Role | null | undefined, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Returns true if the given role has ANY of the requested permissions.
 */
export function hasAnyPermission(role: Role | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Returns the full permission set for a role (for debugging/display).
 */
export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
