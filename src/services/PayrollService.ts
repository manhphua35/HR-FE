import axios from 'axios';
import { API_URL } from '../config';

export interface PayrollItem {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  month: string;
  year: number;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  tax: number;
  insurance: number;
  netSalary: number;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  paymentDate?: string;
}

export interface PayrollSummary {
  totalPayroll: number;
  averageSalary: number;
  totalEmployees: number;
  totalOvertime: number;
  totalBonus: number;
  totalDeductions: number;
  monthlyComparison: {
    currentMonth: number;
    previousMonth: number;
    percentageChange: number;
  };
}

export const PayrollService = {
  getPayrollItems: async (month: string, year: number): Promise<PayrollItem[]> => {
    const response = await axios.get<{ data: PayrollItem[] }>(
      `${API_URL}/payroll/items`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getPayrollSummary: async (month: string, year: number): Promise<PayrollSummary> => {
    const response = await axios.get<{ data: PayrollSummary }>(
      `${API_URL}/payroll/summary`,
      {
        params: { month, year },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  generatePayroll: async (month: string, year: number): Promise<PayrollItem[]> => {
    const response = await axios.post<{ data: PayrollItem[] }>(
      `${API_URL}/payroll/generate`,
      { month, year },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  updatePayrollItem: async (
    id: number,
    data: Partial<PayrollItem>
  ): Promise<PayrollItem> => {
    const response = await axios.put<{ data: PayrollItem }>(
      `${API_URL}/payroll/items/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  approvePayroll: async (ids: number[]): Promise<void> => {
    await axios.post(
      `${API_URL}/payroll/approve`,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
  },

  processPayment: async (ids: number[]): Promise<void> => {
    await axios.post(
      `${API_URL}/payroll/process-payment`,
      { ids },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
  },

  exportPayrollReport: async (month: string, year: number): Promise<Blob> => {
    const response = await axios.get<ArrayBuffer>(
      `${API_URL}/payroll/export`,
      {
        params: { month, year },
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return new Blob([response.data], { type: 'application/vnd.ms-excel' });
  }
};