import axios from 'axios';
import { API_URL } from '../config';
import axiosInstance from '../config/axios';

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
    const response = await axiosInstance.get<{ data: Department[] }>(
      `/departments/list`
    );
    return response.data.data;
  },

  getDepartmentSummary: async (): Promise<DepartmentSummary> => {
    const response = await axiosInstance.get<{ data: DepartmentSummary }>(
      `/departments/list/summary`
    );
    return response.data.data;
  },

  getDepartmentById: async (id: number): Promise<Department | null> => {
    try {
      const response = await axiosInstance.get<{ data: Department }>(
        `/departments/detail/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching department with ID ${id}:`, error);
      return null;
    }
  },

  createDepartment: async (data: Omit<Department, 'id'>): Promise<Department> => {
    const response = await axiosInstance.post<{ data: Department }>(
      `/departments/list`,
      data
    );
    return response.data.data;
  },

  updateDepartment: async (
    id: number,
    data: Partial<Department>
  ): Promise<Department> => {
    const response = await axiosInstance.put<{ data: Department }>(
      `/departments/list/${id}`,
      data
    );
    return response.data.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axiosInstance.delete(
      `/departments/list/${id}`
    );
  }
};