import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreatePlanModal from '../components/modals/CreatePlanModal';
import CreateReviewModal from '../components/modals/CreateReviewModal';
import EditReviewModal from '../components/modals/EditReviewModal';
import EditPlanModal from '../components/modals/EditPlanModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { PerformancePlan, PerformanceReview } from '../types/api';
import { PerformanceService } from '../services/PerformanceService';
import { DepartmentService, Department } from '../services/DepartmentService';
// @ts-ignore
import * as ReactHotToast from 'react-hot-toast';

const toast = ReactHotToast.toast;
const Toaster = ReactHotToast.Toaster;

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
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PerformancePlan[]>([]);
  const [allDepartmentPlans, setAllDepartmentPlans] = useState<PerformancePlan[]>([]);
  const [companyWidePlans, setCompanyWidePlans] = useState<PerformancePlan[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employeeReviews, setEmployeeReviews] = useState<PerformanceReview[]>([]);
  
  // Lấy selectedPlan từ localStorage nếu có
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(() => {
    try {
      const savedPlan = localStorage.getItem('selectedPerformancePlan');
      return savedPlan ? JSON.parse(savedPlan) : null;
    } catch (e) {
      console.error('Lỗi khi đọc selectedPlan từ localStorage:', e);
      return null;
    }
  });
  
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
  const [isSelectedPlanCompanyWide, setIsSelectedPlanCompanyWide] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);
  const [planTitleToDelete, setPlanTitleToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bộ lọc và sắp xếp
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState<number>(0); // 0 = tất cả các tháng
  const [allPlans, setAllPlans] = useState<PerformancePlan[]>([]);
  
    // Không cần sử dụng showPlanDetails nữa vì ta chuyển sang trang riêng

  const isManager = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';
  const isSystemAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN';
  const isHRStaff = currentUser?.role?.roleType === 'HR_STAFF';
  const isAdmin = isSystemAdmin || isHRStaff;
  const isRegularEmployee = !isManager && !isAdmin;   
  
  // Lưu selectedPlan vào localStorage khi thay đổi
  useEffect(() => {    
    if (selectedPlan) {      
      localStorage.setItem('selectedPerformancePlan', JSON.stringify(selectedPlan));    
    } else {      
      localStorage.removeItem('selectedPerformancePlan');    
    }  
  }, [selectedPlan]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Fetch departments
        await fetchDepartments();
        
        // Fetch company-wide plans for all users
        await fetchCompanyWidePlans();

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
        
        // Hợp nhất tất cả các loại kế hoạch
        updateAllPlans();
        
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
      updateAllPlans();
    } catch (err) {
      setError('Lấy kế hoạch hiệu suất thất bại');
    }
  };

  const fetchDepartmentPlans = async () => {
    try {
      const data = await PerformanceService.getDepartmentPlans();
      setPlans(data);
      updateAllPlans();
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
      console.error(`Lỗi khi tải đánh giá:`, err);
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

  const fetchCompanyWidePlans = async () => {
    try {
      const data = await PerformanceService.getCompanyWidePlans();
      setCompanyWidePlans(data);
      updateAllPlans();
    } catch (err) {
      console.error('Lỗi khi lấy kế hoạch hiệu suất toàn công ty:', err);
    }
  };

  const handleCreatePlan = async (data: Omit<PerformancePlan, 'id' | 'departments' | 'createdBy'> & { 
    departmentIds?: number[], 
    isCompanyWide?: boolean 
  }) => {
    try {
      console.log('Selected Department ID:', selectedDepartmentId);
      console.log('Is Admin:', isAdmin);
      console.log('Current User Department:', currentUser?.departmentId);
      console.log('Is Company Wide:', data.isCompanyWide);

      let departmentId: number | null = null;
      
      // Nếu là kế hoạch toàn công ty, không cần departmentId
      if (data.isCompanyWide) {
        console.log('Creating company-wide plan');
      } else if (isAdmin) {
        // Admin tạo kế hoạch cho phòng ban cụ thể
        if (!selectedDepartmentId) {
          console.error('No department selected for admin');
          setError('Vui lòng chọn phòng ban hoặc chọn tùy chọn toàn công ty');
          return;
        }
        departmentId = selectedDepartmentId;
      } else {
        // Trưởng phòng tạo kế hoạch cho phòng ban của mình
        departmentId = currentUser?.departmentId || null;
      }

      // Kiểm tra lại một lần nữa nếu không phải kế hoạch toàn công ty
      if (!data.isCompanyWide && !departmentId) {
        console.error('No valid department ID found');
        setError('Không tìm thấy ID phòng ban hợp lệ');
        return;
      }

      const requestData = {
        ...data,
        departmentId,
        isCompanyWide: data.isCompanyWide || false
      };
      
      console.log('Dữ liệu gửi đi khi tạo kế hoạch:', requestData);
      
      await PerformanceService.createPlan(requestData);
      
      if (data.isCompanyWide) {
        fetchCompanyWidePlans();
      }
      
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
    } catch (err: any) {
      console.error('Lỗi khi xem chi tiết đánh giá:', err);
      // Hiển thị thông báo lỗi cụ thể
      toast.error(err.message || 'Không thể xem chi tiết đánh giá');
      setLoadingReviewDetails(false);
    }
  };

  const handleDeletePlan = async (planId: number, planTitle: string) => {
    setPlanToDelete(planId);
    setPlanTitleToDelete(planTitle);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      setIsDeleting(true);
      await PerformanceService.deletePlan(planToDelete);
      
      // Cập nhật lại danh sách kế hoạch
      if (isAdmin) {
        await fetchAllDepartmentPlans();
        await fetchCompanyWidePlans();
      } else {
        await fetchDepartmentPlans();
        await fetchCompanyWidePlans();
      }
      
      setIsDeleting(false);
      setPlanToDelete(null);
      setPlanTitleToDelete('');
    } catch (err) {
      setError('Xóa kế hoạch thất bại');
      setIsDeleting(false);
    }
  };

  // Hàm hợp nhất tất cả các kế hoạch
  const updateAllPlans = () => {
    let combinedPlans: PerformancePlan[] = [];
    
    // Thêm kế hoạch toàn công ty
    combinedPlans = [...combinedPlans, ...companyWidePlans];
    
    // Thêm kế hoạch phòng ban dựa trên quyền người dùng
    if (isAdmin) {
      combinedPlans = [...combinedPlans, ...allDepartmentPlans];
    } else if (isManager) {
      combinedPlans = [...combinedPlans, ...plans];
    }
    
    // Lọc theo năm
    if (yearFilter) {
      combinedPlans = combinedPlans.filter(plan => {
        const planYear = new Date(plan.startDate).getFullYear();
        return planYear === yearFilter;
      });
    }
    
    // Lọc theo tháng nếu có
    if (monthFilter > 0) {
      combinedPlans = combinedPlans.filter(plan => {
        const planMonth = new Date(plan.startDate).getMonth() + 1; // getMonth() trả về 0-11
        return planMonth === monthFilter;
      });
    }
    
    // Lọc bỏ các kế hoạch trùng lặp (có cùng ID)
    const planIds = new Set<number>();
    combinedPlans = combinedPlans.filter(plan => {
      if (planIds.has(plan.id)) {
        return false; // Đã có kế hoạch này trong danh sách, bỏ qua
      }
      planIds.add(plan.id); // Thêm ID vào Set để theo dõi
      return true;
    });
    
    // Sắp xếp theo thời gian (mới nhất trước)
    combinedPlans.sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
    
    // In ra danh sách kế hoạch để kiểm tra trùng lặp
    console.log('Danh sách kế hoạch sau khi cập nhật:', combinedPlans.map(plan => `${plan.isCompanyWide ? 'Toàn công ty' : 'Phòng ban'}-${plan.id}: ${plan.title}`));
    
    setAllPlans(combinedPlans);
  };

  const renderAllPlans = () => {
    return (
      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tất cả kế hoạch đánh giá hiệu suất</h2>
          <div className="flex space-x-4">
            {/* Chọn năm */}
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(parseInt(e.target.value));
                updateAllPlans();
              }}
            >
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
            </select>
            
            {/* Chọn tháng */}
            <select
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(parseInt(e.target.value));
                updateAllPlans();
              }}
            >
              <option value={0}>Tất cả tháng</option>
              <option value={1}>Tháng 1</option>
              <option value={2}>Tháng 2</option>
              <option value={3}>Tháng 3</option>
              <option value={4}>Tháng 4</option>
              <option value={5}>Tháng 5</option>
              <option value={6}>Tháng 6</option>
              <option value={7}>Tháng 7</option>
              <option value={8}>Tháng 8</option>
              <option value={9}>Tháng 9</option>
              <option value={10}>Tháng 10</option>
              <option value={11}>Tháng 11</option>
              <option value={12}>Tháng 12</option>
            </select>
            
            {/* Nút tạo kế hoạch mới */}
            {(isAdmin || isManager) && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleOpenCreatePlanModal}
              >
                <i className="fas fa-plus mr-2"></i>Tạo kế hoạch mới
              </button>
            )}
          </div>
        </div>
        
        {/* Bảng kế hoạch */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allPlans.length > 0 ? (
                allPlans.map((plan: PerformancePlan) => (
                  <tr 
                    key={`${plan.isCompanyWide ? 'company' : 'dept'}-plan-${plan.id}`}
                    className={`hover:bg-gray-50 ${selectedPlan?.id === plan.id ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{plan.title}</div>
                      <div className="text-sm text-gray-500">{plan.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                        plan.isCompanyWide 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {plan.isCompanyWide ? 'Toàn công ty' : 'Phòng ban'}
                      </span>
                      {!plan.isCompanyWide && plan.departments && plan.departments.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {plan.departments.map((dept: {id: number, name: string}) => dept.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center space-x-3">                        
                        {/* Nút xem chi tiết */}
                        <button
                          className="text-indigo-500 hover:text-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/performance/plan/${plan.id}`);
                          }}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {/* Nút chỉnh sửa kế hoạch (chỉ cho admin) */}
                        {isAdmin && (
                          <button
                            className="text-yellow-500 hover:text-yellow-700"
                            onClick={() => handleEditPlan(plan)}
                            title="Chỉnh sửa kế hoạch"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        
                        {/* Nút thêm đánh giá (chỉ cho admin và manager) */}
                        {(isAdmin || isManager) && (
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsSelectedPlanCompanyWide(plan.isCompanyWide || false);
                              setIsCreateReviewModalOpen(true);
                            }}
                            title="Thêm đánh giá"
                          >
                            <i className="fas fa-plus-circle"></i>
                          </button>
                        )}
                        
                        {/* Nút xóa kế hoạch (chỉ cho admin) */}
                        {isAdmin && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeletePlan(plan.id, plan.title)}
                            title="Xóa kế hoạch"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có kế hoạch đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

    // Không cần hàm renderPlanReviews nữa vì đã chuyển thành trang riêng

  // Thêm phương thức để xử lý khi chọn một kế hoạch đánh giá
  const handleSelectPlan = (plan: PerformancePlan) => {
    // Chuyển hướng đến trang chi tiết kế hoạch
    navigate(`/performance/plan/${plan.id}`);
  };

    // Không cần phương thức handleClosePlanDetails nữa

  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<PerformancePlan | null>(null);

  // Thêm phương thức xử lý khi cần chỉnh sửa kế hoạch
  const handleEditPlan = (plan: PerformancePlan) => {
    setPlanToEdit(plan);
    setIsEditPlanModalOpen(true);
  };

  // Thêm phương thức để lưu thay đổi khi chỉnh sửa kế hoạch
  const handleUpdatePlan = async (planId: number, data: Omit<PerformancePlan, 'id' | 'departments' | 'createdBy'> & { 
    departmentIds?: number[], 
    isCompanyWide?: boolean 
  }) => {
    try {
      console.log('Dữ liệu cập nhật kế hoạch:', data);
      
      // Gọi API service để cập nhật kế hoạch (giả định đã tồn tại)
      await PerformanceService.updatePlan(planId, data);
      
      // Cập nhật lại dữ liệu
      if (isAdmin) {
        await fetchAllDepartmentPlans();
        await fetchCompanyWidePlans();
      } else {
        await fetchDepartmentPlans();
        await fetchCompanyWidePlans();
      }
      
      updateAllPlans();
      
      // Đóng modal
      setIsEditPlanModalOpen(false);
      setPlanToEdit(null);
      
      // Nếu đang xem chi tiết kế hoạch này, cập nhật thông tin
      if (selectedPlan && selectedPlan.id === planId) {
        const updatedPlans = isAdmin ? allDepartmentPlans : plans;
        const updatedPlan = updatedPlans.find(p => p.id === planId) || 
                         companyWidePlans.find(p => p.id === planId);
        
        if (updatedPlan) {
          setSelectedPlan(updatedPlan);
          localStorage.setItem('selectedPerformancePlan', JSON.stringify(updatedPlan));
        }
      }
    } catch (err: any) {
      console.error('Lỗi cập nhật kế hoạch:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Cập nhật kế hoạch hiệu suất thất bại');
      }
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
      </div>

      {/* Company-wide Plans - Visible to all users */}
      {renderAllPlans()}

            {/* Đã xóa phần "Đánh giá hiệu suất theo phòng ban" */}

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
                  <tr key={`department-plan-${plan.id}`}>
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
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => navigate(`/performance/plan/${plan.id}`)}
                      >
                        Xem chi tiết
                      </button>
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
                            setIsSelectedPlanCompanyWide(plan.isCompanyWide || false);
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
                      <tr key={`plan-review-${review.id}`} className="hover:bg-gray-50">
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
                  <tr key={`employee-review-${review.id}`} className="hover:bg-gray-50">
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
          onSelectDepartments={(ids) => {
            if (ids && ids.length > 0) {
              setSelectedDepartmentId(ids[0]);
            } else {
              setSelectedDepartmentId(null);
            }
          }}
        />
      )}

      {isCreateReviewModalOpen && selectedPlan && (
        <CreateReviewModal
          isOpen={isCreateReviewModalOpen}
          onClose={() => setIsCreateReviewModalOpen(false)}
          planId={selectedPlan.id}
          isCompanyWide={isSelectedPlanCompanyWide}
          criteria={selectedPlan.criteria}
          onSubmit={handleCreateReview}
        />
      )}

      {isEditReviewModalOpen && selectedReview && (
        <EditReviewModal
          isOpen={isEditReviewModalOpen}
          onClose={() => {
            setIsEditReviewModalOpen(false);
            setSelectedReview(null);
            setSelectedReviewDetails(null);
          }}
          review={selectedReview}
          criteria={selectedReviewDetails?.plan?.criteria || []}
          onSubmit={(data) => {
            if (selectedReview) {
              handleEditReview(selectedReview.reviewId, data);
            }
          }}
          isReadOnly={isRegularEmployee}
        />
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPlanToDelete(null);
          setPlanTitleToDelete('');
        }}
        onConfirm={confirmDeletePlan}
        title="Xác nhận xóa kế hoạch"
        message={`Bạn có chắc chắn muốn xóa kế hoạch "${planTitleToDelete}"? Hành động này không thể hoàn tác.`}
      />

      {/* Modal chỉnh sửa kế hoạch */}
      {isEditPlanModalOpen && planToEdit && (
        <EditPlanModal
          isOpen={isEditPlanModalOpen}
          onClose={() => {
            setIsEditPlanModalOpen(false);
            setPlanToEdit(null);
          }}
          plan={planToEdit}
          onSubmit={handleUpdatePlan}
          isAdmin={isAdmin}
          departments={departments}
          onSelectDepartments={(ids) => {
            if (ids && ids.length > 0) {
              setSelectedDepartmentId(ids[0]);
            } else {
              setSelectedDepartmentId(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default Performance;