import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types/api';

// Define an interface for Department object
interface DepartmentObject {
  id: number;
  name: string;
  description?: string;
}

// Define props for the Sidebar component
interface SidebarProps {
  currentUser: User | null | undefined;
  logout: () => void;
  location: any;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  accessibleItems: Array<{ path: string; name: string; icon: string; }>;
  onViewProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  logout,
  location,
  sidebarCollapsed,
  setSidebarCollapsed,
  accessibleItems,
  onViewProfile
}) => {
  // const [departmentName, setDepartmentName] = useState<string | undefined>(undefined);

  // Fetch department name if needed
  // useEffect(() => {
  //   const fetchDepartmentName = async () => {
  //     // Chỉ fetch khi có departmentId nhưng không có tên phòng ban
  //     if (currentUser?.departmentId && 
  //         (!currentUser.department || 
  //          (typeof currentUser.department === 'object' && 
  //           !(currentUser.department as DepartmentObject)?.name))) {
  //       try {
  //         const departmentData = await DepartmentService.getDepartmentById(currentUser.departmentId);
  //         if (departmentData) {
  //           setDepartmentName(departmentData.name);
  //         }
  //       } catch (error) {
  //         console.error('Error fetching department name:', error);
  //       }
  //     }
  //   };

  //   fetchDepartmentName();
  // }, [currentUser]);

  // Hàm định dạng kiểu vai trò
  const formatRole = (roleType?: string) => {
    if (!roleType) return '';
    return roleType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Hàm định dạng vai trò + phòng ban
  const formatRoleWithDepartment = () => {
    const role = formatRole(currentUser?.role?.roleType);
    
    // Xác định tên phòng ban
    // let deptName: string | undefined;

    // if (typeof currentUser?.department === 'string') {
    //   // Nếu department là chuỗi
    //   deptName = currentUser.department;
    // } else if (currentUser?.department && typeof currentUser.department === 'object') {
    //   // Nếu department là đối tượng có thuộc tính name
    //   const deptObject = currentUser.department as DepartmentObject;
    //   deptName = deptObject.name;
    // } 
    if (!role) return '';
    
    // Nếu là Employee và có phòng ban, hiển thị "Nhân viên phòng {department}"
    if (role === 'Employee' ) {
      return `Nhân viên `;
    }

    if(role === 'System Admin') {
      return 'Quản trị hệ thống';
    }

    if(role === 'Hr Staff') {
      return 'Nhân viên nhân sự';
    }

    // Nếu là Department Head và có phòng ban, hiển thị "Trưởng phòng {department}"
    if (role === 'Department Head' ) {
      return `Trưởng phòng `;
    }
    
    // Các vai trò khác hoặc không có phòng ban
    return role;
  };

  console.log('Current User:', currentUser);
  return (
    <div className={`sidebar bg-indigo-800 text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo and Toggle Button */}
      <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 relative ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
           <i className={`fas fa-users-cog text-2xl text-white ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
           <span className={`logo-text text-xl font-bold text-white transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>HR Management</span>
        </div>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white hover:text-indigo-200 focus:outline-none p-2 rounded-md absolute top-1/2 -right-3 transform -translate-y-1/2 bg-indigo-700 dark:bg-indigo-600 shadow-md"
          style={{ right: sidebarCollapsed ? 'auto' : '-0.75rem', left: sidebarCollapsed ? '-0.75rem' : 'auto' }}
        >
          <i className={`fas ${sidebarCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <img
          src={currentUser?.avatar || '/logo192.png'} // Use local logo as fallback
          alt="Profile"
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
        />
        <div className={`ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <div className="font-medium text-white">{currentUser?.fullName || 'User'}</div>
          <div className="text-xs text-indigo-200 dark:text-indigo-300">
            {formatRoleWithDepartment()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {/* Map over the filtered accessibleItems */}
          {accessibleItems.map((item) => (
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
          onClick={() => onViewProfile()}
          className={`flex items-center text-indigo-100 hover:text-indigo-200 dark:hover:text-indigo-300 w-full mb-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <i className={`fas fa-user-circle ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
          <span className={`nav-text transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Thông tin cá nhân</span>
        </button>
        <button
          onClick={logout}
          className={`flex items-center text-indigo-100 hover:text-indigo-200 dark:hover:text-indigo-300 w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <i className={`fas fa-sign-out-alt ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
          <span className={`nav-text transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 