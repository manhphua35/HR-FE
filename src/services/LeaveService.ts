import axiosInstance from '../config/axios';

export type LeaveType = 'ANNUAL' | 'SICK' | 'OTHER';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: LeaveStatus;
  numberOfDays: number;
  reason: string;
  rejectionReason?: string;
  user: {
    id: number;
    fullName: string;
    remainingLeaves: number;
    [key: string]: any;
  };
  approver?: {
    id: number;
    fullName: string;
    [key: string]: any;
  };
  createdAt: string;
}

interface GetAllLeavesParams {
  startDate?: string;
  endDate?: string;
  status?: LeaveStatus;
  type?: LeaveType;
  userId?: number;
  departmentId?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface CreateLeaveRequest {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  numberOfDays: number;
}

export const LeaveService = {
  async getAllLeaves(params?: GetAllLeavesParams): Promise<LeaveRequest[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<LeaveRequest[]>>('/leaves/all', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all leaves:', error);
      throw error;
    }
  },

  async getMyLeaves(): Promise<LeaveRequest[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<LeaveRequest[]>>('/leaves/my-leaves');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my leaves:', error);
      throw error;
    }
  },

  async getLeavesBySpecificDate(date: string, userId?: number, departmentId?: number): Promise<LeaveRequest[]> {
    try {
      const params = new URLSearchParams();
      
      params.append('date', date);
      if (userId) params.append('userId', userId.toString());
      if (departmentId) params.append('departmentId', departmentId.toString());
      
      const response = await axiosInstance.get<ApiResponse<LeaveRequest[]>>(`/leaves/by-date?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching leaves by specific date:', error);
      throw error;
    }
  },

  async getLeavesByMonth(year: number, month: number, userId?: number, departmentId?: number): Promise<LeaveRequest[]> {
    try {
      const params = new URLSearchParams();
      
      params.append('year', year.toString());
      params.append('month', month.toString());
      if (userId) params.append('userId', userId.toString());
      if (departmentId) params.append('departmentId', departmentId.toString());
      
      const response = await axiosInstance.get<ApiResponse<LeaveRequest[]>>(`/leaves/by-month?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching leaves by month:', error);
      throw error;
    }
  },

  async createLeave(data: CreateLeaveRequest): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.post<ApiResponse<LeaveRequest>>('/leaves/create', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating leave:', error);
      throw error;
    }
  },

  async updateLeave(id: number, data: {
    startDate: string;
    endDate: string;
    type: 'ANNUAL' | 'SICK' | 'OTHER';
    reason: string;
  }): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating leave:', error);
      throw error;
    }
  },

  async deleteLeave(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/leaves/${id}`);
    } catch (error) {
      console.error('Error deleting leave:', error);
      throw error;
    }
  },

  async approveLeave(id: number, comment?: string): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/status`, {
        status: 'APPROVED',
        comment
      });
      return response.data.data;
    } catch (error) {
      console.error('Error approving leave:', error);
      throw error;
    }
  },

  async rejectLeave(id: number, rejectionReason: string): Promise<LeaveRequest> {
    try {
      if (!rejectionReason) {
        throw new Error('Rejection reason is required');
      }
      
      const response = await axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/status`, {
        status: 'REJECTED',
        rejectionReason
      });
      return response.data.data;
    } catch (error) {
      console.error('Error rejecting leave:', error);
      throw error;
    }
  }
};