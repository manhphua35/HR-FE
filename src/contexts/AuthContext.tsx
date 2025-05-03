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
      console.log('[AuthContext] Starting checkAuth...');
      setLoading(true); // Start loading

      const token = localStorage.getItem('accessToken');
      console.log('[AuthContext] Initial accessToken:', token ? token.substring(0, 10) + '...' : 'None');

      let finalUser: User | null = null;
      let finalIsAuthenticated = false;

      if (token) {
        try {
          console.log('[AuthContext] Attempting initial profile/me...');
          const user = await AuthService.getCurrentUser();
          console.log('[AuthContext] Initial profile/me SUCCESS:', user);
          finalUser = user;
          finalIsAuthenticated = true;
        } catch (error: any) {
          console.error('[AuthContext] Initial profile/me FAILED:', error);
          if (error.response?.status === 401) {
            console.log('[AuthContext] Token expired (401), attempting refresh...');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('[AuthContext] Refresh token found:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'None');
            if (refreshToken) {
              try {
                console.log('[AuthContext] Calling AuthService.refreshToken...');
                // Assuming refreshToken() is handled by axios interceptor or handles API call itself
                const refreshResponse = await AuthService.refreshToken(); // Ensure this exists and works
                console.log('[AuthContext] Refresh SUCCESS:', refreshResponse);
                localStorage.setItem('accessToken', refreshResponse.accessToken);

                console.log('[AuthContext] Retrying profile/me after refresh...');
                const user = await AuthService.getCurrentUser(); // Retry fetch with new token
                console.log('[AuthContext] Retry profile/me SUCCESS:', user);
                finalUser = user;
                finalIsAuthenticated = true;
              } catch (refreshError) {
                console.error('[AuthContext] Token refresh FAILED:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Keep finalUser = null, finalIsAuthenticated = false
              }
            } else {
              console.log('[AuthContext] No refresh token found, logging out.');
              localStorage.removeItem('accessToken');
              // Keep finalUser = null, finalIsAuthenticated = false
            }
          } else {
            console.error('[AuthContext] Non-401 error during initial check:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Keep finalUser = null, finalIsAuthenticated = false
          }
        }
      } else {
        console.log('[AuthContext] No initial accessToken found.');
        // Keep finalUser = null, finalIsAuthenticated = false
      }

      // Update state together AFTER all async operations are resolved
      console.log('[AuthContext] Setting final state:', { finalIsAuthenticated, finalUser });
      setCurrentUser(finalUser);
      setIsAuthenticated(finalIsAuthenticated);
      setLoading(false); // Set loading false only after final state is determined and set
      console.log('[AuthContext] checkAuth finished, loading set to false.');
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

    } catch (error:any) {
      console.log('Login failed:', error);
      throw new Error(`Login failed: ${error.message}`);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
