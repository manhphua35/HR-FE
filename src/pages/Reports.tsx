import React, { useState, useEffect } from 'react';
import { ReportService, EmployeeReport, AttendanceReport, PayrollReport, LeaveReport } from '../services/ReportService';
import { format, subMonths } from 'date-fns';

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'leave'>('employees');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const [employeeReport, setEmployeeReport] = useState<EmployeeReport | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null);
  const [payrollReport, setPayrollReport] = useState<PayrollReport | null>(null);
  const [leaveReport, setLeaveReport] = useState<LeaveReport | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, activeTab]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');

      switch (activeTab) {
        case 'employees':
          const empData = await ReportService.getEmployeeReport(startDate, endDate);
          setEmployeeReport(empData);
          break;
        case 'attendance':
          const attData = await ReportService.getAttendanceReport(startDate, endDate);
          setAttendanceReport(attData);
          break;
        case 'payroll':
          const payData = await ReportService.getPayrollReport(startDate, endDate);
          setPayrollReport(payData);
          break;
        case 'leave':
          const leaveData = await ReportService.getLeaveReport(startDate, endDate);
          setLeaveReport(leaveData);
          break;
      }
    } catch (err) {
      setError('Failed to fetch report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await ReportService.exportReport(activeTab, startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
      console.error(err);
    }
  };

  const tabs = [
    { id: 'employees', label: 'Nhân sự' },
    { id: 'attendance', label: 'Chấm công' },
    { id: 'payroll', label: 'Lương' },
    { id: 'leave', label: 'Nghỉ phép' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i className="fas fa-download mr-2"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="p-6">Loading...</div>
      ) : error ? (
        <div className="p-6 text-red-500">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Employee Report */}
          {activeTab === 'employees' && employeeReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Tổng nhân viên</h3>
                  <p className="mt-2 text-3xl font-bold text-primary">{employeeReport.totalEmployees}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Nhân viên mới</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">+{employeeReport.newHires}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Nghỉ việc</h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">-{employeeReport.turnover}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Tỉ lệ biến động</h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">
                    {Math.round((employeeReport.turnover / employeeReport.totalEmployees) * 100)}%
                  </p>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Phân bố theo phòng ban</h3>
                  <div className="space-y-4">
                    {employeeReport.departmentDistribution.map((dept) => (
                      <div key={dept.department}>
                        <div className="flex justify-between text-sm">
                          <span>{dept.department}</span>
                          <span>{dept.count} ({dept.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: `${dept.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Phân bố theo độ tuổi</h3>
                  <div className="space-y-4">
                    {employeeReport.ageDistribution.map((age) => (
                      <div key={age.range}>
                        <div className="flex justify-between text-sm">
                          <span>{age.range}</span>
                          <span>{age.count} ({age.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-green-600 rounded-full"
                            style={{ width: `${age.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Report */}
          {activeTab === 'attendance' && attendanceReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Tỉ lệ đi làm</h3>
                  <p className="mt-2 text-3xl font-bold text-primary">{attendanceReport.averageAttendance}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Đi muộn</h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">{attendanceReport.lateArrivals}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Về sớm</h3>
                  <p className="mt-2 text-3xl font-bold text-orange-600">{attendanceReport.earlyDepartures}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Vắng mặt</h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">{attendanceReport.absences}</p>
                </div>
              </div>

              {/* Department Attendance */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Tỉ lệ đi làm theo phòng ban</h3>
                <div className="space-y-4">
                  {attendanceReport.departmentAttendance.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm">
                        <span>{dept.department}</span>
                        <span>{dept.attendance}% (Late: {dept.lateCount})</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${dept.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payroll Report */}
          {activeTab === 'payroll' && payrollReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Tổng quỹ lương</h3>
                  <p className="mt-2 text-3xl font-bold text-primary">{payrollReport.totalPayroll.toLocaleString()} VND</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Lương trung bình</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{payrollReport.averageSalary.toLocaleString()} VND</p>
                </div>
              </div>

              {/* Department Payroll */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Phân bố lương theo phòng ban</h3>
                <div className="space-y-4">
                  {payrollReport.departmentPayroll.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm">
                        <span>{dept.department}</span>
                        <span>{dept.average.toLocaleString()} VND</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${(dept.total / payrollReport.totalPayroll) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Leave Report */}
          {activeTab === 'leave' && leaveReport && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Tổng yêu cầu</h3>
                  <p className="mt-2 text-3xl font-bold text-primary">{leaveReport.totalLeaveRequests}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Đã duyệt</h3>
                  <p className="mt-2 text-3xl font-bold text-green-600">{leaveReport.approvedLeaves}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Đã từ chối</h3>
                  <p className="mt-2 text-3xl font-bold text-red-600">{leaveReport.rejectedLeaves}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-700">Đang chờ</h3>
                  <p className="mt-2 text-3xl font-bold text-yellow-600">{leaveReport.pendingLeaves}</p>
                </div>
              </div>

              {/* Leave Types */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Phân loại nghỉ phép</h3>
                <div className="space-y-4">
                  {leaveReport.leaveTypes.map((type) => (
                    <div key={type.type}>
                      <div className="flex justify-between text-sm">
                        <span>{type.type}</span>
                        <span>{type.count} ({type.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ width: `${type.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;