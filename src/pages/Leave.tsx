import React, { useState, useEffect } from 'react';
import { LeaveService } from '../services/LeaveService';
import CreateLeaveRequestModal from '../components/modals/CreateLeaveRequestModal';
import { useAuth } from '../contexts/AuthContext';

// Temporary interface definition to match backend expectations
interface CreateLeaveRequestData {
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
  numberOfDays: number;
}

const LeavePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  // Check if user is HR staff based on current roleType
  const isHrStaff = currentUser?.role?.roleType === 'HR_MANAGER';

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Get user leave requests from API
      const leavesData = await LeaveService.getLeaveRequests();
      setLeaves(leavesData);
      
      // // This API endpoint might not exist yet in the backend - you may need to implement it
      // try {
      //   // const summaryData = await LeaveService.getLeaveSummary(); // Endpoint not available
      //   // setSummary(summaryData);
      // } catch (err) {
      //   // console.warn("Leave summary endpoint not available");
      // }
      
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
      // Ensure proper calculation of number of days
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
      
      // Create leave request with needed data
      const leaveData: CreateLeaveRequestData = {
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        reason: data.reason,
        numberOfDays: diffDays
      };
      
      // @ts-ignore - Ignore type mismatch with original LeaveService interface
      await LeaveService.createLeaveRequest(leaveData);
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

  const openRejectionModal = (id: number) => {
    setSelectedLeaveId(id);
    setShowRejectionModal(true);
  };

  const handleRejectLeave = async () => {
    if (!selectedLeaveId || !rejectionReason) return;
    
    try {
      await LeaveService.rejectLeaveRequest(selectedLeaveId, rejectionReason);
      setShowRejectionModal(false);
      setRejectionReason("");
      setSelectedLeaveId(null);
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

      {/* Leave Summary Cards - Commented out as summary endpoint is not available */}
      {/* {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ... summary cards ...
        </div>
      )} */}

      {/* Leave Balance - Commented out as summary endpoint is not available */}
      {/* {summary && summary.leaveBalance && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          ... leave balance ...
        </div>
      )} */}

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">My Leave Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                {isHrStaff && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{String(leave.type).toLowerCase()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{leave.numberOfDays}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${String(leave.status).toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        String(leave.status).toUpperCase() === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {String(leave.status).toLowerCase()}
                    </span>
                    {leave.rejectionReason && (
                      <div className="text-xs text-red-500 mt-1">
                        {leave.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{leave.reason || '-'}</span>
                  </td>
                  {isHrStaff && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {String(leave.status).toUpperCase() === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveLeave(leave.id)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectionModal(leave.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  )}
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

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-4">Reject Leave Request</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (Required)
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setSelectedLeaveId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-300"
                disabled={!rejectionReason.trim()}
                onClick={handleRejectLeave}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavePage;