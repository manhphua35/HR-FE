// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardOverview {
  totalEmployees: number;
  totalDepartments: number;
  activeLeaves: number;
  currentTrainings: number;
  totalSalary: number;
  averagePerformance: number;
}

export interface DepartmentStat {
  departmentId: number;
  departmentName: string;
  employeeCount: number;
  activeLeaves: number;
  ongoingTrainings: number;
  averagePerformance: number;
  totalSalary: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface DepartmentScore {
  department: string;
  score: number;
}

export interface DepartmentAmount {
  department: string;
  amount: number;
}

export interface LeaveStats {
  total: number;
  byDepartment: DepartmentCount[];
}

export interface TrainingStats {
  total: number;
  byDepartment: DepartmentCount[];
}

export interface PerformanceStats {
  averageScore: number;
  byDepartment: DepartmentScore[];
}

export interface SalaryStats {
  total: number;
  byDepartment: DepartmentAmount[];
}

export interface DashboardData {
  overview: DashboardOverview;
  departmentStats: DepartmentStat[];
  leaveStats: LeaveStats;
  trainingStats: TrainingStats;
  performanceStats: PerformanceStats;
  salaryStats: SalaryStats;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: {
    id: number;
    roleType: 'SYSTEM_ADMIN' | 'HR_MANAGER' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';
    name: string;
    description: string;
  };
  departmentId: number | null;
  roleId: number;
  hireDate: string;
  remainingLeaves: number;
  baseSalary: string;
  isActive: boolean;
  department?: string;
  position?: string;
  avatar?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive';
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