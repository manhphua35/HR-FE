import React, { useState, useEffect, useCallback } from 'react';
import { LeaveService, LeaveRequest, LeaveStatus, LeaveType, HolidayBatch } from '../services/LeaveService';
import { DepartmentService } from '../services/DepartmentService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { CreateLeaveModal } from '../components/modals/LeaveModal';

// Tương tự Attendance, tạo enum để quản lý chế độ xem
enum ViewMode {
  DEFAULT = 'default',
  SPECIFIC_DATE = 'specificDate',
  HISTORY_MONTH = 'historyMonth'
}

// Enum để quản lý các tab
enum TabView {
  LEAVES = 'leaves',
  HOLIDAY_BATCHES = 'holidayBatches'
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

// Interface cho modal thông báo
interface NotificationModalData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Thêm helper function để chuyển đổi loại nghỉ thành nhãn tiếng Việt
const getTypeLabel = (type: LeaveType): string => {
  switch (type) {
    case 'ANNUAL':
      return 'Nghỉ phép năm';
    case 'SICK':
      return 'Nghỉ ốm';
    case 'HOLIDAY':
      return 'Nghỉ lễ';
    case 'UNPAID':
      return 'Nghỉ không lương';
    case 'OTHER':
      return 'Khác';
    default:
      return type;
  }
};

// Thêm helper function để lấy màu cho trạng thái
const getStatusColor = (status: LeaveStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Leave: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN' || currentUser?.role?.roleType === 'HR_STAFF';
  const isDepartmentHead = currentUser?.role?.roleType === 'DEPARTMENT_HEAD';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateHolidayModal, setShowCreateHolidayModal] = useState(false); // Modal tạo kỳ nghỉ lễ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  
  // State cho form tạo kỳ nghỉ lễ
  const [holidayForm, setHolidayForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    allDepartments: true,
    departmentIds: [] as number[]
  });
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);
  const [processingHoliday, setProcessingHoliday] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [type, setType] = useState<'ALL' | 'ANNUAL' | 'SICK' | 'OTHER' | 'HOLIDAY' | 'UNPAID'>('ALL');

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

  // State quản lý tab hiện tại
  const [activeTab, setActiveTab] = useState<TabView>(TabView.LEAVES);
  
  // State cho đợt nghỉ
  const [holidayBatches, setHolidayBatches] = useState<HolidayBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<HolidayBatch | null>(null);
  const [batchDetails, setBatchDetails] = useState<{ batch: HolidayBatch, leaves: LeaveRequest[] } | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);

  // State cho phân trang đợt nghỉ
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Số đợt nghỉ trên mỗi trang
  // State cho phân trang đơn nghỉ phép
  const [leaveCurrentPage, setLeaveCurrentPage] = useState(0);
  const [leaveItemsPerPage, setLeaveItemsPerPage] = useState(10); // Số đơn nghỉ trên mỗi trang

  // State cho modal thông báo
  const [notificationModal, setNotificationModal] = useState<NotificationModalData | null>(null);

  // Hàm hiển thị modal thông báo
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotificationModal({ title, message, type });
    
    // Tự động đóng modal sau 5 giây đối với thông báo thành công
    if (type === 'success') {
      setTimeout(() => {
        setNotificationModal(null);
      }, 5000);
    }
  };

  // Hàm đóng modal thông báo
  const closeNotification = () => {
    setNotificationModal(null);
  };

  // Helper function to handle pagination navigation after deletion
  const adjustPaginationAfterDeletion = (
    currentItems: any[], 
    currentPageIndex: number, 
    itemsPerPageCount: number,
    setPageFunction: (page: number) => void
  ) => {
    const totalPages = Math.ceil(currentItems.length / itemsPerPageCount);
    
    // If current page is beyond available pages, navigate to the last available page
    if (currentPageIndex >= totalPages && totalPages > 0) {
      setPageFunction(totalPages - 1);
    }
    // If current page becomes empty but there are still items, navigate to previous page
    else if (currentPageIndex > 0 && currentItems.length > 0 && 
             currentPageIndex * itemsPerPageCount >= currentItems.length) {
      setPageFunction(currentPageIndex - 1);
    }  };

  const fetchLeaves = useCallback(async () => {
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
          const params: any = {};
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
          if (status !== 'ALL') params.status = status;
          if (type !== 'ALL') params.type = type;
          
          if (isAdmin) {
            // Admin và HR xem tất cả đơn
            data = await LeaveService.getAllLeaves(params);
          } else if (isDepartmentHead && currentUser?.departmentId) {
            // Trưởng phòng xem đơn của phòng ban mình
            params.departmentId = currentUser.departmentId;
            data = await LeaveService.getDepartmentLeaves(params);
          } else {
            // Nhân viên thường xem đơn của mình với bộ lọc
            data = await LeaveService.getMyLeaves(params);
          }
          break;
      }

      // Sort by createdAt in descending order
      const sortedData = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeaves(sortedData);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setError('Không thể tải dữ liệu nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isDepartmentHead, currentUser?.departmentId, viewMode, selectedDate, selectedYear, selectedMonth, startDate, endDate, status, type]);
  // Hàm lấy danh sách đợt nghỉ
  const fetchHolidayBatches = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      setLoadingBatches(true);
      setError(null); // Clear previous errors
      const batches = await LeaveService.getHolidayBatches();
      setHolidayBatches(batches);
    } catch (err) {
      console.error('Failed to fetch holiday batches:', err);
      setError('Không thể tải danh sách đợt nghỉ');
    } finally {
      setLoadingBatches(false);
    }
  }, [isAdmin]);
  // Hàm lấy danh sách phòng ban
  const fetchDepartments = useCallback(async () => {
    try {
      const departmentData = await DepartmentService.getDepartments();
      setDepartments(departmentData.map(dept => ({ id: dept.id, name: dept.name })));
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);  // Thêm useEffect để lấy danh sách phòng ban khi cần thiết
  // useEffect(() => {
  //   if (isAdmin) {
  //     fetchDepartments();
  //   }
  // }, [isAdmin, fetchDepartments]);

  // Thêm useEffect để lấy danh sách đợt nghỉ khi tab đổi hoặc component mount
  useEffect(() => {
    if (activeTab === TabView.HOLIDAY_BATCHES && isAdmin) {
      fetchHolidayBatches();
    }
  }, [activeTab, isAdmin, fetchHolidayBatches]);
  
  // Hàm lấy chi tiết đợt nghỉ
  const fetchBatchDetails = async (batchId: string) => {
    if (!isAdmin) return;
    
    try {
      setLoadingBatches(true);
      const details = await LeaveService.getHolidayBatchDetails(batchId);
      setBatchDetails(details);
    } catch (err) {
      console.error('Failed to fetch batch details:', err);
      setError('Không thể tải chi tiết đợt nghỉ');
    } finally {
      setLoadingBatches(false);
    }
  };
  
  // Hàm để hiển thị modal xác nhận xóa đợt nghỉ
  const openDeleteBatchModal = (batch: HolidayBatch) => {
    setSelectedBatch(batch);
    setShowDeleteBatchModal(true);
  };    // Hàm xử lý xóa đợt nghỉ
  const handleDeleteBatch = async () => {
    if (!selectedBatch) return;
    
    try {
      setDeletingBatch(true);
      setError(null); // Clear any previous errors
      const result = await LeaveService.deleteHolidayBatch(selectedBatch.id);
      
      // Đóng modal và reset state trước
      setShowDeleteBatchModal(false);
      setSelectedBatch(null);
      setBatchDetails(null);
      
      // Force update danh sách đợt nghỉ và adjust pagination
      setHolidayBatches(prev => {
        const updatedBatches = prev.filter(batch => batch.id !== selectedBatch.id);
        // Adjust pagination after state update
        adjustPaginationAfterDeletion(updatedBatches, currentPage, itemsPerPage, setCurrentPage);
        return updatedBatches;
      });
      
      // Fetch lại data từ server để đảm bảo đồng bộ
      await fetchHolidayBatches();
        // Cập nhật lại danh sách leaves nếu cần
      if (activeTab === TabView.LEAVES) {
        await fetchLeaves();
      }
      
      // Hiển thị thông báo thành công
      showNotification(
        'Xóa đợt nghỉ thành công',
        `Đã xóa thành công ${result.deletedCount} đơn nghỉ phép thuộc đợt nghỉ này`,
        'success'
      );
    } catch (err) {
      console.error('Failed to delete holiday batch:', err);
      setError('Không thể xóa đợt nghỉ');
    } finally {
      setDeletingBatch(false);
    }
  };
    // Hàm chuyển đổi giữa các tab
  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    setError(null); // Clear errors when switching tabs
    
    if (tab === TabView.HOLIDAY_BATCHES && isAdmin) {
      // Reset state khi chuyển tab
      setSelectedBatch(null);
      setBatchDetails(null);
      // Fetch data ngay khi chuyển tab
      fetchHolidayBatches();
    } else if (tab === TabView.LEAVES) {
      // Refresh leaves data when switching back
      fetchLeaves();
    }
  };
    // Hàm xử lý khi click vào một đợt nghỉ
  const handleBatchClick = (batch: HolidayBatch) => {
    setSelectedBatch(batch);
    fetchBatchDetails(batch.id);
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
      
      // Optimistic update: Update status immediately
      setLeaves(prev => 
        prev.map(leave => 
          leave.id === selectedLeaveId 
            ? { ...leave, status: 'APPROVED' as LeaveStatus }
            : leave
        )
      );
      
      // If viewing batch details, update batchDetails as well
      if (batchDetails) {
        setBatchDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            leaves: prev.leaves.map(leave => 
              leave.id === selectedLeaveId 
                ? { ...leave, status: 'APPROVED' as LeaveStatus }
                : leave
            )
          };
        });
      }
      
      setShowApproveModal(false);
      setSelectedLeaveId(null);
      setSelectedLeave(null);
      
      // Fetch fresh data from server to ensure consistency
      await fetchLeaves();
      
      // If viewing batch details, refresh batch details too
      if (batchDetails && selectedBatch) {
        await fetchBatchDetails(selectedBatch.id);
      }
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
      
      // Optimistic update: Update status immediately
      setLeaves(prev => 
        prev.map(leave => 
          leave.id === selectedLeaveId 
            ? { ...leave, status: 'REJECTED' as LeaveStatus, rejectionReason: rejectReason }
            : leave
        )
      );
      
      // If viewing batch details, update batchDetails as well
      if (batchDetails) {
        setBatchDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            leaves: prev.leaves.map(leave => 
              leave.id === selectedLeaveId 
                ? { ...leave, status: 'REJECTED' as LeaveStatus, rejectionReason: rejectReason }
                : leave
            )
          };
        });
      }
      
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLeaveId(null);
      setSelectedLeave(null);
      
      // Fetch fresh data from server to ensure consistency
      await fetchLeaves();
      
      // If viewing batch details, refresh batch details too
      if (batchDetails && selectedBatch) {
        await fetchBatchDetails(selectedBatch.id);
      }
    } catch (err) {
      console.error('Failed to reject leave:', err);
      setError('Không thể từ chối đơn nghỉ phép');
    } finally {
      setProcessingAction(false);
    }
  };  // Xử lý xóa đơn
  const handleDeleteLeave = async () => {
    if (!selectedLeaveId) return;

    try {
      setProcessingAction(true);
      await LeaveService.deleteLeave(selectedLeaveId);
      
      // Optimistic update: Remove from current state immediately and adjust pagination
      setLeaves(prev => {
        const updatedLeaves = prev.filter(leave => leave.id !== selectedLeaveId);
        // Adjust pagination after state update
        adjustPaginationAfterDeletion(updatedLeaves, leaveCurrentPage, leaveItemsPerPage, setLeaveCurrentPage);
        return updatedLeaves;
      });
      
      // If viewing batch details, update batchDetails as well
      if (batchDetails) {
        setBatchDetails(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            leaves: prev.leaves.filter(leave => leave.id !== selectedLeaveId),
            batch: {
              ...prev.batch,
              leaveCount: prev.batch.leaveCount - 1 // Update count
            }
          };
        });
        
        // Also update the holiday batches list to reflect the new count
        setHolidayBatches(prev => 
          prev.map(batch => 
            batch.id === batchDetails.batch.id 
              ? { ...batch, leaveCount: batch.leaveCount - 1 }
              : batch
          )
        );
      }
      
      setShowDeleteModal(false);
      setSelectedLeaveId(null);
      setSelectedLeave(null);
      
      // Fetch fresh data from server to ensure consistency
      await fetchLeaves();
      
      // If viewing batch details, refresh batch details too
      if (batchDetails && selectedBatch) {
        await fetchBatchDetails(selectedBatch.id);
      }
    } catch (err) {
      console.error('Failed to delete leave:', err);
      setError('Không thể xóa đơn nghỉ phép');
    } finally {
      setProcessingAction(false);
    }
  };

  const getUserName = (userId: number) => {
    return `User ${userId}`;
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  // Hàm xử lý thay đổi form tạo kỳ nghỉ lễ
  const handleHolidayFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'allDepartments') {
      // Xử lý checkbox
      const checked = (e.target as HTMLInputElement).checked;
      setHolidayForm(prev => ({
        ...prev,
        allDepartments: checked,
        departmentIds: checked ? [] : prev.departmentIds
      }));
      
      // Fetch departments khi cần thiết
      if (!checked && departments.length === 0) {
        fetchDepartments();
      }
    } else {
      setHolidayForm(prev => ({
        ...prev,
        [name]: value
      }));
    }  };

  // Hàm tạo kỳ nghỉ lễ
  const handleCreateHoliday = async () => {
    try {
      setProcessingHoliday(true);
      setError(null);
      
      // Kiểm tra form
      if (!holidayForm.startDate || !holidayForm.endDate || !holidayForm.reason) {
        setError('Vui lòng điền đầy đủ thông tin');
        setProcessingHoliday(false);
        return;
      }
      
      // Kiểm tra ngày bắt đầu và kết thúc
      const startDate = new Date(holidayForm.startDate);
      const endDate = new Date(holidayForm.endDate);
      
      if (startDate > endDate) {
        setError('Ngày kết thúc phải sau ngày bắt đầu');
        setProcessingHoliday(false);
        return;
      }
      
      const requestData = {
        startDate: holidayForm.startDate,
        endDate: holidayForm.endDate,
        reason: holidayForm.reason,
        departmentIds: holidayForm.allDepartments ? undefined : holidayForm.departmentIds
      };
      
      const result = await LeaveService.createHoliday(requestData);
      
      // Đóng modal và hiển thị thông báo thành công
      setShowCreateHolidayModal(false);
      
      // Reset form
      setHolidayForm({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        allDepartments: true,
        departmentIds: []
      });
        // Cập nhật lại danh sách nghỉ phép và đợt nghỉ
      await Promise.all([
        fetchLeaves(),
        fetchHolidayBatches()
      ]);
      
      // Hiển thị thông báo thành công
      showNotification(
        'Tạo kỳ nghỉ lễ thành công',
        `Đã tạo thành công ${result.count} đơn nghỉ lễ`,
        'success'
      );
      
    } catch (err: any) {
      console.error('Failed to create holiday:', err);
      setError(err.response?.data?.message || 'Không thể tạo kỳ nghỉ lễ');
    } finally {
      setProcessingHoliday(false);
    }
  };

  // Hàm xử lý thay đổi trang
  const handlePageChange = (selected: number) => {
    setCurrentPage(selected);
  };

  // Hàm xử lý khi thay đổi trang đơn nghỉ phép
  const handleLeavePageChange = (selected: number) => {
    setLeaveCurrentPage(selected);
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

  // Render buttons
  const renderActionButtons = () => {
    return (
      <div className="mb-4 flex justify-between">
        {/* Nút tạo đơn nghỉ phép */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
          Tạo đơn nghỉ phép
        </button>
      </div>
    );
  };

  // Thêm các hàm render bị thiếu
  const renderFilters = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-4">
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
              <option value="HOLIDAY">Nghỉ lễ</option>
              <option value="UNPAID">Nghỉ không lương</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="spinner-border text-blue-500" role="status">
          <span className="sr-only">Đang tải...</span>
        </div>
      </div>
    );
  };

  const renderLeaveTable = (customLeaves?: LeaveRequest[]) => {
    const dataToRender = customLeaves || leaves;
    // Tính toán phân trang cho đơn nghỉ
    const paginatedLeaves = dataToRender.slice(
      leaveCurrentPage * leaveItemsPerPage, 
      (leaveCurrentPage + 1) * leaveItemsPerPage
    );
    
    return (
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
            {paginatedLeaves.length > 0 ? (
              paginatedLeaves.map((leave) => (
                <tr key={leave.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={leave.user?.avatar || '/logo192.png'}
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
                  </td>                  <td className="px-6 py-4">
                    {leave.approver ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={leave.approver.avatar || '/logo192.png'}
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
        
        {/* Phân trang cho đơn nghỉ phép */}
        {dataToRender.length > leaveItemsPerPage && (
          <div className="flex justify-between items-center mt-4 border-8 border-transparent">
            <div>
              <span className="text-sm text-gray-700">
                Hiển thị {leaveCurrentPage * leaveItemsPerPage + 1}-{Math.min((leaveCurrentPage + 1) * leaveItemsPerPage, dataToRender.length)} của {dataToRender.length} đơn nghỉ
              </span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleLeavePageChange(leaveCurrentPage - 1)}
                disabled={leaveCurrentPage === 0}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(Math.ceil(dataToRender.length / leaveItemsPerPage))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleLeavePageChange(i)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    leaveCurrentPage === i
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleLeavePageChange(leaveCurrentPage + 1)}
                disabled={leaveCurrentPage === Math.ceil(dataToRender.length / leaveItemsPerPage) - 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Hàm render tabs
  const renderTabs = () => {
    return (
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleTabChange(TabView.LEAVES)}
              className={`${
                activeTab === TabView.LEAVES
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
            >
              Đơn nghỉ phép
            </button>
            {isAdmin && (
              <button
                onClick={() => handleTabChange(TabView.HOLIDAY_BATCHES)}
                className={`${
                  activeTab === TabView.HOLIDAY_BATCHES
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
              >
                Quản lý đợt nghỉ
              </button>
            )}
          </nav>
        </div>
      </div>
    );
  };

  // Hàm hiển thị danh sách đợt nghỉ
  const renderHolidayBatches = () => {
    if (loadingBatches && !batchDetails) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
        </div>
      );
    }

    // Nếu đang xem chi tiết một đợt nghỉ
    if (batchDetails) {
      return (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedBatch(null);
                setBatchDetails(null);
              }}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
            >
              &larr; Quay lại
            </button>
            
            <button
              onClick={() => openDeleteBatchModal(batchDetails.batch)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Xóa đợt nghỉ này
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">{batchDetails.batch.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Thời gian:</p>
                <p className="font-medium">
                  {format(new Date(batchDetails.batch.startDate), 'dd/MM/yyyy')} - {format(new Date(batchDetails.batch.endDate), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số đơn nghỉ:</p>
                <p className="font-medium">{batchDetails.batch.leaveCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lý do:</p>
                <p className="font-medium">{batchDetails.batch.reason}</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Danh sách đơn nghỉ trong đợt này</h3>
          {renderLeaveTable(batchDetails.leaves)}
        </div>
      );
    }

    // Hiển thị danh sách đợt nghỉ với phân trang
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Danh sách đợt nghỉ</h2>
          <button
            onClick={() => setShowCreateHolidayModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tạo đợt nghỉ mới
          </button>
        </div>

        {holidayBatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Chưa có đợt nghỉ nào được tạo
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidayBatches
                .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
                .map(batch => (
                  <div
                    key={batch.id}
                    onClick={() => handleBatchClick(batch)}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold mb-2 truncate">{batch.name}</h3>
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Thời gian: </span>
                      {format(new Date(batch.startDate), 'dd/MM/yyyy')} - {format(new Date(batch.endDate), 'dd/MM/yyyy')}
                    </div>
                    <div className="text-sm mb-2">
                      <span className="text-gray-500">Lý do: </span>
                      {batch.reason.length > 50 ? batch.reason.substring(0, 50) + '...' : batch.reason}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Số đơn nghỉ: </span>
                      <span className="font-medium">{batch.leaveCount}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Tạo ngày {format(new Date(batch.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Phân trang */}
            {holidayBatches.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-sm text-gray-700">
                    Hiển thị {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, holidayBatches.length)} của {holidayBatches.length} đợt nghỉ
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {[...Array(Math.ceil(holidayBatches.length / itemsPerPage))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(holidayBatches.length / itemsPerPage) - 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý nghỉ phép</h1>
      
      {/* Hiển thị lỗi */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      {/* Hiển thị tabs */}
      {renderTabs()}
      
      {/* Nội dung dựa theo tab đang chọn */}
      {activeTab === TabView.LEAVES ? (
        <>
          {/* Các nút điều khiển */}
          {renderActionButtons()}
          
          {/* Điều khiển chế độ xem */}
          {renderViewModeControls()}          {/* Bộ lọc - hiển thị cho tất cả user khi ở chế độ DEFAULT */}
          {viewMode === ViewMode.DEFAULT && renderFilters()}
          
          {/* Danh sách nghỉ phép */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            {loading ? renderLoading() : renderLeaveTable()}
          </div>
        </>
      ) : (
        /* Hiển thị danh sách đợt nghỉ nếu tab là HOLIDAY_BATCHES */
        <>
          {renderHolidayBatches()}
        </>
      )}
      
      {/* Modal tạo đơn nghỉ phép */}
      <CreateLeaveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data: {
          startDate: string;
          endDate: string;
          type: LeaveType;
          reason: string;
          numberOfDays: number;
        }) => {
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

      {/* Modal tạo kỳ nghỉ lễ */}
      {showCreateHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Tạo đợt nghỉ lễ</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={holidayForm.startDate}
                onChange={handleHolidayFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ngày kết thúc</label>
              <input
                type="date"
                name="endDate"
                value={holidayForm.endDate}
                onChange={handleHolidayFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Lý do nghỉ lễ</label>
              <textarea
                name="reason"
                value={holidayForm.reason}
                onChange={handleHolidayFormChange}
                className="w-full p-2 border rounded"
                rows={3}
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allDepartments"
                  checked={holidayForm.allDepartments}
                  onChange={handleHolidayFormChange}
                  className="mr-2"
                />
                <span>Áp dụng cho tất cả các phòng ban</span>
              </label>
            </div>
              {!holidayForm.allDepartments && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Chọn phòng ban</label>
                <div className="border rounded p-3 max-h-48 overflow-y-auto">
                  {departments.length > 0 ? (
                    departments.map(dept => (
                      <div key={dept.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`dept-${dept.id}`}
                          className="mr-2"
                          checked={holidayForm.departmentIds.includes(dept.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setHolidayForm(prev => ({
                              ...prev,
                              departmentIds: isChecked 
                                ? [...prev.departmentIds, dept.id]
                                : prev.departmentIds.filter(id => id !== dept.id)
                            }));
                          }}
                        />
                        <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                          {dept.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">Đang tải danh sách phòng ban...</div>
                  )}
                </div>
                {holidayForm.departmentIds.length > 0 && (
                  <small className="text-blue-600 mt-1 block">
                    Đã chọn {holidayForm.departmentIds.length} phòng ban
                  </small>
                )}
              </div>
            )}
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowCreateHolidayModal(false)}
                disabled={processingHoliday}
              >
                Hủy
              </button>
              
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                onClick={handleCreateHoliday}
                disabled={processingHoliday}
              >
                {processingHoliday ? 'Đang xử lý...' : 'Tạo nghỉ lễ'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal xóa đợt nghỉ */}
      {showDeleteBatchModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h2 className="text-xl font-semibold mb-4">Xác nhận xóa đợt nghỉ</h2>
            <div className="mb-6">
              <p className="text-gray-700">Bạn có chắc muốn xóa đợt nghỉ <strong>{selectedBatch.name}</strong> không?</p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">Thời gian: </span>
                {format(new Date(selectedBatch.startDate), 'dd/MM/yyyy')} - {format(new Date(selectedBatch.endDate), 'dd/MM/yyyy')}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-medium">Số đơn nghỉ sẽ bị xóa: </span>
                {selectedBatch.leaveCount}
              </p>
              <p className="text-red-600 text-sm mt-2">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                Tất cả đơn nghỉ thuộc đợt này sẽ bị xóa. Hành động này không thể hoàn tác!
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteBatchModal(false);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={deletingBatch}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteBatch}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={deletingBatch}
              >
                {deletingBatch ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}      {/* Modal thông báo */}
      {notificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full shadow-xl">
            <div className="flex items-center mb-4">
              {/* Icon dựa trên type */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                notificationModal.type === 'success' ? 'bg-green-100' :
                notificationModal.type === 'error' ? 'bg-red-100' :
                notificationModal.type === 'warning' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                {notificationModal.type === 'success' && (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notificationModal.type === 'error' && (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notificationModal.type === 'warning' && (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {notificationModal.type === 'info' && (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {/* Title */}
              <h2 className={`text-lg font-semibold ${
                notificationModal.type === 'success' ? 'text-green-800' :
                notificationModal.type === 'error' ? 'text-red-800' :
                notificationModal.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {notificationModal.title}
              </h2>
            </div>
            
            {/* Message */}
            <p className="text-gray-700 mb-6 leading-relaxed">
              {notificationModal.message}
            </p>
            
            {/* Buttons */}
            <div className="flex justify-end">
              <button
                onClick={closeNotification}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  notificationModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  notificationModal.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  notificationModal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;