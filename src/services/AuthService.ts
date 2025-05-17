import axiosInstance from '../config/axios';
import axios from 'axios';
import { User } from '../types/api';
import { API_URL } from '../config'; // Import API_URL

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string; // Add refreshToken if backend provides it
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Role {
  type: string;
  name: string;
}

export const AuthService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await axiosInstance.get<ApiResponse<Role[]>>('/auth/roles');
    return response.data.data;
  },

  login: async (username: string, password: string): Promise<LoginResponse> => {
    // Sử dụng axios thông thường và URL đầy đủ cho login
    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_URL}/auth/login`, // Remove /api prefix
      { username, password }
    );
    // Store both tokens if refreshToken is provided
    if (response.data.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
    }
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    // Correct endpoint is /profile/me based on backend routes
    // Assuming the API returns the User object directly
    const response = await axiosInstance.get<User>('/profile/me');
    // Return the data directly, which should now be of type User
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh-token' // Remove /api prefix
    );
    return response.data.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.put<ApiResponse<{ message: string }>>(
      '/profile/change-password',
      { oldPassword, newPassword }
    );
    return { message: response.data.message || 'Password changed successfully' };
  }
};