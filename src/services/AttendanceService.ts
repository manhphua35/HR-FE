import axiosInstance from '../config/axios';

export interface AttendanceRecord {
  id: number;
  userId: number;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: number;
  status: string;
}

export interface AttendanceSummary {
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
  averageWorkingHours: number;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const AttendanceService = {
  getAttendanceRecords: async (dateFilter?: string): Promise<AttendanceRecord[]> => {
    const url = dateFilter 
      ? `/attendance/records?date=${dateFilter}`
      : '/attendance/records';
    const response = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>(url);
    return response.data.data;
  },

  getAttendanceSummary: async (dateFilter?: string): Promise<AttendanceSummary> => {
    const url = dateFilter 
      ? `/attendance/summary?date=${dateFilter}`
      : '/attendance/summary';
    const response = await axiosInstance.get<ApiResponse<AttendanceSummary>>(url);
    return response.data.data;
  },

  createAttendanceRecord: async (data: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>(
      '/attendance/records',
      data
    );
    return response.data.data;
  },

  updateAttendanceRecord: async (id: number, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const response = await axiosInstance.put<ApiResponse<AttendanceRecord>>(
      `/attendance/records/${id}`,
      data
    );
    return response.data.data;
  },

  deleteAttendanceRecord: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/attendance/records/${id}`);
  },

  exportAttendanceReport: async (dateFilter?: string): Promise<Blob> => {
    const url = dateFilter 
      ? `/attendance/export?date=${dateFilter}`
      : '/attendance/export';
    const response = await axiosInstance.get<Blob>(url, {
      responseType: 'blob'
    });
    return response.data;
  }
};