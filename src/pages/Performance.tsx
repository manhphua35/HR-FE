import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePlanModal from '../components/modals/CreatePlanModal';
import CreateReviewModal from '../components/modals/CreateReviewModal';
import EditReviewModal from '../components/modals/EditReviewModal';
import { PerformancePlan, PerformanceReview } from '../types/api';
import { PerformanceService } from '../services/PerformanceService';

interface DepartmentReview {
  reviewId: number;
  employeeName: string;
  planTitle: string;
  reviewDate: string;
  totalScore: string;
}

interface DepartmentPerformance {
  department: string;
  reviews: DepartmentReview[];
}

const formatScore = (score: string | undefined) => {
  if (!score) return 'N/A';
  return parseFloat(score).toFixed(2);
};

const getScoreClass = (score: string | undefined) => {
  if (!score) return 'text-gray-600 font-medium';
  const numScore = parseFloat(score);
  if (numScore >= 4.0) return 'text-green-600 font-medium';
  if (numScore >= 3.5) return 'text-blue-600 font-medium';
  if (numScore >= 3.0) return 'text-yellow-600 font-medium';
  return 'text-red-600 font-medium';
};

const Performance: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PerformancePlan[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(null);
  const [selectedReview, setSelectedReview] = useState<DepartmentReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentData, setDepartmentData] = useState<DepartmentPerformance[]>([]);
  const [isEditReviewModalOpen, setIsEditReviewModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);

  const isManager = currentUser?.role?.roleType === 'DEPARTMENT_MANAGER';
  const isSystemAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN';

  useEffect(() => {
    if (isSystemAdmin) {
      fetchOverallPerformance();
    } else {
      fetchDepartmentPlans();
    }
  }, [isSystemAdmin]);

  const fetchDepartmentPlans = async () => {
    try {
      const data = await PerformanceService.getDepartmentPlans();
      setPlans(data);
      setLoading(false);
    } catch (err) {
      setError('Lấy kế hoạch hiệu suất thất bại');
      setLoading(false);
    }
  };

  const fetchOverallPerformance = async () => {
    try {
      const data = await PerformanceService.getOverallPerformance();
      setDepartmentData(data || []);
      setLoading(false);
    } catch (err) {
      setError('Lấy dữ liệu hiệu suất thất bại');
      setLoading(false);
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

  const handleCreatePlan = async (data: Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'>) => {
    try {
      await PerformanceService.createPlan(data);
      fetchDepartmentPlans();
      setIsCreatePlanModalOpen(false);
    } catch (err) {
      setError('Tạo kế hoạch hiệu suất thất bại');
    }
  };

  const handleCreateReview = async (data: Omit<PerformanceReview, 'id' | 'planId' | 'reviewerId'>) => {
    try {
      if (!selectedPlan) return;
      
      await PerformanceService.createReview({
        ...data,
        planId: selectedPlan.id,
      });
      
      fetchReviews(selectedPlan.id);
      setIsCreateReviewModalOpen(false);
    } catch (err) {
      setError('Tạo đánh giá thất bại');
    }
  };

  const handleEditReview = async (reviewId: number, data: any) => {
    try {
      await PerformanceService.updateReview(reviewId, data);
      fetchOverallPerformance();
      setIsEditReviewModalOpen(false);
    } catch (err) {
      setError('Cập nhật đánh giá thất bại');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await PerformanceService.deleteReview(reviewId);
      fetchOverallPerformance();
    } catch (err) {
      setError('Xóa đánh giá thất bại');
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
        {isManager && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsCreatePlanModalOpen(true)}
          >
            Tạo kế hoạch
          </button>
        )}
      </div>

      {isSystemAdmin && departmentData.length > 0 && (
        <div className="space-y-6">
          {departmentData.map((dept) => (
            <div key={dept.department} className="bg-white rounded-lg shadow overflow-hidden">
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dept.reviews.map((review) => (
                      <tr key={review.reviewId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {review.employeeName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-normal">
                          <div className="text-sm text-gray-900">{review.planTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-center ${getScoreClass(review.totalScore)}`}>
                          {formatScore(review.totalScore)}
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

      {!isSystemAdmin && (
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
                      {isManager && new Date(plan.endDate) > new Date() && (
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm trung bình</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => {
                      const averageScore = review.scores.reduce((acc, curr) => acc + curr.score, 0) / review.scores.length;
                      return (
                        <tr key={review.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">ID: {review.employeeId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-right ${getScoreClass(averageScore.toString())}`}>
                            {averageScore.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button
                              className="text-yellow-600 hover:text-yellow-900"
                              onClick={() => {
                                setSelectedReview({
                                  reviewId: review.id,
                                  employeeName: `Employee ${review.employeeId}`,
                                  planTitle: selectedPlan.title,
                                  reviewDate: review.reviewDate,
                                  totalScore: averageScore.toString()
                                });
                                setIsEditReviewModalOpen(true);
                              }}
                            >
                              Chỉnh sửa
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {isCreatePlanModalOpen && (
        <CreatePlanModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => setIsCreatePlanModalOpen(false)}
          onSubmit={handleCreatePlan}
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
          criteria={selectedPlan?.criteria || []}
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
            await handleEditReview(selectedReview.reviewId, data);
          }}
        />
      )}
    </div>
  );
};

export default Performance;