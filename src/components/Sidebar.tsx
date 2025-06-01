import React from 'react';
import { Link, Location } from 'react-router-dom'; // Import Location
import { User } from '../types/api'; // Import User type

// Định nghĩa props cho component Sidebar
interface SidebarProps {
  currentUser: User | null | undefined; // Người dùng hiện tại
  logout: () => void; // Hàm đăng xuất
  location: Location; // Sử dụng kiểu Location từ react-router-dom
  sidebarCollapsed: boolean; // Trạng thái thu gọn của sidebar
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>; // Hàm cập nhật trạng thái sidebar
  accessibleItems: Array<{ path: string; name: string; icon: string; }>; // Danh sách các mục có thể truy cập
}

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  logout,
  location,
  sidebarCollapsed,
  setSidebarCollapsed,
  accessibleItems
}) => {

  // Hàm định dạng vai trò người dùng (chuyển ROLE_ADMIN thành Admin)
  const formatRole = (roleType?: User['role']['roleType']) => {
    if (!roleType) return '';
    return roleType
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    // Container chính của sidebar với trạng thái thu gọn/mở rộng
    <div className={`sidebar bg-indigo-800 text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Phần logo và nút thu gọn */}
      <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 relative ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
           <i className={`fas fa-users-cog text-2xl text-white ${sidebarCollapsed ? '' : 'mr-3'}`}></i>
           <span className={`logo-text text-xl font-bold text-white transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>HR Management</span>
        </div>
        {/* Nút chuyển đổi trạng thái thu gọn */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white hover:text-indigo-200 focus:outline-none p-2 rounded-md absolute top-1/2 -right-3 transform -translate-y-1/2 bg-indigo-700 dark:bg-indigo-600 shadow-md"
          style={{ right: sidebarCollapsed ? 'auto' : '-0.75rem', left: sidebarCollapsed ? '-0.75rem' : 'auto' }}
        >
          <i className={`fas ${sidebarCollapsed ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
        </button>
      </div>

      {/* Thông tin người dùng */}
      <div className={`p-4 flex items-center border-b border-indigo-700 dark:border-indigo-900 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <img
          src={currentUser?.avatar || '/logo192.png'} // Sử dụng logo mặc định nếu không có avatar
          alt="Profile"
          className="w-10 h-10 rounded-full flex-shrink-0 object-cover" // Thêm object-cover để ảnh không bị méo
        />
        <div className={`ml-3 transition-opacity duration-200 ${sidebarCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <div className="font-medium text-white">{currentUser?.fullName || 'User'}</div>
          <div className="text-xs text-indigo-200 dark:text-indigo-300">
            {formatRole(currentUser?.role?.roleType)}
          </div>
        </div>
      </div>

      {/* Phần điều hướng */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {/* Hiển thị các mục menu từ danh sách đã được lọc */}
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

      {/* Nút đăng xuất */}
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
  );
};

export default Sidebar;