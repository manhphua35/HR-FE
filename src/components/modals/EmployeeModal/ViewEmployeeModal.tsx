import React from 'react';
import { Employee } from '../../../services/EmployeeService'; // Import interface Employee

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: Employee | null; // Dữ liệu nhân viên cần xem
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  isOpen,
  onClose,
  employeeData,
}) => {
  if (!isOpen || !employeeData) return null;

  // Helper function để hiển thị giá trị hoặc 'N/A'
  const displayValue = (value: string | number | undefined | null) =>
    value || 'Chưa có';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-5">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi tiết nhân viên
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <i className="fas fa-times w-5 h-5"></i>
            <span className="sr-only">Đóng modal</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={employeeData.avatar || '/logo192.png'}
              alt={employeeData.fullName}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {/* Thông tin cơ bản */}
            <div className="sm:col-span-2">
              <strong className="text-gray-600">Tên đăng nhập:</strong>{' '}
              {displayValue(employeeData.username)}
            </div>
            <div className="sm:col-span-2">
              <strong className="text-gray-600">Họ và tên:</strong>{' '}
              {displayValue(employeeData.fullName)}
            </div>
            <div className="sm:col-span-2">
              <strong className="text-gray-600">Email:</strong>{' '}
              {displayValue(employeeData.email)}
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <strong className="text-gray-600">Điện thoại:</strong>{' '}
              {displayValue(employeeData.phone)}
            </div>
            <div>
              <strong className="text-gray-600">Địa chỉ:</strong>{' '}
              {displayValue(employeeData.address)}
            </div>

            {/* Thông tin công việc */}
            <div>
              <strong className="text-gray-600">Phòng ban:</strong>{' '}
              {displayValue(employeeData.department?.name)}
            </div>
            {/* @ts-ignore */}
            <div>
              <strong className="text-gray-600">Vai trò:</strong>{' '}
              {displayValue(employeeData.role?.name)}
            </div>
            <div className="sm:col-span-2">
              <strong className="text-gray-600">Mô tả vai trò:</strong>{' '}
              {displayValue(employeeData.description)}
            </div>

            {/* Thông tin ngày tháng */}
            <div>
              <strong className="text-gray-600">Ngày vào làm:</strong>{' '}
              {displayValue(employeeData.hireDate?.split('T')[0])}
            </div>
            <div>
              <strong className="text-gray-600">Ngày nghỉ việc:</strong>{' '}
              {displayValue(employeeData.resignationDate?.split('T')[0])}
            </div>

            {/* Thông tin lương và nghỉ phép */}
            <div>
              <strong className="text-gray-600">Lương cơ bản:</strong>{' '}
              {employeeData.baseSalary
                ? `${employeeData.baseSalary.toLocaleString()} VND`
                : 'Chưa có'}
            </div>
            <div>
              <strong className="text-gray-600">Số ngày nghỉ còn lại:</strong>{' '}
              {displayValue(employeeData.remainingLeaves)}
            </div>

            {/* Trạng thái */}
            <div>
              <strong className="text-gray-600">Trạng thái:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  employeeData.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {employeeData.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>

            {/* Thông tin hệ thống */}
            <div>
              <strong className="text-gray-600">Ngày tạo:</strong>{' '}
              {employeeData.createdAt
                ? new Date(employeeData.createdAt).toLocaleDateString('vi-VN')
                : 'Chưa có'}
            </div>
            <div>
              <strong className="text-gray-600">Cập nhật lần cuối:</strong>{' '}
              {employeeData.updatedAt
                ? new Date(employeeData.updatedAt).toLocaleDateString('vi-VN')
                : 'Chưa có'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-5 border-t mt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 focus:z-10"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
