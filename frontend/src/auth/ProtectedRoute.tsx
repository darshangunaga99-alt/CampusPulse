/**
 * CampusPulse RBAC — ProtectedRoute
 *
 * Wraps a route and enforces role-based access control.
 * If the user does not have the required role(s) or permission(s):
 *   - Unauthenticated users → redirect to /login
 *   - Wrong role → redirect to their role's home page with a 403 state
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from './roles';
import { ROLE_HOME_ROUTES } from './roles';
import type { Permission } from './permissions';
import { hasPermission, hasAnyPermission } from './permissions';

interface ProtectedRouteProps {
  /** The page content to render if access is granted */
  children: React.ReactNode;
  /**
   * Allow access only to these roles.
   * If omitted, any authenticated user may access the route.
   */
  allowedRoles?: Role[];
  /**
   * Require at least one of these permissions.
   * Evaluated AFTER role check.
   */
  requireAnyPermission?: Permission[];
  /**
   * Custom redirect path on access denied.
   * Defaults to the user's role home route.
   */
  unauthorizedRedirect?: string;
}

/** Rendered when the user does not have access */
const AccessDenied: React.FC<{ targetRole: string }> = ({ targetRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="max-w-md text-center p-space-xl">
      <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-space-md">
        <span className="material-symbols-outlined text-on-error-container text-3xl">lock</span>
      </div>
      <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-sm">
        Access Restricted
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
        Your current role (<span className="font-semibold text-on-surface">{targetRole}</span>) does
        not have permission to access this page. Please contact your administrator if you believe
        this is an error.
      </p>
      <div className="inline-flex items-center gap-space-xs font-label-sm text-label-sm bg-error-container text-on-error-container px-space-md py-space-xs rounded-full">
        <span className="material-symbols-outlined text-sm">security</span>
        HTTP 403 — Forbidden
      </div>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAnyPermission,
  unauthorizedRedirect,
}) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While auth is initialising, render nothing to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → send to login, preserve intended destination
  if (!isAuthenticated || !user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the denied page (their home), NOT to a blank screen
    const redirect = unauthorizedRedirect ?? ROLE_HOME_ROUTES[role];
    return <Navigate to={redirect} state={{ denied: true, from: location.pathname }} replace />;
  }

  // Permission check (optional secondary gate)
  if (requireAnyPermission && !hasAnyPermission(role, requireAnyPermission)) {
    const redirect = unauthorizedRedirect ?? ROLE_HOME_ROUTES[role];
    return <Navigate to={redirect} state={{ denied: true, from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Convenience hook: check a single permission in components
// ─────────────────────────────────────────────────────────────────────────────
export function usePermission(permission: Permission): boolean {
  const { role } = useAuth();
  return hasPermission(role, permission);
}

export function useAnyPermission(permissions: Permission[]): boolean {
  const { role } = useAuth();
  return hasAnyPermission(role, permissions);
}
