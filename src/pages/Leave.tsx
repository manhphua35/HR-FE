import React, { useState, useEffect } from 'react';
import { LeaveService, LeaveRequest } from '../services/LeaveService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import CreateLeaveModal from '../components/modals/CreateLeaveModal';
import axiosInstance from '../config/axios';

// Tương tự Attendance, tạo enum để quản lý chế độ xem
enum ViewMode {
  DEFAULT = 'default',
  SPECIFIC_DATE = 'specificDate',
  HISTORY_MONTH = 'historyMonth'
}

// Tạo mảng các tháng để hiển thị dropdown
const months = [
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' }
];

// Tạo mảng các năm gần đây cho dropdown
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

// Interface cho cache user data
interface UserInfo {
  id: number;
  fullName: string;
}

const Leave: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN' || currentUser?.role?.roleType === 'HR_STAFF';
  const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usersCache, setUsersCache] = useState<Record<number, UserInfo>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [type, setType] = useState<'ALL' | 'ANNUAL' | 'SICK' | 'OTHER'>('ALL');

  // State cho chế độ xem
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DEFAULT);
  
  // State cho việc xem theo ngày cụ thể
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  
  // State cho việc xem lịch sử theo tháng
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // State cho phê duyệt/từ chối đơn
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, startDate, endDate, status, type, viewMode, selectedDate, selectedMonth, selectedYear]);

  // Hàm lấy thông tin người dùng dựa vào userId
  const fetchUserInfo = async (userIds: number[]) => {
    if (userIds.length === 0) return;

    // Lọc ra những userId chưa có trong cache
    const uniqueIds = Array.from(new Set(userIds)).filter(id => !usersCache[id]);
    if (uniqueIds.length === 0) return;

    setLoadingUsers(true);
    try {
      // Lấy thông tin các người dùng chưa có trong cache
      const response = await axiosInstance.get('/users/info', {
        params: { userIds: uniqueIds.join(',') }
      });

      const newUserData = { ...usersCache };
      response.data.data.forEach((user: any) => {
        newUserData[user.id] = {
          id: user.id,
          fullName: user.fullName || `User ${user.id}`
        };
      });

      setUsersCache(newUserData);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let data: LeaveRequest[];

      switch (viewMode) {
        case ViewMode.SPECIFIC_DATE:
          // Lấy dữ liệu nghỉ phép cho ngày cụ thể
          data = await LeaveService.getLeavesBySpecificDate(selectedDate);
          break;
          
        case ViewMode.HISTORY_MONTH:
          // Lấy dữ liệu nghỉ phép cho tháng cụ thể
          data = await LeaveService.getLeavesByMonth(selectedYear, selectedMonth);
          break;
          
        default:
          // Chế độ mặc định - lấy theo filter
          if (isAdmin) {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (status !== 'ALL') params.status = status;
            if (type !== 'ALL') params.type = type;
            
            data = await LeaveService.getAllLeaves(params);
          } else {
            data = await LeaveService.getMyLeaves();
          }
          break;
      }

      // Sort by createdAt in descending order
      const sortedData = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeaves(sortedData);

      // Chuẩn bị danh sách userIds để lấy thông tin
      const userIds = sortedData.map(leave => leave.userId);
      const approverIds = sortedData
        .filter(leave => leave.approverId)
        .map(leave => leave.approverId!)
        .filter(id => id !== null);
      
      // Lấy thông tin người dùng
      await fetchUserInfo([...userIds, ...approverIds]);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setError('Không thể tải dữ liệu nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal xác nhận duyệt đơn
  const openApproveModal = (leave: LeaveRequest) => {
    setSelectedLeaveId(leave.id);
    setSelectedLeave(leave);
    setShowApproveModal(true);
  };

  // Mở modal từ chối đơn
  const openRejectModal = (leave: LeaveRequest) => {
    setSelectedLeaveId(leave.id);
    setSelectedLeave(leave);
    setShowRejectModal(true);
  };

  // Mở modal xác nhận xóa đơn
  const openDeleteModal = (leave: LeaveRequest) => {
    setSelectedLeaveId(leave.id);
    setSelectedLeave(leave);
    setShowDeleteModal(true);
  };

  // Xử lý duyệt đơn
  const handleApproveLeave = async () => {
    if (!selectedLeaveId) return;
    
    try {
      setProcessingAction(true);
      await LeaveService.approveLeave(selectedLeaveId);
      await fetchLeaves();
      setShowApproveModal(false);
      setSelectedLeaveId(null);
      setSelectedLeave(null);
    } catch (err) {
      console.error('Failed to approve leave:', err);
      setError('Không thể duyệt đơn nghỉ phép');
    } finally {
      setProcessingAction(false);
    }
  };

  // Xử lý từ chối đơn
  const handleRejectLeave = async () => {
    if (!selectedLeaveId || !rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessingAction(true);
      await LeaveService.rejectLeave(selectedLeaveId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLeaveId(null);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      console.error('Failed to reject leave:', err);
      setError('Không thể từ chối đơn nghỉ phép');
    } finally {
      setProcessingAction(false);
    }
  };

  // Xử lý xóa đơn
  const handleDeleteLeave = async () => {
    if (!selectedLeaveId) return;

    try {
      setProcessingAction(true);
      await LeaveService.deleteLeave(selectedLeaveId);
      setShowDeleteModal(false);
      setSelectedLeaveId(null);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      console.error('Failed to delete leave:', err);
      setError('Không thể xóa đơn nghỉ phép');
    } finally {
      setProcessingAction(false);
    }
  };

  // Hàm lấy tên người dùng từ cache hoặc hiển thị "User ID"
  const getUserName = (userId: number) => {
    if (usersCache[userId]) {
      return usersCache[userId].fullName;
    }
    return `User ${userId}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL': return 'Nghỉ phép năm';
      case 'SICK': return 'Nghỉ ốm';
      case 'OTHER': return 'Khác';
      default: return type;
    }
  };

  // Hàm xử lý thay đổi chế độ xem
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Render các điều khiển chế độ xem
  const renderViewModeControls = () => {
    return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Chọn chế độ xem</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleViewModeChange(ViewMode.DEFAULT)}
            className={`px-4 py-2 rounded-lg ${
              viewMode === ViewMode.DEFAULT 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Tất cả dữ liệu
          </button>
          
          <button
            onClick={() => handleViewModeChange(ViewMode.SPECIFIC_DATE)}
            className={`px-4 py-2 rounded-lg ${
              viewMode === ViewMode.SPECIFIC_DATE 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Xem theo ngày
          </button>
          
          <button
            onClick={() => handleViewModeChange(ViewMode.HISTORY_MONTH)}
            className={`px-4 py-2 rounded-lg ${
              viewMode === ViewMode.HISTORY_MONTH 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Xem theo tháng
          </button>
        </div>
        
        {/* Hiển thị tùy chọn dựa trên chế độ xem */}
        {viewMode === ViewMode.SPECIFIC_DATE && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        {viewMode === ViewMode.HISTORY_MONTH && (
          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tháng
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn năm
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Hiển thị tiêu đề dựa trên chế độ xem đang chọn
  const renderViewTitle = () => {
    switch (viewMode) {
      case ViewMode.SPECIFIC_DATE:
        // Định dạng lại ngày từ YYYY-MM-DD thành DD/MM/YYYY để hiển thị
        const dateParts = selectedDate.split('-');
        if (dateParts.length === 3) {
          return `Dữ liệu nghỉ phép ngày ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
        return `Dữ liệu nghỉ phép ngày ${selectedDate}`;
      case ViewMode.HISTORY_MONTH:
        return `Dữ liệu nghỉ phép Tháng ${selectedMonth}/${selectedYear}`;
      default:
        return 'Quản lý nghỉ phép';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{renderViewTitle()}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Tạo đơn nghỉ phép
        </button>
      </div>

      {/* Thêm điều khiển chế độ xem */}
      {renderViewModeControls()}

      <CreateLeaveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          try {
            await LeaveService.createLeave(data);
            await fetchLeaves();
            setShowCreateModal(false);
          } catch (err) {
            console.error('Failed to create leave:', err);
            throw err;
          }
        }}
      />

      {/* Modal phê duyệt đơn nghỉ phép */}
      {showApproveModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold mb-4">Xác nhận phê duyệt</h2>
            <div className="mb-6">
              <p className="text-gray-700">Bạn có chắc muốn phê duyệt đơn nghỉ phép của <strong>{getUserName(selectedLeave.userId)}</strong> không?</p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">Thời gian: </span>
                {format(new Date(selectedLeave.startDate), 'dd/MM/yyyy')} - {format(new Date(selectedLeave.endDate), 'dd/MM/yyyy')}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                <span className="font-medium">Số ngày: </span>{selectedLeave.numberOfDays}
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedLeaveId(null);
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={processingAction}
              >
                Hủy
              </button>
              <button
                onClick={handleApproveLeave}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                disabled={processingAction}
              >
                {processingAction ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : 'Phê duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối đơn nghỉ phép */}
      {showRejectModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold mb-4">Từ chối đơn nghỉ phép</h2>
            <div className="mb-2">
              <p className="text-gray-700 mb-2">Đơn nghỉ phép của <strong>{getUserName(selectedLeave.userId)}</strong></p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Thời gian: </span>
                {format(new Date(selectedLeave.startDate), 'dd/MM/yyyy')} - {format(new Date(selectedLeave.endDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none h-32 focus:ring-red-500 focus:border-red-500"
                placeholder="Nhập lý do từ chối..."
                required
              />
              {rejectReason.trim() === '' && (
                <p className="text-red-500 text-xs mt-1">Vui lòng nhập lý do từ chối</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedLeaveId(null);
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={processingAction}
              >
                Hủy
              </button>
              <button
                onClick={handleRejectLeave}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={!rejectReason.trim() || processingAction}
              >
                {processingAction ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xóa đơn nghỉ phép */}
      {showDeleteModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold mb-4">Xác nhận xóa</h2>
            <div className="mb-6">
              <p className="text-gray-700">Bạn có chắc muốn xóa đơn nghỉ phép của <strong>{getUserName(selectedLeave.userId)}</strong> không?</p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">Thời gian: </span>
                {format(new Date(selectedLeave.startDate), 'dd/MM/yyyy')} - {format(new Date(selectedLeave.endDate), 'dd/MM/yyyy')}
              </p>
              <p className="text-red-600 text-sm mt-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedLeaveId(null);
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={processingAction}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteLeave}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={processingAction}
              >
                {processingAction ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {viewMode === ViewMode.DEFAULT && isAdmin && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-700">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Đang chờ</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nghỉ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="ANNUAL">Nghỉ phép năm</option>
                <option value="SICK">Nghỉ ốm</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4">Nhân viên</th>
                <th scope="col" className="px-6 py-4">Phòng ban</th>
                <th scope="col" className="px-6 py-4">Loại nghỉ</th>
                <th scope="col" className="px-6 py-4">Thời gian</th>
                <th scope="col" className="px-6 py-4">Số ngày</th>
                <th scope="col" className="px-6 py-4">Lý do</th>
                <th scope="col" className="px-6 py-4">Trạng thái</th>
                <th scope="col" className="px-6 py-4">Người duyệt</th>
                {(isAdmin || isDepartmentHead) && <th scope="col" className="px-6 py-4">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <tr key={leave.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leave.user?.fullName || 'Unknown')}&background=random`}
                            alt={leave.user?.fullName || 'Unknown'}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.user?.fullName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{leave.user?.department?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{getTypeLabel(leave.type)}</td>
                    <td className="px-6 py-4">
                      {format(new Date(leave.startDate), 'dd/MM/yyyy')} - {format(new Date(leave.endDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">{leave.numberOfDays}</td>
                    <td className="px-6 py-4">{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status === 'PENDING' && 'Đang chờ'}
                        {leave.status === 'APPROVED' && 'Đã duyệt'}
                        {leave.status === 'REJECTED' && 'Từ chối'}
                      </span>
                      {leave.status === 'REJECTED' && leave.rejectionReason && (
                        <div className="text-xs text-red-600 mt-1" title={leave.rejectionReason}>
                          Lý do: {leave.rejectionReason.length > 20 ? leave.rejectionReason.substring(0, 20) + '...' : leave.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {leave.approver ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leave.approver.fullName)}&background=random`}
                              alt={leave.approver.fullName}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.approver.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {leave.approver.email}
                            </div>
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    {(isAdmin || isDepartmentHead) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {leave.status === 'PENDING' && isAdmin && (
                            <>
                              <button
                                onClick={() => openApproveModal(leave)}
                                className="text-green-600 hover:text-green-900"
                                title="Duyệt"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => openRejectModal(leave)}
                                className="text-red-600 hover:text-red-900"
                                title="Từ chối"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openDeleteModal(leave)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                    Không có dữ liệu nghỉ phép nào được tìm thấy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;