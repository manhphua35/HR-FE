import React, { useState, useEffect } from 'react';
import { AttendanceService, AttendanceStatus, type CreateAttendanceData, type AttendanceRecord } from '../../services/AttendanceService';
import { EmployeeService } from '../../services/EmployeeService';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance: AttendanceRecord;
}

const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  attendance 
}) => {
  const [date, setDate] = useState(attendance.date);
  const [checkInTime, setCheckInTime] = useState(attendance.checkInTime || '');
  const [checkOutTime, setCheckOutTime] = useState(attendance.checkOutTime || '');
  const [userId, setUserId] = useState(attendance.user.id);
  const [status, setStatus] = useState<AttendanceStatus>(attendance.status);
  const [notes, setNotes] = useState(attendance.notes || '');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    setDate(attendance.date);
    setCheckInTime(attendance.checkInTime || '');
    setCheckOutTime(attendance.checkOutTime || '');
    setUserId(attendance.user.id);
    setStatus(attendance.status);
    setNotes(attendance.notes || '');
  }, [attendance]);

  const fetchEmployees = async () => {
    try {
      const data = await EmployeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Không thể tải danh sách nhân viên');
    }
  };

  const calculateWorkHours = (checkIn: string, checkOut: string): number | null => {
    if (!checkIn || !checkOut) return null;
    const [checkInHour, checkInMinute] = checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = checkOut.split(':').map(Number);
    const hours = checkOutHour - checkInHour;
    const minutes = checkOutMinute - checkInMinute;
    return hours + minutes / 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const workHours = calculateWorkHours(checkInTime, checkOutTime);
      const attendanceData: Partial<CreateAttendanceData> = {
        userId: String(userId),
        date,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        status,
        workHours,
        notes: notes || null
      };

      await AttendanceService.updateAttendance(attendance.id, attendanceData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update attendance:', err);
      setError('Không thể cập nhật bản ghi chấm công');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sửa chấm công</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhân viên</label>
            <select
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Chọn nhân viên</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giờ check-in</label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Giờ check-out</label>
            <input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value={AttendanceStatus.PRESENT}>{AttendanceService.getStatusDisplay(AttendanceStatus.PRESENT)}</option>
              <option value={AttendanceStatus.LATE}>{AttendanceService.getStatusDisplay(AttendanceStatus.LATE)}</option>
              <option value={AttendanceStatus.ABSENT}>{AttendanceService.getStatusDisplay(AttendanceStatus.ABSENT)}</option>
              <option value={AttendanceStatus.LEAVE}>{AttendanceService.getStatusDisplay(AttendanceStatus.LEAVE)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAttendanceModal;