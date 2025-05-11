import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PerformancePlan } from '../../types/api';
import { Department } from '../../services/DepartmentService';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PerformancePlan, 'id' | 'departmentId' | 'createdBy'>) => void;
  isAdmin?: boolean;
  departments?: Department[];
  onSelectDepartment?: (id: number) => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isAdmin = false,
  departments = [],
  onSelectDepartment 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState([
    { id: 1, name: 'Kỹ năng chuyên môn', weight: 30, description: 'Đánh giá kỹ năng chuyên môn và kiến thức nghiệp vụ' },
    { id: 2, name: 'Hiệu suất làm việc', weight: 30, description: 'Đánh giá kết quả công việc và hiệu quả làm việc' },
    { id: 3, name: 'Tinh thần làm việc', weight: 20, description: 'Đánh giá thái độ, tinh thần làm việc và đóng góp cho tập thể' },
    { id: 4, name: 'Kỹ năng giao tiếp', weight: 20, description: 'Đánh giá khả năng giao tiếp và làm việc nhóm' },
  ]);

  // Log danh sách phòng ban
  useEffect(() => {
    if (departments.length > 0) {
      console.log('Danh sách phòng ban trong modal:', departments);
    }
  }, [departments]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setSelectedDepartmentId(null);
      setDepartmentError(null);
      setCriteria([
        { id: 1, name: 'Kỹ năng chuyên môn', weight: 30, description: 'Đánh giá kỹ năng chuyên môn và kiến thức nghiệp vụ' },
        { id: 2, name: 'Hiệu suất làm việc', weight: 30, description: 'Đánh giá kết quả công việc và hiệu quả làm việc' },
        { id: 3, name: 'Tinh thần làm việc', weight: 20, description: 'Đánh giá thái độ, tinh thần làm việc và đóng góp cho tập thể' },
        { id: 4, name: 'Kỹ năng giao tiếp', weight: 20, description: 'Đánh giá khả năng giao tiếp và làm việc nhóm' },
      ]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra xem đã chọn phòng ban chưa nếu người dùng là admin
    if (isAdmin && !selectedDepartmentId) {
      setDepartmentError('Vui lòng chọn phòng ban');
      return;
    }
    
    if (isAdmin && selectedDepartmentId && onSelectDepartment) {
      onSelectDepartment(selectedDepartmentId);
    }
    
    const planData = {
      title,
      description,
      startDate,
      endDate,
      criteria,
      status: 'ACTIVE'
    };

    // Nếu có departmentId, thêm vào dữ liệu gửi đi
    if (selectedDepartmentId) {
      console.log(`Đang tạo kế hoạch cho phòng ban ID: ${selectedDepartmentId}`);
    }
    
    onSubmit(planData);
  };

  // Xử lý khi chọn phòng ban
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setDepartmentError(null);
      const value = e.target.value;
      
      if (!value) {
        setSelectedDepartmentId(null);
        return;
      }
      
      // Chuyển đổi giá trị an toàn
      const deptId = parseInt(value, 10);
      
      // Kiểm tra nếu deptId là NaN
      if (isNaN(deptId)) {
        console.error('ID phòng ban không hợp lệ:', value);
        setSelectedDepartmentId(null);
        return;
      }
      
      console.log('Đã chọn phòng ban ID:', deptId);
      setSelectedDepartmentId(deptId);
    } catch (error) {
      console.error('Lỗi khi chọn phòng ban:', error);
      setSelectedDepartmentId(null);
    }
  };

  const handleCriteriaChange = (index: number, field: string, value: string | number) => {
    const newCriteria = [...criteria];
    (newCriteria[index] as any)[field] = field === 'weight' ? Number(value) : value;
    setCriteria(newCriteria);
  };

  const addCriteria = () => {
    const newId = Math.max(...criteria.map(c => c.id)) + 1;
    setCriteria([...criteria, { id: newId, name: '', weight: 0, description: '' }]);
  };

  const removeCriteria = (index: number) => {
    if (criteria.length <= 1) return;
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    setCriteria(newCriteria);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo kế hoạch đánh giá hiệu suất">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
          />
        </div>

        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phòng ban <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDepartmentId || ''}
              onChange={handleDepartmentChange}
              className={`mt-1 block w-full px-3 py-2 border ${departmentError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              required={isAdmin}
            >
              <option value="">Chọn phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {departmentError && (
              <p className="mt-1 text-sm text-red-600">
                {departmentError}
              </p>
            )}
            {selectedDepartmentId !== null && (
              <p className="mt-1 text-sm text-green-600">
                Đã chọn phòng ban: {departments.find(d => d.id === selectedDepartmentId)?.name || 'Không tìm thấy'}
              </p>
            )}
            {isAdmin && departments.length === 0 && (
              <p className="mt-1 text-sm text-orange-500">
                Không có phòng ban nào. Vui lòng tạo phòng ban trước.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Tiêu chí đánh giá</label>
            <button
              type="button"
              onClick={addCriteria}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Thêm tiêu chí
            </button>
          </div>

          {criteria.map((criterion, index) => (
            <div key={criterion.id} className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700">Tên tiêu chí</label>
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                    className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Trọng số (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={criterion.weight}
                    onChange={(e) => handleCriteriaChange(index, 'weight', e.target.value)}
                    className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Mô tả</label>
                <input
                  type="text"
                  value={criterion.description}
                  onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                  className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => removeCriteria(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                  disabled={criteria.length <= 1}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          <div className="mt-2 text-sm">
            Tổng trọng số: {criteria.reduce((sum, c) => sum + c.weight, 0)}% 
            {criteria.reduce((sum, c) => sum + c.weight, 0) !== 100 && (
              <span className="text-red-500 ml-2">(Tổng trọng số phải là 100%)</span>
            )}
          </div>
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
            disabled={criteria.reduce((sum, c) => sum + c.weight, 0) !== 100}
          >
            Tạo kế hoạch
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePlanModal;