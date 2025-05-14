import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PerformancePlan } from '../../types/api';
import { Department } from '../../services/DepartmentService';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PerformancePlan;
  onSubmit: (planId: number, data: Omit<PerformancePlan, 'id' | 'departments' | 'createdBy'> & { 
    departmentIds?: number[], 
    isCompanyWide?: boolean 
  }) => void;
  isAdmin?: boolean;
  departments?: Department[];
  onSelectDepartments?: (ids: number[]) => void;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  plan,
  onSubmit,
  isAdmin = false,
  departments = [],
  onSelectDepartments 
}) => {
  const [title, setTitle] = useState(plan.title || '');
  const [description, setDescription] = useState(plan.description || '');
  const [startDate, setStartDate] = useState(plan.startDate?.substring(0, 10) || '');
  const [endDate, setEndDate] = useState(plan.endDate?.substring(0, 10) || '');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>(
    plan.departments?.map(d => d.id) || []
  );
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [isCompanyWide, setIsCompanyWide] = useState(plan.isCompanyWide || false);
  const [criteria, setCriteria] = useState(plan.criteria || [
    { id: 1, name: 'Kỹ năng chuyên môn', weight: 30, description: 'Đánh giá kỹ năng chuyên môn và kiến thức nghiệp vụ' },
    { id: 2, name: 'Hiệu suất làm việc', weight: 30, description: 'Đánh giá kết quả công việc và hiệu quả làm việc' },
    { id: 3, name: 'Tinh thần làm việc', weight: 20, description: 'Đánh giá thái độ, tinh thần làm việc và đóng góp cho tập thể' },
    { id: 4, name: 'Kỹ năng giao tiếp', weight: 20, description: 'Đánh giá khả năng giao tiếp và làm việc nhóm' },
  ]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTitle(plan.title || '');
      setDescription(plan.description || '');
      setStartDate(plan.startDate?.substring(0, 10) || '');
      setEndDate(plan.endDate?.substring(0, 10) || '');
      setSelectedDepartmentIds(plan.departments?.map(d => d.id) || []);
      setDepartmentError(null);
      setIsCompanyWide(plan.isCompanyWide || false);
      setCriteria(plan.criteria || [
        { id: 1, name: 'Kỹ năng chuyên môn', weight: 30, description: 'Đánh giá kỹ năng chuyên môn và kiến thức nghiệp vụ' },
        { id: 2, name: 'Hiệu suất làm việc', weight: 30, description: 'Đánh giá kết quả công việc và hiệu quả làm việc' },
        { id: 3, name: 'Tinh thần làm việc', weight: 20, description: 'Đánh giá thái độ, tinh thần làm việc và đóng góp cho tập thể' },
        { id: 4, name: 'Kỹ năng giao tiếp', weight: 20, description: 'Đánh giá khả năng giao tiếp và làm việc nhóm' },
      ]);
    }
  }, [isOpen, plan]);

  // Theo dõi khi thay đổi isCompanyWide và cập nhật UI
  useEffect(() => {
    if (isCompanyWide) {
      setSelectedDepartmentIds([]);
      if (onSelectDepartments) {
        onSelectDepartments([]);
      }
    }
  }, [isCompanyWide, onSelectDepartments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra xem đã chọn phòng ban chưa nếu người dùng là admin và không phải plan cho toàn công ty
    if (isAdmin && !isCompanyWide && selectedDepartmentIds.length === 0) {
      setDepartmentError('Vui lòng chọn ít nhất một phòng ban hoặc chọn "Áp dụng cho toàn công ty"');
      return;
    }
    
    if (isAdmin && selectedDepartmentIds.length > 0 && onSelectDepartments && !isCompanyWide) {
      onSelectDepartments(selectedDepartmentIds);
    }
    
    const planData = {
      title,
      description,
      startDate,
      endDate,
      criteria,
      status: plan.status || 'ACTIVE',
      isCompanyWide,
      departmentIds: !isCompanyWide ? selectedDepartmentIds : undefined
    };

    // Log thông tin kế hoạch
    if (selectedDepartmentIds.length > 0 && !isCompanyWide) {
      console.log(`Đang cập nhật kế hoạch cho ${selectedDepartmentIds.length} phòng ban: ${selectedDepartmentIds.join(', ')}`);
    } else if (isCompanyWide) {
      console.log('Đang cập nhật kế hoạch cho toàn công ty');
    }
    
    onSubmit(plan.id, planData);
  };

  // Xử lý khi chọn/bỏ chọn phòng ban
  const handleDepartmentChange = (deptId: number, checked: boolean) => {
    try {
      setDepartmentError(null);
      
      if (checked) {
        // Thêm phòng ban vào danh sách đã chọn
        setSelectedDepartmentIds(prev => [...prev, deptId]);
      } else {
        // Xóa phòng ban khỏi danh sách đã chọn
        setSelectedDepartmentIds(prev => prev.filter(id => id !== deptId));
      }

      // Gọi callback để thông báo thay đổi
      if (onSelectDepartments) {
        const newSelectedIds = checked 
          ? [...selectedDepartmentIds, deptId]
          : selectedDepartmentIds.filter(id => id !== deptId);
        onSelectDepartments(newSelectedIds);
      }
    } catch (error) {
      console.error('Lỗi khi chọn phòng ban:', error);
    }
  };

  // Xử lý chọn tất cả phòng ban
  const handleSelectAllDepartments = (checked: boolean) => {
    if (checked) {
      const allIds = departments.map(dept => dept.id);
      setSelectedDepartmentIds(allIds);
      if (onSelectDepartments) {
        onSelectDepartments(allIds);
      }
    } else {
      setSelectedDepartmentIds([]);
      if (onSelectDepartments) {
        onSelectDepartments([]);
      }
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

  // Xử lý khi toggle chế độ toàn công ty
  const handleCompanyWideToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCompanyWide(e.target.checked);
    if (e.target.checked) {
      setSelectedDepartmentIds([]);
      setDepartmentError(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa kế hoạch đánh giá hiệu suất">
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
          <>
            <div className="flex items-center mb-4">
              <input
                id="company-wide"
                type="checkbox"
                checked={isCompanyWide}
                onChange={handleCompanyWideToggle}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="company-wide" className="ml-2 block text-sm text-gray-900">
                Áp dụng cho toàn công ty
              </label>
            </div>

            {!isCompanyWide && (
              <div className="border rounded-md p-4 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phòng ban</label>
                <div className="flex items-center mb-2">
                  <input
                    id="select-all"
                    type="checkbox"
                    checked={selectedDepartmentIds.length === departments.length}
                    onChange={(e) => handleSelectAllDepartments(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="select-all" className="ml-2 block text-sm text-gray-900">
                    Chọn tất cả
                  </label>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center mb-2">
                      <input
                        id={`dept-${dept.id}`}
                        type="checkbox"
                        checked={selectedDepartmentIds.includes(dept.id)}
                        onChange={(e) => handleDepartmentChange(dept.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`dept-${dept.id}`} className="ml-2 block text-sm text-gray-900">
                        {dept.name}
                      </label>
                    </div>
                  ))}
                </div>
                {departmentError && <p className="text-red-500 text-sm mt-1">{departmentError}</p>}
              </div>
            )}
          </>
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
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700">Mô tả tiêu chí</label>
                <input
                  type="text"
                  value={criterion.description}
                  onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                  className="mt-1 block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {criteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCriteria(index)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Xóa tiêu chí
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPlanModal; 