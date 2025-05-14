import React from 'react';

// Import các component trang (giữ nguyên để tham khảo, nhưng không cần thiết cho Sidebar)
// import Dashboard from '../pages/Dashboard';
// import Employees from '../pages/Employees';
// import Departments from '../pages/Departments';
// import Attendance from '../pages/Attendance';
// import Performance from '../pages/Performance';
// import Payroll from '../pages/Payroll';
// import Leave from '../pages/Leave';
// import Reports from '../pages/Reports';
// import Settings from '../pages/Settings';

// Định nghĩa kiểu Role (khớp với backend)
export type Role = 'SYSTEM_ADMIN' | 'HR_STAFF' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';

// Interface cho cấu hình quyền truy cập route
export interface RoutePermissionConfig {
  path: string;
  allowedRoles: Role[];
  // Các thông tin khác có thể thêm vào đây nếu cần cho Sidebar (ví dụ: label, icon)
  label: string; // Thêm label để Sidebar sử dụng
  icon?: React.ComponentType<any>; // Thêm icon component (tùy chọn)
  id: string; // Thêm id để khớp với logic activeTab hiện tại
}

// Mảng cấu hình quyền truy cập route
// Dựa trên protectedRoutes từ AppRoutes.tsx, thêm label và id
export const routePermissions: RoutePermissionConfig[] = [
  {
    path: "/dashboard",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    label: "Trang chủ", // Đổi thành Trang chủ
    id: "dashboard"
    // icon: DashboardIcon // Sẽ import icon vào Sidebar trực tiếp
  },
  {
    path: "/employees",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD'],
    label: "Nhân viên", // Đổi thành Nhân viên
    id: "employees"
    // icon: EmployeesIcon
  },
  {
    path: "/departments",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF'],
    label: "Phòng ban", // Đổi thành Phòng ban
    id: "departments"
    // icon: DepartmentsIcon
  },
  {
    path: "/attendance",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    label: "Chấm công", // Đổi thành Chấm công
    id: "attendance"
    // icon: AttendanceIcon // Cần tạo icon nếu muốn hiển thị
  },
  {
    path: "/performance",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    label: "Hiệu suất", // Đổi thành Hiệu suất
    id: "performance"
    // icon: PerformanceIcon // Cần tạo icon nếu muốn hiển thị
  },
  {
    path: "/payroll",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF'],
    label: "Lương thưởng", // Đổi thành Lương thưởng
    id: "payroll"
    // icon: PayrollIcon // Cần tạo icon nếu muốn hiển thị
  },
  {
    path: "/leave",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE'],
    label: "Nghỉ phép", // Đổi thành Nghỉ phép
    id: "leave"
    // icon: LeaveIcon // Cần tạo icon nếu muốn hiển thị
  },
  {
    path: "/reports",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD'],
    label: "Báo cáo", // Đổi thành Báo cáo
    id: "reports"
    // icon: ReportsIcon
  },
  {
    path: "/settings",
    allowedRoles: ['SYSTEM_ADMIN', 'HR_STAFF', 'DEPARTMENT_HEAD', 'EMPLOYEE'], // Cho phép tất cả các vai trò
    label: "Cài đặt", // Đổi thành Cài đặt
    id: "settings"
    // icon: SettingsIcon
  }
];

// Hàm tiện ích để kiểm tra quyền truy cập cho một path cụ thể
export const hasPermission = (path: string, userRole: Role | undefined): boolean => {
  if (!userRole) return false; // Nếu không có vai trò, không có quyền
  const routeConfig = routePermissions.find(route => route.path === path);
  if (!routeConfig) return false; // Nếu không tìm thấy cấu hình route, mặc định không có quyền
  return routeConfig.allowedRoles.includes(userRole);
};