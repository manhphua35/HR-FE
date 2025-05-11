import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PerformanceService } from '../../services/PerformanceService';
import { DepartmentReview } from '../../services/PerformanceService';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: DepartmentReview;
  criteria: {
    id: number;
    name: string;
    weight: number;
    description: string;
  }[];
  onSubmit: (data: {
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
  }) => void;
  isReadOnly?: boolean;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  criteria,
  onSubmit,
  isReadOnly = false
}) => {
  const [reviewDate, setReviewDate] = useState('');
  const [scores, setScores] = useState<{
    criteriaId: number;
    score: number;
    comment: string;
  }[]>([]);
  const [comments, setComments] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [improvement, setImprovement] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setLoading(true);
        const data = await PerformanceService.getReviewDetails(review.reviewId);
        
        setReviewDate(data.reviewDate);
        setScores(data.scores || []);
        setComments(data.comments || '');
        setStrengths(data.strengths || '');
        setWeaknesses(data.weaknesses || '');
        setImprovement(data.improvement || '');
        setLoading(false);
      } catch (err) {
        setError('Lấy chi tiết đánh giá thất bại');
        setLoading(false);
      }
    };

    if (isOpen && review.reviewId) {
      fetchReviewDetails();
    }
  }, [isOpen, review.reviewId]);

  const handleScoreChange = (criteriaId: number, field: 'score' | 'comment', value: string | number) => {
    const newScores = [...scores];
    const index = newScores.findIndex(s => s.criteriaId === criteriaId);
    
    if (index === -1) {
      newScores.push({
        criteriaId,
        score: field === 'score' ? Number(value) : 0,
        comment: field === 'comment' ? String(value) : ''
      });
    } else {
      if (field === 'score') {
        newScores[index].score = Number(value);
      } else {
        newScores[index].comment = String(value);
      }
    }
    
    setScores(newScores);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      reviewDate,
      scores,
      comments,
      strengths,
      weaknesses,
      improvement
    });
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết đánh giá">
        <div className="text-center p-4">Đang tải...</div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết đánh giá">
        <div className="text-center text-red-500 p-4">{error}</div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isReadOnly ? "Chi tiết đánh giá" : "Chỉnh sửa đánh giá"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 mb-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{review.employeeName}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              parseFloat(review.totalScore) >= 4.0 ? 'bg-green-100 text-green-800' :
              parseFloat(review.totalScore) >= 3.5 ? 'bg-blue-100 text-blue-800' :
              parseFloat(review.totalScore) >= 3.0 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Điểm: {parseFloat(review.totalScore).toFixed(2)}
            </div>
          </div>
          <p className="text-sm text-gray-600">{review.planTitle}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày đánh giá</label>
          <input
            type="date"
            value={reviewDate}
            onChange={e => setReviewDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isReadOnly}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá các tiêu chí</label>
          {criteria.map(criterion => {
            const scoreItem = scores.find(s => s.criteriaId === criterion.id);
            return (
              <div key={criterion.id} className="mb-4 p-3 border rounded-md bg-gray-50">
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{criterion.name}</h4>
                    <p className="text-sm text-gray-500">{criterion.description}</p>
                    <p className="text-xs text-gray-400">Trọng số: {criterion.weight}%</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => !isReadOnly && handleScoreChange(criterion.id, 'score', star)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          (scoreItem?.score || 0) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        disabled={isReadOnly}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nhận xét</label>
                  <textarea
                    value={scoreItem?.comment || ''}
                    onChange={e => handleScoreChange(criterion.id, 'comment', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nhận xét chung</label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            disabled={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Điểm mạnh</label>
            <textarea
              value={strengths}
              onChange={e => setStrengths(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Điểm yếu</label>
            <textarea
              value={weaknesses}
              onChange={e => setWeaknesses(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phương hướng cải thiện</label>
          <textarea
            value={improvement}
            onChange={e => setImprovement(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            disabled={isReadOnly}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {isReadOnly ? "Đóng" : "Hủy"}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Lưu thay đổi
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default EditReviewModal;