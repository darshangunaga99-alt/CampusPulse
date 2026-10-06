/**
 * CampusPulse — Application Routes
 *
 * Every non-public route is wrapped in <ProtectedRoute> with an explicit
 * allowedRoles array. Accessing a route without the required role causes an
 * automatic redirect to that user's own home page (no 404, no blank screen).
 *
 * Route ownership:
 *   /student/*       → student
 *   /staff/*         → staff, department_head, admin
 *   /department/*    → department_head, admin
 *   /admin/*         → admin
 *   /auditor/*       → auditor, admin
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { ROLE_HOME_ROUTES } from '../auth/roles';

// ── Auth Pages ────────────────────────────────────────────────────────────────
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// ── Student Pages ─────────────────────────────────────────────────────────────
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { MyRequestsPage } from '../pages/student/MyRequestsPage';
import { NewRequestPage } from '../pages/student/NewRequestPage';
import { RequestDetailPage } from '../pages/student/RequestDetailPage';
import { IncidentsPage as StudentIncidentsPage } from '../pages/student/IncidentsPage';
import { StudentNotifications } from '../pages/student/StudentNotifications';

// ── Staff Pages ───────────────────────────────────────────────────────────────
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffRequests } from '../pages/staff/StaffRequests';
import { StaffRequestDetail } from '../pages/staff/StaffRequestDetail';

// ── Department Head Pages ─────────────────────────────────────────────────────
import { DepartmentDashboard } from '../pages/department/DepartmentDashboard';
import { DepartmentRequests } from '../pages/department/DepartmentRequests';
import { DepartmentIncidents } from '../pages/department/DepartmentIncidents';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { IncidentsPage as AdminIncidentsPage } from '../pages/admin/IncidentsPage';
import { MapPage } from '../pages/admin/MapPage';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage';
import { ServicesPage } from '../pages/admin/ServicesPage';
import { AdminUsers } from '../pages/admin/AdminUsers';

// ── Auditor Pages ─────────────────────────────────────────────────────────────
import { AuditorDashboard } from '../pages/auditor/AuditorDashboard';

// ── Error ─────────────────────────────────────────────────────────────────────
import { ErrorState } from '../components/common/ErrorState';

// ─────────────────────────────────────────────────────────────────────────────
// Root redirect: send each user to their role's home page
// ─────────────────────────────────────────────────────────────────────────────
const RootRedirect: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME_ROUTES[role]} replace />;
};

// ─────────────────────────────────────────────────────────────────────────────
// AppRoutes
// ─────────────────────────────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected Shell ── */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Root → role home */}
        <Route index element={<RootRedirect />} />

        {/* ── STUDENT ─────────────────────────────────────────────────────── */}
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/requests"
          element={
            <ProtectedRoute
              allowedRoles={['student']}
              requireAnyPermission={['view_own_requests']}
            >
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/requests/new"
          element={
            <ProtectedRoute
              allowedRoles={['student']}
              requireAnyPermission={['submit_request']}
            >
              <NewRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/requests/:id"
          element={
            <ProtectedRoute
              allowedRoles={['student']}
              requireAnyPermission={['view_own_request_detail']}
            >
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/incidents"
          element={
            <ProtectedRoute
              allowedRoles={['student']}
              requireAnyPermission={['view_student_incidents']}
            >
              <StudentIncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/notifications"
          element={
            <ProtectedRoute
              allowedRoles={['student']}
              requireAnyPermission={['view_notifications']}
            >
              <StudentNotifications />
            </ProtectedRoute>
          }
        />

        {/* ── STAFF ───────────────────────────────────────────────────────── */}
        <Route
          path="staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['staff', 'department_head', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/requests"
          element={
            <ProtectedRoute
              allowedRoles={['staff', 'department_head', 'admin']}
              requireAnyPermission={['view_assigned_requests', 'view_department_requests', 'view_all_requests']}
            >
              <StaffRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/requests/:id"
          element={
            <ProtectedRoute allowedRoles={['staff', 'department_head', 'admin']}>
              <StaffRequestDetail />
            </ProtectedRoute>
          }
        />

        {/* ── DEPARTMENT HEAD ──────────────────────────────────────────────── */}
        <Route
          path="department/dashboard"
          element={
            <ProtectedRoute allowedRoles={['department_head', 'admin']}>
              <DepartmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="department/requests"
          element={
            <ProtectedRoute
              allowedRoles={['department_head', 'admin']}
              requireAnyPermission={['view_department_requests', 'view_all_requests']}
            >
              <DepartmentRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="department/incidents"
          element={
            <ProtectedRoute
              allowedRoles={['department_head', 'admin']}
              requireAnyPermission={['view_department_incidents', 'view_all_incidents']}
            >
              <DepartmentIncidents />
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN ───────────────────────────────────────────────────────── */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['view_campus_analytics']}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/requests"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['view_all_requests']}
            >
              <StaffRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/incidents"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['view_all_incidents', 'manage_incidents']}
            >
              <AdminIncidentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/map"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['view_campus_map']}
            >
              <MapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['view_campus_analytics', 'view_preventive_analytics']}
            >
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/services"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['manage_services']}
            >
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              requireAnyPermission={['manage_users']}
            >
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* ── AUDITOR ─────────────────────────────────────────────────────── */}
        <Route
          path="auditor/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['auditor', 'admin']}
              requireAnyPermission={['audit_read_requests', 'audit_read_logs']}
            >
              <AuditorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route
          path="*"
          element={<ErrorState status={404} message="This page does not exist on CampusPulse." />}
        />
      </Route>
    </Routes>
  );
};
