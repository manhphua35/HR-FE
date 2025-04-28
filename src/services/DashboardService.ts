import axios from 'axios';
import { ApiResponse } from '../types/api';

interface DashboardStats {
  totalEmployees: number;
  departmentsCount: number;
  averagePerformance: number;
  issuesCount: number;
  attendanceRate: number;
  leaveRequests: number;
  openPositions: number;
  projectsCount: number;
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
  private static baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  static async getAdminStats(): Promise<DashboardStats> {
    const response = await axios.get<ApiResponse<DashboardStats>>(
      `${this.baseUrl}/dashboard/admin`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  }

  static async getHrStats(): Promise<DashboardStats> {
    const response = await axios.get<ApiResponse<DashboardStats>>(
      `${this.baseUrl}/dashboard/hr`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  }

  static async getDepartmentStats(departmentId: string): Promise<DepartmentStats> {
    const response = await axios.get<ApiResponse<DepartmentStats>>(
      `${this.baseUrl}/dashboard/department/${departmentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  }

  static async getEmployeeStats(employeeId: string): Promise<EmployeeStats> {
    const response = await axios.get<ApiResponse<EmployeeStats>>(
      `${this.baseUrl}/dashboard/employee/${employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  }

  static async getRecentActivities(): Promise<Activity[]> {
    const response = await axios.get<ApiResponse<Activity[]>>(
      `${this.baseUrl}/dashboard/activities`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  }
}

export type { DashboardStats, DepartmentStats, EmployeeStats, Schedule, Activity };