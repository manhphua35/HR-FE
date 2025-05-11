import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  criteria: {
    id: number;
    name: string;
    weight: number;
    description: string;
  }[];
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
    status?: string;
    totalScore?: number;
  }) => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  planId,
  criteria,
  onSubmit
}) => {
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([
    { id: 1, name: 'Nhân viên A' },
    { id: 2, name: 'Nhân viên B' },
    { id: 3, name: 'Nhân viên C' },
    { id: 4, name: 'Nhân viên D' }
  ]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [reviewDate, setReviewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<{ criteriaId: number; score: number; comment: string }[]>([]);
  const [comments, setComments] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [weaknesses, setWeaknesses] = useState<string>('');
  const [improvement, setImprovement] = useState<string>('');

  // Initialize scores when criteria changes
  useEffect(() => {
    if (criteria.length > 0) {
      setScores(criteria.map(criterion => ({
        criteriaId: criterion.id,
        score: 0,
        comment: ''
      })));
    }
  }, [criteria]);

  const handleScoreChange = (criteriaId: number, field: 'score' | 'comment', value: string | number) => {
    setScores(prevScores => 
      prevScores.map(score => 
        score.criteriaId === criteriaId 
          ? { 
              ...score, 
              [field]: field === 'score' ? Number(value) : value 
            } 
          : score
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      alert('Vui lòng chọn nhân viên');
      return;
    }

    // Tính tổng điểm có trọng số
    const totalScore = scores.reduce((sum, score) => {
      const criterion = criteria.find(c => c.id === score.criteriaId);
      if (!criterion) return sum;
      return sum + (score.score * criterion.weight / 100);
    }, 0);

    onSubmit({
      employeeId: selectedEmployeeId,
      reviewDate,
      scores,
      comments,
      strengths,
      weaknesses,
      improvement,
      status: 'DRAFT',
      totalScore
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo đánh giá hiệu suất">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Chọn nhân viên</label>
          <select
            value={selectedEmployeeId || ''}
            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Chọn nhân viên --</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ngày đánh giá</label>
          <input
            type="date"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá các tiêu chí</label>
          {criteria.map(criterion => {
            const score = scores.find(s => s.criteriaId === criterion.id);
            return (
              <div key={criterion.id} className="mb-4 p-3 border rounded-md bg-gray-50">
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{criterion.name}</h4>
                    <p className="text-sm text-gray-500">{criterion.description}</p>
                    <p className="text-xs text-gray-400">Trọng số: {criterion.weight}%</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleScoreChange(criterion.id, 'score', star)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          (score?.score || 0) >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Nhận xét</label>
                  <textarea
                    value={score?.comment || ''}
                    onChange={(e) => handleScoreChange(criterion.id, 'comment', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
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
            onChange={(e) => setComments(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Điểm mạnh</label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Điểm yếu</label>
            <textarea
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phương hướng cải thiện</label>
          <textarea
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Tạo đánh giá
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReviewModal;