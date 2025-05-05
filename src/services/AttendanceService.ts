import axiosInstance from '../config/axios';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  roleType: string;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  departmentId: number;
  positionId: string;
  roleId: number;
  hireDate: string;
  remainingLeaves: number;
  baseSalary: string;
  isActive: boolean;
  role: Role;
  department: Department;
}

export interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  LATE = 'late', 
  ABSENT = 'absent',
  LEAVE = 'leave'
}

const displayStatus = {
  [AttendanceStatus.PRESENT]: 'Đúng giờ',
  [AttendanceStatus.LATE]: 'Đi muộn',
  [AttendanceStatus.ABSENT]: 'Vắng mặt',
  [AttendanceStatus.LEAVE]: 'Nghỉ phép'
};

export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  workHours: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  leaveRequest?: LeaveRequest | null;
}

export interface GetAttendancesParams {
  userId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAttendanceData {
  userId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  workHours: number | null;
  notes: string | null;
  leaveRequestId?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const AttendanceService = {
  getAttendances: async (params: GetAttendancesParams = {}): Promise<PaginatedResponse<AttendanceRecord>> => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `/attendances${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    try {
      const response = await axiosInstance.get(url);
      const records = response.data as AttendanceRecord[]; // Type assertion here
      
      return {
        records: records,
        total: records.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil(records.length / (params.limit || 10))
      };
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw new Error('Failed to fetch attendance records');
    }
  },

  getStatusDisplay: (status: AttendanceStatus): string => {
    return displayStatus[status] || status;
  },

  getAttendanceById: async (id: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.get<ApiResponse<AttendanceRecord>>(`/attendances/${id}`);
    return response.data.data;
  },

  createAttendance: async (data: CreateAttendanceData): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendances', data);
    return response.data.data;
  },

  updateAttendance: async (id: string, data: Partial<CreateAttendanceData>): Promise<AttendanceRecord> => {
    const response = await axiosInstance.put<ApiResponse<AttendanceRecord>>(`/attendances/${id}`, data);
    return response.data.data;
  },

  deleteAttendance: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/attendances/${id}`);
  },

  checkIn: async (notes?: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendances/check-in', { notes });
    return response.data.data;
  },

  checkOut: async (notes?: string): Promise<AttendanceRecord> => {
    const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendances/check-out', { notes });
    return response.data.data;
  }
};