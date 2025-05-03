import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Role-specific dashboard components
import AdminDashboard from '../components/dashboards/AdminDashboard';
import HrManagerDashboard from '../components/dashboards/HrManagerDashboard';
import DepartmentManagerDashboard from '../components/dashboards/DepartmentManagerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <div className="p-6 text-center">Please log in to view your dashboard.</div>;
  }

  // Render appropriate dashboard based on user roleType
  switch(currentUser.role?.roleType) { // Access nested role.roleType
    case 'SYSTEM_ADMIN': // Use backend role names
      return <AdminDashboard />;
    case 'HR_MANAGER': // Use backend role names
      return <HrManagerDashboard />;
    case 'DEPARTMENT_MANAGER': // Use backend role names
      // Assuming department info is still needed, might need adjustment based on User type update
      return <DepartmentManagerDashboard department={currentUser.department} />;
    case 'EMPLOYEE': // Use backend role names
      return <EmployeeDashboard userId={currentUser.id.toString()} />;
    default:
      return <div className="p-6 text-center">Invalid user role: {currentUser.role?.roleType || 'undefined'}</div>; // Safely access nested role.roleType
  }
};

export default Dashboard;