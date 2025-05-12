import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardService, DashboardData } from '../../services/DashboardService';

const AdminDashboard: React.FC = () => {
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
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const statsData = await DashboardService.getDashboardData(currentMonth, currentYear);
        setStats(statsData);
        setComponentLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setComponentLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, currentUser]);

  if (authLoading || componentLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính tổng số phòng ban
  const totalDepartments = stats.departments.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Trang chủ Quản trị viên</h2> 
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-3">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng nhân viên</p>
              <h3 className="text-xl font-bold">{stats?.summary?.totalEmployees || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-3">
              <i className="fas fa-building text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phòng ban</p>
              <h3 className="text-xl font-bold">{totalDepartments || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hiệu suất TB</p>
              <h3 className="text-xl font-bold">{(stats?.summary?.avgPerformance || 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-3">
              <i className="fas fa-sign-out-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang nghỉ phép</p>
              <h3 className="text-xl font-bold">{stats?.summary?.activeLeaves || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-3">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang đào tạo</p>
              <h3 className="text-xl font-bold">{stats?.summary?.ongoingTrainings || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-3">
              <i className="fas fa-money-bill-wave text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng lương</p>
              <h3 className="text-xl font-bold">{formatCurrency(stats?.summary?.totalSalary || 0)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Thống kê theo phòng ban</h3>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phòng ban</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Số nhân viên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Đang nghỉ phép</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Đang đào tạo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Hiệu suất TB</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tổng lương</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(stats?.departments || []).map((dept) => (
                  <tr key={dept.department}>
                    <td className="px-4 py-3 text-sm text-gray-900">{dept.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{dept.employeeCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{dept.leaveCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{dept.trainingCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(dept.avgPerformance || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(dept.totalSalary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lương theo phòng ban */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Lương theo phòng ban</h3>
          <div className="space-y-4">
            {(stats?.departments || []).map((dept) => {
              const totalSalary = stats.departments.reduce((sum, d) => 
                sum + (d.totalSalary || 0), 0);
                
              return (
                <div key={dept.department} className="flex items-center">
                  <span className="w-48 text-sm">{dept.department}</span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 rounded-full h-2" 
                        style={{ 
                          width: `${totalSalary > 0 
                            ? ((dept.totalSalary || 0) / totalSalary) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium">{formatCurrency(dept.totalSalary)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hiệu suất theo phòng ban */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Hiệu suất theo phòng ban</h3>
          <div className="space-y-4">
            {(stats?.departments || []).map((dept) => {
              const maxPerformance = Math.max(...(stats?.departments || [])
                .map(d => d.avgPerformance || 0));
              return (
                <div key={dept.department} className="flex items-center">
                  <span className="w-48 text-sm">{dept.department}</span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 rounded-full h-2" 
                        style={{ 
                          width: `${maxPerformance > 0 
                            ? ((dept.avgPerformance || 0) / maxPerformance) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium">{(dept.avgPerformance || 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nhân viên theo phòng ban */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Nhân viên theo phòng ban</h3>
        <div className="space-y-4">
          {(stats?.departments || []).map((dept) => (
            <div key={dept.department} className="flex items-center">
              <span className="w-48 text-sm">{dept.department}</span>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 rounded-full h-2" 
                    style={{ 
                      width: `${(stats?.summary?.totalEmployees || 0) > 0
                        ? (dept.employeeCount / (stats.summary.totalEmployees || 1)) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-sm font-medium">{dept.employeeCount} nhân viên</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
