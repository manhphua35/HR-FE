import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ApiErrorResponse {
  message: string;
}

interface AxiosErrorWithResponse extends Error {
  response?: {
    status: number;
    data: ApiErrorResponse;
  };
  isAxiosError: boolean;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra và điền thông tin đăng nhập đã lưu khi component được tải
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const wasRemembered = localStorage.getItem('rememberMe') === 'true';
    
    if (savedUsername && savedPassword && wasRemembered) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Lưu thông tin đăng nhập nếu người dùng chọn "Remember me"
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Xóa thông tin đã lưu nếu không chọn "Remember me"
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }

      await login(username, password);
      navigate('/dashboard');
    } catch (err)
    {
      console.error('Login error21:', err);
      const error = err as AxiosErrorWithResponse;
      
      console.log('Login error1:', error);
      if (error.isAxiosError) {
        // Cải thiện thông báo lỗi cho người dùng
        const status = error.response?.status;
        
        if (status === 401) {
          setError('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.');
        } else if (status === 404) {
          setError('Tài khoản không tồn tại trong hệ thống. Vui lòng kiểm tra lại tên đăng nhập.');
        } else if (status === 403) {
          setError('Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập. Vui lòng liên hệ quản trị viên.');
        } else if (status === 429) {
          setError('Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ít phút.');
        } else if (error.response?.data.message) {
          setError(error.response.data.message);
        } else {
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
        }
      } else {
        setError('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau hoặc liên hệ hỗ trợ kỹ thuật.');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pr-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 z-20" 
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <i className="fas fa-spinner fa-spin"></i>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <i className="fas fa-lock"></i>
                </span>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
