import axiosInstance from '../config/axios';

export interface Payroll {
  id: number;
  month: number;
  year: number;
  baseSalary: string;
  totalAllowance: number;
  totalDeduction: number;
  totalBenefit: number;
  netSalary: number;
  leaveDeductionAmount: number;
  latePenaltyAmount: number;
  bonus: number;
  tax: number;
  paymentDate: string | null;
  note: string | null;
  isFinalized: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Thông tin user
  userId: number;
  user?: {
    id: number;
    fullName: string;
    email: string;
    department?: {
      id: number;
      name: string;
    };
    position?: {
      id: number;
      name: string;
    };
  };
}

export interface PayrollResponse {
  message: string;
  data: Payroll[];
}

export interface PayrollUpdateData {
  bonus?: number;
  totalAllowance?: number;
  totalBenefit?: number;
  note?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const PayrollService = {
  async processBatchPayroll(month: number, year: number): Promise<Payroll[]> {
    try {
      // Backend sẽ kiểm tra roleType từ token
      const response = await axiosInstance.post<PayrollResponse | Payroll[]>('/payroll/process-batch', {
        month,
        year
      });
      
      // Kiểm tra cấu trúc response và trả về đúng dữ liệu
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data as Payroll[];
    } catch (error) {
      console.error('Error processing batch payroll:', error);
      throw error;
    }
  },

  async updatePayroll(payrollId: number, updateData: PayrollUpdateData): Promise<Payroll> {
    try {
      const response = await axiosInstance.put<ApiResponse<Payroll>>(`/payroll/update/${payrollId}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating payroll:', error);
      throw error;
    }
  },

  async setPaymentDate(payrollId: number, paymentDate: string): Promise<Payroll> {
    try {
      const response = await axiosInstance.put<ApiResponse<Payroll>>(`/payroll/payment-date/${payrollId}`, { paymentDate });
      return response.data.data;
    } catch (error) {
      console.error('Error setting payment date:', error);
      throw error;
    }
  },

  async finalizePayroll(payrollId: number): Promise<void> {
    try {
      await axiosInstance.put(`/payroll/finalize/${payrollId}`);
    } catch (error) {
      console.error('Error finalizing payroll:', error);
      throw error;
    }
  },

  async getPayrollDetail(userId: number, month: number, year: number): Promise<Payroll> {
    try {
      const response = await axiosInstance.get<Payroll>(`/payroll/detail/${userId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll detail:', error);
      throw error;
    }
  }
};