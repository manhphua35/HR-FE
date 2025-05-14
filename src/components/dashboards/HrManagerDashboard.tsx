import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardService, DashboardData } from '../../services/DashboardService';

const HrManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [componentLoading, setComponentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, currentUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
       if (authLoading) {
         setComponentLoading(true);
         return;
       }

       if (!isAuthenticated) {
        setError("Not authenticated");
        setComponentLoading(false);
        return;
      }

      setComponentLoading(true);
      setError(null);

      try {
        const dashboardData = await DashboardService.getHrStats();
        setStats(dashboardData);
        setComponentLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setComponentLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser, authLoading]);

  if (authLoading || componentLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Trang chủ Quản lý Nhân sự</h2> 
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số nhân viên</p>
              <h3 className="text-2xl font-bold">{stats.summary.totalEmployees}</h3>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-user-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đào tạo hiện tại</p>
              <h3 className="text-2xl font-bold">{stats.summary.ongoingTrainings}</h3>
              <p className="text-sm text-green-500">Khóa đang diễn ra</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nghỉ phép</p>
              <h3 className="text-2xl font-bold">{stats.summary.activeLeaves}</h3>
              <p className="text-sm text-yellow-500">Đang nghỉ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-star text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hiệu suất trung bình</p>
              <h3 className="text-2xl font-bold">{stats.summary.avgPerformance?.toFixed(2) || 0}</h3>
              <p className="text-sm text-purple-500">Toàn công ty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Thống kê theo phòng ban</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nghỉ phép
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đào tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hiệu suất
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.departments.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.employeeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.leaveCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.trainingCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept.avgPerformance?.toFixed(2) || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cost Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Tổng quan chi phí</h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tổng chi phí lương</h4>
            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.summary.totalSalary || 0)}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Chi phí theo phòng ban</h4>
            <div className="space-y-2">
              {stats.departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{dept.department}</span>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dept.totalSalary || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrManagerDashboard;
