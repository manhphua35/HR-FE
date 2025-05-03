import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/api';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const formatRole = (roleType?: User['role']['roleType']) => { // Access nested roleType
    if (!roleType) return '';
    return roleType
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Add type for word, make rest lowercase
      .join(' ');
  };

  const navigationItems = [
    { 
      name: 'Dashboard', 
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {/* Updated width based on sidebarCollapsed state */}
      <div className={`sidebar bg-indigo-800 text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo and Toggle Button */}
        {/* Adjusted structure for better toggle button positioning */}
        <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 relative ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {/* Logo Icon and Text */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
             <i className={`fas fa-users-cog text-2xl text-white ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
             <span className={`logo-text text-xl font-bold text-white transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>HR Management</span>
          </div>
          {/* Toggle Button - Always visible, positioned absolutely when collapsed */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:text-indigo-200 focus:outline-none p-2 rounded-md absolute top-1/2 -right-3 transform -translate-y-1/2 bg-indigo-700 dark:bg-indigo-600 shadow-md" // Positioned outside when expanded
            style={{ right: sidebarCollapsed ? 'auto' : '-0.75rem', left: sidebarCollapsed ? '-0.75rem' : 'auto' }} // Adjust left/right based on state
          >
            {/* Change icon based on state */}
            <i className={`fas ${sidebarCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
          </button>
        </div>

        {/* User Profile */}
        <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <img
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.fullName || 'User'}&background=0D8ABC&color=fff`}
            alt="Profile"
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className={`ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <div className="font-medium text-white">{currentUser?.fullName || 'User'}</div>
            <div className="text-xs text-indigo-200 dark:text-indigo-300">
              {formatRole(currentUser?.role?.roleType)}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`px-4 py-3 flex items-center text-indigo-100 hover:bg-indigo-700 dark:hover:bg-indigo-600 ${sidebarCollapsed ? 'justify-center' : ''} ${
                    location.pathname === item.path ? 'bg-indigo-900 dark:bg-indigo-700' : ''
                  }`}
                >
                  <i className={`${item.icon} ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
                  <span className={`nav-text transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-700 dark:border-indigo-900">
          <button
            onClick={logout}
            className={`flex items-center text-indigo-100 hover:text-indigo-200 dark:hover:text-indigo-300 w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <i className={`fas fa-sign-out-alt ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
            <span className={`nav-text transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ml-2 border-l border-gray-200`}>
        {/* Top Navigation */}
        {/* Added dark mode classes */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Added dark mode text color */}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
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
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.fullName || 'User'}&background=0D8ABC&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
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