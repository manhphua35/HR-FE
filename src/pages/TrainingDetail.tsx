import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TrainingService, TrainingCourse, TrainingParticipant, TrainingResult, TrainingStatus, ParticipantStatus, CompetencyAssessment } from '../services/TrainingService';

const TrainingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [course, setCourse] = useState<TrainingCourse | null>(null);
  const [participants, setParticipants] = useState<TrainingParticipant[]>([]);
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  
  // Kiểm tra quyền hạn
  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN';
  const isHR = currentUser?.role?.roleType === 'HR_STAFF';
  const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';
  const canManage = isAdmin || isHR || (isDepartmentHead && course?.departmentId === currentUser?.departmentId);
  const canViewAllCourses = isAdmin || isHR;

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);
  
  const fetchCourseDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseDetails = await TrainingService.getTrainingCourseDetail(parseInt(id));
      
      // Kiểm tra quyền xem chi tiết khóa học
      const userDepartmentId = currentUser?.departmentId;
      const isCourseDepartmentMatch = courseDetails.departmentId === userDepartmentId || courseDetails.departmentId === null;
      
      // Nếu không phải admin/HR và khóa học không thuộc phòng ban của người dùng
      if (!canViewAllCourses && !isCourseDepartmentMatch) {
        setError('Bạn không có quyền xem khóa đào tạo này.');
        setLoading(false);
        return;
      }
      
      setCourse(courseDetails);
      
      // Giả định rằng getTrainingCourseDetail trả về cả participants và results
      // Nếu không, bạn cần các API call riêng để lấy các dữ liệu này
      if (courseDetails.participants) {
        setParticipants(courseDetails.participants);
      }
      
      if (courseDetails.results) {
        setResults(courseDetails.results);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Không thể tải chi tiết khóa đào tạo. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleRegisterUser = async (userId: number) => {
    try {
      await TrainingService.registerParticipant(parseInt(id!), userId);
      setShowRegisterModal(false);
      fetchCourseDetails(); // Refresh data
    } catch (err) {
      setError('Không thể đăng ký người dùng. Vui lòng thử lại sau.');
    }
  };

  const handleRecordResult = async (resultData: Partial<TrainingResult>) => {
    try {
      await TrainingService.recordTrainingResult({
        ...resultData,
        courseId: parseInt(id!),
        userId: selectedParticipant!
      });
      setShowResultModal(false);
      fetchCourseDetails(); // Refresh data
    } catch (err) {
      setError('Không thể lưu kết quả. Vui lòng thử lại sau.');
    }
  };
  
  const handleSendNotification = async () => {
    try {
      await TrainingService.sendTrainingNotification(parseInt(id!));
      alert('Đã gửi thông báo cho tất cả học viên.');
    } catch (err) {
      setError('Không thể gửi thông báo. Vui lòng thử lại sau.');
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
  
  const getParticipantStatusText = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.REGISTERED:
        return 'Đã đăng ký';
      case ParticipantStatus.CONFIRMED:
        return 'Đã xác nhận';
      case ParticipantStatus.ATTENDED:
        return 'Đã tham gia';
      case ParticipantStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return status;
    }
  };
  
  const getParticipantStatusClass = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.REGISTERED:
        return 'bg-blue-100 text-blue-800';
      case ParticipantStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ParticipantStatus.ATTENDED:
        return 'bg-purple-100 text-purple-800';
      case ParticipantStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate('/training')}
          className="mt-4 flex items-center text-gray-600 hover:text-blue-600"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!course) {
    return <div className="p-6">Không tìm thấy khóa đào tạo</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          onClick={() => navigate('/training')}
          className="flex items-center text-gray-600 hover:text-blue-600"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Quay lại danh sách
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <div className="flex items-center mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(course.status)}`}
              >
                {getStatusText(course.status)}
              </span>
            </div>
          </div>
          {canManage && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Thêm học viên
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Gửi thông báo
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 mb-6">
          <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-medium">
                  {new Date(course.startDate).toLocaleDateString('vi-VN')} - {new Date(course.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <div>
                <p className="text-sm text-gray-500">Địa điểm</p>
                <p className="font-medium">{course.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <div>
                <p className="text-sm text-gray-500">Giảng viên</p>
                <p className="font-medium">{course.instructor}</p>
              </div>
            </div>
          </div>

          {course.departmentId && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Phòng ban</p>
                  <p className="font-medium">{course.department ? course.department.name : `ID: ${course.departmentId}`}</p>
                </div>
              </div>
            </div>
          )}
          
          {!course.departmentId && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Phạm vi</p>
                  <p className="font-medium">Toàn công ty</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danh sách học viên */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách học viên ({participants.length})</h2>
        
        {participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Chưa có học viên nào tham gia khóa học này</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                  {canManage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {participant.user ? `${participant.user.firstName} ${participant.user.lastName}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {participant.user?.departmentName || `ID: ${participant.user?.departmentId || 'N/A'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getParticipantStatusClass(participant.status)}`}>
                        {getParticipantStatusText(participant.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(participant.registrationDate).toLocaleDateString('vi-VN')}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            setSelectedParticipant(participant.userId);
                            setShowResultModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ghi kết quả
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Kết quả đào tạo */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Kết quả đào tạo</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm số</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhận xét</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày hoàn thành</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chứng chỉ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.score}/10</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{result.feedback}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.completionDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.certificate ? (
                        <a href={result.certificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          Xem chứng chỉ
                        </a>
                      ) : (
                        'Không có'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal đăng ký học viên - đây chỉ là phần khung, bạn cần phát triển thêm */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Đăng ký học viên mới</h2>
            
            {/* Form đăng ký học viên */}
            {/* Thêm form với trường nhập ID hoặc dropdown chọn nhân viên */}
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowRegisterModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Implement handleRegisterUser with actual userId
                  setShowRegisterModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ghi kết quả - đây chỉ là phần khung, bạn cần phát triển thêm */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Ghi kết quả học viên</h2>
            
            {/* Form nhập kết quả */}
            {/* Thêm form với các trường nhập điểm, nhận xét, ngày hoàn thành, v.v. */}
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Implement handleRecordResult with form data
                  setShowResultModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDetail; 