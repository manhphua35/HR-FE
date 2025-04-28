import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CreatePlanModal from '../components/modals/CreatePlanModal';
import CreateReviewModal from '../components/modals/CreateReviewModal';
import ReviewDetailsModal from '../components/modals/ReviewDetailsModal';
import { PerformancePlan, PerformanceReview } from '../types/api';
import { PerformanceService } from '../services/PerformanceService';

const Performance: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<PerformancePlan[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PerformancePlan | null>(null);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isCreateReviewModalOpen, setIsCreateReviewModalOpen] = useState(false);
  const [isReviewDetailsModalOpen, setIsReviewDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await PerformanceService.getPlans();
      setPlans(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch performance plans');
      setLoading(false);
    }
  };

  const fetchReviews = async (planId: number) => {
    try {
      const data = await PerformanceService.getReviews(planId);
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const handleCreatePlan = async (data: Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'>) => {
    try {
      await PerformanceService.createPlan(data);
      fetchPlans();
      setIsCreatePlanModalOpen(false);
    } catch (err) {
      setError('Failed to create performance plan');
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
      setError('Failed to create review');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const isManager = currentUser?.role === 'department_manager' || currentUser?.role === 'hr_manager';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Performance Management</h1>

      {/* Performance Plans Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Performance Plans</h2>
          {isManager && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setIsCreatePlanModalOpen(true)}
            >
              Create Plan
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Completed
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
                      View Reviews
                    </button>
                    {isManager && new Date(plan.endDate) > new Date() && (
                      <button
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsCreateReviewModalOpen(true);
                        }}
                      >
                        Add Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews Section */}
      {selectedPlan && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviews for {selectedPlan.title}</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Employee ID: {review.employeeId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(review.scores.reduce((acc, curr) => acc + curr.score, 0) / review.scores.length).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setSelectedReview(review);
                          setIsReviewDetailsModalOpen(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
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

      {isReviewDetailsModalOpen && selectedReview && selectedPlan && (
        <ReviewDetailsModal
          isOpen={isReviewDetailsModalOpen}
          onClose={() => setIsReviewDetailsModalOpen(false)}
          review={selectedReview}
          criteria={selectedPlan.criteria}
        />
      )}
    </div>
  );
};

export default Performance;