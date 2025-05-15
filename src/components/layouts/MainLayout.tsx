import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items with role-based access
  const navigationItems = [
    {
      name: 'Trang chủ', // Đổi thành Trang chủ
      path: '/dashboard',
      icon: 'fas fa-tachometer-alt',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD', 'employee']
    },
    { 
      name: 'Employees', 
      path: '/employees', 
      icon: 'fas fa-users',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD']
    },
    { 
      name: 'Departments', 
      path: '/departments', 
      icon: 'fas fa-building',
      allowedRoles: ['admin', 'HR_STAFF']
    },
    { 
      name: 'Attendance', 
      path: '/attendance', 
      icon: 'fas fa-clipboard-check',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD', 'employee']
    },
    { 
      name: 'Performance', 
      path: '/performance', 
      icon: 'fas fa-chart-line',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD', 'employee']
    },
    { 
      name: 'Leave Requests', 
      path: '/leave-requests', 
      icon: 'fas fa-calendar-alt',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD', 'employee']
    },
    { 
      name: 'Payroll', 
      path: '/payroll', 
      icon: 'fas fa-money-bill-alt',
      allowedRoles: ['admin', 'HR_STAFF']
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: 'fas fa-chart-bar',
      allowedRoles: ['admin', 'HR_STAFF', 'DEPARTMENT_HEAD']
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: 'fas fa-cog',
      allowedRoles: ['admin']
    }
  ];

  // Filter navigation items based on user roleType
  const filteredNavItems = navigationItems.filter(item =>
    currentUser && currentUser.role && item.allowedRoles.includes(currentUser.role.roleType) // Access nested role.roleType
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      <div 
        className={`lg:block fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`lg:block fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white border-r lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        }`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="mx-2 text-2xl font-semibold text-blue-600">HR Trang chủ</span>
          </div>
        </div>

        <nav className="mt-10">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-2 mt-2 text-gray-600 transition-colors duration-300 transform rounded-lg ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 hover:text-gray-700'
                }`
              }
            >
              <i className={`${item.icon} w-5 h-5`}></i>
              <span className="mx-4 font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none lg:hidden"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            {/* User Menu */}
            <div className="relative">
              <div className="flex items-center">
                {currentUser && (
                  <>
                    <div className="flex flex-col items-end mr-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {currentUser.fullName} {/* Use fullName */}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {currentUser.role?.roleType.replace('_', ' ') || 'N/A'} {/* Safely access nested role.roleType */}
                      </span>
                    </div>
                    <button className="relative w-8 h-8 overflow-hidden rounded-full">
                      <img
                        src={`https://ui-avatars.com/api/?name=${currentUser.fullName}&background=0D8ABC&color=fff`}
                        alt="avatar"
                        className="object-cover w-full h-full"
                      />
                    </button>
                  </>
                )}

                <div className="ml-3">
                  <button
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container px-6 py-8 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
