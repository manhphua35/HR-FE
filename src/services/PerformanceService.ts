import axios from '../config/axios';
import { PerformancePlan, PerformanceReview } from '../types/api';

interface DepartmentReview {
  reviewId: number;
  employeeName: string;
  planTitle: string;
  reviewDate: string;
  totalScore: string;
}

interface DepartmentPerformance {
  department: string;
  reviews: DepartmentReview[];
}

interface ApiResponse<T> {
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
}