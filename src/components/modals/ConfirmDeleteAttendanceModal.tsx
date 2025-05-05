import React from 'react';
import { AttendanceRecord } from '../../services/AttendanceService';

interface ConfirmDeleteAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  attendance: AttendanceRecord;
  isLoading: boolean;
}

const ConfirmDeleteAttendanceModal: React.FC<ConfirmDeleteAttendanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  attendance,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              Bạn có chắc chắn muốn xóa bản ghi chấm công này?
            </p>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Nhân viên:</strong> {attendance.user.fullName}</p>
              <p><strong>Ngày:</strong> {attendance.date}</p>
              <p><strong>Trạng thái:</strong> {attendance.status}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              {isLoading ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteAttendanceModal;