import React, { useState } from 'react';
// Import cả CreateEmployeePayload
import { EmployeeService, Employee, CreateEmployeePayload } from '../../services/EmployeeService';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback khi tạo thành công
}

const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // State cho các trường input - cập nhật theo CreateEmployeePayload
  const [username, setUsername] = useState(''); // Thêm username
  const [password, setPassword] = useState(''); // Thêm password
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  // Đổi state để lưu ID thay vì tên
  const [positionId, setPositionId] = useState(''); // UUID là string
  const [departmentId, setDepartmentId] = useState<number | string>(''); // Lưu string từ input, parse sau
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState('Đang thử việc');
  const [roleId, setRoleId] = useState<number | string>(''); // Thêm roleId (kiểu number hoặc string tùy API)
  const [avatar, setAvatar] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Tạo payload theo interface CreateEmployeePayload
    const employeeData: CreateEmployeePayload = {
      username,
      password: password || undefined, // Gửi undefined nếu rỗng, API sẽ xử lý
      fullName,
      email,
      // Sửa payload để gửi ID
      positionId: positionId || null, // Gửi null nếu rỗng
      departmentId: typeof departmentId === 'string' ? parseInt(departmentId, 10) : (departmentId || null), // Parse sang number, gửi null nếu rỗng/NaN
      phone: phone || null, // Gửi null nếu rỗng
      status,
      avatar: avatar || undefined,
      // Chuyển đổi roleId sang number nếu cần và nếu nó đang là string
      roleId: typeof roleId === 'string' ? parseInt(roleId, 10) : roleId,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
    };
    
    // Validate roleId và departmentId sau khi parse
    if (isNaN(employeeData.roleId as number)) {
       setError("Role ID không hợp lệ.");
       setIsLoading(false);
       return;
    }
    // Kiểm tra departmentId sau khi parse (nếu không rỗng)
    if (employeeData.departmentId !== null && isNaN(employeeData.departmentId)) {
        setError("Department ID không hợp lệ.");
        setIsLoading(false);
        return;
    }
    // Có thể thêm validate cho positionId (UUID format) nếu cần

    try {
      await EmployeeService.createEmployee(employeeData);
      onSuccess(); // Gọi callback thành công
    } catch (err) {
      console.error("Failed to create employee:", err);
      setError("Không thể tạo nhân viên. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Thêm nhân viên mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <i className="fas fa-times w-5 h-5"></i>
            <span className="sr-only">Đóng modal</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
             {/* Password */}
             <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Để trống nếu không đổi" // Hoặc yêu cầu nhập nếu là tạo mới
              />
            </div>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Position ID (Tạm thời nhập text, nên là dropdown) */}
            <div>
              <label htmlFor="positionId" className="block mb-2 text-sm font-medium text-gray-900">Position ID (UUID)</label>
              <input
                type="text"
                id="positionId"
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập Position ID (UUID)"
                // required // Tạm bỏ required vì có thể là null
              />
            </div>
            {/* Department ID (Tạm thời nhập text, nên là dropdown) */}
            <div>
              <label htmlFor="departmentId" className="block mb-2 text-sm font-medium text-gray-900">Department ID</label>
              <input
                type="number" // Hoặc text và parse
                id="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)} // Lưu string
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Nhập Department ID"
                // required // Tạm bỏ required vì có thể là null
              />
            </div>
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            </div>
            {/* Hire Date */}
            <div>
              <label htmlFor="hireDate" className="block mb-2 text-sm font-medium text-gray-900">Ngày vào làm</label>
              <input
                type="date"
                id="hireDate"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required // API yêu cầu hireDate
              />
            </div>
             {/* Status */}
             <div>
              <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Trạng thái</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="Đang thử việc">Đang thử việc</option>
                <option value="Chính thức">Chính thức</option>
                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                {/* Thêm các trạng thái khác nếu cần */}
              </select>
            </div>
             {/* Role ID */}
             <div>
              <label htmlFor="roleId" className="block mb-2 text-sm font-medium text-gray-900">Role ID</label>
              <input
                type="number" // Hoặc text nếu API nhận string
                id="roleId"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)} // Lấy value là string, sẽ parse sau
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              />
            </div>
            {/* Avatar URL (Tạm thời) */}
            <div>
              <label htmlFor="avatar" className="block mb-2 text-sm font-medium text-gray-900">URL Ảnh đại diện (Tạm thời)</label>
              <input
                type="text"
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 mr-2 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                'Thêm nhân viên'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;