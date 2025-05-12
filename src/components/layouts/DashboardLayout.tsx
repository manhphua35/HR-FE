import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/api'; // Keep User import
import { routePermissions, Role } from '../../config/routePermissions'; // Import Role and config
import Sidebar from './Sidebar'; // Cập nhật đường dẫn đến Sidebar

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Added state back
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // formatRole function moved to Sidebar.tsx

  // Added navigationItems back
  const navigationItems = [
    {
      name: 'Trang chủ', // Đổi thành Trang chủ
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt'
    },
    {
      name: 'Nhân viên',
      path: '/employees',
      icon: 'fas fa-users'
    },
    {
      name: 'Chấm công',
      path: '/attendance',
      icon: 'fas fa-calendar-alt'
    },
    {
      name: 'Lương thưởng',
      path: '/payroll',
      icon: 'fas fa-file-invoice-dollar'
    },
    {
      name: 'Nghỉ phép',
      path: '/leave',
      icon: 'fas fa-plane'
    },
    {
      name: 'Đánh giá',
      path: '/performance',
      icon: 'fas fa-chart-line'
    },
    {
      name: 'Đào tạo',
      path: '/training',
      icon: 'fas fa-graduation-cap'
    },
    {
      name: 'Báo cáo',
      path: '/reports',
      icon: 'fas fa-chart-bar'
    },
    {
      name: 'Cài đặt',
      path: '/settings',
      icon: 'fas fa-cog'
    }
  ];

  // Get user role, explicitly cast to Role type or undefined
  const userRole: Role | undefined = currentUser?.role?.roleType as Role | undefined;

  // Filter navigation items based on user role and routePermissions
  const accessibleItems = navigationItems.filter(navItem => {
    // Find the permission config for the current navigation item's path
    const permissionConfig = routePermissions.find(p => p.path === navItem.path);
    // If no permission config exists for the path, assume it's accessible by all authenticated users
    if (!permissionConfig) {
      // 
      return true;
    }
    // Check if the user's role is included in the allowed roles
    const isAllowed = userRole && permissionConfig.allowedRoles.includes(userRole);
    //  // Optional debug log
    return isAllowed;
  });

  // Find the current page title using original logic (using the original unfiltered list)
  const currentPageTitle = navigationItems.find(item => item.path === location.pathname)?.name || 'Trang chủ';


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Render the Sidebar component and pass necessary props */}
      <Sidebar
        currentUser={currentUser}
        logout={logout}
        location={location}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        accessibleItems={accessibleItems}
      />

      {/* Main Content */}
      {/* Adjusted margin-left if Sidebar width changes */}
      <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ml-2 border-l border-gray-200`}>
        {/* Top Navigation */}
        {/* Added dark mode classes */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Added dark mode text color */}
            {/* Use capitalizedTitle derived from location or ideally routePermissions */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {currentPageTitle} {/* Reverted to original variable */}
            </h1>

            {/* Added dark mode text color for icons */}
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              {/* Notifications */}
              <div className="relative">
                <button className="hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none">
                  <i className="fas fa-bell text-xl"></i>
                  {/* Notification badge colors can remain */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* Messages */}
              <div className="relative">
                <button className="hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none">
                  <i className="fas fa-envelope text-xl"></i>
                  {/* Message badge colors can remain */}
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="relative">
                <button className="flex items-center hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none">
                  <img
                    src={currentUser?.avatar || '/logo192.png'} // Use local logo as fallback
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover" // Added object-cover
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {/* Added dark mode background */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="px-8 py-6">
            {children} {/* Children components should handle their own dark mode styling */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;