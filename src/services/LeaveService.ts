import axios from 'axios';
import { API_URL } from '../config';

export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverName?: string;
  approvalDate?: string;
  comments?: string;
}

export interface LeaveSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  leaveBalance: {
    annual: number;
    sick: number;
    unpaid: number;
  };
}

export interface CreateLeaveRequest {
  startDate: string;
  endDate: string;
  type: Leave['type'];
  reason: string;
}

export const LeaveService = {
  getLeaveRequests: async (): Promise<Leave[]> => {
    const response = await axios.get<{ data: Leave[] }>(
      `${API_URL}/leave/requests`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getLeaveSummary: async (): Promise<LeaveSummary> => {
    const response = await axios.get<{ data: LeaveSummary }>(
      `${API_URL}/leave/summary`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  createLeaveRequest: async (data: CreateLeaveRequest): Promise<Leave> => {
    const response = await axios.post<{ data: Leave }>(
      `${API_URL}/leave/requests`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  approveLeaveRequest: async (
    id: number,
    comments?: string
  ): Promise<Leave> => {
    const response = await axios.put<{ data: Leave }>(
      `${API_URL}/leave/requests/${id}/approve`,
      { comments },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  rejectLeaveRequest: async (
    id: number,
    comments?: string
  ): Promise<Leave> => {
    const response = await axios.put<{ data: Leave }>(
      `${API_URL}/leave/requests/${id}/reject`,
      { comments },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  cancelLeaveRequest: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/leave/requests/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
  }
};