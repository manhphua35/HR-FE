import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { EmployeeService, Employee } from '../../services/EmployeeService';
import { DepartmentService, Department } from '../../services/DepartmentService';

interface CreateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  isCompanyWide?: boolean; // Thêm prop để xác định kế hoạch là cho toàn công ty hay không
  criteria: {
    id: number;
    name: string;
    weight: number;
    description: string;
  }[];
  employeeId?: number | null; // Thêm prop employeeId để chọn sẵn nhân viên
  onSubmit: (data: {
    employeeId: number;
    reviewDate: string;
    scores: {
      criteriaId: number;
      score: number;
      comment: string;
    }[];    comments?: string;
    strengths?: string;
    weaknesses?: string;
    improvement?: string;
    totalScore?: number;
  }) => void;
}

const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
  isOpen,
  onClose,
  planId,
  isCompanyWide = false,
  criteria,
  employeeId = null,
  onSubmit
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [reviewDate, setReviewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<{ criteriaId: number; score: number; comment: string }[]>([]);
  const [comments, setComments] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [weaknesses, setWeaknesses] = useState<string>('');  const [improvement, setImprovement] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng ban nếu kế hoạch là cho toàn công ty và không có employeeId được chỉ định
  useEffect(() => {
    if (isOpen && isCompanyWide && !employeeId) {
      fetchDepartments();
    }
  }, [isOpen, isCompanyWide, employeeId]);
  // Reset form khi mở modal và thiết lập nhân viên nếu có employeeId
  useEffect(() => {
    if (isOpen) {
      setSelectedDepartmentId(null);
      setSelectedEmployeeId(employeeId);
      setReviewDate(new Date().toISOString().split('T')[0]);
      setComments('');
      setStrengths('');
      setWeaknesses('');      setImprovement('');
      setError(null);

      // Nếu không có employeeId được chỉ định
      if (!employeeId) {
        // Nếu không phải kế hoạch toàn công ty, tự động lấy danh sách nhân viên
        if (!isCompanyWide) {
          fetchEmployees();
        }
      } else {
        // Nếu có employeeId, lấy thông tin nhân viên để hiển thị
        fetchEmployeeById(employeeId);
      }
    }
  }, [isOpen, isCompanyWide, employeeId]);

  // Khởi tạo scores khi criteria thay đổi
  useEffect(() => {
    if (criteria.length > 0) {
      setScores(criteria.map(criterion => ({
        criteriaId: criterion.id,
        score: 0,
        comment: ''
      })));
    }
  }, [criteria]);

  // Lấy danh sách nhân viên khi phòng ban thay đổi
  useEffect(() => {
    if (selectedDepartmentId) {
      fetchEmployeesByDepartment(selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phòng ban:', err);
      setError('Không thể tải danh sách phòng ban');
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await EmployeeService.getAllEmployees();
      const activeEmployees = data.filter(emp => emp.isActive);
      setEmployees(activeEmployees);
      setIsLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách nhân viên:', err);
      setError('Không thể tải danh sách nhân viên');
      setIsLoading(false);
    }
  };

  const fetchEmployeesByDepartment = async (departmentId: number) => {
    try {
      setIsLoading(true);
      setEmployees([]);
      setSelectedEmployeeId(null);
      const data = await EmployeeService.getDepartmentEmployees(departmentId);
      const activeEmployees = data.filter(emp => emp.isActive);
      setEmployees(activeEmployees);
      setIsLoading(false);
    } catch (err) {
      console.error(`Lỗi khi lấy danh sách nhân viên phòng ban ${departmentId}:`, err);
      setError('Không thể tải danh sách nhân viên theo phòng ban');
      setIsLoading(false);
    }
  };

  const fetchEmployeeById = async (id: number) => {
    try {
      setIsLoading(true);
      const employee = await EmployeeService.getEmployeeById(id);
      if (employee) {
        setEmployees([employee]);
        setSelectedEmployeeId(employee.id);
        
        // Nếu nhân viên thuộc một phòng ban và kế hoạch là toàn công ty
        if (employee.departmentId && isCompanyWide) {
          setSelectedDepartmentId(employee.departmentId);
          // Lấy danh sách phòng ban để hiển thị
          await fetchDepartments();
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error(`Lỗi khi lấy thông tin nhân viên ${id}:`, err);
      setError('Không thể tải thông tin nhân viên');
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = parseInt(e.target.value, 10);
    if (!isNaN(departmentId)) {
      setSelectedDepartmentId(departmentId);
    } else {
      setSelectedDepartmentId(null);
      setEmployees([]);
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = parseInt(e.target.value, 10);
    if (!isNaN(employeeId)) {
      setSelectedEmployeeId(employeeId);
    } else {
      setSelectedEmployeeId(null);
    }
  };

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
      setError('Vui lòng chọn nhân viên');
      return;
    }

    // Tính tổng điểm có trọng số
    const totalScore = scores.reduce((sum, score) => {
      const criterion = criteria.find(c => c.id === score.criteriaId);
      if (!criterion) return sum;
      return sum + (score.score * criterion.weight / 100);
    }, 0);    onSubmit({
      employeeId: selectedEmployeeId,
      reviewDate,
      scores,
      comments,
      strengths,
      weaknesses,
      improvement,
      totalScore
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo đánh giá hiệu suất">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phần chọn phòng ban (chỉ hiển thị nếu là kế hoạch toàn công ty và không có employeeId được chỉ định) */}
        {isCompanyWide && !employeeId && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn phòng ban</label>
            <select
              value={selectedDepartmentId || ''}
              onChange={handleDepartmentChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Phần chọn nhân viên (chỉ hiển thị nếu không có employeeId được chỉ định) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {employeeId ? 'Nhân viên được đánh giá' : 'Chọn nhân viên'}
          </label>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              <span>Đang tải...</span>
            </div>
          ) : (
            employeeId && employees.length === 1 ? (
              <div className="p-2 border rounded bg-gray-50">
                <span className="font-medium">{employees[0]?.fullName}</span>
                {employees[0]?.department && (
                  <span className="text-gray-600 ml-2">({employees[0].department.name})</span>
                )}
              </div>
            ) : (
              <select
                value={selectedEmployeeId || ''}
                onChange={handleEmployeeChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isCompanyWide && !selectedDepartmentId}
              >
                <option value="">-- Chọn nhân viên --</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName} {employee.department ? `(${employee.department.name})` : ''}
                  </option>
                ))}
              </select>
            )
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
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
        </div>        <div>
          <label className="block text-sm font-medium text-gray-700">Phương hướng cải thiện</label>
          <textarea
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />        </div>

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
            disabled={isLoading}
          >
            {isLoading ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...</>
            ) : (
              'Tạo đánh giá'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReviewModal;