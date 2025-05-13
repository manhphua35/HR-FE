import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';
// import { IEmployeeDashboardData, ITrainingCourse } from '../../services/DashboardService'; // Remove incorrect import

// Define necessary types directly in the component file
interface IEmployeeProfile {
    id: number;
    fullName: string;
    email: string;
    department?: string;
    position?: string;
}

interface IAttendanceSummary {
    totalWorkDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
}

interface ILeaveSummary {
    used: number;
    remaining: number;
    pending: number;
}

interface IPayrollSummary {
    month: number;
    year: number;
    basicSalary: string; // API returns string, handle conversion if needed
    totalAllowance: string;
    totalDeduction: string;
    netSalary: string;
}

interface ITrainingCourse {
    id: number;
    name: string;
    startDate: string | Date; // API might return string or Date
    endDate: string | Date;
    progress: number;
}

interface IPerformanceSummary {
    period: string;
    overallScore: string; // API returns string
    strengths: string[];
    improvements: string[];
}

interface IEmployeeDashboardData {
    employee: IEmployeeProfile;
    attendance: IAttendanceSummary;
    leaves: ILeaveSummary;
    payroll: IPayrollSummary | null;
    training: ITrainingCourse[];
    performance: IPerformanceSummary | null;
}

interface EmployeeDashboardProps {
  userId: string;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ userId }) => {
  const [data, setData] = useState<IEmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        // DashboardService.getEmployeeStats should return the IEmployeeDashboardData structure
        const dashboardData = await DashboardService.getEmployeeStats(userId) as unknown as IEmployeeDashboardData;
        setData(dashboardData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee dashboard data');
        console.error(err); // Log the error for debugging
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!data) return <div className="p-4">No data available</div>;

  const { employee, attendance, leaves, payroll, training, performance } = data;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Trang chủ Nhân viên</h2> 
      
      {/* Employee Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
          <p><strong>Tên:</strong> {employee.fullName}</p>
          <p><strong>Email:</strong> {employee.email}</p>
          <p><strong>Phòng ban:</strong> {employee.department || 'N/A'}</p>
          <p><strong>Chức vụ:</strong> {employee.position || 'N/A'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Attendance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chấm công (tháng)</p>
              <h3 className="text-2xl font-bold">{attendance.presentDays}/{attendance.totalWorkDays}</h3>
              <p className="text-sm text-gray-500">Có mặt / Tổng ngày làm</p>
              <p className="text-xs text-yellow-500 mt-1">Đi muộn: {attendance.lateDays} ngày</p>
              <p className="text-xs text-red-500">Vắng: {attendance.absentDays} ngày</p>
            </div>
          </div>
        </div>

        {/* Leave Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nghỉ phép</p>
              <h3 className="text-2xl font-bold">{leaves.remaining}</h3>
              <p className="text-sm text-gray-500">Ngày còn lại</p>
              <p className="text-xs text-blue-500 mt-1">Đã dùng: {leaves.used} ngày</p>
              <p className="text-xs text-orange-500">Chờ duyệt: {leaves.pending} đơn</p>
            </div>
          </div>
        </div>

        {/* Payroll Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-money-bill-wave text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lương (tháng {payroll?.month}/{payroll?.year})</p>
              {payroll ? (
                <>
                  <h3 className="text-2xl font-bold">{Number(payroll.netSalary).toLocaleString('vi-VN')}</h3>
                  <p className="text-sm text-gray-500">Lương thực nhận</p>
                </>
              ) : (
                <p className="text-gray-500">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i className="fas fa-star text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hiệu suất ({performance?.period || 'N/A'})</p>
              {performance ? (
                 <h3 className="text-2xl font-bold">{performance.overallScore}</h3>
              ) : (
                <p className="text-gray-500">Chưa có đánh giá</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Training Courses & Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Training Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Khóa đào tạo đang tham gia</h3>
          </div>
          <div className="p-6">
            {training && training.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                {training.map((course: ITrainingCourse) => (
                    <li key={course.id} className="py-3">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-sm font-medium text-gray-900">{course.name}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                        </p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">{course.progress}%</span>
                    </div>
                    {/* Optional: Add a progress bar */}
                     <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                     </div>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-gray-500">Không có khóa đào tạo nào đang diễn ra.</p>
            )}
          </div>
        </div>

        {/* Performance Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết hiệu suất ({performance?.period || 'N/A'})</h3>
          </div>
          <div className="p-6">
            {performance ? (
                <div>
                    <h4 className="font-semibold text-green-600">Điểm mạnh:</h4>
                    <ul className="list-disc list-inside text-gray-700 mb-3">
                        {performance.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                    <h4 className="font-semibold text-red-600">Cần cải thiện:</h4>
                     <ul className="list-disc list-inside text-gray-700">
                        {performance.improvements.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                    </ul>
                </div>
            ) : (
                <p className="text-gray-500">Chưa có đánh giá chi tiết.</p>
            )}
            
          </div>
        </div>
      </div>

      {/* Quick Actions (Optional - giữ lại nếu vẫn cần) */}
      {/* ... (Phần Quick Actions giữ nguyên nếu bạn muốn) ... */}
    </div>
  );
};

export default EmployeeDashboard;