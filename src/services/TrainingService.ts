import axios from '../config/axios';
import { API_URL } from '../config';
import { ApiResponse } from '../types/api';

export enum TrainingStatus {
  PLANNED = "PLANNED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export enum ParticipantStatus {
  REGISTERED = "REGISTERED",
  CONFIRMED = "CONFIRMED",
  ATTENDED = "ATTENDED",
  CANCELLED = "CANCELLED"
}

export enum CompetencyLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT"
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface TrainingCourse {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TrainingStatus;
  location: string;
  instructor: string;
  departmentId: number | null;
  department?: Department;
  user?: any;
  assessor?: any;
  participants?: any[];
  results?: any[];
}

export interface TrainingParticipant {
  id: number;
  userId: number;
  courseId: number;
  status: ParticipantStatus;
  registrationDate: string;
  user?: any;
}

export interface TrainingResult {
  id: number;
  userId: number;
  courseId: number;
  score: number;
  evaluation: string;
  completionDate: string;
  feedback?: string;
  certificate?: string;
}

export interface CompetencyAssessment {
  id: number;
  userId: number;
  courseId: number;
  level: CompetencyLevel;
  assessmentDate: string;
  assessorId: number;
}

export const TrainingService = {
  // Lấy danh sách phòng ban
  async getDepartments(): Promise<Department[]> {
    const response = await axios.get(`${API_URL}/training/departments`);
    return response.data.data;
  },

  // Tạo khóa đào tạo
  async createTrainingCourse(courseData: Partial<TrainingCourse>): Promise<TrainingCourse> {
    const response = await axios.post(`${API_URL}/training/courses`, courseData);
    return response.data.data;
  },

  // Cập nhật khóa đào tạo
  async updateTrainingCourse(id: number, courseData: Partial<TrainingCourse>): Promise<TrainingCourse> {
    const response = await axios.put(`${API_URL}/training/courses/${id}`, courseData);
    return response.data.data;
  },

  // Lấy danh sách khóa đào tạo
  async getTrainingCourses(status?: TrainingStatus, departmentId?: number, userDepartmentId?: number): Promise<TrainingCourse[]> {
    const params: any = {
      ...(status && { status }),
      ...(departmentId && { departmentId }),
    };
    
    // Truyền thêm departmentId của người dùng nếu cần lọc theo phòng ban
    if (userDepartmentId) {
      params.userDepartmentId = userDepartmentId;
    }
    
    const response = await axios.get(`${API_URL}/training/courses`, { params });
    return response.data.data;
  },

  // Lấy khóa học theo phòng ban người dùng
  async getDepartmentTrainingCourses(departmentId: number): Promise<TrainingCourse[]> {
    const response = await axios.get(`${API_URL}/training/department-courses/${departmentId}`);
    return response.data.data;
  },

  // Lấy chi tiết khóa đào tạo
  async getTrainingCourseDetail(id: number): Promise<TrainingCourse> {
    const response = await axios.get(`${API_URL}/training/courses/${id}`);
    return response.data.data;
  },

  // Đăng ký người dùng tham gia khóa đào tạo
  async registerParticipant(courseId: number, userId: number): Promise<TrainingCourse> {
    const response = await axios.post(`${API_URL}/training/register`, { courseId, userId });
    return response.data.data;
  },

  // Ghi nhận kết quả đào tạo
  async recordTrainingResult(data: { courseId: number; userId: number; [key: string]: any }): Promise<TrainingCourse> {
    const response = await axios.post(`${API_URL}/training/results`, data);
    return response.data.data;
  },

  // Đánh giá năng lực
  async assessCompetency(data: { courseId: number; assessorId: number; [key: string]: any }): Promise<TrainingCourse> {
    const response = await axios.post(`${API_URL}/training/competency`, data);
    return response.data.data;
  },

  // Gửi thông báo đào tạo
  async sendTrainingNotification(courseId: number): Promise<void> {
    await axios.post(`${API_URL}/training/notify/${courseId}`);
  },

  // Xóa khóa đào tạo
  async deleteTrainingCourse(id: number): Promise<void> {
    await axios.delete(`${API_URL}/training/courses/${id}`);
  },

  // Xuất báo cáo năng lực
  async exportCompetencyReport(userId: number): Promise<TrainingCourse[]> {
    const response = await axios.get(`${API_URL}/training/report/${userId}`);
    return response.data.data;
  }
}; 