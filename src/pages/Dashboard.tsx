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

  // Render appropriate dashboard based on user role
  switch(currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'hr_manager':
      return <HrManagerDashboard />;
    case 'department_manager':
      return <DepartmentManagerDashboard department={currentUser.department} />;
    case 'employee':
      return <EmployeeDashboard userId={currentUser.id.toString()} />;
    default:
      return <div className="p-6 text-center">Invalid user role</div>;
  }
};

export default Dashboard;