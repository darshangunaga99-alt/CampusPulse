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
import { StaffIncidents } from '../pages/staff/StaffIncidents';

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
import { AuditorIncidents } from '../pages/auditor/AuditorIncidents';

// ── Common / Profile Pages ───────────────────────────────────────────────────
import { ProfilePage } from '../pages/common/ProfilePage';

// ── Error ─────────────────────────────────────────────────────────────────────
import { ErrorState } from '../components/common/ErrorState';

// ─────────────────────────────────────────────────────────────────────────────
// Root redirect: send each user to their role's home page
// ─────────────────────────────────────────────────────────────────────────────
const RootRedirect: React.FC = () => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 animate-pulse">
            CP
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME_ROUTES[role] || '/login'} replace />;
};

// ─────────────────────────────────────────────────────────────────────────────
// AppRoutes
// ─────────────────────────────────────────────────────────────────────────────
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public Auth ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Root Route: Auth-Aware Redirect ── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Protected Shell ── */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* ── COMMON / ACTIVE INCIDENTS ────────────────────────────── */}
        <Route
          path="incidents"
          element={
            <ProtectedRoute
              requireAnyPermission={[
                'view_student_incidents',
                'view_relevant_incidents',
                'view_department_incidents',
                'view_all_incidents',
                'audit_read_incidents',
              ]}
            >
              <StudentIncidentsPage />
            </ProtectedRoute>
          }
        />

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
              requireAnyPermission={[
                'view_student_incidents',
                'view_relevant_incidents',
                'view_department_incidents',
                'view_all_incidents',
                'audit_read_incidents',
              ]}
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
        <Route
          path="staff/incidents"
          element={
            <ProtectedRoute
              allowedRoles={['staff', 'department_head', 'admin']}
              requireAnyPermission={['view_relevant_incidents', 'view_department_incidents', 'view_all_incidents']}
            >
              <StaffIncidents />
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
              allowedRoles={['admin', 'department_head', 'staff']}
              requireAnyPermission={['view_all_incidents', 'manage_incidents', 'view_department_incidents', 'view_relevant_incidents']}
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
        <Route
          path="auditor/incidents"
          element={
            <ProtectedRoute
              allowedRoles={['auditor', 'admin']}
              requireAnyPermission={['audit_read_incidents', 'view_all_incidents']}
            >
              <AuditorIncidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="auditor/requests"
          element={
            <ProtectedRoute
              allowedRoles={['auditor', 'admin']}
              requireAnyPermission={['audit_read_requests', 'view_all_requests']}
            >
              <StaffRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="auditor/analytics"
          element={
            <ProtectedRoute
              allowedRoles={['auditor', 'admin']}
              requireAnyPermission={['audit_read_analytics', 'view_campus_analytics']}
            >
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* ── PROFILE (All authenticated users) ───────────────────────── */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
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
