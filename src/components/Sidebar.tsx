import React from 'react';

// Import icons for the sidebar
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
  </svg>
);

const EmployeesIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
  </svg>
);

const DepartmentsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
  </svg>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-primary">HR Management</h1>
      </div>
      <nav className="mt-6">
        <div
          className={`px-4 py-3 flex items-center ${
            activeTab === 'dashboard' ? 'text-primary bg-secondary-light' : 'text-gray-600 hover:bg-secondary-light'
          } cursor-pointer transition-colors duration-200`}
          onClick={() => setActiveTab('dashboard')}
        >
          <DashboardIcon />
          <span className="mx-4">Dashboard</span>
        </div>
        <div
          className={`px-4 py-3 flex items-center ${
            activeTab === 'employees' ? 'text-primary bg-secondary-light' : 'text-gray-600 hover:bg-secondary-light'
          } cursor-pointer transition-colors duration-200`}
          onClick={() => setActiveTab('employees')}
        >
          <EmployeesIcon />
          <span className="mx-4">Employees</span>
        </div>
        <div
          className={`px-4 py-3 flex items-center ${
            activeTab === 'departments' ? 'text-primary bg-secondary-light' : 'text-gray-600 hover:bg-secondary-light'
          } cursor-pointer transition-colors duration-200`}
          onClick={() => setActiveTab('departments')}
        >
          <DepartmentsIcon />
          <span className="mx-4">Departments</span>
        </div>
        <div
          className={`px-4 py-3 flex items-center ${
            activeTab === 'reports' ? 'text-primary bg-secondary-light' : 'text-gray-600 hover:bg-secondary-light'
          } cursor-pointer transition-colors duration-200`}
          onClick={() => setActiveTab('reports')}
        >
          <ReportsIcon />
          <span className="mx-4">Reports</span>
        </div>
        <div
          className={`px-4 py-3 flex items-center ${
            activeTab === 'settings' ? 'text-primary bg-secondary-light' : 'text-gray-600 hover:bg-secondary-light'
          } cursor-pointer transition-colors duration-200`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon />
          <span className="mx-4">Settings</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 