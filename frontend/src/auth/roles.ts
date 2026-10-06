/**
 * CampusPulse RBAC — Role Definitions
 *
 * This is the single source of truth for all roles in the system.
 * The same role slugs are expected to be enforced by the FastAPI backend.
 * Do NOT change role values without coordinating with the backend team.
 */

export type Role =
  | 'student'
  | 'staff'
  | 'department_head'
  | 'admin'
  | 'auditor';

/** Human-readable labels for each role */
export const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  staff: 'Field Specialist',
  department_head: 'Department Head',
  admin: 'Campus Commander',
  auditor: 'Compliance Auditor',
};

/** Default landing route per role */
export const ROLE_HOME_ROUTES: Record<Role, string> = {
  student: '/student/dashboard',
  staff: '/staff/dashboard',
  department_head: '/department/dashboard',
  admin: '/admin/dashboard',
  auditor: '/auditor/dashboard',
};

/** Role hierarchy value — higher number = broader access.
 *  Used only for informational comparisons, NOT as the access gate.
 *  Always use hasPermission() for actual access control. */
export const ROLE_HIERARCHY: Record<Role, number> = {
  student: 1,
  staff: 2,
  department_head: 3,
  auditor: 3,
  admin: 4,
};
