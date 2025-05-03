import axiosInstance from '../config/axios';

// Định nghĩa các interface phụ trợ
interface Department {
  id: number;
  name: string;
  description?: string; // Optional
}

interface Role {
  id: number;
  roleType: string;
  name: string;
  description?: string; // Optional
}

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string | null;
  departmentId: number;
  positionId: string; // UUID dạng string
  roleId: number;
  hireDate: string; // Hoặc Date
  remainingLeaves: number;
  baseSalary: string; // Hoặc number
  isActive: boolean;
  role: Role;
  department: Department;
  // Thêm các trường user khác nếu cần
}

// Cập nhật AttendanceRecord để khớp với API response
export interface AttendanceRecord {
  id: string; // UUID dạng string
  date: string; // Hoặc Date
  checkInTime: string | null; // Đổi tên từ checkIn
  checkOutTime: string | null; // Đổi tên từ checkOut
  status: string; // 'present', etc.
  workHours: number | null;
  notes?: string | null;
  createdAt: string; // Hoặc Date
  updatedAt: string; // Hoặc Date
  user: User; // Đối tượng user lồng vào
  leaveRequest?: any | null; // Giữ nguyên nếu có thể có
}

// Interface cho các tham số query khi lấy danh sách chấm công
interface GetAttendancesParams {
  userId?: number;
  departmentId?: number;
  startDate?: string; // Format YYYY-MM-DD
  endDate?: string;   // Format YYYY-MM-DD
  // Thêm các tham số khác nếu cần (page, limit, etc.)
}

// Interface chung cho phản hồi API (giả sử backend có cấu trúc này)
interface ApiResponse<T> {
  success: boolean; // Hoặc một trường tương tự để chỉ thành công/thất bại
  data: T;
  message?: string;
}

export const AttendanceService = {
  /**
   * Lấy danh sách chấm công với các bộ lọc tùy chọn.
   */
  getAttendances: async (params: GetAttendancesParams = {}): Promise<AttendanceRecord[]> => {
    // Xây dựng query string từ các tham số hợp lệ
    const queryParams = new URLSearchParams();
    if (params.userId) queryParams.append('userId', String(params.userId));
    if (params.departmentId) queryParams.append('departmentId', String(params.departmentId));
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    // Thêm các tham số khác vào đây nếu cần

    const queryString = queryParams.toString();
    const url = `/attendances${queryString ? `?${queryString}` : ''}`;

    // API trả về trực tiếp mảng, không có wrapper 'data' hoặc 'success'
    const response = await axiosInstance.get<AttendanceRecord[]>(url);
    // Trả về trực tiếp response.data vì API trả về mảng
    return response.data;
  },

  /**
   * Lấy chi tiết một bản ghi chấm công theo ID.
   */
  getAttendanceById: async (id: number): Promise<AttendanceRecord> => {
    const url = `/attendances/${id}`;
    // API trả về trực tiếp object, không có wrapper
    const response = await axiosInstance.get<AttendanceRecord>(url);
    return response.data;
  },

  /**
   * Tạo một bản ghi chấm công mới (thường dùng cho Admin/HR nhập tay).
   * Kiểu dữ liệu 'data' cần khớp với những gì backend mong đợi.
   */
  createAttendance: async (data: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
    const url = '/attendances';
    // API trả về trực tiếp object, không có wrapper
    const response = await axiosInstance.post<AttendanceRecord>(url, data);
    return response.data;
  },

  /**
   * Cập nhật một bản ghi chấm công.
   * Kiểu dữ liệu 'data' cần khớp với những gì backend cho phép cập nhật.
   */
  updateAttendance: async (id: number, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    const url = `/attendances/${id}`;
    // API trả về trực tiếp object, không có wrapper
    const response = await axiosInstance.put<AttendanceRecord>(url, data);
    return response.data;
  },

  /**
   * Xóa một bản ghi chấm công.
   */
  deleteAttendance: async (id: number): Promise<void> => {
    const url = `/attendances/${id}`;
    // API có thể không trả về nội dung hoặc chỉ trả về status code
    await axiosInstance.delete(url);
    // Không cần return gì nếu thành công
  },

  /**
   * Thực hiện check-in cho nhân viên đang đăng nhập.
   * Backend sẽ tự lấy userId từ token.
   */
  checkIn: async (): Promise<AttendanceRecord> => { // Giả sử trả về bản ghi vừa tạo/cập nhật
    const url = '/attendances/check-in';
    // API trả về trực tiếp object, không có wrapper
    const response = await axiosInstance.post<AttendanceRecord>(url);
    return response.data;
  },

  /**
   * Thực hiện check-out cho nhân viên đang đăng nhập.
   * Backend sẽ tự lấy userId từ token và tìm bản ghi check-in gần nhất.
   */
  checkOut: async (): Promise<AttendanceRecord> => { // Giả sử trả về bản ghi vừa cập nhật
    const url = '/attendances/check-out';
    // API trả về trực tiếp object, không có wrapper
    const response = await axiosInstance.post<AttendanceRecord>(url);
    return response.data;
  },

  // --- Các hàm cũ không còn khớp với backend routes ---
  /*
  getAttendanceSummary: async (dateFilter?: string): Promise<AttendanceSummary> => {
    // Backend không có route này, cần xóa hoặc sửa đổi dựa trên cách lấy summary mới
    const url = dateFilter
      ? `/attendance/summary?date=${dateFilter}`
      : '/attendance/summary';
    const response = await axiosInstance.get<ApiResponse<AttendanceSummary>>(url);
    return response.data.data;
  },
  */

  /*
  exportAttendanceReport: async (dateFilter?: string): Promise<Blob> => {
    // Backend không có route này, cần xóa hoặc triển khai ở backend trước
    const url = dateFilter
      ? `/attendance/export?date=${dateFilter}`
      : '/attendance/export';
    const response = await axiosInstance.get<Blob>(url, {
      responseType: 'blob'
    });
    return response.data;
  }
  */
};