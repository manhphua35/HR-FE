import axiosInstance from '../config/axios';

export type LeaveType = 'ANNUAL' | 'SICK' | 'OTHER' | 'HOLIDAY' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  type: LeaveType;
  status: LeaveStatus;
  numberOfDays: number;
  reason: string;
  rejectionReason?: string;
  approverId?: number | null;
  createdAt: string;
  updatedAt: string;
  holidayBatchId?: string;
  holidayBatchName?: string;
  // Các trường sau đây có thể được thiết lập bởi backend nếu có, hoặc không
  user?: {
    id: number;
    fullName: string;
    remainingLeaves?: number;
    [key: string]: any;
  };
  approver?: {
    id: number;
    fullName: string;
    [key: string]: any;
  };
}

interface GetAllLeavesParams {
  startDate?: string;
  endDate?: string;
  status?: LeaveStatus;
  type?: LeaveType;
  userId?: number;
  departmentId?: number;
  holidayBatchId?: string;
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

interface CreateHolidayRequest {
  startDate: string;
  endDate: string;
  reason: string;
  departmentIds?: number[];
  batchName?: string;
}

interface CreateHolidayResponse {
  success: boolean;
  count: number;
  errors: any[];
  batchId: string;
}

export interface HolidayBatch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdBy: number;
  createdAt: string;
  leaveCount: number;
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

  async createHoliday(data: CreateHolidayRequest): Promise<CreateHolidayResponse> {
    try {
      const response = await axiosInstance.post<ApiResponse<CreateHolidayResponse>>('/leaves/create-holiday', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  },

  async getHolidayBatches(): Promise<HolidayBatch[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<HolidayBatch[]>>('/leaves/holiday-batches');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching holiday batches:', error);
      throw error;
    }
  },

  async getHolidayBatchDetails(batchId: string): Promise<{ batch: HolidayBatch, leaves: LeaveRequest[] }> {
    try {
      const response = await axiosInstance.get<ApiResponse<{ batch: HolidayBatch, leaves: LeaveRequest[] }>>(`/leaves/holiday-batches/${batchId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching holiday batch details:', error);
      throw error;
    }
  },

  async deleteHolidayBatch(batchId: string): Promise<{ success: boolean, deletedCount: number }> {
    try {
      const response = await axiosInstance.delete<ApiResponse<{ success: boolean, deletedCount: number }>>(`/leaves/holiday-batches/${batchId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting holiday batch:', error);
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