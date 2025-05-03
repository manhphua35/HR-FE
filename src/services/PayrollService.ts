import axios from 'axios';
import { API_URL } from '../config';

// Interface for PayrollItem might still be relevant for getMonthlyPayrollDetail
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
  status: 'draft' | 'pending' | 'approved' | 'paid'; // Assuming status is part of the detail
  paymentDate?: string;
  // Add other relevant fields from backend if needed
}

// Interface for Payroll Component (adjust based on actual backend structure)
export interface PayrollComponent {
  id: number;
  name: string;
  type: 'allowance' | 'deduction' | 'bonus'; // Example types
  amount?: number;
  percentage?: number;
  isTaxable?: boolean;
  // Add other relevant fields
}

// Interface for data needed to add/update a component
export interface PayrollComponentData {
  name: string;
  type: 'allowance' | 'deduction' | 'bonus';
  amount?: number;
  percentage?: number;
  isTaxable?: boolean;
  // Add other relevant fields
}

// Interface for data needed to calculate payroll
export interface CalculatePayrollData {
  month: number; // Assuming month is a number (e.g., 1-12)
  year: number;
  employeeIds?: number[]; // Optional: calculate for specific employees
}

export const PayrollService = {
  // Calculate monthly payroll
  calculateMonthlyPayroll: async (data: CalculatePayrollData): Promise<any> => { // Adjust return type based on backend response
    const response = await axios.post<any>(
      `${API_URL}/payroll/calculate`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data; // Or response.data.data depending on backend structure
  },

  // Add a new payroll component
  addPayrollComponent: async (data: PayrollComponentData): Promise<PayrollComponent> => {
    const response = await axios.post<{ data: PayrollComponent }>(
      `${API_URL}/payroll/components`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Update a payroll component
  updatePayrollComponent: async (id: number, data: Partial<PayrollComponentData>): Promise<PayrollComponent> => {
    const response = await axios.put<{ data: PayrollComponent }>(
      `${API_URL}/payroll/components/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Delete a payroll component
  deletePayrollComponent: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/payroll/components/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
  },

  // Get payroll components by type
  getPayrollComponentsByType: async (type: string): Promise<PayrollComponent[]> => {
    const response = await axios.get<{ data: PayrollComponent[] }>(
      `${API_URL}/payroll/components/${type}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Get monthly payroll detail for a user
  getMonthlyPayrollDetail: async (userId: number, month: number, year: number): Promise<PayrollItem> => { // Assuming it returns a PayrollItem structure
    const response = await axios.get<{ data: PayrollItem }>(
      `${API_URL}/payroll/monthly/${userId}/${month}/${year}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Finalize a monthly payroll item (assuming by its ID)
  finalizeMonthlyPayroll: async (id: number): Promise<PayrollItem> => { // Assuming it returns the updated PayrollItem
    const response = await axios.put<{ data: PayrollItem }>(
      `${API_URL}/payroll/finalize/${id}`,
      {}, // Send empty body or required data if any
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // --- NEW Functions based on role requirements ---

  // Get all monthly payroll items (for HR/Admin) - API Endpoint does not exist in backend router
  /*
  getAllMonthlyPayroll: async (month: number, year: number): Promise<PayrollItem[]> => {
    const response = await axios.get<{ data: PayrollItem[] }>(
      `${API_URL}/payroll/monthly/${month}/${year}`, // Incorrect endpoint based on provided backend router
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },
  */

  // Get monthly payroll items for a specific department (for Department Manager) - API Endpoint does not exist in backend router
  /*
  getDepartmentMonthlyPayroll: async (departmentId: number, month: number, year: number): Promise<PayrollItem[]> => {
    const response = await axios.get<{ data: PayrollItem[] }>(
      `${API_URL}/payroll/monthly/department/${departmentId}/${month}/${year}`, // Incorrect endpoint based on provided backend router
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },
  */

  // Approve multiple payroll items (for HR/Admin) - API Endpoint does not exist in backend router
  /*
  approvePayrollItems: async (ids: number[]): Promise<any> => { // Adjust return type as needed
    const response = await axios.put<any>(
      `${API_URL}/payroll/approve`, // Incorrect endpoint based on provided backend router
      { ids },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data;
  },
  */

  // Process payment for multiple payroll items (for HR/Admin) - API Endpoint does not exist in backend router
  /*
  processPayrollPayments: async (ids: number[]): Promise<any> => { // Adjust return type as needed
    const response = await axios.post<any>(
      `${API_URL}/payroll/process-payment`, // Incorrect endpoint based on provided backend router
      { ids },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data;
  },
  */

  // --- Functions below were previously removed or are placeholders ---
  // getPayrollItems: ... (Replaced by role-specific functions)
  // getPayrollSummary: ... (Likely not needed with list view)
  // generatePayroll: ... (Replaced by calculateMonthlyPayroll)
  // updatePayrollItem: ... (Maybe needed for individual edits?)
  // exportPayrollReport: ... (Could be added back if needed)
};