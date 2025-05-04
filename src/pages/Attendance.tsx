import React, { useState, useEffect } from 'react';
import { AttendanceService, AttendanceRecord } from '../services/AttendanceService';

// Format date to DD/MM/YYYY for display
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format date to YYYY-MM-DD for API calls
const formatDateForAPI = (dateStr: string): string => {
  try {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return ''; // Handle invalid format
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (e) {
    console.error("Error formatting date for API:", e);
    return ''; // Trả về chuỗi rỗng hoặc xử lý lỗi thích hợp
  }
};


const Attendance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Use Date object for easier manipulation, format for display/API when needed
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  // Summary state removed as the API endpoint was removed
  // const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAttendanceData();
  }, [currentDate]); // Re-fetch when currentDate changes

  const fetchAttendanceData = async () => {
    const apiDate = formatDateForAPI(formatDate(currentDate));
    if (!apiDate) {
      setError("Định dạng ngày đã chọn không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch only records, summary endpoint removed
      const recordsData = await AttendanceService.getAttendances({
        startDate: apiDate,
        endDate: apiDate // Giả sử lọc theo một ngày duy nhất
      });
      // Đảm bảo recordsData luôn là một mảng, ngay cả khi API trả về null/undefined
      setRecords(Array.isArray(recordsData) ? recordsData : []);
      // setSummary đã bị xóa
      setError("");
    } catch (err) {
      setError("Lấy dữ liệu chấm công thất bại");
      setRecords([]); // Luôn đặt thành mảng rỗng khi có lỗi
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // handleExportReport removed as the API endpoint was removed
  /*
  const handleExportReport = async () => {
    const apiDate = formatDateForAPI(formatDate(currentDate));
    if (!apiDate) return; // Or show error
    try {
      // Assuming exportAttendanceReport existed and accepted similar date format
      const blob = await AttendanceService.exportAttendanceReport(apiDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${apiDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Xuất báo cáo thất bại");
      console.error(err);
    }
  };
  */

  // Filter records - Use default empty array to ensure safety
  const filteredRecords = (records || []).filter(record => { // Changed: Use (records || [])
        // Kiểm tra null/undefined cho user và các thuộc tính của nó
        const employeeName = record.user?.fullName || '';
    const departmentName = record.user?.department?.name || '';
    const recordStatus = record.status || '';

    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || recordStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesDepartment = departmentFilter === "" || departmentName.toLowerCase() === departmentFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesDepartment;
      }); // Removed the erroneous `: [];`

  // Get unique departments for filter dropdown - Sử dụng cấu trúc user lồng vào
  const departments = Array.from(
    new Set(
      (records || []) // Changed: Use (records || [])
        .map(record => record.user?.department?.name) // Lấy tên phòng ban từ user.department
        .filter((name): name is string => !!name) // Lọc bỏ các giá trị null/undefined và đảm bảo kiểu string
    )
  );

  // Get unique statuses for filter dropdown - Handle undefined/null
  const statuses = Array.from(
    new Set(
        (records || []) // Changed: Use (records || [])
        .map(record => record.status) // Lấy trạng thái
        .filter((status): status is string => !!status) // Lọc bỏ các giá trị null/undefined
    )
  );

  // Handler for date input change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Attempt to parse the input value as a date
    const dateValue = event.target.value; // Expected format DD/MM/YYYY from input
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const newDate = new Date(year, month, day);
        // Basic validation if the date is valid
        if (!isNaN(newDate.getTime())) {
           setCurrentDate(newDate);
        } else {
           // Handle invalid date input, maybe show an error message
           console.warn("Invalid date entered:", dateValue);
        }
      } else {
         console.warn("Invalid date parts:", dateValue);
      }
    } else {
       console.warn("Date format incorrect, expected DD/MM/YYYY:", dateValue);
    }
  };


  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Chấm công</h1>
      </div>

      {/* Attendance Records Table */}
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-calendar text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  placeholder="Ngày (DD/MM/YYYY)"
                  value={formatDate(currentDate)} // Display formatted date
                  onChange={handleDateChange} // Use handler to parse and set Date object
                />
              </div>

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
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
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
                {filteredRecords.map(record => (
                  <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* Sử dụng logo192.png làm ảnh đại diện tạm thời. Cần thêm /default-avatar.png vào thư mục public */}
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={'/logo192.png'} // Sử dụng logo hiện có làm placeholder
                            alt={record.user?.fullName || 'Employee'} // Sử dụng fullName từ user
                            // Bỏ onError để tránh vòng lặp nếu ảnh không tải được
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.user?.fullName || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {/* Lấy tên phòng ban từ user.department.name */}
                      <div className="text-sm text-gray-900">{record.user?.department?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-900">{record.date}</div>
                    </td>
                    <td className="px-6 py-5">
                      {/* Sử dụng checkInTime */}
                      <div className={`text-sm ${(record.status || '').toLowerCase() === 'đi muộn' ? 'text-yellow-600 font-medium' : 'text-gray-900'}`}>
                        {record.checkInTime || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {/* Sử dụng checkOutTime */}
                      <div className="text-sm text-gray-900">{record.checkOutTime || '-'}</div>
                    </td>
                    <td className="px-6 py-5">
                      {/* Handle undefined status and adjust class logic */}
                      <span className={`px-3 py-1.5 text-xs rounded-full ${
                        (record.status || '').toLowerCase() === 'đúng giờ'
                          ? 'bg-green-100 text-green-800'
                          : (record.status || '').toLowerCase() === 'đi muộn'
                            ? 'bg-yellow-100 text-yellow-800'
                            : (record.status || '').toLowerCase() === 'vắng' // Ví dụ: Thêm các trạng thái khác nếu cần
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800' // Trạng thái mặc định/không xác định
                      }`}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {/* Handle undefined workHours */}
                      <div className="text-sm text-gray-900">{record.workHours ?? '-'}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-gray-600 hover:text-gray-900 mr-3" title="Chi tiết">
                        <i className="fas fa-info-circle"></i>
                      </button>
                      <button className="text-blue-600 hover:text-blue-900" title="Sửa">
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredRecords.length}</span> trong tổng số <span className="font-medium">{(records || []).length}</span> bản ghi
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Previous</span>
                  <i className="fas fa-chevron-left h-5 w-5"></i>
                </button>
                <button aria-current="page" className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">1</button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">2</button>
                <button className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex">3</button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                  <span className="sr-only">Next</span>
                  <i className="fas fa-chevron-right h-5 w-5"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;