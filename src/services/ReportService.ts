import axios from '../config/axios'; // Use configured axios instance
import { API_URL } from '../config';

// Define interfaces based on expected backend responses (using 'any' for now)
// TODO: Replace 'any' with actual types when backend structure is known

export interface DepartmentReportParams {
  startDate?: string;
  endDate?: string;
  // Add other potential parameters
}

export interface GenerateDepartmentReportData {
  departmentId: number;
  startDate: string;
  endDate: string;
  // Add other potential data fields
}

export interface HRCostParams {
  month: number; // Changed from startDate/endDate
  year: number;
  // Add other potential parameters
}

export interface DashboardDataParams {
  month: number; // Changed from startDate/endDate
  year: number;
  departmentId?: number; // Optional, depending on role
  // Add other potential parameters
}

export const ReportService = {
  /**
   * Generates a department report.
   * Requires HR_STAFF or SYSTEM_ADMIN role.
   * Corresponds to: POST /reports/departments
   */
  generateDepartmentReport: async (data: GenerateDepartmentReportData): Promise<any> => {
    // Assuming the backend returns some confirmation or the generated report data
    const response = await axios.post<{ data: any }>(
      `${API_URL}/reports/departments`,
      data
      // Headers with token are automatically added by the axios instance
    );
    return response.data.data;
  },

  /**
   * Gets department reports over time for a specific department.
   * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
   * Corresponds to: GET /reports/departments/:departmentId
   */
  getDepartmentReports: async (departmentId: number, params?: DepartmentReportParams): Promise<any[]> => {
    // Assuming the backend returns an array of report data points or summaries
    const response = await axios.get<{ data: any[] }>(
      `${API_URL}/reports/departments/${departmentId}`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Gets HR cost statistics.
   * Requires HR_STAFF or SYSTEM_ADMIN role.
   * Corresponds to: GET /reports/hr-cost
   */
  getHRCostStatistics: async (params: HRCostParams): Promise<any> => { // Made params required
    // Assuming the backend returns an object with cost statistics
    const response = await axios.get<{ data: any }>(
      `${API_URL}/reports/hr-cost`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Gets aggregated data for the dashboard.
   * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
   * Corresponds to: GET /reports/dashboard-data
   */
  getDashboardData: async (params: DashboardDataParams): Promise<any> => { // Made params required
    // Assuming the backend returns an object with various dashboard metrics
    const response = await axios.get<{ data: any }>(
      `${API_URL}/reports/dashboard-data`,
      { params }
    );
    return response.data.data;
  },

  // Note: The export functionality needs clarification based on backend capabilities.
  // The previous exportReport function is removed as its endpoint doesn't match.
  // A new export function might be needed if the backend provides specific export endpoints
  // for the new report types (e.g., /reports/hr-cost/export).
};

// Example usage (to be placed in the component):
/*
import { ReportService } from '../services/ReportService';
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { currentUser } = useAuth();

  const fetchDeptReports = async () => {
    if (currentUser?.departmentId && (currentUser.role?.roleType === 'DEPARTMENT_HEAD' || currentUser.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN')) {
      try {
        const reports = await ReportService.getDepartmentReports(currentUser.departmentId, { startDate: '...', endDate: '...' });
        // Update state with reports
      } catch (error) {
        console.error("Failed to fetch department reports", error);
      }
    }
  };

  const fetchHRCosts = async () => {
     if (currentUser?.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN') {
        try {
          const costs = await ReportService.getHRCostStatistics({ startDate: '...', endDate: '...' });
          // Update state with costs
        } catch (error) {
          console.error("Failed to fetch HR costs", error);
        }
     }
  };
}
*/