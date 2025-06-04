import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { AuthService } from '../services/AuthService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean; // Add loading state
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading to true

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthContext] Bắt đầu checkAuth...');
      setLoading(true); // Bắt đầu tải

      const token = localStorage.getItem('accessToken');
      console.log('[AuthContext] accessToken ban đầu:', token ? token.substring(0, 10) + '...' : 'Không có');

      let finalUser: User | null = null;
      let finalIsAuthenticated = false;

      if (token) {
        try {
          console.log('[AuthContext] Đang thử lấy profile/me ban đầu...');
          const user = await AuthService.getCurrentUser();
          console.log('[AuthContext] Lấy profile/me ban đầu THÀNH CÔNG:', user);
          finalUser = user;
          finalIsAuthenticated = true;
        } catch (error: any) {
          console.error('[AuthContext] Lấy profile/me ban đầu THẤT BẠI:', error);
          if (error.response?.status === 401) {
            console.log('[AuthContext] Token hết hạn (401), đang thử làm mới...');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('[AuthContext] Tìm thấy refresh token:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'Không có');
            if (refreshToken) {
              try {
                console.log('[AuthContext] Đang gọi AuthService.refreshToken...');
                // Giả sử refreshToken() được xử lý bởi axios interceptor hoặc tự xử lý gọi API
                const refreshResponse = await AuthService.refreshToken(); // Đảm bảo hàm này tồn tại và hoạt động
                console.log('[AuthContext] Làm mới THÀNH CÔNG:', refreshResponse);
                localStorage.setItem('accessToken', refreshResponse.accessToken);

                console.log('[AuthContext] Đang thử lại profile/me sau khi làm mới...');
                const user = await AuthService.getCurrentUser(); // Thử lại fetch với token mới
                console.log('[AuthContext] Thử lại profile/me THÀNH CÔNG:', user);
                finalUser = user;
                finalIsAuthenticated = true;
              } catch (refreshError) {
                console.error('[AuthContext] Làm mới token THẤT BẠI:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Keep finalUser = null, finalIsAuthenticated = false
              }
            } else {
              console.log('[AuthContext] Không tìm thấy refresh token, đang đăng xuất.');
              localStorage.removeItem('accessToken');
              // Giữ finalUser = null, finalIsAuthenticated = false
            }
          } else {
            console.error('[AuthContext] Lỗi không phải 401 trong quá trình kiểm tra ban đầu:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Keep finalUser = null, finalIsAuthenticated = false
          }
        }
      } else {
        console.log('[AuthContext] Không tìm thấy accessToken ban đầu.');
        // Giữ finalUser = null, finalIsAuthenticated = false
      }      // Cập nhật state cùng lúc SAU KHI tất cả các hoạt động bất đồng bộ được giải quyết
      console.log('[AuthContext] Đặt trạng thái cuối cùng:', { finalIsAuthenticated, finalUser });
      console.log('[AuthContext] finalUser.role:', finalUser?.role);
      console.log('[AuthContext] finalUser.role.roleType:', finalUser?.role?.roleType);
      setCurrentUser(finalUser);
      setIsAuthenticated(finalIsAuthenticated);
      setLoading(false); // Đặt loading thành false chỉ sau khi trạng thái cuối cùng được xác định và đặt
      console.log('[AuthContext] checkAuth đã hoàn thành, loading được đặt thành false.');
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await AuthService.login(username, password);
      localStorage.setItem('accessToken', response.accessToken);
      // Also store refreshToken if available
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      // Standardize user object structure before setting state
      const userFromLogin = response.user;
      let standardizedUser: User | null = null;

      if (userFromLogin) {
        // Check if the role is already nested (ideal case)
        if (userFromLogin.role && typeof userFromLogin.role === 'object' && 'roleType' in userFromLogin.role) {
          standardizedUser = userFromLogin as User; // Assume it matches the User type
        }
        // Check if roleType exists directly (flat structure from login response)
        else if ('roleType' in userFromLogin && typeof userFromLogin.roleType === 'string') {
           // Construct the nested structure expected by the User type
           // We might not have all role details (id, name, description) from login response,
           // so create a minimal valid structure.
           standardizedUser = {
             ...userFromLogin,
             role: {
               // Assign default/placeholder values if not available from login response
               id: userFromLogin.roleId || 0, // Use roleId if available, else 0
               roleType: userFromLogin.roleType as User['role']['roleType'],
               name: userFromLogin.roleType.replace('_', ' '), // Generate a basic name
               description: '', // Placeholder
             },
             // Ensure roleType is removed from the top level if it existed
             roleType: undefined,
           } as User; // Cast to User, acknowledging potential missing role details
        } else {
           console.error('[AuthContext] Login response user object has unexpected structure:', userFromLogin);
           // Handle unexpected structure, maybe treat as error or set minimal user
           standardizedUser = null; // Or handle differently
        }
      }

      console.log('[AuthContext] Standardized user from login:', standardizedUser);
      setCurrentUser(standardizedUser);
      setIsAuthenticated(!!standardizedUser); // Set authenticated based on successful standardization

    } catch (error) {
      console.log('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear both tokens on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Optionally: redirect to login page
    // window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, logout }}>
      {/* Render children only when loading is false? Or let children handle loading state */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong một AuthProvider');
  }
  return context;
};

export default AuthContext;
