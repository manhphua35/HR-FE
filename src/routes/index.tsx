import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import DashboardLayout from '../components/layouts/DashboardLayout';
import AuthLayout from '../components/layouts/AuthLayout';

// Pages 
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import Departments from '../pages/Departments';
import Attendance from '../pages/Attendance';
import Performance from '../pages/Performance';
import Payroll from '../pages/Payroll';
import Leave from '../pages/Leave';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';
import Training from '../pages/Training';
import TrainingDetail from '../pages/TrainingDetail';

// Define roles type (matching backend response)
type Role = 'SYSTEM_ADMIN' | 'HR_STAFF' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';

// Interface for route permissions
interface RoutePermissions {
  allowedRoles: Role[];
  path: string;
  element: React.ReactNode;
}

const ProtectedDashboardLayout = () => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Get loading state
  console.log('[ProtectedLayout] Rendering - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated); // Log mỗi lần render

  // Show loading indicator while auth context is checking
  if (authLoading) {
    console.log('[ProtectedLayout] Auth is loading, showing loading indicator.'); // Log khi đang loading
    // You might want a more sophisticated loading spinner here
    return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  }

  // After loading, check authentication
  if (!isAuthenticated) {
     console.log('[ProtectedLayout] Not authenticated after loading, redirecting to /login.'); // Log khi chuyển hướng login
  } else {
     console.log('[ProtectedLayout] Authenticated, rendering DashboardLayout.'); // Log khi render layout
  }

  return isAuthenticated ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppRoutes = () => {
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth(); // Lấy cả loading state
  
  // Protected routes with role-based access control
  const protectedRoutes: RoutePermissions[] = [
    {
      path: "/dashboard",
      element: <Dashboard />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] // Use backend role names
    },
    {
      path: "/employees",
      element: <Employees />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER'] // Use backend role names
    },
    {
      path: "/departments",
      element: <Departments />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF'] // Use backend role names
    },
    {
      path: "/attendance",
      element: <Attendance />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] // Use backend role names
    },
    {
      path: "/performance",
      element: <Performance />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] // Use backend role names
    },
    {
      path: "/payroll",
      element: <Payroll />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF'] // Use backend role names
    },
    {
      path: "/leave",
      element: <Leave />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE'] // Use backend role names
    },
    {
      path: "/reports",
      element: <Reports />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER'] // Use backend role names
    },
    {
      path: "/settings",
      element: <Settings />,
      allowedRoles: ['SYSTEM_ADMIN'] // Use backend role names
    },
    {
      path: "training",
      element: <Training />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE']
    },
    {
      path: "training/:id",
      element: <TrainingDetail />,
      allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_MANAGER', 'EMPLOYEE']
    }
  ];

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedDashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {protectedRoutes.map(route => {
          // Log TRƯỚC KHI render Route component
          console.log(`[AppRoutes] Evaluating route: ${route.path} - authLoading: ${authLoading}, isAuthenticated: ${isAuthenticated}, currentUser:`, currentUser);
        
          return (
            <Route
              key={route.path}
              path={route.path}
            element={
              authLoading ? (
                // Show loading indicator while auth context is resolving
                <div className="p-4">Đang kiểm tra quyền...</div>
              ) : isAuthenticated ? ( // Primary check: Is the user authenticated?
                // If authenticated, THEN check role
                currentUser && currentUser.role && 
                  (route.allowedRoles.includes(currentUser.role.roleType as Role) || 
                   (currentUser.role.roleType === 'HR_MANAGER' && route.allowedRoles.includes('HR_STAFF'))) ? ( // Xử lý cả HR_MANAGER
                  // Log success before rendering element
                  console.log(`[AppRoutes] Role match SUCCESS for ${route.path}. User role: ${currentUser.role.roleType}. Allowed: ${route.allowedRoles.join(', ')}`), // Access nested role.roleType
                  route.element // Authorized
                ) : currentUser ? ( // Authenticated but role doesn't match or role object is missing
                  // Log failure before navigating to unauthorized
                  console.log(`[AppRoutes] Role match FAILED for ${route.path}. User role: ${currentUser.role?.roleType || 'undefined'}. Allowed: ${route.allowedRoles.join(', ')}`), // Safely access nested role.roleType
                  <Navigate to="/unauthorized" replace />
                ) : (
                  // Authenticated is true, but currentUser is momentarily null (state update pending?)
                  // Show a brief message or redirect to unauthorized as a safeguard
                  <div className="p-4">Đang hoàn tất phiên...</div>
                  // <Navigate to="/unauthorized" replace /> // Alternative: redirect immediately
                )
              ) : (
                // Not authenticated after loading
                <Navigate to="/login" replace />
              )
            }
            />
          );
        })}
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
