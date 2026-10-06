import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Student Stitch Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { MyRequestsPage as StudentRequests } from '../pages/student/MyRequestsPage';
import { NewRequestPage as NewRequest } from '../pages/student/NewRequestPage';
import { RequestDetailPage as RequestDetail } from '../pages/student/RequestDetailPage';
import { IncidentsPage as CampusIncidents } from '../pages/student/IncidentsPage';
import { StudentNotifications } from '../pages/student/StudentNotifications';

// Staff Stitch Pages
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffRequestsPage as StaffRequests } from '../pages/staff/StaffRequestsPage';

// Department Head Pages
import { DepartmentDashboard } from '../pages/department/DepartmentDashboard';
import { DepartmentRequests } from '../pages/department/DepartmentRequests';
import { DepartmentIncidents } from '../pages/department/DepartmentIncidents';

// Admin Stitch Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { IncidentsPage as AdminIncidents } from '../pages/admin/IncidentsPage';
import { MapPage as AdminMap } from '../pages/admin/MapPage';
import { AnalyticsPage as AdminAnalytics } from '../pages/admin/AnalyticsPage';
import { ServicesPage as AdminServices } from '../pages/admin/ServicesPage';
import { AdminUsers } from '../pages/admin/AdminUsers';

// Error 404 page
import { ErrorState } from '../components/common/ErrorState';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
}) => {
  return <>{children}</>;
};

// Root Redirect Helper
const RootRedirect: React.FC = () => {
  return <Navigate to="/student/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main Layout & Connected Stitch Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* 1. Student Services Screens */}
        <Route path="student/dashboard" element={<StudentDashboard />} />
        <Route path="student/requests" element={<StudentRequests />} />
        <Route path="student/requests/new" element={<NewRequest />} />
        <Route path="student/requests/:id" element={<RequestDetail />} />
        <Route path="student/incidents" element={<CampusIncidents />} />
        <Route path="student/notifications" element={<StudentNotifications />} />

        {/* 2. Operations & Incidents Screens */}
        <Route path="staff/dashboard" element={<StaffDashboard />} />
        <Route path="staff/requests" element={<StaffRequests />} />
        <Route path="staff/requests/:id" element={<RequestDetail />} />

        {/* 3. Department Head Routes */}
        <Route path="department/dashboard" element={<DepartmentDashboard />} />
        <Route path="department/requests" element={<DepartmentRequests />} />
        <Route path="department/incidents" element={<DepartmentIncidents />} />

        {/* 4. Campus Command & Admin Screens */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/requests" element={<StaffRequests />} />
        <Route path="admin/incidents" element={<AdminIncidents />} />
        <Route path="admin/map" element={<AdminMap />} />
        <Route path="admin/analytics" element={<AdminAnalytics />} />
        <Route path="admin/services" element={<AdminServices />} />
        <Route path="admin/users" element={<AdminUsers />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<ErrorState status={404} message="Route not found on CampusPulse." />} />
      </Route>
    </Routes>
  );
};

