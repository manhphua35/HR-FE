import React from 'react';

interface Score {
  criteriaId: number;
  score: number;
  comment: string;
}

interface Criteria {
  id: number;
  name: string;
  weight: number;
  description: string;
}

interface ReviewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: number;
    employeeId: number;
    reviewDate: string;
    scores: Score[];
    comments?: string;
    strengths?: string;
    weaknesses?: string;
    improvement?: string;
  };
  criteria: Criteria[];
}

const ReviewDetailsModal: React.FC<ReviewDetailsModalProps> = ({
  isOpen,
  onClose,
  review,
  criteria
}) => {
  if (!isOpen) return null;

  const calculateAverageScore = () => {
    const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);
    const weightedSum = review.scores.reduce((acc, score) => {
      const criterion = criteria.find(c => c.id === score.criteriaId);
      return acc + (score.score * (criterion?.weight || 0));
    }, 0);
    return (weightedSum / totalWeight).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Chi tiết đánh giá hiệu suất</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
            <div>
              <p className="text-sm text-gray-600">Mã nhân viên</p>
              <p className="font-medium">{review.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày đánh giá</p>
              <p className="font-medium">{new Date(review.reviewDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Điểm số */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Điểm đánh giá</h4>
            <div className="space-y-4">
              {review.scores.map(score => {
                const criterion = criteria.find(c => c.id === score.criteriaId);
                return (
                  <div key={score.criteriaId} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h5 className="font-medium">{criterion?.name}</h5>
                        <p className="text-sm text-gray-500">{criterion?.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{score.score}%</p>
                        <p className="text-sm text-gray-500">Trọng số: {criterion?.weight}%</p>
                      </div>
                    </div>
                    {score.comment && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Nhận xét:</span> {score.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">Điểm tổng hợp</p>
                <p className="text-3xl font-bold text-blue-600">{calculateAverageScore()}%</p>
              </div>
            </div>
          </div>

          {/* Nhận xét chung */}
          {review.comments && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Nhận xét chung</h4>
              <p className="p-4 bg-gray-50 rounded">{review.comments}</p>
            </div>
          )}

          {/* Điểm mạnh và điểm yếu */}
          <div className="grid grid-cols-2 gap-4">
            {review.strengths && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Điểm mạnh</h4>
                <p className="p-4 bg-green-50 rounded">{review.strengths}</p>
              </div>
            )}
            {review.weaknesses && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Điểm cần cải thiện</h4>
                <p className="p-4 bg-yellow-50 rounded">{review.weaknesses}</p>
              </div>
            )}
          </div>

          {/* Kế hoạch phát triển */}
          {review.improvement && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Kế hoạch phát triển</h4>
              <p className="p-4 bg-purple-50 rounded">{review.improvement}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsModal;