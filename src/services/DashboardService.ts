import axiosInstance from '../config/axios'; // Import axiosInstance as default
import { ApiResponse } from '../types/api';

// --- Định nghĩa Interfaces mới khớp với API Response ---

interface OverviewStats {
  totalEmployees: number;
  totalDepartments: number; // Đổi tên từ departmentsCount
  activeLeaves: number;
  currentTrainings: number;
  totalSalary: number;
  averagePerformance: number;
}

interface DepartmentStatDetail {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
  activeLeaves: number;
  ongoingTrainings: number;
  averagePerformance: number;
  totalSalary: number;
}

interface CountByDepartment {
  department: string;
  count: number;
}

interface ScoreByDepartment {
  department: string;
  score: number;
}

interface AmountByDepartment {
  department: string;
  amount: number;
}

interface PayrollDepartmentBreakdown {
  departmentName: string;
  totalSalary: number;
}

interface LeaveStats {
  total: number;
  details: any[]; // Để trống nếu không có dữ liệu
}

interface TrainingStats {
  total: number;
  details: any[]; // Để trống nếu không có dữ liệu
}

interface PayrollStats {
  total: number;
  departmentBreakdown: PayrollDepartmentBreakdown[];
}

interface PerformanceStats {
  averageScore: number; // Lưu ý: overview cũng có averagePerformance
  byDepartment: ScoreByDepartment[];
}

interface SalaryStats {
  total: number;
  byDepartment: AmountByDepartment[];
}

// Interface chính cho toàn bộ response
interface DashboardData {
  overview: OverviewStats;
  departmentStats: DepartmentStatDetail[];
  leaveStats: LeaveStats;
  trainingStats: TrainingStats;
  payrollStats?: PayrollStats; // Thêm payrollStats để phù hợp với API response
  performanceStats?: PerformanceStats; // Optional để tránh lỗi khi không có
  salaryStats?: SalaryStats; // Optional để tránh lỗi khi không có
}

// --- Các interface cũ không còn dùng cho getDashboardData ---
// interface DashboardStats { ... } // Đã thay bằng DashboardData

interface DepartmentStats { // Giữ lại cho getDepartmentStats nếu endpoint đó khác
  employeeCount: number;
  activeProjects: number;
  pendingLeaveRequests: number;
  averagePerformance: number;
  attendance: {
    present: number;
    total: number;
  };
  projectCompletion: number;
  trainingProgress: number;
}

interface EmployeeStats {
  workingHours: number;
  attendanceRate: number;
  performanceScore: number;
  leaveBalance: number;
  schedule: Array<Schedule>;
  activities: Array<Activity>;
}

interface Schedule {
  id: number;
  title: string;
  date: string;
  type: 'meeting' | 'training' | 'deadline' | 'other';
}

interface Activity {
  id: number;
  type: 'user' | 'document' | 'calendar' | 'notification' | 'other';
  title: string;
  description: string;
  timestamp: string;
}

export class DashboardService {
  // No need for baseUrl, axiosInstance handles it
  // No need for manual headers, axiosInstance handles Authorization

  // Updated to accept month and year parameters and return the new DashboardData type
  static async getDashboardData(month: number, year: number): Promise<DashboardData> {
    try {
      const response = await axiosInstance.get<ApiResponse<DashboardData>>(
        '/reports/dashboard-data',
        {
          params: { month, year }
        }
      );
      
      // Trả về data từ wrapper object
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Updated other methods to use axiosInstance for consistency
  // Note: Endpoints for these might also need verification against backend routes
  // TODO: Xác minh kiểu trả về thực tế cho getHrStats nếu endpoint /dashboard/hr tồn tại và khác /reports/dashboard-data
  static async getHrStats(): Promise<any> {
    const response = await axiosInstance.get<ApiResponse<any>>(
      '/dashboard/hr'
    );
    return response.data.data;
  }

  static async getDepartmentStats(departmentId: string): Promise<DepartmentStats> {
    const response = await axiosInstance.get<ApiResponse<DepartmentStats>>(
      `/dashboard/department/${departmentId}`
    );
    return response.data.data;
  }

  static async getEmployeeStats(employeeId: string): Promise<EmployeeStats> {
    const response = await axiosInstance.get<ApiResponse<EmployeeStats>>(
      `/dashboard/employee/${employeeId}`
    );
    return response.data.data;
  }

  // Commented out as no corresponding backend endpoint was found
  // static async getRecentActivities(): Promise<Activity[]> {
  //   const response = await axiosInstance.get<ApiResponse<Activity[]>>(
  //     '/dashboard/activities'
  //   );
  //   return response.data.data;
  // }
}

// Xuất các kiểu mới
export type {
  OverviewStats,
  DepartmentStatDetail,
  CountByDepartment,
  ScoreByDepartment,
  AmountByDepartment,
  LeaveStats,
  TrainingStats,
  PayrollStats,
  PayrollDepartmentBreakdown,
  PerformanceStats,
  SalaryStats,
  DashboardData,
  // Giữ lại các kiểu cũ nếu các hàm khác còn dùng
  DepartmentStats,
  EmployeeStats,
  Schedule,
  Activity
};