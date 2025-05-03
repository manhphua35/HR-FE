// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Performance Types
export interface PerformancePlan {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  departmentId: number;
  createdBy: number;
  criteria: {
    id: number;
    name: string;
    weight: number;
    description: string;
  }[];
}

export interface PerformanceReview {
  id: number;
  planId: number;
  employeeId: number;
  reviewerId: number;
  reviewDate: string;
  scores: {
    criteriaId: number;
    score: number;
    comment: string;
  }[];
  comments?: string;
  strengths?: string;
  weaknesses?: string;
  improvement?: string;
}

// User Types (Matching backend response)
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string; // Added from backend response
  role: { // Updated to match nested structure from API response
    id: number;
    roleType: 'SYSTEM_ADMIN' | 'HR_MANAGER' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';
    name: string;
    description: string;
  };
  // permissions: string[]; // Assuming permissions might not be directly on user object based on response
  departmentId: number | null;
  roleId: number; // Added from response
  hireDate: string; // Added from response
  remainingLeaves: number; // Added from response
  baseSalary: string; // Added from response
  isActive: boolean; // Added from response
  // Optional fields
  department?: string;
  position?: string;
  avatar?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive'; // Made optional as it wasn't in the login response
}

// Dashboard Types
export interface DashboardStats {
  totalEmployees: number;
  departmentsCount: number;
  averagePerformance: number;
  issuesCount: number;
  attendanceRate: number;
  leaveRequests: number;
  openPositions: number;
  projectsCount: number;
}

export interface DepartmentStats {
  employeeCount: number;
  activeProjects: number;
  pendingLeaveRequests: number;
  averagePerformance: number;
  attendance: {
    present: number;
    total: number;
  };
  projectCompletion: number;
  trainingProgress: number;
}

export interface EmployeeStats {
  workingHours: number;
  attendanceRate: number;
  performanceScore: number;
  leaveBalance: number;
  schedule: Array<{
    id: number;
    title: string;
    date: string;
    type: string;
  }>;
  activities: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}