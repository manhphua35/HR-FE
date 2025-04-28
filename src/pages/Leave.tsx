import React, { useState, useEffect } from 'react';
import { LeaveService, Leave, LeaveSummary } from '../services/LeaveService';
import CreateLeaveRequestModal from '../components/modals/CreateLeaveRequestModal';
import { useAuth } from '../contexts/AuthContext';

const LeavePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [leavesData, summaryData] = await Promise.all([
        LeaveService.getLeaveRequests(),
        LeaveService.getLeaveSummary()
      ]);
      setLeaves(leavesData);
      setSummary(summaryData);
      setError("");
    } catch (err) {
      setError("Failed to fetch leave data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (data: any) => {
    try {
      await LeaveService.createLeaveRequest(data);
      setIsCreateModalOpen(false);
      fetchLeaveData();
    } catch (err) {
      setError("Failed to create leave request");
      console.error(err);
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      await LeaveService.approveLeaveRequest(id);
      fetchLeaveData();
    } catch (err) {
      setError("Failed to approve leave request");
      console.error(err);
    }
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await LeaveService.rejectLeaveRequest(id);
      fetchLeaveData();
    } catch (err) {
      setError("Failed to reject leave request");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const isManager = currentUser?.role === 'department_manager' || currentUser?.role === 'hr_manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leave Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Leave Request
        </button>
      </div>

      {/* Leave Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className="fas fa-calendar text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <h3 className="text-2xl font-bold">{summary.totalRequests}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="text-2xl font-bold">{summary.pendingRequests}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i className="fas fa-check text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <h3 className="text-2xl font-bold">{summary.approvedRequests}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <i className="fas fa-times text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <h3 className="text-2xl font-bold">{summary.rejectedRequests}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Balance */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Leave Balance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Annual Leave</p>
              <p className="text-2xl font-bold text-blue-600">{summary.leaveBalance.annual} days</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Sick Leave</p>
              <p className="text-2xl font-bold text-blue-600">{summary.leaveBalance.sick} days</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Unpaid Leave</p>
              <p className="text-2xl font-bold text-blue-600">{summary.leaveBalance.unpaid} days</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={leave.employeeAvatar} alt="" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{leave.employeeName}</div>
                        <div className="text-sm text-gray-500">{leave.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{leave.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {leave.startDate} - {leave.endDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        leave.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isManager && leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateLeaveRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLeave}
      />
    </div>
  );
};

export default LeavePage;