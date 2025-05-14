import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePlanModal from '../components/modals/CreatePlanModal';
import CreateReviewModal from '../components/modals/CreateReviewModal';
import EditReviewModal from '../components/modals/EditReviewModal';
import { PerformancePlan, PerformanceReview } from '../types/api';
import { PerformanceService } from '../services/PerformanceService';
import { DepartmentService, Department } from '../services/DepartmentService';

interface Employee {
  id: number;
  fullName: string;
  email: string;
}

interface Plan {
  id: number;
  title: string;
  description: string;
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

interface DepartmentPerformance {
  department: string;
  reviews: DepartmentReview[];
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

const Performance: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PerformancePlan[]>([]);
  const [allDepartmentPlans, setAllDepartmentPlans] = useState<PerformancePlan[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employeeReviews, setEmployeeReviews] = useState<PerformanceReview[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(null);
  const [selectedReview, setSelectedReview] = useState<DepartmentReview | null>(null);
  const [selectedReviewDetails, setSelectedReviewDetails] = useState<PerformanceReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentData, setDepartmentData] = useState<DepartmentPerformance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [loadingReviewDetails, setLoadingReviewDetails] = useState(false);

  const isManager = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';
  const isSystemAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN';
  const isHRStaff = currentUser?.role?.roleType === 'HR_STAFF';
  const isAdmin = isSystemAdmin || isHRStaff;
  const isRegularEmployee = !isManager && !isAdmin;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Fetch departments
        await fetchDepartments();
        
        if (isAdmin) {
          // Admins see all departments
          await fetchOverallPerformance();
          await fetchAllDepartmentPlans();
        } else if (isManager) {
          // Department managers see their department
          await fetchDepartmentPlans();
        } else {
          // Regular employees see their reviews
          await fetchEmployeeReviews();
        }
        setLoading(false);
      } catch (err) {
        setError('Lấy dữ liệu hiệu suất thất bại');
        setLoading(false);
      }
    };

    loadInitialData();
  }, [isAdmin, isManager]);

  const fetchAllDepartmentPlans = async () => {
    try {
      const data = await PerformanceService.getAllDepartmentPlans();
      setAllDepartmentPlans(data);
    } catch (err) {
      setError('Lấy kế hoạch hiệu suất thất bại');
    }
  };

  const fetchDepartmentPlans = async () => {
    try {
      const data = await PerformanceService.getDepartmentPlans();
      setPlans(data);
    } catch (err) {
      setError('Lấy kế hoạch hiệu suất thất bại');
    }
  };

  const fetchEmployeeReviews = async () => {
    try {
      const data = await PerformanceService.getEmployeeReviews();
      setEmployeeReviews(data);
    } catch (err) {
      setError('Lấy đánh giá thất bại');
    }
  };

  const fetchOverallPerformance = async () => {
    try {
      const data = await PerformanceService.getOverallPerformance();
      setDepartmentData(data || []);
    } catch (err) {
      setError('Lấy dữ liệu hiệu suất thất bại');
    }
  };

  const fetchReviews = async (planId: number) => {
    try {
      const data = await PerformanceService.getDepartmentReviews(planId);
      setReviews(data);
    } catch (err) {
      setError('Lấy đánh giá thất bại');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getDepartments();
      console.log('Danh sách phòng ban từ API:', data);
      setDepartments(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phòng ban:', err);
      setError('Không thể tải danh sách phòng ban');
    }
  };

  const handleCreatePlan = async (data: Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'>) => {
    try {
      console.log('Selected Department ID:', selectedDepartmentId);
      console.log('Is Admin:', isAdmin);
      console.log('Current User Department:', currentUser?.departmentId);

      let departmentId = currentUser?.departmentId;
      
      if (isAdmin) {
        if (!selectedDepartmentId) {
          console.error('No department selected for admin');
          setError('Vui lòng chọn phòng ban');
          return;
        }
        departmentId = selectedDepartmentId;
      }

      // Kiểm tra lại một lần nữa
      if (!departmentId) {
        console.error('No valid department ID found');
        setError('Không tìm thấy ID phòng ban hợp lệ');
        return;
      }

      const requestData = {
        ...data,
        departmentId: departmentId
      };
      
      console.log('Dữ liệu gửi đi khi tạo kế hoạch:', requestData);
      
      await PerformanceService.createPlan(requestData);
      
      if (isAdmin) {
        fetchAllDepartmentPlans();
        fetchOverallPerformance();
      } else {
        fetchDepartmentPlans();
      }
      
      setIsCreatePlanModalOpen(false);
      setSelectedDepartmentId(null);
    } catch (err: any) {
      console.error('Lỗi tạo kế hoạch:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Tạo kế hoạch hiệu suất thất bại');
      }
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
    status?: string;
    totalScore?: number;
  }) => {
    try {
      if (!selectedPlan) return;
      
      await PerformanceService.createReview({
        ...data,
        planId: selectedPlan.id,
      });
      
      if (isAdmin) {
        fetchOverallPerformance();
      } else {
        fetchReviews(selectedPlan.id);
      }
      
      setIsCreateReviewModalOpen(false);
    } catch (err) {
      setError('Tạo đánh giá thất bại');
    }
  };

  const handleEditReview = async (reviewId: number, data: any) => {
    try {
      await PerformanceService.updateReview(reviewId, data);
      
      if (isAdmin) {
        fetchOverallPerformance();
      } else if (isManager) {
        selectedPlan && fetchReviews(selectedPlan.id);
      } else {
        fetchEmployeeReviews();
      }
      
      setIsEditReviewModalOpen(false);
    } catch (err) {
      setError('Cập nhật đánh giá thất bại');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await PerformanceService.deleteReview(reviewId);
      
      if (isAdmin) {
        fetchOverallPerformance();
      } else if (isManager) {
        selectedPlan && fetchReviews(selectedPlan.id);
      } else {
        fetchEmployeeReviews();
      }
    } catch (err) {
      setError('Xóa đánh giá thất bại');
    }
  };

  const handleOpenCreatePlanModal = () => {
    if (isAdmin && departments.length === 0) {
      fetchDepartments(); // Tải lại phòng ban nếu cần
    }
    setIsCreatePlanModalOpen(true);
  };

  const handleViewReviewDetails = async (reviewId: number) => {
    try {
      setLoadingReviewDetails(true);
      const reviewDetails = await PerformanceService.getReviewDetails(reviewId);
      
      console.log("Dữ liệu chi tiết đánh giá:", reviewDetails);
      
      // Cập nhật thông tin đánh giá chi tiết
      setSelectedReviewDetails(reviewDetails);
      
      // Chuẩn bị dữ liệu cho modal
      setSelectedReview({
        reviewId: reviewDetails.id,
        employeeName: reviewDetails.employee?.fullName || 'Bạn',
        planTitle: reviewDetails.plan?.title || 'N/A',
        reviewDate: reviewDetails.reviewDate,
        totalScore: reviewDetails.totalScore.toString(),
        status: reviewDetails.status,
        comments: reviewDetails.comments,
        strengths: reviewDetails.strengths,
        weaknesses: reviewDetails.weaknesses,
        improvement: reviewDetails.improvement,
        reviewer: reviewDetails.reviewer,
        plan: reviewDetails.plan,
        scores: reviewDetails.scores
      });
      
      setIsEditReviewModalOpen(true);
      setLoadingReviewDetails(false);
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đánh giá:', err);
      setError('Không thể tải chi tiết đánh giá');
      setLoadingReviewDetails(false);
    }
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý hiệu suất</h1>
        {(isAdmin || isManager) && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleOpenCreatePlanModal}
          >
            Tạo kế hoạch đánh giá
          </button>
        )}
      </div>

      {/* Admin View - All Departments */}
      {isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Kế hoạch đánh giá theo phòng ban</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDepartmentPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.department?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                      <div className="text-sm text-gray-500">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(plan.endDate) > new Date() ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đang diễn ra
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Đã kết thúc
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsCreateReviewModalOpen(true);
                        }}
                        title="Thêm đánh giá"
                      >
                        <i className="fas fa-plus-circle"></i>
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {/* Handle delete plan */}}
                        title="Xóa kế hoạch"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold mb-4">Đánh giá hiệu suất theo phòng ban</h2>
          {departmentData.map((dept) => (
            <div key={dept.department} className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold">{dept.department}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kế hoạch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đánh giá</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm số</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận xét</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dept.reviews.map((review) => (
                      <tr key={review.reviewId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.employeeName)}&background=random`}
                                alt={review.employeeName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {review.employeeName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.planTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center ${getScoreClass(review.totalScore)}`}>
                          {formatScore(review.totalScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {review.status === 'APPROVED' ? 'Đã duyệt' :
                             review.status === 'PENDING' ? 'Đang chờ' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.comments}</div>
                          {review.strengths && (
                            <div className="mt-1">
                              <span className="text-xs font-medium text-green-600">Điểm mạnh:</span>
                              <span className="text-xs text-gray-500 ml-1">{review.strengths}</span>
                            </div>
                          )}
                          {review.weaknesses && (
                            <div className="mt-1">
                              <span className="text-xs font-medium text-red-600">Điểm yếu:</span>
                              <span className="text-xs text-gray-500 ml-1">{review.weaknesses}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setIsEditReviewModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 mx-2"
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.reviewId)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Manager View */}
      {isManager && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                      <div className="text-sm text-gray-500">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(plan.endDate) > new Date() ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đang diễn ra
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Đã kết thúc
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => {
                          setSelectedPlan(plan);
                          fetchReviews(plan.id);
                        }}
                      >
                        Xem đánh giá
                      </button>
                      {new Date(plan.endDate) > new Date() && (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsCreateReviewModalOpen(true);
                          }}
                        >
                          Thêm đánh giá
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPlan && reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Đánh giá cho {selectedPlan.title}</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đánh giá</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm trung bình</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận xét</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review: PerformanceReview) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.employee?.fullName || '')}&background=random`}
                                alt={review.employee?.fullName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {review.employee?.fullName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center ${getScoreClass(review.totalScore)}`}>
                          {formatScore(review.totalScore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {review.status === 'APPROVED' ? 'Đã duyệt' :
                             review.status === 'PENDING' ? 'Đang chờ' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{review.comments}</div>
                          <div className="mt-1">
                            <span className="text-xs font-medium text-green-600">Điểm mạnh:</span>
                            <span className="text-xs text-gray-500 ml-1">{review.strengths}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs font-medium text-red-600">Điểm yếu:</span>
                            <span className="text-xs text-gray-500 ml-1">{review.weaknesses}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                            onClick={() => {
                              setSelectedReview({
                                reviewId: review.id,
                                employeeName: review.employee?.fullName || `ID: ${review.employeeId}`,
                                planTitle: selectedPlan.title,
                                reviewDate: review.reviewDate,
                                totalScore: review.totalScore.toString(),
                                status: review.status,
                                comments: review.comments,
                                strengths: review.strengths,
                                weaknesses: review.weaknesses,
                                improvement: review.improvement
                              });
                              setIsEditReviewModalOpen(true);
                            }}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteReview(review.id)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Regular Employee View */}
      {isRegularEmployee && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Đánh giá hiệu suất của bạn</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kế hoạch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người đánh giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đánh giá</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm trung bình</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeReviews.map((review: PerformanceReview) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{review.plan?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer?.fullName || '')}&background=random`}
                            alt={review.reviewer?.fullName}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{review.reviewer?.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center ${getScoreClass(review.totalScore)}`}>
                      {formatScore(review.totalScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {review.status === 'APPROVED' ? 'Đã duyệt' :
                         review.status === 'PENDING' ? 'Đang chờ' : 'Từ chối'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewReviewDetails(review.id)}
                        title="Xem chi tiết"
                        disabled={loadingReviewDetails}
                      >
                        {loadingReviewDetails ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-eye"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {employeeReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Chưa có đánh giá nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isCreatePlanModalOpen && (
        <CreatePlanModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => {
            setIsCreatePlanModalOpen(false);
            setSelectedDepartmentId(null);
          }}
          onSubmit={handleCreatePlan}
          isAdmin={isAdmin}
          departments={departments}
          onSelectDepartment={(id) => setSelectedDepartmentId(id)}
        />
      )}

      {isCreateReviewModalOpen && selectedPlan && (
        <CreateReviewModal
          isOpen={isCreateReviewModalOpen}
          onClose={() => setIsCreateReviewModalOpen(false)}
          planId={selectedPlan.id}
          criteria={selectedPlan.criteria}
          onSubmit={handleCreateReview}
        />
      )}

      {isEditReviewModalOpen && selectedReview && (
        <EditReviewModal
          isOpen={isEditReviewModalOpen}
          onClose={() => setIsEditReviewModalOpen(false)}
          review={selectedReview}
          criteria={selectedReviewDetails?.plan?.criteria || []}
          isReadOnly={isRegularEmployee}
          onSubmit={async (data: {
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
            if (!isRegularEmployee) {
              await handleEditReview(selectedReview.reviewId, data);
            }
          }}
        />
      )}
    </div>
  );
};

export default Performance;