import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/api';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const formatRole = (role?: User['role']) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
      <div className={`sidebar bg-indigo-800 text-white w-64 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          <div className="flex items-center">
            <i className="fas fa-users-cog text-2xl mr-3"></i>
            <span className="logo-text text-xl font-bold">HR Management</span>
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white focus:outline-none"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 flex items-center border-b border-indigo-700">
          <img 
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=0D8ABC&color=fff`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <div className="font-medium">{currentUser?.name || 'User'}</div>
            <div className="text-xs text-indigo-200">
              {formatRole(currentUser?.role)}
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
                  className={`px-4 py-3 flex items-center hover:bg-indigo-700 ${
                    location.pathname === item.path ? 'bg-indigo-900' : ''
                  }`}
                >
                  <i className={`${item.icon} mr-3`}></i>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-700">
          <button 
            onClick={logout}
            className="flex items-center text-white hover:text-indigo-200 w-full"
          >
            <i className="fas fa-sign-out-alt mr-3"></i>
            <span className="nav-text">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-hidden flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* Messages */}
              <div className="relative">
                <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
                  <i className="fas fa-envelope text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>

              {/* Profile */}
              <div className="relative">
                <button className="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none">
                  <img 
                    src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=0D8ABC&color=fff`}
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;