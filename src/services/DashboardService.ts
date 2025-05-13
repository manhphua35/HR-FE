import axiosInstance from '../config/axios'; // Import axiosInstance as default
import { ApiResponse } from '../types/api';

// --- Định nghĩa Interfaces mới khớp với API Response ---

interface SummaryStats {
  totalEmployees: number;
  activeLeaves: number;
  ongoingTrainings: number;
  totalSalary: number | null;
  avgPerformance: number;
}

interface DepartmentStatDetail {
  department: string;
  employeeCount: number;
  leaveCount: number;
  trainingCount: number;
  totalSalary: number | null;
  avgPerformance: number;
}

// Interface chính cho toàn bộ response
interface DashboardData {
  summary: SummaryStats;
  departments: DepartmentStatDetail[];
}

interface DepartmentStats {
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
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const response = await axiosInstance.get<ApiResponse<EmployeeStats>>(
      `/reports/employee-dashboard/${employeeId}`,
      {
        params: { month: currentMonth, year: currentYear }
      }
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
  SummaryStats,
  DepartmentStatDetail,
  DashboardData,
  DepartmentStats,
  EmployeeStats,
  Schedule,
  Activity
};