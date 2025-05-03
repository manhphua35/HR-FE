import React, { useState, useEffect } from 'react';
// Import Employee và CreateEmployeePayload (có thể cần UpdateEmployeePayload riêng?)
import { EmployeeService, Employee, CreateEmployeePayload } from '../../services/EmployeeService'; 

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeData: Employee | null; // Dữ liệu nhân viên cần sửa
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onSuccess, employeeData }) => {
  // State cho các trường input - sẽ được điền từ employeeData
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); // Mật khẩu thường không hiển thị/sửa trực tiếp
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  // Đổi state để lưu ID
  const [positionId, setPositionId] = useState(''); // UUID là string
  const [departmentId, setDepartmentId] = useState<number | string>(''); // Lưu string từ input, parse sau
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState(''); 
  const [roleId, setRoleId] = useState<number | string>(''); 
  const [avatar, setAvatar] = useState(''); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect để điền dữ liệu khi modal mở hoặc employeeData thay đổi
  useEffect(() => {
    if (employeeData) {
      setUsername(employeeData.username || '');
      setFullName(employeeData.fullName || '');
      setEmail(employeeData.email || '');
      // Sửa lỗi: Gán ID vào state mới
      setPositionId(employeeData.position?.id || '');
      setDepartmentId(employeeData.department?.id || ''); // Gán ID (number) hoặc ''
      setPhone(employeeData.phone || '');
      // Định dạng lại ngày tháng nếu cần
      setHireDate(employeeData.hireDate ? employeeData.hireDate.split('T')[0] : ''); 
      setStatus(employeeData.status || '');
      setRoleId(employeeData.roleId || '');
      setAvatar(employeeData.avatar || '');
      setPassword(''); // Không điền mật khẩu cũ
    }
  }, [employeeData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeData) return; // Không có dữ liệu để sửa

    setIsLoading(true);
    setError(null);

    // Tạo payload - Lưu ý: chỉ gửi các trường cần cập nhật
    // Có thể cần interface UpdateEmployeePayload riêng
    const updatedData: Partial<CreateEmployeePayload> = {
      username,
      // Chỉ gửi password nếu người dùng nhập giá trị mới
      ...(password && { password }), 
      fullName,
      email,
      // Sửa payload để gửi ID
      positionId: positionId || null,
      departmentId: typeof departmentId === 'string' ? parseInt(departmentId, 10) : (departmentId || null),
      phone: phone || null,
      status,
      avatar: avatar || null,
      roleId: typeof roleId === 'string' ? parseInt(roleId, 10) : roleId,
      hireDate,
    };

    // Validate roleId và departmentId
     if (updatedData.roleId !== undefined && isNaN(updatedData.roleId as number)) {
       setError("Role ID không hợp lệ.");
       setIsLoading(false);
       return;
     }
     if (updatedData.departmentId !== null && updatedData.departmentId !== undefined && isNaN(updatedData.departmentId)) {
        setError("Department ID không hợp lệ.");
        setIsLoading(false);
        return;
     }
     // Có thể thêm validate cho positionId (UUID format) nếu cần

    try {
      await EmployeeService.updateEmployee(employeeData.id, updatedData);
      onSuccess(); // Gọi callback thành công
    } catch (err) {
      setError(`Cập nhật thất bại: ${err instanceof Error ? err.message : String(err)}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl p-5">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin nhân viên</h3>
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
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-400 text-sm p-3 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label htmlFor="edit-username" className="block mb-2 text-sm font-medium text-gray-900">Tên đăng nhập</label>
              <input
                type="text"
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
             {/* Password */}
             <div>
              <label htmlFor="edit-password" className="block mb-2 text-sm font-medium text-gray-900">Mật khẩu mới (để trống nếu không đổi)</label>
              <input
                type="password"
                id="edit-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            {/* Full Name */}
            <div>
              <label htmlFor="edit-fullName" className="block mb-2 text-sm font-medium text-gray-900">Họ và tên</label>
              <input
                type="text"
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="edit-email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
              <input
                type="email"
                id="edit-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Position ID (Tạm thời nhập text) */}
            <div>
              <label htmlFor="edit-positionId" className="block mb-2 text-sm font-medium text-gray-900">Position ID (UUID)</label>
              <input
                type="text"
                id="edit-positionId"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập Position ID (UUID)"
                // required // Tạm bỏ required
              />
            </div>
            {/* Department ID (Tạm thời nhập text) */}
            <div>
              <label htmlFor="edit-departmentId" className="block mb-2 text-sm font-medium text-gray-900">Department ID</label>
              <input
                type="number" // Hoặc text
                id="edit-departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)} // Lưu string
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập Department ID"
                // required // Tạm bỏ required
              />
            </div>
            {/* Phone */}
            <div>
              <label htmlFor="edit-phone" className="block mb-2 text-sm font-medium text-gray-900">Số điện thoại</label>
              <input
                type="tel"
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            {/* Hire Date */}
            <div>
              <label htmlFor="edit-hireDate" className="block mb-2 text-sm font-medium text-gray-900">Ngày vào làm</label>
              <input
                type="date"
                id="edit-hireDate"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required 
              />
            </div>
             {/* Status */}
             <div>
              <label htmlFor="edit-status" className="block mb-2 text-sm font-medium text-gray-900">Trạng thái</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="Đang thử việc">Đang thử việc</option>
                <option value="Chính thức">Chính thức</option>
                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                {/* Thêm các trạng thái khác nếu cần */}
              </select>
            </div>
             {/* Role ID */}
             <div>
              <label htmlFor="edit-roleId" className="block mb-2 text-sm font-medium text-gray-900">Role ID</label>
              <input
                type="number" // Hoặc text nếu API nhận string
                id="edit-roleId"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)} 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Avatar URL (Tạm thời) */}
            <div>
              <label htmlFor="edit-avatar" className="block mb-2 text-sm font-medium text-gray-900">URL Ảnh đại diện</label>
              <input
                type="text"
                id="edit-avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
          </div>
          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-5 border-t mt-5">
            <button 
              type="button" 
              onClick={onClose}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 mr-2"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;