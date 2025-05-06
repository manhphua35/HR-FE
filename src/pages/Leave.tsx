import React, { useState, useEffect } from 'react';
import { LeaveService, LeaveRequest } from '../services/LeaveService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import CreateLeaveModal from '../components/modals/CreateLeaveModal';

const Leave: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role?.roleType === 'SYSTEM_ADMIN' || currentUser?.role?.roleType === 'HR_MANAGER';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [type, setType] = useState<'ALL' | 'ANNUAL' | 'SICK' | 'OTHER'>('ALL');

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, startDate, endDate, status, type]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      let data: LeaveRequest[];

      if (isAdmin) {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (status !== 'ALL') params.status = status;
        if (type !== 'ALL') params.type = type;
        
        data = await LeaveService.getAllLeaves(params);
      } else {
        data = await LeaveService.getMyLeaves();
      }

      // Sort by createdAt in descending order
      const sortedData = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLeaves(sortedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setError('Không thể tải dữ liệu nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeave = async (id: any) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn nghỉ phép này?')) return;

    try {
      await LeaveService.deleteLeave(Number(id));
      await fetchLeaves();
    } catch (err) {
      console.error('Failed to delete leave:', err);
      setError('Không thể xóa đơn nghỉ phép');
    }
  };

  const handleApproveLeave = async (id: any) => {
    try {
      await LeaveService.approveLeave(Number(id));
      await fetchLeaves();
    } catch (err) {
      console.error('Failed to approve leave:', err);
      setError('Không thể duyệt đơn nghỉ phép');
    }
  };

  const handleRejectLeave = async (id: any) => {
    try {
      await LeaveService.rejectLeave(Number(id));
      await fetchLeaves();
    } catch (err) {
      console.error('Failed to reject leave:', err);
      setError('Không thể từ chối đơn nghỉ phép');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ANNUAL': return 'Nghỉ phép năm';
      case 'SICK': return 'Nghỉ ốm';
      case 'OTHER': return 'Khác';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nghỉ phép</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Tạo đơn nghỉ phép
        </button>
      </div>

      <CreateLeaveModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          try {
            await LeaveService.createLeave(data);
            await fetchLeaves();
            setShowCreateModal(false);
          } catch (err) {
            console.error('Failed to create leave:', err);
            throw err;
          }
        }}
      />

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-700">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Đang chờ</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nghỉ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Tất cả</option>
                <option value="ANNUAL">Nghỉ phép năm</option>
                <option value="SICK">Nghỉ ốm</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4">Nhân viên</th>
                <th scope="col" className="px-6 py-4">Loại nghỉ</th>
                <th scope="col" className="px-6 py-4">Thời gian</th>
                <th scope="col" className="px-6 py-4">Số ngày</th>
                <th scope="col" className="px-6 py-4">Lý do</th>
                <th scope="col" className="px-6 py-4">Trạng thái</th>
                <th scope="col" className="px-6 py-4">Người duyệt</th>
                {isAdmin && <th scope="col" className="px-6 py-4">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leave.user.fullName)}&background=random`}
                          alt={leave.user.fullName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.user.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTypeLabel(leave.type)}</td>
                  <td className="px-6 py-4">
                    {format(new Date(leave.startDate), 'dd/MM/yyyy')} - {format(new Date(leave.endDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4">{leave.numberOfDays}</td>
                  <td className="px-6 py-4">{leave.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status === 'PENDING' && 'Đang chờ'}
                      {leave.status === 'APPROVED' && 'Đã duyệt'}
                      {leave.status === 'REJECTED' && 'Từ chối'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {leave.approver?.fullName || '-'}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {leave.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveLeave(leave.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleRejectLeave(leave.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Từ chối"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteLeave(leave.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaves.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
};

export default Leave;