import axios from '../config/axios';
import { PerformancePlan, PerformanceReview } from '../types/api';

export interface DepartmentReview {
  reviewId: number;
  employeeName: string;
  planTitle: string;
  reviewDate: string;
  totalScore: string;
}

export interface DepartmentPerformance {
  department: string;
  reviews: DepartmentReview[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export class PerformanceService {
  static async getDepartmentPlans(): Promise<PerformancePlan[]> {
    const { data } = await axios.get<ApiResponse<PerformancePlan[]>>('/performance/plans/department');
    return data.data;
  }

  static async getOverallPerformance(): Promise<DepartmentPerformance[]> {
    const { data } = await axios.get<ApiResponse<DepartmentPerformance[]>>('/performance/overall');
    return data.data;
  }

  static async createPlan(data: Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'>): Promise<PerformancePlan> {
    const response = await axios.post<ApiResponse<PerformancePlan>>('/performance/plans/create', data);
    return response.data.data;
  }

  static async getDepartmentReviews(planId: number): Promise<PerformanceReview[]> {
    const { data } = await axios.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews/department/${planId}`);
    return data.data;
  }

  static async getReviewDetails(reviewId: number): Promise<PerformanceReview> {
    const { data } = await axios.get<ApiResponse<PerformanceReview>>(`/performance/reviews/${reviewId}`);
    return data.data;
  }

  static async createReview(data: {
    planId: number;
    employeeId: number;
    reviewDate: string;
    scores: {
      criteriaId: number;
      score: number;
      comment: string;
    }[];
    comments?: string;
    strengths?: string;
    weaknesses?: string;
    improvement?: string;
  }): Promise<PerformanceReview> {
    const response = await axios.post<ApiResponse<PerformanceReview>>('/performance/reviews/create', data);
    return response.data.data;
  }

  static async updateReview(reviewId: number, data: {
    reviewDate: string;
    scores: {
      criteriaId: number;
      score: number;
      comment: string;
    }[];
    comments?: string;
    strengths?: string;
    weaknesses?: string;
    improvement?: string;
  }): Promise<PerformanceReview> {
    const response = await axios.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${reviewId}`, data);
    return response.data.data;
  }

  static async deleteReview(reviewId: number): Promise<void> {
    await axios.delete(`/performance/reviews/${reviewId}`);
  }
}