import axiosInstance from '../config/axios';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  departmentId: number;
  baseSalary: string;
  isActive: boolean;
}

export enum ComponentType {
  ALLOWANCE = 'ALLOWANCE',
  DEDUCTION = 'DEDUCTION'
}

export interface PayrollComponent {
  id: number;
  name: string;
  amount: string;
  type: ComponentType;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface PayrollComponentsResponse {
  allowances: PayrollComponent[];
  deductions: PayrollComponent[];
}

export const PayrollComponentService = {
  getAllComponents: async (): Promise<PayrollComponentsResponse> => {
    try {
      const [allowancesRes, deductionsRes] = await Promise.all([
        axiosInstance.get<PayrollComponent[]>('/payroll/allowances'),
        axiosInstance.get<PayrollComponent[]>('/payroll/deductions')
      ]);

      // API trả về mảng trực tiếp
      const allowances = allowancesRes.data;
      const deductions = deductionsRes.data;

      // Đảm bảo type cho mỗi component
      const typedAllowances = allowances.map(item => ({
        ...item,
        type: ComponentType.ALLOWANCE
      }));

      const typedDeductions = deductions.map(item => ({
        ...item,
        type: ComponentType.DEDUCTION
      }));

      return {
        allowances: typedAllowances,
        deductions: typedDeductions
      };
    } catch (error) {
      console.error('Error fetching payroll components:', error);
      throw new Error('Failed to fetch payroll components');
    }
  },

  // Gộp dữ liệu từ 2 mảng thành 1
  combineComponents: (components: PayrollComponentsResponse): PayrollComponent[] => {
    return [
      ...components.allowances,
      ...components.deductions
    ].sort((a, b) => {
      // Sort by user's fullName, then by component type, then by component name
      if (a.user.fullName !== b.user.fullName) {
        return a.user.fullName.localeCompare(b.user.fullName);
      }
      if (a.type !== b.type) {
        return a.type === ComponentType.ALLOWANCE ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  },

  formatAmount: (amount: string): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  },

  getComponentTypeDisplay: (type: ComponentType): string => {
    return type === ComponentType.ALLOWANCE ? 'Phụ cấp' : 'Khấu trừ';
  },

  getComponentTypeColor: (type: ComponentType): string => {
    return type === ComponentType.ALLOWANCE ? 'text-green-600' : 'text-red-600';
  }
};