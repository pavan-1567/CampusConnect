import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminLogin from '../pages/auth/AdminLogin';
import AccessDenied from '../pages/auth/AccessDenied';
import PendingApproval from '../pages/auth/PendingApproval';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import ReportLostItem from '../pages/student/ReportLostItem';
import ReportFoundItem from '../pages/student/ReportFoundItem';
import BrowseLostItems from '../pages/student/BrowseLostItems';
import BrowseFoundItems from '../pages/student/BrowseFoundItems';
import ItemDetails from '../pages/student/ItemDetails';
import RespondToLostItem from '../pages/student/RespondToLostItem';
import MyLostRequests from '../pages/student/MyLostRequests';
import MyFoundReports from '../pages/student/MyFoundReports';
import MyResponses from '../pages/student/MyResponses';
import NotificationCenter from '../pages/student/NotificationCenter';
import StudentProfile from '../pages/student/StudentProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import LostItemsAdmin from '../pages/admin/LostItemsAdmin';
import FoundItemsAdmin from '../pages/admin/FoundItemsAdmin';
import ResponsesAdmin from '../pages/admin/ResponsesAdmin';
import PotentialMatches from '../pages/admin/PotentialMatches';
import OwnershipVerification from '../pages/admin/OwnershipVerification';
import HandoverManagement from '../pages/admin/HandoverManagement';
import AnalyticsReports from '../pages/admin/AnalyticsReports';
import AuditLogs from '../pages/admin/AuditLogs';
import AdminSettings from '../pages/admin/AdminSettings';

const RootRedirect = () => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return null;

  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/auth/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Public Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="access-denied" element={<AccessDenied />} />
        <Route path="pending-approval" element={<PendingApproval />} />
      </Route>

      {/* Protected Student Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute requiredRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="report-lost" element={<ReportLostItem />} />
            <Route path="report-found" element={<ReportFoundItem />} />
            <Route path="browse-lost" element={<BrowseLostItems />} />
            <Route path="browse-found" element={<BrowseFoundItems />} />
            <Route path="lost-items/:id" element={<ItemDetails type="lost" />} />
            <Route path="found-items/:id" element={<ItemDetails type="found" />} />
            <Route path="respond/:lostItemId" element={<RespondToLostItem />} />
            <Route path="my-lost" element={<MyLostRequests />} />
            <Route path="my-found" element={<MyFoundReports />} />
            <Route path="my-responses" element={<MyResponses />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="lost-items" element={<LostItemsAdmin />} />
            <Route path="found-items" element={<FoundItemsAdmin />} />
            <Route path="responses" element={<ResponsesAdmin />} />
            <Route path="matches" element={<PotentialMatches />} />
            <Route path="verification" element={<OwnershipVerification />} />
            <Route path="handovers" element={<HandoverManagement />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default AppRoutes;

