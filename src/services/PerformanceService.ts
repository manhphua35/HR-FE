import axios from '../config/axios';
import { PerformancePlan, PerformanceReview } from '../types/api';
import { Employee } from '../services/EmployeeService';

export interface DepartmentReview {
  reviewId: number;
  employeeName: string;
  planTitle: string;
  reviewDate: string;
  totalScore: string;
  status?: string;
  comments?: string;
  strengths?: string;
  weaknesses?: string;
  improvement?: string;
  reviewer?: any;
  plan?: any;
  scores?: any[];
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
  static async getReviewDetails(reviewId: number): Promise<PerformanceReview> {
    try {
      const { data } = await axios.get<ApiResponse<PerformanceReview>>(`/performance/reviews/${reviewId}`);
      return data.data;
    } catch (error: any) {
      console.error('Error fetching review details:', error);
      
      // Lấy thông báo lỗi từ response nếu có
      const errorMessage = error.response?.data?.message || 'Lỗi khi lấy chi tiết đánh giá';
      
      // Throw lại lỗi với thông tin chi tiết hơn
      throw new Error(errorMessage);
    }
  }

  static async getDepartmentPlans(): Promise<PerformancePlan[]> {
    const { data } = await axios.get<ApiResponse<PerformancePlan[]>>('/performance/plans/department');
    return data.data;
  }

  static async getAllDepartmentPlans(): Promise<PerformancePlan[]> {
    const { data } = await axios.get<ApiResponse<PerformancePlan[]>>('/performance/plans/all');
    return data.data;
  }

  static async getCompanyWidePlans(): Promise<PerformancePlan[]> {
    const { data } = await axios.get<ApiResponse<PerformancePlan[]>>('/performance/plans/company');
    return data.data;
  }

  static async getOverallPerformance(): Promise<DepartmentPerformance[]> {
    const { data } = await axios.get<ApiResponse<DepartmentPerformance[]>>('/performance/overall');
    return data.data;
  }

  static async getEmployeeReviews(): Promise<PerformanceReview[]> {
    const { data } = await axios.get<ApiResponse<PerformanceReview[]>>('/performance/reviews/employee');
    return data.data;
  }

  static async createPlan(data: Omit<PerformancePlan, 'id' | 'createdBy'> & { departmentIds?: number[], isCompanyWide?: boolean }): Promise<PerformancePlan> {
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
    status?: string;
    totalScore?: number;
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
    status?: string;
  }): Promise<PerformanceReview> {
    const response = await axios.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${reviewId}`, data);
    return response.data.data;
  }

  static async deleteReview(reviewId: number): Promise<void> {
    await axios.delete(`/performance/reviews/${reviewId}`);
  }

  static async deletePlan(planId: number): Promise<void> {
    try {
      await axios.delete(`/performance/plans/${planId}`);
    } catch (error: any) {
      console.error(`Lỗi khi xóa kế hoạch ID ${planId}:`, error);
      throw error; // Ném lỗi để component xử lý
    }
  }

  static async updatePlan(
    planId: number, 
    data: Partial<PerformancePlan> & { 
      departmentIds?: number[], 
      isCompanyWide?: boolean 
    }
  ): Promise<PerformancePlan> {
    try {
      const response = await axios.put(`/performance/plans/${planId}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật kế hoạch ID ${planId}:`, error);
      throw error; // Ném lỗi để component xử lý
    }
  }

  static async getDepartmentEmployees(): Promise<Employee[]> {
    const { data } = await axios.get<ApiResponse<Employee[]>>('/employee/all');
    return data.data || [];
  }
}