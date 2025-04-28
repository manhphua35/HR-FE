import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services/DashboardService';

interface DepartmentManagerDashboardProps {
  department?: string;
}

const DepartmentManagerDashboard: React.FC<DepartmentManagerDashboardProps> = ({ department }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!department) {
        setError('Department ID is required');
        setLoading(false);
        return;
      }

      try {
        const statsData = await DashboardService.getDepartmentStats(department);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch department dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [department]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return <div className="p-4">No data available</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-5">
        {department || 'Department'} Manager Dashboard
      </h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department Staff</p>
              <h3 className="text-2xl font-bold">{stats.employeeCount}</h3>
              <p className="text-sm text-gray-500">Active Members</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i className="fas fa-tasks text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <h3 className="text-2xl font-bold">{stats.activeProjects}</h3>
              <p className="text-sm text-green-500">On Track</p>
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
              <h3 className="text-2xl font-bold">{stats.pendingLeaveRequests}</h3>
              <p className="text-sm text-yellow-500">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-500">Performance</p>
              <h3 className="text-2xl font-bold">{stats.averagePerformance}%</h3>
              <p className="text-sm text-purple-500">Department Average</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Overview and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Team Overview</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Present Today</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(stats.attendance.present / stats.attendance.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                      {stats.attendance.present}/{stats.attendance.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Project Completion</p>
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
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Training Progress</p>
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
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h3>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {stats.pendingLeaveRequests > 0 && (
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Review Leave Requests</p>
                      <p className="text-sm text-gray-500">{stats.pendingLeaveRequests} pending requests</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      High Priority
                    </span>
                  </div>
                </li>
              )}
              <li className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                    <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Scheduled
                  </span>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Project Deadline</p>
                    <p className="text-sm text-gray-500">Project X due in 2 weeks</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Upcoming
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagerDashboard;