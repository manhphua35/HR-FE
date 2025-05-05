import React, { useState } from 'react';

interface Criteria {
  id: number;
  name: string;
  weight: number;
  description: string;
}

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  criteria: Criteria[];
  onSubmit: (data: {
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
  }) => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  planId,
  criteria,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    employeeId: 0,
    reviewDate: new Date().toISOString().split('T')[0],
    scores: criteria.map(c => ({
      criteriaId: c.id,
      score: 0,
      comment: ''
    })),
    comments: '',
    strengths: '',
    weaknesses: '',
    improvement: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Tạo đánh giá hiệu suất</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mã nhân viên
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.employeeId || ''}
                onChange={(e) => setFormData({ ...formData, employeeId: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ngày đánh giá
              </label>
              <input
                type="date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Điểm đánh giá</h4>
            {formData.scores.map((score, index) => {
              const criterion = criteria.find(c => c.id === score.criteriaId);
              return (
                <div key={score.criteriaId} className="mb-4 p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-medium">{criterion?.name}</h5>
                    <span className="text-sm text-gray-500">Trọng số: {criterion?.weight}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-xs mb-1">Điểm (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                        value={score.score || ''}
                        onChange={(e) => {
                          const newScores = [...formData.scores];
                          newScores[index].score = Number(e.target.value);
                          setFormData({ ...formData, scores: newScores });
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs mb-1">Nhận xét</label>
                      <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                        value={score.comment}
                        onChange={(e) => {
                          const newScores = [...formData.scores];
                          newScores[index].comment = e.target.value;
                          setFormData({ ...formData, scores: newScores });
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nhận xét chung
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Điểm mạnh
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Điểm cần cải thiện
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Kế hoạch phát triển
            </label>
            <textarea 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.improvement}
              onChange={(e) => setFormData({ ...formData, improvement: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tạo đánh giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewModal;