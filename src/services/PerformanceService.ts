import axios from 'axios';
import { API_URL } from '../config';
import { ApiResponse, PerformancePlan, PerformanceReview } from '../types/api';

interface CreatePlanData extends Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'> {}
interface CreateReviewData extends Omit<PerformanceReview, 'id' | 'planId' | 'reviewerId'> {}

export const PerformanceService = {
  getPlans: async (): Promise<PerformancePlan[]> => {
    const response = await axios.get<ApiResponse<PerformancePlan[]>>(
      `${API_URL}/performance/plans/department`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getReviews: async (planId: number): Promise<PerformanceReview[]> => {
    const response = await axios.get<ApiResponse<PerformanceReview[]>>(
      `${API_URL}/performance/reviews/department/${planId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  createPlan: async (data: CreatePlanData): Promise<PerformancePlan> => {
    const response = await axios.post<ApiResponse<PerformancePlan>>(
      `${API_URL}/performance/plans/create`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  createReview: async (data: CreateReviewData & { planId: number }): Promise<PerformanceReview> => {
    const response = await axios.post<ApiResponse<PerformanceReview>>(
      `${API_URL}/performance/reviews/create`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  updateReview: async (reviewId: number, data: Partial<PerformanceReview>): Promise<PerformanceReview> => {
    const response = await axios.put<ApiResponse<PerformanceReview>>(
      `${API_URL}/performance/reviews/${reviewId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Get overall plans (for Admin/HR) - Assumes endpoint returns PerformancePlan[]
  getOverallPlans: async (): Promise<PerformancePlan[]> => {
    const response = await axios.get<ApiResponse<PerformancePlan[]>>(
      `${API_URL}/performance/overall`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    // Assuming the overall endpoint also returns data in response.data.data
    return response.data.data;
  }
};