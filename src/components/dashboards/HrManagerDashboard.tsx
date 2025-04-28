import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';

const HrManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          DashboardService.getHrStats(),
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
      <h2 className="text-2xl font-bold text-gray-800 mb-5">HR Manager Dashboard</h2>
      
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
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-user-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Attendance Today</p>
              <h3 className="text-2xl font-bold">{stats.attendanceRate}%</h3>
              <p className="text-sm text-green-500">Present</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Leave Requests</p>
              <h3 className="text-2xl font-bold">{stats.leaveRequests}</h3>
              <p className="text-sm text-yellow-500">Pending Approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-clipboard-list text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Positions</p>
              <h3 className="text-2xl font-bold">{stats.openPositions}</h3>
              <p className="text-sm text-purple-500">Active Recruitment</p>
            </div>
          </div>
        </div>
      </div>

      {/* HR Tasks and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Pending Tasks</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {stats.leaveRequests > 0 && (
                <li className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Review Leave Requests</p>
                    <p className="text-sm text-gray-500">{stats.leaveRequests} requests pending</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    High Priority
                  </span>
                </li>
              )}
              <li className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">Performance Reviews</p>
                  <p className="text-sm text-gray-500">Q2 reviews due next week</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  Upcoming
                </span>
              </li>
              <li className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">Update HR Policies</p>
                  <p className="text-sm text-gray-500">Annual policy review</p>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  Scheduled
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Updates</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
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
              ))}
            </div>
          </div>
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

export default HrManagerDashboard;
