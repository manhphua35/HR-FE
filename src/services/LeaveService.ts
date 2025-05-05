import axiosInstance from '../config/axios';

export interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  type: 'ANNUAL' | 'SICK' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  numberOfDays: number;
  reason: string;
  user: {
    id: number;
    fullName: string;
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
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  type?: 'ANNUAL' | 'SICK' | 'OTHER';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
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
      const response = await axiosInstance.get<LeaveRequest[]>('/leaves');
      return response.data;
    } catch (error) {
      console.error('Error fetching my leaves:', error);
      throw error;
    }
  },

  async createLeave(data: {
    startDate: string;
    endDate: string;
    type: 'ANNUAL' | 'SICK' | 'OTHER';
    reason: string;
  }): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.post<LeaveRequest>('/leaves', data);
      return response.data;
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
      const response = await axiosInstance.put<LeaveRequest>(`/leaves/${id}`, data);
      return response.data;
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

  async approveLeave(id: number): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.put<LeaveRequest>(`/leaves/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving leave:', error);
      throw error;
    }
  },

  async rejectLeave(id: number): Promise<LeaveRequest> {
    try {
      const response = await axiosInstance.put<LeaveRequest>(`/leaves/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting leave:', error);
      throw error;
    }
  }
};