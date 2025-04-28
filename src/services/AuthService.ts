import axiosInstance from '../config/axios';
import axios from 'axios';
import { User } from '../types/api';

export interface LoginResponse {
  user: User;
  accessToken: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const AuthService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    // Sử dụng axios thông thường cho login vì chưa có token
    const response = await axios.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { username, password }
    );
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh-token'
    );
    return response.data.data;
  }
};