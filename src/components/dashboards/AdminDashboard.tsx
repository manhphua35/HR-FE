import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { DashboardService, DashboardData } from '../../services/DashboardService'; // Import kiểu dữ liệu mới

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardData | null>(null); // Sử dụng kiểu DashboardData
  const [componentLoading, setComponentLoading] = useState(true); // Renamed to avoid conflict
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, currentUser, loading: authLoading } = useAuth(); // Get auth state including loading

  // Add authLoading, isAuthenticated, currentUser to dependency array
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth context to finish loading first
      if (authLoading) {
        setComponentLoading(true); // Keep component loading while auth is loading
        return;
      }

      // Now check authentication
      if (!isAuthenticated) {
        setError("Not authenticated"); // Set error if not authenticated after auth check
        setComponentLoading(false);
        return;
      }
      // Optional: Add role check if needed
      // if (!currentUser || currentUser.role !== 'ADMIN') {
      //   setError("Permission Denied");
      //   setLoading(false);
      //   return;
      // }

      setComponentLoading(true); // Start component loading for data fetch
      setError(null); // Clear previous errors

      try {
        // Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
        const currentYear = currentDate.getFullYear();

        // Fetch dashboard data for the current month and year
        const statsData = await DashboardService.getDashboardData(currentMonth, currentYear);
        // Assuming statsData contains all necessary info, including potential activities if the API provides them
        // If activities are separate or structured differently in the response, adjust here
        setStats(statsData);
        // setActivities([]); // Clear or handle activities based on the new API response structure
        setComponentLoading(false);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        setComponentLoading(false);
      }
    };

    fetchData();
    // Add dependencies: useEffect runs when these change
  }, [authLoading, isAuthenticated, currentUser]);

  // Show loading indicator while auth context is loading OR component is fetching data
  if (authLoading || componentLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Trang chủ Quản trị viên</h2> 
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              {/* Truy cập qua stats.overview */}
              <h3 className="text-2xl font-bold">{stats?.overview?.totalEmployees ?? 'N/A'}</h3>
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
              {/* Truy cập qua stats.overview và sử dụng totalDepartments */}
              <h3 className="text-2xl font-bold">{stats?.overview?.totalDepartments ?? 'N/A'}</h3>
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
              {/* Truy cập qua stats.overview */}
              <h3 className="text-2xl font-bold">{stats?.overview?.averagePerformance ?? 'N/A'}%</h3>
              <p className="text-sm text-green-500">
                Overall Company Performance
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4"> {/* Thay đổi màu sắc */}
              <i className="fas fa-calendar-times text-xl"></i> {/* Thay đổi icon */}
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Leaves</p> {/* Thay thế Issues bằng Active Leaves */}
              {/* Truy cập qua stats.overview */}
              <h3 className="text-2xl font-bold">{stats?.overview?.activeLeaves ?? 'N/A'}</h3>
              <p className="text-sm text-yellow-500">Currently On Leave</p> {/* Thay đổi mô tả */}
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
          {/* TODO: Update this section based on how/if activities are returned by the new API */}
          {/* Example: Assuming statsData might have an 'activities' array */}
          {/* {stats?.activities?.map((activity: any) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition">
              ... render activity ...
            </div>
          {/* API response không có 'activities', giữ nguyên placeholder */}
          {/* {stats?.activities?.map((activity: any) => ( ... ))} */}
          <div className="p-4 text-gray-500">No recent activities available in this data.</div>
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
