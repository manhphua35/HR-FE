// Import axiosInstance thay vì axios mặc định
import axiosInstance from '../config/axios';
import { API_URL } from '../config';

// Interface cho Department (dựa trên dữ liệu API mẫu)
export interface Department {
  id: number;
  name: string;
  description?: string; // Optional based on API data
}


// Interface cho Position
export interface Position {
  id: string;
  title: string;
  level?: number;
}

// Interface cho Role
export interface Role {
  id: number;
  roleType: string; // e.g., "SYSTEM_ADMIN", "HR_STAFF"
  name: string;
  description?: string;
  createdAt?: string; // Optional based on API data
  updatedAt?: string; // Optional based on API data
}


// Interface cho dữ liệu nhân viên trả về từ API (GET /list, /detail)
// Cập nhật để khớp với cấu trúc dữ liệu API thực tế
export interface Employee {
  id: number;
  username: string;
  fullName: string;
  email: string;
  department: Department | null;
  position: Position | null;
  phone: string | null; // Updated type to allow null
  status?: string; // Status không có trong API mẫu, đánh dấu optional
  avatar: string | null; // Updated type to allow null (API mẫu không có)
  hireDate: string; // Giữ là string, cần xử lý định dạng nếu cần
  role: Role | null; // Updated type
  // Các trường khác từ API mẫu
  departmentId: number | null;
  roleType: string; // e.g., "SYSTEM_ADMIN", "HR_STAFF"
  remainingLeaves?: number; // Optional based on API data
  baseSalary?: string; // Optional based on API data, có thể là number?
  isActive?: boolean; // Optional based on API data
  createdAt?: string; // Optional based on API data
  updatedAt?: string; // Optional based on API data
}

// Interface cho dữ liệu gửi đi khi tạo nhân viên (POST /create)
// Cập nhật để phù hợp hơn với cấu trúc Employee (có thể cần gửi ID thay vì object)
export interface CreateEmployeePayload {
  username: string;
  password?: string; // Password thường chỉ bắt buộc khi tạo
  fullName: string;
  email: string;
  departmentId: number | null; // Gửi departmentId thay vì object
  phone?: string | null; // Allow null
  isActive?: boolean;
  avatar?: string | null; // Allow null
  hireDate: string;
  roleType: string;
  // Thêm các trường cần thiết khác khi tạo
  baseSalary?: string; // Hoặc number
  remainingLeaves?: number;
}


interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const EmployeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await axiosInstance.get<ApiResponse<Employee[]>>(`/users/list`);
    return response.data.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    // Sử dụng axiosInstance
    const response = await axiosInstance.get<ApiResponse<Employee>>(`/users/detail/${id}`);
    return response.data.data;
  },

  // Lấy danh sách nhân viên theo phòng ban
  getDepartmentEmployees: async (departmentId: number): Promise<Employee[]> => {
    const response = await axiosInstance.get<ApiResponse<Employee[]>>(`/users/department/${departmentId}`);
    return response.data.data;
  },

  // Cập nhật kiểu dữ liệu cho employeeData thành CreateEmployeePayload
  // Đảm bảo kiểu tham số là CreateEmployeePayload đã export
  createEmployee: async (employeeData: CreateEmployeePayload): Promise<Employee> => {
    // Sử dụng axiosInstance
    const response = await axiosInstance.post<ApiResponse<Employee>>(`/users/create`, employeeData);
    // API có thể trả về Employee đầy đủ hoặc chỉ thông báo thành công
    // Nếu chỉ trả về thông báo, cần điều chỉnh kiểu trả về của hàm này
    return response.data.data;
  },

  // Cập nhật kiểu dữ liệu cho employeeData thành Partial<CreateEmployeePayload> hoặc interface riêng
  // Đảm bảo kiểu tham số là Partial<CreateEmployeePayload> đã export
  updateEmployee: async (id: number, employeeData: Partial<CreateEmployeePayload>): Promise<Employee> => {
    // Sử dụng axiosInstance
    const response = await axiosInstance.put<ApiResponse<Employee>>(`/users/update/${id}`, employeeData);
    return response.data.data;
  },

  // Cập nhật lương cơ bản của nhân viên
  updateEmployeeBaseSalary: async (id: number, baseSalary: number): Promise<Employee> => {
    // Sử dụng updateEmployee với chỉ trường baseSalary
    return await EmployeeService.updateEmployee(id, { baseSalary: baseSalary.toString() });
  },

  deleteEmployee: async (id: number): Promise<void> => {
    // Sử dụng axiosInstance
    await axiosInstance.delete(`/users/delete/${id}`);
  }
};