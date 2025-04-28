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

// Define roles type
type Role = 'admin' | 'hr_manager' | 'department_manager' | 'employee';

// Interface for route permissions
interface RoutePermissions {
  allowedRoles: Role[];
  path: string;
  element: React.ReactNode;
}

const ProtectedDashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppRoutes = () => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Protected routes with role-based access control
  const protectedRoutes: RoutePermissions[] = [
    {
      path: "/dashboard",
      element: <Dashboard />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']
    },
    {
      path: "/employees",
      element: <Employees />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager']
    },
    {
      path: "/departments",
      element: <Departments />,
      allowedRoles: ['admin', 'hr_manager']
    },
    {
      path: "/attendance",
      element: <Attendance />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']
    },
    {
      path: "/performance",
      element: <Performance />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']
    },
    {
      path: "/payroll",
      element: <Payroll />,
      allowedRoles: ['admin', 'hr_manager']
    },
    {
      path: "/leave",
      element: <Leave />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager', 'employee']
    },
    {
      path: "/reports",
      element: <Reports />,
      allowedRoles: ['admin', 'hr_manager', 'department_manager']
    },
    {
      path: "/settings",
      element: <Settings />,
      allowedRoles: ['admin']
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
        
        {protectedRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              currentUser && route.allowedRoles.includes(currentUser.role) ? (
                route.element
              ) : (
                <Navigate to="/unauthorized" replace />
              )
            }
          />
        ))}
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
