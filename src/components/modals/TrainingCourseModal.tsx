import React, { useState, useEffect } from 'react';
import { TrainingCourse, TrainingStatus, TrainingService, Department } from '../../services/TrainingService';
import { useAuth } from '../../contexts/AuthContext';

interface TrainingCourseModalProps {
  course: TrainingCourse | null;
  onSave: (courseData: Partial<TrainingCourse>) => void;
  onClose: () => void;
}

const TrainingCourseModal: React.FC<TrainingCourseModalProps> = ({ course, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [instructor, setInstructor] = useState('');
  const [status, setStatus] = useState<TrainingStatus>(TrainingStatus.PLANNED);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { currentUser } = useAuth();
  const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_MANAGER';

  useEffect(() => {
    fetchDepartments();
    
    if (course) {
      setTitle(course.name);
      setDescription(course.description);
      setStartDate(formatDateForInput(course.startDate));
      setEndDate(formatDateForInput(course.endDate));
      setLocation(course.location);
      setInstructor(course.instructor || '');
      setStatus(course.status);
      setDepartmentId(course.departmentId);
    } else {
      // Nếu là trưởng phòng, tự động chọn phòng ban của họ
      if (isDepartmentHead && currentUser?.departmentId) {
        setDepartmentId(currentUser.departmentId);
      }
    }
  }, [course, currentUser]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const departmentsList = await TrainingService.getDepartments();
      setDepartments(departmentsList);
    } catch (error) {
      console.error('Không thể lấy danh sách phòng ban:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả';
    if (!startDate) newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!endDate) newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    if (!location.trim()) newErrors.location = 'Vui lòng nhập địa điểm';
    if (!instructor.trim()) newErrors.instructor = 'Vui lòng nhập tên giảng viên';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const courseData: Partial<TrainingCourse> = {
      name: title,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      location,
      instructor,
      status,
      departmentId
    };
    
    onSave(courseData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {course ? 'Chỉnh sửa khóa đào tạo' : 'Tạo khóa đào tạo mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Tiêu đề */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>
            
            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
            
            {/* Ngày bắt đầu và kết thúc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
              </div>
            </div>
            
            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
            </div>
            
            {/* Giảng viên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giảng viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${errors.instructor ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.instructor && <p className="mt-1 text-sm text-red-500">{errors.instructor}</p>}
            </div>
            
            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TrainingStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={TrainingStatus.PLANNED}>Sắp diễn ra</option>
                <option value={TrainingStatus.ONGOING}>Đang diễn ra</option>
                <option value={TrainingStatus.COMPLETED}>Đã hoàn thành</option>
                <option value={TrainingStatus.CANCELLED}>Đã hủy</option>
              </select>
            </div>
            
            {/* Phòng ban (dropdown) */}
            {!isDepartmentHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Áp dụng cho phòng ban
                </label>
                <select
                  value={departmentId === null ? "" : departmentId}
                  onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loadingDepartments}
                >
                  <option value="">Toàn công ty</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {loadingDepartments && (
                  <p className="mt-1 text-sm text-gray-500">Đang tải danh sách phòng ban...</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {course ? 'Lưu thay đổi' : 'Tạo khóa học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingCourseModal; 