import axios from 'axios';
import { API_URL } from '../config';

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  status: string;
  avatar: string;
  joinDate: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const EmployeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await axios.get<ApiResponse<Employee[]>>(`${API_URL}/users/list`);
    return response.data.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await axios.get<ApiResponse<Employee>>(`${API_URL}/users/detail/${id}`);
    return response.data.data;
  },

  createEmployee: async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const response = await axios.post<ApiResponse<Employee>>(`${API_URL}/users/create`, employeeData);
    return response.data.data;
  },

  updateEmployee: async (id: number, employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await axios.put<ApiResponse<Employee>>(`${API_URL}/users/update/${id}`, employeeData);
    return response.data.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/users/delete/${id}`);
  }
};