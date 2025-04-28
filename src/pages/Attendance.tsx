import React, { useState, useEffect } from 'react';
import { AttendanceService, AttendanceRecord, AttendanceSummary } from '../services/AttendanceService';

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Attendance: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>(formatDate(new Date()));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAttendanceData();
  }, [dateFilter]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [recordsData, summaryData] = await Promise.all([
        AttendanceService.getAttendanceRecords(dateFilter),
        AttendanceService.getAttendanceSummary(dateFilter)
      ]);
      setRecords(recordsData);
      setSummary(summaryData);
      setError("");
    } catch (err) {
      setError("Failed to fetch attendance data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const blob = await AttendanceService.exportAttendanceReport(dateFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${dateFilter.replace(/\//g, '-')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to export report");
      console.error(err);
    }
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "" || record.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter dropdown
  const departments = Array.from(new Set(records.map(record => record.department)));
  
  // Get unique statuses for filter dropdown
  const statuses = Array.from(new Set(records.map(record => record.status)));

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Attendance Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng số</p>
                <h3 className="text-2xl font-bold">{summary.totalEmployees}</h3>
                <p className="text-xs text-gray-500">Nhân viên</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i className="fas fa-user-check text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đúng giờ</p>
                <h3 className="text-2xl font-bold">{summary.presentCount}</h3>
                <p className="text-xs text-green-500">
                  {Math.round((summary.presentCount / summary.totalEmployees) * 100)}% tổng số
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <i className="fas fa-user-clock text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đi muộn</p>
                <h3 className="text-2xl font-bold">{summary.lateCount}</h3>
                <p className="text-xs text-yellow-500">
                  {Math.round((summary.lateCount / summary.totalEmployees) * 100)}% tổng số
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <i className="fas fa-user-minus text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nghỉ phép</p>
                <h3 className="text-2xl font-bold">{summary.onLeaveCount}</h3>
                <p className="text-xs text-purple-500">
                  {Math.round((summary.onLeaveCount / summary.totalEmployees) * 100)}% tổng số
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <i className="fas fa-user-times text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vắng</p>
                <h3 className="text-2xl font-bold">{summary.absentCount}</h3>
                <p className="text-xs text-red-500">
                  {Math.round((summary.absentCount / summary.totalEmployees) * 100)}% tổng số
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Dữ liệu chấm công</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
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
                  placeholder="Ngày"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
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
              
              <button
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                onClick={handleExportReport}
              >
                <i className="fas fa-download mr-2"></i>Xuất báo cáo
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nhân viên</th>
                  <th scope="col" className="px-6 py-3">Phòng ban</th>
                  <th scope="col" className="px-6 py-3">Ngày</th>
                  <th scope="col" className="px-6 py-3">Check-in</th>
                  <th scope="col" className="px-6 py-3">Check-out</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                  <th scope="col" className="px-6 py-3">Thời gian làm việc</th>
                  <th scope="col" className="px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={record.employeeAvatar} alt={record.employeeName} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${record.status === 'Đi muộn' ? 'text-yellow-600 font-medium' : 'text-gray-900'}`}>
                        {record.checkIn}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.checkOut}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        record.status === 'Đúng giờ' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'Đi muộn'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.workHours}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-600 hover:text-gray-900 mr-2" title="Chi tiết">
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
              Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredRecords.length}</span> trong tổng số <span className="font-medium">{records.length}</span> bản ghi
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