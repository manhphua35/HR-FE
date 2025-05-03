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
  type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'OTHER'; // Changed to uppercase
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
  // Get current user's leave requests
  getLeaveRequests: async (): Promise<Leave[]> => {
    const response = await axios.get<{ data: Leave[] }>(
      `${API_URL}/leaves/my-leaves`, // Updated endpoint
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    // Assuming backend returns data directly or inside a 'data' property
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  // getLeaveSummary: async (): Promise<LeaveSummary> => { // Endpoint not provided by backend
  //   const response = await axios.get<{ data: LeaveSummary }>(
  //     `${API_URL}/leave/summary`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  //       }
  //     }
  //   );
  //   return response.data.data;
  // },

  // Create leave request
  createLeaveRequest: async (data: CreateLeaveRequest): Promise<Leave> => {
    const response = await axios.post<{ data: Leave }>(
      `${API_URL}/leaves/create`, // Updated endpoint
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Update leave status (Approve)
  approveLeaveRequest: async (
    id: number,
    comments?: string // Comments might be optional for approval
  ): Promise<Leave> => {
    const response = await axios.put<{ data: Leave }>(
      `${API_URL}/leaves/${id}/status`, // Updated endpoint
      { status: 'approved', comments }, // Send status in body
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Update leave status (Reject)
  rejectLeaveRequest: async (
    id: number,
    comments: string // Comments are likely required for rejection
  ): Promise<Leave> => {
    const response = await axios.put<{ data: Leave }>(
      `${API_URL}/leaves/${id}/status`, // Updated endpoint
      { status: 'rejected', comments }, // Send status and comments in body
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // cancelLeaveRequest: async (id: number): Promise<void> => { // Endpoint not provided by backend
  //   await axios.delete(
  //     `${API_URL}/leave/requests/${id}`,
  //     {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('accessToken')}`
  //       }
  //     }
  //   );
  // }
};