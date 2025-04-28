import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          DashboardService.getAdminStats(),
          DashboardService.getRecentActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <h3 className="text-2xl font-bold">{stats.totalEmployees}</h3>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-building text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <h3 className="text-2xl font-bold">{stats.departmentsCount}</h3>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Performance</p>
              <h3 className="text-2xl font-bold">{stats.averagePerformance}%</h3>
              <p className="text-sm text-green-500">
                Overall Company Performance
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <i className="fas fa-exclamation-circle text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Issues</p>
              <h3 className="text-2xl font-bold">{stats.issuesCount}</h3>
              <p className="text-sm text-red-500">High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full bg-${activity.type}-500 flex items-center justify-center text-white`}>
                    <i className={`fas fa-${getActivityIcon(activity.type)} text-sm`}></i>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get icon based on activity type
const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'user':
      return 'user-plus';
    case 'document':
      return 'file-alt';
    case 'calendar':
      return 'calendar-alt';
    case 'notification':
      return 'bell';
    default:
      return 'info-circle';
  }
};

export default AdminDashboard;
