// src/auth/index.ts — Barrel export for the RBAC auth module
export * from './roles';
export * from './permissions';
export { ProtectedRoute, usePermission, useAnyPermission } from './ProtectedRoute';
export {
  RoleGuard,
  AdminOnly,
  ManagementOnly,
  OperationsOnly,
  StudentOnly,
  AuditorOnly,
  NotStudent,
} from './RoleGuard';
