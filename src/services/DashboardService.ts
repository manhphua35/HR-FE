import axiosInstance from '../config/axios'; // Import axiosInstance as default
import { ApiResponse } from '../types/api';

// --- Định nghĩa Interfaces mới khớp với API Response ---

interface SummaryStats {
  totalEmployees: number;
  activeLeaves: number;
  ongoingTrainings: number;
  totalSalary: number;
  avgPerformance: number;
}

interface DepartmentStatDetail {
  department: string;
  employeeCount: number;
  leaveCount: number;
  trainingCount: number;
  totalSalary: number;
  avgPerformance: number;
}

// Interface chính cho toàn bộ response
interface DashboardData {
  summary: SummaryStats;
  departments: DepartmentStatDetail[];
}

// Interface cho dashboard của Trưởng phòng
interface DepartmentStats {
  employeeCount: number;
  pendingLeaveRequests: number;
  averagePerformance: number;
  attendance: {
    present: number;
    total: number;
  };
  projectCompletion: number;
  trainingProgress: number;
  activeProjects: number;
}

// Interface cho dữ liệu nhân viên
interface IEmployeeProfile {
  id: number;
  fullName: string;
  email: string;
  department?: string;
  position?: string;
}

interface IAttendanceSummary {
  totalWorkDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}

interface ILeaveSummary {
  used: number;
  remaining: number;
  pending: number;
}

interface IPayrollSummary {
  month: number;
  year: number;
  basicSalary: string;
  totalAllowance: string;
  totalDeduction: string;
  totalBenefit: string;
  bonus: string;
  tax: string;
  netSalary: string;
  leaveDeductionAmount: string;
  latePenaltyAmount: string;
  isFinalized: boolean;
}

interface ITrainingCourse {
  id: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  progress: number;
}

interface IPerformanceSummary {
  period: string;
  overallScore: string;
  strengths: string[];
  improvements: string[];
}

interface IEmployeeDashboardData {
  employee: IEmployeeProfile;
  attendance: IAttendanceSummary;
  leaves: ILeaveSummary;
  payroll: IPayrollSummary | null;
  training: ITrainingCourse[];
  performance: IPerformanceSummary | null;
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
  static async getHrStats(): Promise<DashboardData> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Sử dụng endpoint dashboard-data thay vì /dashboard/hr không tồn tại
      const response = await axiosInstance.get<ApiResponse<DashboardData>>(
        '/reports/dashboard-data',
        {
          params: { month: currentMonth, year: currentYear }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching HR dashboard data:', error);
      throw error;
    }
  }

  // Lấy dữ liệu cho dashboard của Trưởng phòng
  static async getDepartmentStats(departmentId: string): Promise<DepartmentStats> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const response = await axiosInstance.get<ApiResponse<DepartmentStats>>(
        `/reports/department-dashboard/${departmentId}`,
        {
          params: { month: currentMonth, year: currentYear }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  }

  // Lấy dữ liệu cho dashboard của Nhân viên
  static async getEmployeeStats(employeeId: string): Promise<IEmployeeDashboardData> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const response = await axiosInstance.get<ApiResponse<IEmployeeDashboardData>>(
        `/reports/employee-dashboard/${employeeId}`,
        {
          params: { month: currentMonth, year: currentYear }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    }
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
  IEmployeeDashboardData,
  IEmployeeProfile,
  IAttendanceSummary,
  ILeaveSummary,
  IPayrollSummary,
  ITrainingCourse,
  IPerformanceSummary
};