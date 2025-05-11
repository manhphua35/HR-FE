import React, { useState, useEffect } from 'react';
import { AttendanceService, AttendanceStatus, AttendanceRecord } from '../services/AttendanceService';
import CreateAttendanceModal from '../components/modals/CreateAttendanceModal';
import EditAttendanceModal from '../components/modals/EditAttendanceModal';
import ConfirmDeleteAttendanceModal from '../components/modals/ConfirmDeleteAttendanceModal';

// Format date to DD/MM/YYYY for display
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Cài đặt enum để quản lý các chế độ xem
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

// Tạo mảng các tùy chọn xem lịch sử theo ngày
const dayOptions = [
  { value: 7, label: '7 ngày qua' },
  { value: 14, label: '14 ngày qua' },
  { value: 30, label: '30 ngày qua' },
  { value: 60, label: '60 ngày qua' },
  { value: 90, label: '90 ngày qua' }
];

const Attendance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  
  // Thêm state quản lý chế độ xem
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DEFAULT);
  
  // State cho việc xem theo ngày cụ thể
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Format YYYY-MM-DD
  
  // State cho việc xem lịch sử theo tháng
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  type AttendanceDataType = {
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceDataType>({
    records: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage, viewMode, selectedDate, selectedMonth, selectedYear]); // Re-fetch khi các tham số thay đổi

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");
      
      let data: any;
      
      switch (viewMode) {
        case ViewMode.SPECIFIC_DATE:
          // Lấy dữ liệu chấm công cho ngày cụ thể
          const specificDateRecords = await AttendanceService.getAttendanceBySpecificDate(selectedDate);
          data = {
            records: specificDateRecords,
            total: specificDateRecords.length,
            page: 1,
            limit: pageSize,
            totalPages: Math.ceil(specificDateRecords.length / pageSize)
          };
          break;
          
        case ViewMode.HISTORY_MONTH:
          // Lấy lịch sử chấm công theo tháng
          const historyMonthRecords = await AttendanceService.getAttendanceHistoryByMonth(selectedYear, selectedMonth);
          data = {
            records: historyMonthRecords,
            total: historyMonthRecords.length,
            page: 1,
            limit: pageSize,
            totalPages: Math.ceil(historyMonthRecords.length / pageSize)
          };
          break;
          
        default:
          // Chế độ mặc định - lấy tất cả bản ghi
          data = await AttendanceService.getAttendances();
          break;
      }
      
      if (data && Array.isArray(data.records)) {
        setAttendanceData(data);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError("Lấy dữ liệu chấm công thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Filter records in frontend
  const filteredRecords = attendanceData.records.filter((record: AttendanceRecord) => {
    const employeeName = record.user?.fullName || '';
    const departmentName = record.user?.department?.name || '';

    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "" || departmentName.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Client-side pagination
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Update total pages whenever filters change
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter]);

  // Get unique departments for filter dropdown
  const departments = Array.from(
    new Set(
      attendanceData.records
        .map(record => record.user?.department?.name)
        .filter((name): name is string => !!name)
    )
  );

  // Get unique statuses for filter dropdown
  const statuses = Object.values(AttendanceStatus);

  // Hàm xử lý thay đổi chế độ xem
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1); // Reset về trang đầu tiên khi đổi chế độ xem
  };

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
          return `Dữ liệu chấm công ngày ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
        return `Dữ liệu chấm công ngày ${selectedDate}`;
      case ViewMode.HISTORY_MONTH:
        return `Lịch sử chấm công Tháng ${selectedMonth}/${selectedYear}`;
      default:
        return 'Dữ liệu chấm công';
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

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center">
        <i className="fas fa-exclamation-circle mr-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chấm công</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm chấm công
        </button>
      </div>

      {/* Thêm thanh điều khiển chế độ xem */}
      {renderViewModeControls()}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{renderViewTitle()}</h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between mb-8">
            <div className="relative w-full lg:w-1/3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((department, index) => (
                  <option key={index} value={department}>{department}</option>
                ))}
              </select>

              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value ? e.target.value as AttendanceStatus : "")}
              >
                <option value="">Tất cả trạng thái</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {AttendanceService.getStatusDisplay(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4">Nhân viên</th>
                  <th scope="col" className="px-6 py-4">Phòng ban</th>
                  <th scope="col" className="px-6 py-4">Ngày</th>
                  <th scope="col" className="px-6 py-4">Check-in</th>
                  <th scope="col" className="px-6 py-4">Check-out</th>
                  <th scope="col" className="px-6 py-4">Trạng thái</th>
                  <th scope="col" className="px-6 py-4">Thời gian làm việc</th>
                  <th scope="col" className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((record: AttendanceRecord) => (
                    <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src="/logo192.png"
                              alt={record.user?.fullName || 'Employee'}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.user?.fullName || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900">{record.user?.department?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900">{record.date}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`text-sm ${record.status === AttendanceStatus.LATE ? 'text-yellow-600 font-medium' : 'text-gray-900'}`}>
                          {record.checkInTime || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900">{record.checkOutTime || '-'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 text-xs rounded-full ${
                          record.status === AttendanceStatus.PRESENT
                            ? 'bg-green-100 text-green-800'
                            : record.status === AttendanceStatus.LATE
                              ? 'bg-yellow-100 text-yellow-800'
                              : record.status === AttendanceStatus.ABSENT
                                ? 'bg-red-100 text-red-800'
                                : record.status === AttendanceStatus.LEAVE
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}>
                          {AttendanceService.getStatusDisplay(record.status)}
                          {record.leaveRequest && (
                            <span className="ml-1 text-xs" title="Có đơn nghỉ phép">
                              <i className="fas fa-info-circle"></i>
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-900">{record.workHours ?? '-'}</div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => {
                            setSelectedAttendance(record);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAttendance(record);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      Không có dữ liệu chấm công nào được tìm thấy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                {paginatedRecords.length > 0 ? (
                  <>
                    Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến{' '}
                    <span className="font-medium">{Math.min(currentPage * pageSize, filteredRecords.length)}</span> trong tổng số{' '}
                    <span className="font-medium">{filteredRecords.length}</span> bản ghi
                  </>
                ) : (
                  <>
                    Hiển thị <span className="font-medium">0</span> trong tổng số{' '}
                    <span className="font-medium">0</span> bản ghi
                  </>
                )}
              </div>
              <div>
                {filteredRecords.length > pageSize && (
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <i className="fas fa-chevron-left h-5 w-5"></i>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <i className="fas fa-chevron-right h-5 w-5"></i>
                    </button>
                  </nav>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateAttendanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchAttendanceData();
        }}
      />

      {selectedAttendance && (
        <>
          <EditAttendanceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAttendance(null);
            }}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedAttendance(null);
              fetchAttendanceData();
            }}
            attendance={selectedAttendance}
          />

          <ConfirmDeleteAttendanceModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedAttendance(null);
            }}
            onConfirm={async () => {
              try {
                setIsDeleting(true);
                await AttendanceService.deleteAttendance(selectedAttendance.id);
                fetchAttendanceData();
                setIsDeleteModalOpen(false);
                setSelectedAttendance(null);
              } catch (error) {
                console.error('Failed to delete attendance:', error);
                setError('Không thể xóa bản ghi chấm công');
              } finally {
                setIsDeleting(false);
              }
            }}
            attendance={selectedAttendance}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default Attendance;