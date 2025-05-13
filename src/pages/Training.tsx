import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrainingService, TrainingCourse, TrainingStatus } from '../services/TrainingService';
import TrainingCourseModal from '../components/modals/TrainingCourseModal';
import ConfirmDeleteCourseModal from '../components/modals/ConfirmDeleteCourseModal';
import ExportTrainingReportModal from '../components/modals/ExportTrainingReportModal';
import ExportSuccessModal from '../components/modals/ExportSuccessModal';
import { ExportFormat, TrainingReportService } from '../services/TrainingReportService';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

interface TrainingProps {}

const Training: React.FC<TrainingProps> = () => {
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<TrainingCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | ''>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<{id: number, name: string} | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra quyền hạn
  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN';
  const isHR = currentUser?.role?.roleType === 'HR_STAFF';
  const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_MANAGER';
  const canManageCourses = isAdmin || isHR || isDepartmentHead;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, statusFilter, searchTerm, selectedYear, selectedMonth]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let fetchedCourses = await TrainingService.getTrainingCourses();
      
      // Nếu là trưởng phòng, chỉ hiển thị khóa học của phòng họ
      if (isDepartmentHead && currentUser?.departmentId) {
        fetchedCourses = fetchedCourses.filter(
          course => !course.departmentId || course.departmentId === currentUser.departmentId
        );
      }
      
      setCourses(fetchedCourses || []); // Đảm bảo luôn set mảng rỗng nếu không có dữ liệu
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin khóa đào tạo. Vui lòng thử lại sau.');
      setLoading(false);
      setCourses([]); // Set mảng rỗng khi có lỗi
    }
  };

  const filterCourses = () => {
    // Đảm bảo courses là mảng trước khi lọc
    if (!Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }

    let result = [...courses];
    
    // Lọc theo trạng thái
    if (statusFilter) {
      result = result.filter(course => course.status === statusFilter);
    }
    
    // Lọc theo năm
    if (selectedYear) {
      result = result.filter(course => new Date(course.startDate).getFullYear().toString() === selectedYear);
    }

    // Lọc theo tháng (chỉ khi đã chọn năm)
    if (selectedYear && selectedMonth) {
      result = result.filter(course => (new Date(course.startDate).getMonth() + 1).toString() === selectedMonth);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(course => 
        course.name.toLowerCase().includes(searchTermLower) || 
        course.description.toLowerCase().includes(searchTermLower) ||
        course.instructor.toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredCourses(result);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCreateModal(true);
  };

  const handleEditCourse = (course: TrainingCourse) => {
    setEditingCourse(course);
    setShowCreateModal(true);
  };

  const handleCourseDetail = (courseId: number) => {
    navigate(`/training/${courseId}`);
  };

  const handleSaveCourse = async (courseData: Partial<TrainingCourse>) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      let dataToSend = { ...courseData };
      const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_MANAGER';

      if (isDepartmentHead) {
        if (!currentUser?.departmentId) {
          setError('Là Trưởng phòng, nhưng thông tin phòng ban của bạn không được xác định. Không thể tạo khóa học.');
          setLoading(false);
          return;
        }
        // For Department Heads, when creating a new course, departmentId must be their own.
        if (!editingCourse) { 
          dataToSend.departmentId = currentUser.departmentId;
        }
        // Note: Logic for *editing* courses by Department Heads might need more rules,
        // e.g., preventing them from changing a course to another department.
        // However, the current error is on *creation*.
      }
      
      if (editingCourse) {
        await TrainingService.updateTrainingCourse(editingCourse.id, dataToSend);
      } else {
        await TrainingService.createTrainingCourse(dataToSend);
      }
      
      setShowCreateModal(false);
      fetchCourses(); // Refresh the list of courses
    } catch (err: any) {
      let message = 'Không thể lưu khóa đào tạo. Vui lòng thử lại sau.';
      // Check if the error object has response and data from axios
      if (err.response && err.response.data && err.response.data.message) {
        message = `Lỗi: ${err.response.data.message}`;
      } else if (err.message) {
        message = `Lỗi: ${err.message}`;
      }
      setError(message);
      setLoading(false);
      // Do not close the modal on error, so the user can see the error and correct data if needed
    }
  };

  const handleDeleteCourse = (courseId: number, courseName: string) => {
    setCourseToDelete({ id: courseId, name: courseName });
    setShowDeleteConfirmModal(true);
  };

  const executeDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setLoading(true);
      setError(null);
      await TrainingService.deleteTrainingCourse(courseToDelete.id);
      setShowDeleteConfirmModal(false);
      setCourseToDelete(null);
      fetchCourses(); // Refresh the list - this will re-fetch data and update the UI
    } catch (err: any) {
      let message = 'Không thể xóa khóa đào tạo. Vui lòng thử lại sau.';
      if (err.response && err.response.data && err.response.data.message) {
        message = `Lỗi xóa: ${err.response.data.message}`;
      }
      setError(message);
      // Keep the modal open if there's an error for the user to see the message or retry
      // setShowDeleteConfirmModal(false); 
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.PLANNED:
        return 'bg-blue-100 text-blue-800';
      case TrainingStatus.ONGOING:
        return 'bg-green-100 text-green-800';
      case TrainingStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800';
      case TrainingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TrainingStatus) => {
    switch (status) {
      case TrainingStatus.PLANNED:
        return 'Sắp diễn ra';
      case TrainingStatus.ONGOING:
        return 'Đang diễn ra';
      case TrainingStatus.COMPLETED:
        return 'Đã hoàn thành';
      case TrainingStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleExportReport = async (
    exportFormat: ExportFormat,
    startDate: string,
    endDate: string,
    departmentId?: number
  ) => {
    try {
      setExportLoading(true);
      // Lấy danh sách khóa học theo filter
      let reportCourses = [...courses];
      
      // Lọc theo thời gian
      reportCourses = reportCourses.filter(course => 
        new Date(course.startDate) >= new Date(startDate) && 
        new Date(course.endDate) <= new Date(endDate)
      );
      
      // Lọc theo phòng ban nếu có
      if (departmentId) {
        reportCourses = reportCourses.filter(course => course.departmentId === departmentId);
      }

      // Chuẩn bị dữ liệu báo cáo
      const departmentName = departmentId && reportCourses.length > 0 && reportCourses[0].department 
        ? reportCourses[0].department.name 
        : undefined;
      
      const reportData = {
        title: 'BÁO CÁO KHÓA ĐÀO TẠO',
        courses: reportCourses,
        startDate,
        endDate,
        departmentId,
        departmentName,
        generateBy: {
          id: currentUser?.id || 0,
          name: currentUser?.fullName || 'Người dùng',
          role: currentUser?.role?.roleType || 'Không xác định'
        }
      };

      // Xuất báo cáo PDF
      const blob = await TrainingReportService.exportTrainingReportAsPDF(reportData);
      const dateStr = format(new Date(), 'dd-MM-yyyy');
      const fileName = `bao-cao-dao-tao-${dateStr}.pdf`;
      
      // Lưu file
      saveAs(blob, fileName);
      
      // Hiển thị thông báo thành công
      setSuccessMessage('Xuất báo cáo PDF thành công!');
      setShowSuccessModal(true);

      // Đóng modal xuất báo cáo
      setShowExportModal(false);
    } catch (error: any) {
      setError(`Xuất báo cáo thất bại: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading && courses.length === 0) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đào tạo</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Xuất báo cáo
          </button>
          {canManageCourses && (
            <button
              onClick={handleCreateCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tạo khóa đào tạo mới
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px]">
          <input
            type="text"
            placeholder="Tìm kiếm khóa đào tạo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TrainingStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={TrainingStatus.PLANNED}>Sắp diễn ra</option>
            <option value={TrainingStatus.ONGOING}>Đang diễn ra</option>
            <option value={TrainingStatus.COMPLETED}>Đã hoàn thành</option>
            <option value={TrainingStatus.CANCELLED}>Đã hủy</option>
          </select>
        </div>
        <div>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (!e.target.value) setSelectedMonth(''); // Reset tháng nếu bỏ chọn năm
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px]"
          >
            <option value="">Tất cả năm</option>
            {/* Tạo danh sách năm động, ví dụ từ 2020 đến năm hiện tại + 1 */}
            {[...Array(new Date().getFullYear() - 2019)].map((_, i) => 2020 + i).reverse().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={!selectedYear} // Chỉ cho phép chọn tháng khi đã chọn năm
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px] disabled:bg-gray-100"
          >
            <option value="">Tất cả tháng</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-gray-500">Không tìm thấy khóa đào tạo nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(course.status)}`}
                  >
                    {getStatusText(course.status)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="text-sm text-gray-500 space-y-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {new Date(course.startDate).toLocaleDateString('vi-VN')} - {new Date(course.endDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {course.location}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {course.instructor}
                  </div>
                  {course.department && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      {course.department.name}
                    </div>
                  )}
                  {!course.departmentId && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Toàn công ty
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  {canManageCourses && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-xs"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TrainingCourseModal
          course={editingCourse}
          onSave={handleSaveCourse}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Confirm Delete Modal */}
      {courseToDelete && (
        <ConfirmDeleteCourseModal
          isOpen={showDeleteConfirmModal}
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setCourseToDelete(null);
          }}
          onConfirm={executeDeleteCourse}
          courseName={courseToDelete.name}
        />
      )}

      {/* Export Report Modal */}
      <ExportTrainingReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportReport}
      />

      {/* Success Modal */}
      <ExportSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Training; 