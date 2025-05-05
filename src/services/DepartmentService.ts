import axios from 'axios';
import { API_URL } from '../config';

export interface Department {
  id: number;
  name: string;
  employeeCount: number;
  manager: string;
  budget: string;
}

export interface DepartmentSummary {
  totalDepartments: number;
  totalEmployees: number;
  averageTeamSize: number;
  totalBudget: string;
}

export const DepartmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await axios.get<{ data: Department[] }>(
      `${API_URL}/departments/list`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  getDepartmentSummary: async (): Promise<DepartmentSummary> => {
    const response = await axios.get<{ data: DepartmentSummary }>(
      `${API_URL}/departments/list/summary`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  createDepartment: async (data: Omit<Department, 'id'>): Promise<Department> => {
    const response = await axios.post<{ data: Department }>(
      `${API_URL}/departments/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  updateDepartment: async (
    id: number,
    data: Partial<Department>
  ): Promise<Department> => {
    const response = await axios.put<{ data: Department }>(
      `${API_URL}/departments/list/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axios.delete(
      `${API_URL}/departments/list/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
  }
};