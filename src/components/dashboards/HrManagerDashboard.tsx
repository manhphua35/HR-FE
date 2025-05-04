import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { DashboardService } from '../../services/DashboardService';

const HrManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [componentLoading, setComponentLoading] = useState(true); // Renamed
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, currentUser, loading: authLoading } = useAuth(); // Get auth state + loading

  // Add authLoading, isAuthenticated, currentUser to dependency array
  useEffect(() => {
    const fetchData = async () => {
       // Wait for auth context to finish loading first
       if (authLoading) {
         setComponentLoading(true);
         return;
       }

       // Now check authentication
       if (!isAuthenticated) {
        setError("Not authenticated");
        setComponentLoading(false);
        return;
      }
      // Optional: Add role check if needed
      // if (!currentUser || currentUser.role !== 'HR_MANAGER') { ... }

      setComponentLoading(true); // Start component loading for data fetch
      setError(null); // Clear previous errors

      try {
        // Fetch only the HR stats data now
        const statsData = await DashboardService.getHrStats();
        // Assuming statsData contains all necessary info.
        // If activities are needed and provided differently, adjust here.
        setStats(statsData);
        // setActivities([]); // Clear or handle activities based on API response
        setComponentLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setComponentLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser]); // Ensure dependencies are correct

  // Show loading indicator while auth context is loading OR component is fetching data
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
              {/* TODO: Update this section based on how/if activities are returned by the getHrStats API */}
              {/* Placeholder if no activities data is available */}
              {(!stats || !stats.activities || stats.activities.length === 0) && (
                 <div className="p-4 text-gray-500">No recent updates available.</div>
              )}
              {/* Example: Assuming statsData might have an 'activities' array */}
              {/* {stats?.activities?.map((activity: any) => (
                <div key={activity.id} className="flex items-start">
                  ... render activity ...
                </div>
              ))} */}
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
