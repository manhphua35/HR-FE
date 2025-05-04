import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';

interface EmployeeDashboardProps {
  userId: string;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState<any>(null);
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
        const statsData = await DashboardService.getEmployeeStats(userId);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Trang chủ Nhân viên</h2> 
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Working Hours</p>
              <h3 className="text-2xl font-bold">{stats.workingHours}h</h3>
              <p className="text-sm text-gray-500">This Month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <h3 className="text-2xl font-bold">{stats.attendanceRate}%</h3>
              <p className="text-sm text-green-500">
                {stats.attendanceRate >= 95 ? 'Excellent' : 'Good'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-star text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Performance Score</p>
              <h3 className="text-2xl font-bold">{stats.performanceScore}%</h3>
              <p className="text-sm text-purple-500">Last Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i className="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Leave Balance</p>
              <h3 className="text-2xl font-bold">{stats.leaveBalance}</h3>
              <p className="text-sm text-yellow-500">Days Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">My Schedule</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {stats.schedule.map((event: any) => (
                <li key={event.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${getEventColor(event.type)}-100 text-${getEventColor(event.type)}-800`}>
                      {event.type}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full bg-${getActivityColor(activity.type)}-500 flex items-center justify-center text-white`}>
                      <i className={`fas fa-${getActivityIcon(activity.type)} text-sm`}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <i className="fas fa-clock text-2xl text-blue-500 mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Clock In/Out</p>
          </button>
          <button className="p-4 text-center rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <i className="fas fa-calendar-plus text-2xl text-blue-500 mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Request Leave</p>
          </button>
          <button className="p-4 text-center rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <i className="fas fa-file-alt text-2xl text-blue-500 mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Submit Report</p>
          </button>
          <button className="p-4 text-center rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <i className="fas fa-question-circle text-2xl text-blue-500 mb-2"></i>
            <p className="text-sm font-medium text-gray-700">Get Help</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get event color
const getEventColor = (type: string): string => {
  switch (type) {
    case 'meeting':
      return 'blue';
    case 'deadline':
      return 'yellow';
    case 'review':
      return 'purple';
    default:
      return 'gray';
  }
};

// Helper function to get activity color
const getActivityColor = (type: string): string => {
  switch (type) {
    case 'attendance':
      return 'green';
    case 'project':
      return 'blue';
    case 'document':
      return 'yellow';
    default:
      return 'gray';
  }
};

// Helper function to get activity icon
const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'attendance':
      return 'clock';
    case 'project':
      return 'tasks';
    case 'document':
      return 'file-alt';
    default:
      return 'circle';
  }
};

export default EmployeeDashboard;