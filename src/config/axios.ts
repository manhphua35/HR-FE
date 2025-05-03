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
    console.log('[AxiosRequest] Attaching token:', token ? `Bearer ${token.substring(0, 10)}...` : 'None', 'for URL:', config.url);
    // Giả định config có headers và url tại runtime
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => { // Sử dụng any cho error
    console.error('[AxiosRequest] Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi 401 và refresh token (sử dụng 'any' cho error)
axiosInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    // --- DEBUGGING START ---
    console.log('[AxiosResponseError] Interceptor triggered for error on URL:', error?.config?.url);
    console.log('[AxiosResponseError] Full error object:', error);
    console.log('[AxiosResponseError] error.response status:', error?.response?.status);
    console.log('[AxiosResponseError] error.config._retry before check:', error?.config?._retry);
    // --- DEBUGGING END ---

    const originalRequest = error.config as any;

    if (!originalRequest) {
      console.error('[AxiosResponseError] Error without config:', error);
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
      console.log(`[AxiosResponseError] Caught 401 for ${originalRequest.url}, attempting refresh...`);

      // Tránh vòng lặp vô hạn
      if (originalRequest.url === '/auth/refresh-token') {
        console.error('[AxiosResponseError] Refresh token request itself failed with 401. Logging out.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      console.log('[AxiosResponseError] Using refreshToken:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'None');

      if (!refreshToken) {
        console.error('[AxiosResponseError] No refresh token found. Logging out.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(new Error('No refresh token available.'));
      }

      try {
        console.log('[AxiosResponseError] Calling refresh token API...');
        // Gọi API refresh bằng axios gốc
        const refreshResponse = await axios.post<RefreshTokenSuccessResponse>(
          `${API_URL}/auth/refresh-token`,
          { refreshToken: refreshToken }
        );

        console.log('[AxiosResponseError] Refresh API SUCCESS. Full response data:', refreshResponse.data);

        let newAccessToken: string | undefined;
        if (refreshResponse.data?.data?.accessToken) {
          newAccessToken = refreshResponse.data.data.accessToken;
          console.log('[AxiosResponseError] Extracted new token from data.data.accessToken');
        } else if (refreshResponse.data?.accessToken) {
          newAccessToken = refreshResponse.data.accessToken;
          console.log('[AxiosResponseError] Extracted new token from data.accessToken');
        }

        if (typeof newAccessToken === 'string') {
          console.log('[AxiosResponseError] New accessToken obtained:', newAccessToken.substring(0, 10) + '...');
          localStorage.setItem('accessToken', newAccessToken);

          // Giả định originalRequest có headers
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          } else {
            // Khởi tạo headers nếu chưa có (ít khả năng xảy ra)
            originalRequest.headers = { Authorization: `Bearer ${newAccessToken}` };
          }

          console.log(`[AxiosResponseError] Retrying original request: ${originalRequest.url}`);
          // Retry bằng axiosInstance, truyền config đã cập nhật (vẫn là any)
          return axiosInstance(originalRequest);
        } else {
          console.error('[AxiosResponseError] Could not extract new access token from refresh response. Logging out.', refreshResponse.data);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(new Error('Failed to extract new access token after refresh.'));
        }

      } catch (refreshError: any) { // Sử dụng any cho refreshError
        let errorMessage = 'Refresh API failed';
        // Kiểm tra lỗi theo kiểu Axios 0.x (dựa vào isAxiosError nếu có)
        if (refreshError && refreshError.isAxiosError && refreshError.response) {
          errorMessage = refreshError.response.data?.message || JSON.stringify(refreshError.response.data) || refreshError.message;
          console.error(`[AxiosResponseError] Refresh API FAILED (AxiosError ${refreshError.response.status || 'N/A'}):`, errorMessage);
        } else if (refreshError instanceof Error) {
          errorMessage = refreshError.message;
          console.error('[AxiosResponseError] Refresh API FAILED (Error):', errorMessage);
        } else {
          console.error('[AxiosResponseError] Refresh API FAILED (Unknown):', refreshError);
        }

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(new Error(`Token refresh failed: ${errorMessage}`));
      }
    }

    // Xử lý các lỗi khác
    console.log(`[AxiosResponseError] Passing through error (Status: ${error.response?.status || (isNetworkError ? 'Network Error' : 'N/A')}, URL: ${originalRequest?.url || 'N/A'})`);
    return Promise.reject(error);
  }
);

export default axiosInstance;