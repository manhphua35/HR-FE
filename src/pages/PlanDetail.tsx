import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PerformanceService } from '../services/PerformanceService';
import { DepartmentService } from '../services/DepartmentService';
import { EmployeeService, Employee as ApiEmployee } from '../services/EmployeeService';
import { PerformancePlan, PerformanceReview } from '../types/api';
import CreateReviewModal from '../components/modals/CreateReviewModal';
import EditReviewModal from '../components/modals/EditReviewModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface Employee {
  id: number;
  fullName: string;
  email: string;
  departmentId: number;
  department?: {
    id: number;
    name: string;
  } | null;
  isActive?: boolean;
}

interface DepartmentEmployees {
  departmentId: number;
  departmentName: string;
  employees: Employee[];
}

interface DepartmentReview {
  reviewId: number;
  employeeName: string;
  planTitle: string;
  reviewDate: string;
  totalScore: string;
  status?: string;
  comments?: string;
  strengths?: string;
  weaknesses?: string;
  improvement?: string;
  employee?: {
    id: number;
    fullName: string;
    email?: string;
    departmentId?: number;
  };
  reviewer?: {
    id: number;
    fullName: string;
    email?: string;
  };
  plan?: {
    id: number;
    title: string;
    description?: string;
    criteria?: {
      id: number;
      name: string;
      weight: number;
      description: string;
    }[];
  };
  scores?: any[];
}

const formatScore = (score: string | number | undefined) => {
  if (!score) return 'N/A';
  return typeof score === 'string' ? parseFloat(score).toFixed(2) : score.toFixed(2);
};

const getScoreClass = (score: string | number | undefined) => {
  if (!score) return 'text-gray-600 font-medium';
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  if (numScore >= 4.0) return 'text-green-600 font-medium';
  if (numScore >= 3.5) return 'text-blue-600 font-medium';
  if (numScore >= 3.0) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
};

const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [plan, setPlan] = useState<PerformancePlan | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [departmentEmployees, setDepartmentEmployees] = useState<DepartmentEmployees[]>([]);
  const [selectedReview, setSelectedReview] = useState<DepartmentReview | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [selectedReviewDetails, setSelectedReviewDetails] = useState<PerformanceReview | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [employeeNameToDelete, setEmployeeNameToDelete] = useState<string>('');

  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN' || currentUser?.role?.roleType === 'HR_STAFF';
  const isManager = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';
  const canEditPlan = isAdmin || isManager;

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Lấy chi tiết kế hoạch đánh giá
      const allPlans = isAdmin 
        ? await PerformanceService.getAllDepartmentPlans()
        : await PerformanceService.getDepartmentPlans();
      
      const planData = allPlans.find(p => p.id === parseInt(id));
      
      if (!planData) {
        setError('Không tìm thấy kế hoạch đánh giá');
        setLoading(false);
        return;
      }
      
      setPlan(planData);
      
      // Lấy danh sách đánh giá
      const reviewsData = await PerformanceService.getDepartmentReviews(parseInt(id));
      setReviews(reviewsData);
      
      // Lấy danh sách nhân viên theo phòng ban
      await fetchEmployeesByDepartments(planData);
      
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu kế hoạch:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu kế hoạch đánh giá');
      setLoading(false);
    }
  };

  const fetchEmployeesByDepartments = async (planData: PerformancePlan) => {
    try {
      if (!planData.departments || planData.departments.length === 0) {
        // Nếu là plan toàn công ty hoặc không có phòng ban, lấy tất cả nhân viên
        const allEmployees = await EmployeeService.getAllEmployees();
        const departmentMap = new Map<number, DepartmentEmployees>();
        
        // Nhóm nhân viên theo phòng ban
        for (const employee of allEmployees) {
          if (!employee.departmentId) continue;
          
          if (!departmentMap.has(employee.departmentId)) {
            departmentMap.set(employee.departmentId, {
              departmentId: employee.departmentId,
              departmentName: employee.department?.name || `Phòng ban ${employee.departmentId}`,
              employees: []
            });
          }
          
          const deptEmployees = departmentMap.get(employee.departmentId);
          if (deptEmployees) {
            deptEmployees.employees.push({
              id: employee.id,
              fullName: employee.fullName,
              email: employee.email,
              departmentId: employee.departmentId,
              department: employee.department,
              isActive: employee.isActive
            });
          }
        }
        
        setDepartmentEmployees(Array.from(departmentMap.values()));
      } else {
        // Nếu có phòng ban cụ thể
        const deptEmployeesPromises = planData.departments.map(async dept => {
          const apiEmployees = await EmployeeService.getDepartmentEmployees(dept.id);
          const employees: Employee[] = apiEmployees.map(emp => ({
            id: emp.id,
            fullName: emp.fullName,
            email: emp.email,
            departmentId: emp.departmentId || dept.id, // Sử dụng dept.id nếu departmentId là null
            department: emp.department,
            isActive: emp.isActive
          }));
          
          return {
            departmentId: dept.id,
            departmentName: dept.name,
            employees: employees
          };
        });
        
        const deptEmployees = await Promise.all(deptEmployeesPromises);
        setDepartmentEmployees(deptEmployees);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên:', err);
      setError('Đã xảy ra lỗi khi tải danh sách nhân viên');
    }
  };

  const handleCreateReview = async (data: {
    employeeId: number;
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
  }) => {
    if (!plan) return;
    
    try {
      setLoadingAction('creating');
      
      await PerformanceService.createReview({
        ...data,
        planId: plan.id,
      });
      
      // Làm mới danh sách đánh giá
      const reviewsData = await PerformanceService.getDepartmentReviews(plan.id);
      setReviews(reviewsData);
      
      setIsCreateReviewModalOpen(false);
      setLoadingAction(null);
    } catch (err) {
      console.error('Lỗi khi tạo đánh giá:', err);
      setError('Đã xảy ra lỗi khi tạo đánh giá');
      setLoadingAction(null);
    }
  };

  const handleEditReview = async (reviewId: number, data: any) => {
    if (!plan) return;
    
    try {
      setLoadingAction('editing');
      
      await PerformanceService.updateReview(reviewId, data);
      
      // Làm mới danh sách đánh giá
      const reviewsData = await PerformanceService.getDepartmentReviews(plan.id);
      setReviews(reviewsData);
      
      setIsEditReviewModalOpen(false);
      setLoadingAction(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật đánh giá:', err);
      setError('Đã xảy ra lỗi khi cập nhật đánh giá');
      setLoadingAction(null);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    try {
      setLoadingAction(`deleting-${reviewId}`);
      
      await PerformanceService.deleteReview(reviewId);
      
      // Làm mới danh sách đánh giá
      if (plan) {
        const reviewsData = await PerformanceService.getDepartmentReviews(plan.id);
        setReviews(reviewsData);
      }
      
      setLoadingAction(null);
    } catch (err) {
      console.error('Lỗi khi xóa đánh giá:', err);
      setError('Đã xảy ra lỗi khi xóa đánh giá');
      setLoadingAction(null);
    }
  };

  const openDeleteModal = (reviewId: number, employeeName: string) => {
    setReviewToDelete(reviewId);
    setEmployeeNameToDelete(employeeName);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      setLoadingAction(`deleting-${reviewToDelete}`);
      
      // Xóa đánh giá
      await PerformanceService.deleteReview(reviewToDelete);
      
      // Làm mới danh sách đánh giá
      if (plan) {
        const reviewsData = await PerformanceService.getDepartmentReviews(plan.id);
        setReviews(reviewsData);
      }
      
      setIsDeleteModalOpen(false);
      setLoadingAction(null);
      setReviewToDelete(null);
      setEmployeeNameToDelete('');
    } catch (err) {
      console.error('Lỗi khi xóa đánh giá:', err);
      setError('Đã xảy ra lỗi khi xóa đánh giá');
      setLoadingAction(null);
    }
  };

  const handleViewReviewDetails = async (reviewId: number) => {
    try {
      setLoadingAction(`viewing-${reviewId}`);
      
      const reviewDetails = await PerformanceService.getReviewDetails(reviewId);
      setSelectedReviewDetails(reviewDetails);
      
      // Chuẩn bị dữ liệu cho modal
      setSelectedReview({
        reviewId: reviewDetails.id,
        employeeName: reviewDetails.employee?.fullName || 'Chưa có tên',
        planTitle: reviewDetails.plan?.title || 'Chưa có tiêu đề',
        reviewDate: reviewDetails.reviewDate,
        totalScore: reviewDetails.totalScore.toString(),
        status: reviewDetails.status,
        comments: reviewDetails.comments,
        strengths: reviewDetails.strengths,
        weaknesses: reviewDetails.weaknesses,
        improvement: reviewDetails.improvement,
        employee: reviewDetails.employee,
        reviewer: reviewDetails.reviewer,
        plan: reviewDetails.plan,
        scores: reviewDetails.scores
      });
      
      setIsEditReviewModalOpen(true);
      setLoadingAction(null);
    } catch (err: any) {
      console.error('Lỗi khi xem chi tiết đánh giá:', err);
      // Hiển thị thông báo lỗi
      setError(err.message || 'Không thể xem chi tiết đánh giá');
      setLoadingAction(null);
    }
  };

  const isEmployeeReviewed = (employeeId: number): boolean => {
    return reviews.some(review => review.employeeId === employeeId);
  };

  const getEmployeeReview = (employeeId: number): PerformanceReview | undefined => {
    return reviews.find(review => review.employeeId === employeeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Thông báo! </strong>
        <span className="block sm:inline">Không tìm thấy kế hoạch đánh giá.</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <i className="fas fa-arrow-left mr-2"></i> Quay lại
        </button>
        <h1 className="text-2xl font-bold flex-grow text-center">{plan.title}</h1>
        <div className="w-24"></div> {/* Để giữ cân đối */}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-gray-600 font-semibold">Mô tả:</h3>
            <p className="text-gray-800">{plan.description}</p>
          </div>
          <div>
            <h3 className="text-gray-600 font-semibold">Thời gian:</h3>
            <p className="text-gray-800">
              {new Date(plan.startDate).toLocaleDateString('vi-VN')} - {new Date(plan.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-gray-600 font-semibold">Trạng thái:</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              plan.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : plan.status === 'COMPLETED'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {plan.status === 'ACTIVE'
              ? 'Đang diễn ra'
              : plan.status === 'COMPLETED'
              ? 'Đã hoàn thành'
              : plan.status === 'DRAFT'
              ? 'Dự thảo'
              : 'Đã hủy'}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-gray-600 font-semibold">Phạm vi:</h3>
          {plan.isCompanyWide ? (
            <p className="text-gray-800">Toàn công ty</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {plan.departments && plan.departments.map(dept => (
                <span
                  key={dept.id}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {dept.name}
                </span>
              ))}
              {(!plan.departments || plan.departments.length === 0) && (
                <p className="text-gray-800">Chưa có phòng ban nào</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-gray-600 font-semibold mb-2">Tiêu chí đánh giá:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên tiêu chí
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trọng số
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plan.criteria && plan.criteria.map(criterion => (
                  <tr key={criterion.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{criterion.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{criterion.weight}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{criterion.description}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Đánh giá theo phòng ban</h2>

      {departmentEmployees.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Không có nhân viên nào trong phạm vi kế hoạch này.</span>
        </div>
      ) : (
        departmentEmployees.map(dept => (
          <div key={dept.departmentId} className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{dept.departmentName}</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái đánh giá
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm số
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dept.employees.map(employee => {
                    const isReviewed = isEmployeeReviewed(employee.id);
                    const review = getEmployeeReview(employee.id);
                    
                    return (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.fullName)}&background=random`}
                                alt={employee.fullName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isReviewed ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              review?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              review?.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review?.status === 'APPROVED' ? 'Đã duyệt' :
                               review?.status === 'SUBMITTED' ? 'Đã đánh giá' : 'Dự thảo'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Chưa đánh giá
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center ${
                          isReviewed ? getScoreClass(review?.totalScore) : 'text-gray-400'
                        }`}>
                          {isReviewed ? formatScore(review?.totalScore) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isReviewed ? (
                            <div className="flex justify-center space-x-3">
                              <button
                                onClick={() => review && handleViewReviewDetails(review.id)}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                disabled={loadingAction === `viewing-${review?.id}`}
                              >
                                {loadingAction === `viewing-${review?.id}` ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-eye"></i>
                                )}
                              </button>
                              {canEditPlan && (
                                <>
                                  <button
                                    onClick={() => review && openDeleteModal(
                                      review.id, 
                                      review.employee?.fullName || `ID: ${review.employeeId}`
                                    )}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    disabled={loadingAction === `deleting-${review?.id}`}
                                  >
                                    {loadingAction === `deleting-${review?.id}` ? (
                                      <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                      <i className="fas fa-trash"></i>
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          ) : canEditPlan && (
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setSelectedDepartmentId(dept.departmentId);
                                setIsCreateReviewModalOpen(true);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              disabled={loadingAction === 'creating'}
                            >
                              {loadingAction === 'creating' ? (
                                <i className="fas fa-spinner fa-spin mr-1"></i>
                              ) : (
                                <i className="fas fa-plus-circle mr-1"></i>
                              )}
                              Đánh giá
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Modal tạo đánh giá */}
      {isCreateReviewModalOpen && selectedEmployee && plan && (
        <CreateReviewModal
          isOpen={isCreateReviewModalOpen}
          onClose={() => {
            setIsCreateReviewModalOpen(false);
            setSelectedEmployee(null);
          }}
          planId={plan.id}
          employeeId={selectedEmployee.id}
          isCompanyWide={plan.isCompanyWide || false}
          criteria={plan.criteria || []}
          onSubmit={handleCreateReview}
        />
      )}

      {/* Modal sửa đánh giá */}
      {isEditReviewModalOpen && selectedReview && selectedReviewDetails && (
        <EditReviewModal
          isOpen={isEditReviewModalOpen}
          onClose={() => setIsEditReviewModalOpen(false)}
          review={selectedReview}
          criteria={selectedReviewDetails.plan?.criteria || []}
          isReadOnly={!canEditPlan}
          onSubmit={(data) => handleEditReview(selectedReview.reviewId, data)}
        />
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Xác nhận xóa đánh giá"
        message={`Bạn có chắc chắn muốn xóa đánh giá cho nhân viên "${employeeNameToDelete}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};

export default PlanDetail; 