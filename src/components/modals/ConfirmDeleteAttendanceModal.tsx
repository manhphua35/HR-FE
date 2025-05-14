import React from 'react';
import { AttendanceRecord } from '../../services/AttendanceService';
import ConfirmDeleteModal from './ConfirmDeleteModal';

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
  const formatStatus = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Có mặt';
      case 'ABSENT': return 'Vắng mặt';
      case 'LATE': return 'Đi muộn';
      case 'LEAVE': return 'Nghỉ phép';
      default: return status;
    }
  };

  const title = "Xác nhận xóa bản ghi chấm công";
  
  const message = `
    Bạn có chắc chắn muốn xóa bản ghi chấm công này?
    
    Nhân viên: ${attendance.user?.fullName || 'N/A'}
    Ngày: ${attendance.date || 'N/A'}
    Trạng thái: ${formatStatus(attendance.status)}
    
    Hành động này không thể hoàn tác.
  `;

  const wrappedOnConfirm = async () => {
    if (isLoading) return;
    await onConfirm();
  };

  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={wrappedOnConfirm}
      title={title}
      message={message}
    />
  );
};

export default ConfirmDeleteAttendanceModal;