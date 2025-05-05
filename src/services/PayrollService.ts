import axiosInstance from '../config/axios';

export interface PayrollComponentWithUser {
  id: number;
  name: string;
  amount: string;
  type: 'ALLOWANCE' | 'DEDUCTION';
  description: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string;
    baseSalary: string;
    [key: string]: any;
  };
}

export const PayrollService = {
  async getPayrollComponentsByType(type: 'ALLOWANCE' | 'DEDUCTION'): Promise<PayrollComponentWithUser[]> {
    try {
      const response = await axiosInstance.get(`/payroll/components/${type}`);
      return response.data as PayrollComponentWithUser[];
    } catch (error) {
      console.error('Error fetching payroll components:', error);
      throw error;
    }
  },

  async addPayrollComponent(data: {
    userId: number;
    name: string;
    amount: string;
    type: 'ALLOWANCE' | 'DEDUCTION';
    description: string;
  }): Promise<PayrollComponentWithUser> {
    try {
      const response = await axiosInstance.post('/payroll/components', data);
      return response.data as PayrollComponentWithUser;
    } catch (error) {
      console.error('Error adding payroll component:', error);
      throw error;
    }
  },

  async updatePayrollComponent(id: number, data: {
    name: string;
    amount: string;
    type: 'ALLOWANCE' | 'DEDUCTION';
    description: string;
  }): Promise<PayrollComponentWithUser> {
    try {
      const response = await axiosInstance.put(`/payroll/components/${id}`, data);
      return response.data as PayrollComponentWithUser;
    } catch (error) {
      console.error('Error updating payroll component:', error);
      throw error;
    }
  },

  async deletePayrollComponent(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/payroll/components/${id}`);
    } catch (error) {
      console.error('Error deleting payroll component:', error);
      throw error;
    }
  }
};