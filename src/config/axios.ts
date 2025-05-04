import axios from 'axios'; // Chỉ import axios mặc định
import { API_URL } from './index';

// Interface cho response thành công từ API refresh (linh hoạt hơn)
interface RefreshTokenSuccessResponse {
  accessToken?: string;
  data?: {
    accessToken?: string;
  };
  // Thêm các thuộc tính khác nếu API trả về
}

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Thêm token vào header (sử dụng 'any' cho config)
axiosInstance.interceptors.request.use(
  (config: any) => { // Sử dụng any cho config
    const token = localStorage.getItem('accessToken');
    console.log('[AxiosRequest] Đính kèm token:', token ? `Bearer ${token.substring(0, 10)}...` : 'Không có', 'cho URL:', config.url);
    // Giả định config có headers và url tại runtime
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => { // Sử dụng any cho error
    console.error('[AxiosRequest] Lỗi:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi 401 và refresh token (sử dụng 'any' cho error)
axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    // --- DEBUGGING START ---
    console.log('[AxiosResponseError] Interceptor được kích hoạt cho lỗi trên URL:', error?.config?.url);
    console.log('[AxiosResponseError] Đối tượng lỗi đầy đủ:', error);
    console.log('[AxiosResponseError] Trạng thái error.response:', error?.response?.status);
    console.log('[AxiosResponseError] error.config._retry trước khi kiểm tra:', error?.config?._retry);
    // --- DEBUGGING END ---

    const originalRequest = error.config as any;

    if (!originalRequest) {
      console.error('[AxiosResponseError] Lỗi không có config:', error);
      return Promise.reject(error);
    }

    // Thêm thuộc tính _retry nếu chưa có
    if (originalRequest._retry === undefined) {
      originalRequest._retry = false;
    }

    const isNetworkError = !error.response;
    const isAuthError = error.response?.status === 401;

    // Chỉ xử lý lỗi 401 và chưa retry
    if (isAuthError && !originalRequest._retry) {
      console.log(`[AxiosResponseError] Đã bắt lỗi 401 cho ${originalRequest.url}, đang thử làm mới...`);

      // Tránh vòng lặp vô hạn
      if (originalRequest.url === '/auth/refresh-token') {
        console.error('[AxiosResponseError] Yêu cầu refresh token thất bại với lỗi 401. Đang đăng xuất.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      console.log('[AxiosResponseError] Sử dụng refreshToken:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'Không có');

      if (!refreshToken) {
        console.error('[AxiosResponseError] Không tìm thấy refresh token. Đang đăng xuất.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(new Error('Không có refresh token.'));
      }

      try {
        console.log('[AxiosResponseError] Đang gọi API refresh token...');
        // Gọi API refresh bằng axios gốc
        const refreshResponse = await axios.post<RefreshTokenSuccessResponse>(
          `${API_URL}/auth/refresh-token`,
          { refreshToken: refreshToken }
        );

        console.log('[AxiosResponseError] API refresh THÀNH CÔNG. Dữ liệu phản hồi đầy đủ:', refreshResponse.data);

        let newAccessToken: string | undefined;
        if (refreshResponse.data?.data?.accessToken) {
          newAccessToken = refreshResponse.data.data.accessToken;
          console.log('[AxiosResponseError] Đã trích xuất token mới từ data.data.accessToken');
        } else if (refreshResponse.data?.accessToken) {
          newAccessToken = refreshResponse.data.accessToken;
          console.log('[AxiosResponseError] Đã trích xuất token mới từ data.accessToken');
        }

        if (typeof newAccessToken === 'string') {
          console.log('[AxiosResponseError] Đã nhận accessToken mới:', newAccessToken.substring(0, 10) + '...');
          localStorage.setItem('accessToken', newAccessToken);

          // Giả định originalRequest có headers
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          } else {
            // Khởi tạo headers nếu chưa có (ít khả năng xảy ra)
            originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
          }

          console.log(`[AxiosResponseError] Đang thử lại yêu cầu gốc: ${originalRequest.url}`);
          // Retry bằng axiosInstance, truyền config đã cập nhật (vẫn là any)
          return axiosInstance(originalRequest);
        } else {
          console.error('[AxiosResponseError] Không thể trích xuất access token mới từ phản hồi refresh. Đang đăng xuất.', refreshResponse.data);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(new Error('Không thể trích xuất access token mới sau khi làm mới.'));
        }

      } catch (refreshError: any) { // Sử dụng any cho refreshError
        let errorMessage = 'API refresh thất bại';
        // Kiểm tra lỗi theo kiểu Axios 0.x (dựa vào isAxiosError nếu có)
        if (refreshError && refreshError.isAxiosError && refreshError.response) {
          errorMessage = refreshError.response.data?.message || JSON.stringify(refreshError.response.data) || refreshError.message;
          console.error(`[AxiosResponseError] API refresh THẤT BẠI (AxiosError ${refreshError.response.status || 'N/A'}):`, errorMessage);
        } else if (refreshError instanceof Error) {
          errorMessage = refreshError.message;
          console.error('[AxiosResponseError] API refresh THẤT BẠI (Lỗi):', errorMessage);
        } else {
          console.error('[AxiosResponseError] API refresh THẤT BẠI (Không xác định):', refreshError);
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(new Error(`Làm mới token thất bại: ${errorMessage}`));
      }
    }

    // Xử lý các lỗi khác
    console.log(`[AxiosResponseError] Chuyển tiếp lỗi (Trạng thái: ${error.response?.status || (isNetworkError ? 'Lỗi mạng' : 'N/A')}, URL: ${originalRequest?.url || 'N/A'})`);
    return Promise.reject(error);
  }
);

export default axiosInstance;