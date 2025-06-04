import React, { useEffect, useState } from 'react';
import {
  DashboardService,
  DepartmentStats,
} from '../../services/DashboardService';
import DepartmentEmployees from './DepartmentEmployees';

interface DepartmentManagerDashboardProps {
  departmentId?: string;
}

const DepartmentManagerDashboard: React.FC<DepartmentManagerDashboardProps> = ({
  departmentId,
}) => {
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!departmentId) {
        setError('Department ID is required');
        setLoading(false);
        return;
      }

      try {
        const statsData = await DashboardService.getDepartmentStats(
          departmentId
        );
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch department dashboard data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">
        Trang chủ Quản lý Phòng ban
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nhân viên</p>
              <h3 className="text-2xl font-bold">{stats.employeeCount}</h3>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-tasks text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dự án đang hoạt động</p>
              <h3 className="text-2xl font-bold">{stats.activeProjects}</h3>
              <p className="text-sm text-green-500">Đang tiến hành</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn nghỉ phép</p>
              <h3 className="text-2xl font-bold">
                {stats.pendingLeaveRequests}
              </h3>
              <p className="text-sm text-yellow-500">Đang chờ duyệt</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hiệu suất phòng ban</p>
              <h3 className="text-2xl font-bold">
                {stats.averagePerformance}%
              </h3>
              <p className="text-sm text-purple-500">Đánh giá trung bình</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Tổng quan nhóm
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Chấm công hôm nay
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (stats.attendance.present /
                              stats.attendance.total) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {stats.attendance.present}/{stats.attendance.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hoàn thành kế hoạch</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${stats.projectCompletion}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {stats.projectCompletion}%
                    </span>
                  </div>
                </div>
              </div> */}

              {/* <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tiến độ đào tạo
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${stats.trainingProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {stats.trainingProgress}%
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách nhân viên trong phòng ban */}
      <div className="mt-6">
        <DepartmentEmployees departmentId={departmentId} />
      </div>
    </div>
  );
};

export default DepartmentManagerDashboard;
