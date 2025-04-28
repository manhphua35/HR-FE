import axios from 'axios';
import { API_URL } from '../config';

export interface EmployeeReport {
  totalEmployees: number;
  newHires: number;
  turnover: number;
  departmentDistribution: {
    department: string;
    count: number;
    percentage: number;
  }[];
  ageDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
    percentage: number;
  }[];
}

export interface AttendanceReport {
  averageAttendance: number;
  lateArrivals: number;
  earlyDepartures: number;
  absences: number;
  departmentAttendance: {
    department: string;
    attendance: number;
    lateCount: number;
  }[];
  monthlyTrend: {
    month: string;
    attendance: number;
    lateCount: number;
  }[];
}

export interface PayrollReport {
  totalPayroll: number;
  averageSalary: number;
  departmentPayroll: {
    department: string;
    total: number;
    average: number;
  }[];
  salaryRanges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    total: number;
    average: number;
  }[];
}

export interface LeaveReport {
  totalLeaveRequests: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  pendingLeaves: number;
  leaveTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  departmentLeave: {
    department: string;
    approved: number;
    rejected: number;
    pending: number;
  }[];
  monthlyTrend: {
    month: string;
    requests: number;
    approved: number;
  }[];
}

export const ReportService = {
  getEmployeeReport: async (startDate: string, endDate: string): Promise<EmployeeReport> => {
    const response = await axios.get<{ data: EmployeeReport }>(
      `${API_URL}/reports/employees`,
      {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getAttendanceReport: async (startDate: string, endDate: string): Promise<AttendanceReport> => {
    const response = await axios.get<{ data: AttendanceReport }>(
      `${API_URL}/reports/attendance`,
      {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getPayrollReport: async (startDate: string, endDate: string): Promise<PayrollReport> => {
    const response = await axios.get<{ data: PayrollReport }>(
      `${API_URL}/reports/payroll`,
      {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getLeaveReport: async (startDate: string, endDate: string): Promise<LeaveReport> => {
    const response = await axios.get<{ data: LeaveReport }>(
      `${API_URL}/reports/leave`,
      {
        params: { startDate, endDate },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  exportReport: async (
    type: 'employees' | 'attendance' | 'payroll' | 'leave',
    startDate: string,
    endDate: string
  ): Promise<Blob> => {
    const response = await axios.get<ArrayBuffer>(
      `${API_URL}/reports/${type}/export`,
      {
        params: { startDate, endDate },
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return new Blob([response.data], { type: 'application/vnd.ms-excel' });
  }
};