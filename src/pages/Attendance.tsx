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

const Attendance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  
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
  }, [currentPage]); // Re-fetch when page changes

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await AttendanceService.getAttendances();
      console.log('API Response:', data); // Debug log
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Dữ liệu chấm công</h2>
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
                {paginatedRecords.map((record: AttendanceRecord) => (
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
                ))}
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