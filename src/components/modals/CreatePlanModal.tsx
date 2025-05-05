import React, { useState } from 'react';

interface Criteria {
  id: number;
  name: string;
  weight: number;
  description: string;
}

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    criteria: Criteria[];
  }) => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    criteria: [
      {
        id: 1,
        name: 'Chất lượng công việc',
        weight: 40,
        description: 'Đánh giá chất lượng công việc hoàn thành'
      },
      {
        id: 2,
        name: 'Tinh thần làm việc',
        weight: 30,
        description: 'Đánh giá thái độ và tinh thần làm việc'
      },
      {
        id: 3,
        name: 'Kỹ năng mềm',
        weight: 30,
        description: 'Đánh giá kỹ năng giao tiếp và làm việc nhóm'
      }
    ]
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
          <h3 className="text-xl font-bold">Tạo kế hoạch hiệu suất</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mô tả
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tiêu chí đánh giá
            </label>
            {formData.criteria.map((criterion, index) => (
              <div key={criterion.id} className="mb-4 p-4 border rounded">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-gray-700 text-xs mb-1">Tên tiêu chí</label>
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                      value={criterion.name}
                      onChange={(e) => {
                        const newCriteria = [...formData.criteria];
                        newCriteria[index].name = e.target.value;
                        setFormData({ ...formData, criteria: newCriteria });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-xs mb-1">Trọng số (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                      value={criterion.weight}
                      onChange={(e) => {
                        const newCriteria = [...formData.criteria];
                        newCriteria[index].weight = Number(e.target.value);
                        setFormData({ ...formData, criteria: newCriteria });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Mô tả</label>
                  <input
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm"
                    value={criterion.description}
                    onChange={(e) => {
                      const newCriteria = [...formData.criteria];
                      newCriteria[index].description = e.target.value;
                      setFormData({ ...formData, criteria: newCriteria });
                    }}
                  />
                </div>
              </div>
            ))}
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
              Tạo kế hoạch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;