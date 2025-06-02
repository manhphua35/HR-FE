import React, { useState, useEffect, useRef } from 'react';
import { CreateEmployeePayload, EmployeeService} from '../../../services/EmployeeService';
import { AuthService, Role } from '../../../services/AuthService';
import { DepartmentService } from '../../../services/DepartmentService';
import { roleTypeMapping, roleDisplayNameMapping } from './mappings';

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
  const [departmentId, setDepartmentId] = useState<number | string>(''); // Lưu string từ input, parse sau
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState(''); // Thêm state cho mô tả
  const [hireDate, setHireDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [roleType, setRoleType] = useState<string>(''); // Role type (e.g. "SYSTEM_ADMIN")
  const [avatar, setAvatar] = useState('');
  
  // State mới cho xử lý ảnh
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho roles và departments
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles và departments khi modal mở
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [rolesData, departmentsData] = await Promise.all([
            AuthService.getRoles(),
            DepartmentService.getDepartments()
          ]);
          setRoles(rolesData);
          setDepartments(departmentsData);
        } catch (err) {
          console.error('Failed to fetch data:', err);
          setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Tạo URL xem trước
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  // Xử lý khi click vào nút chọn ảnh
  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  // Xử lý khi xóa ảnh đã chọn
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Hàm chuyển đổi file thành Base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const roleIdToSend = roleTypeMapping[roleType]; // Lấy roleId từ state roleType (chuỗi)

    // Kiểm tra nếu roleId không hợp lệ (ví dụ: roleType không khớp với mapping)
    if (roleIdToSend === undefined) {
      setError("Vai trò được chọn không hợp lệ.");
      setIsLoading(false);
      return;
    }

    try {
      // Xử lý ảnh nếu có file được chọn
      let avatarToSend = avatar;
      if (selectedFile) {
        setIsProcessingImage(true);
        try {
          // Chuyển đổi file thành Base64
          avatarToSend = await convertFileToBase64(selectedFile);
        } catch (imgErr) {
          console.error("Lỗi xử lý ảnh:", imgErr);
          setError("Không thể xử lý ảnh. Vui lòng thử lại.");
          setIsLoading(false);
          setIsProcessingImage(false);
          return;
        } finally {
          setIsProcessingImage(false);
        }
    }

    // Tạo payload theo interface CreateEmployeePayload
    const employeeData: CreateEmployeePayload = {
      username,
      password: password || undefined, // Gửi undefined nếu rỗng, API sẽ xử lý
      fullName,
      email,
      // Sửa payload để gửi ID
      departmentId: typeof departmentId === 'string' ? parseInt(departmentId, 10) : (departmentId || null), // Parse sang number, gửi null nếu rỗng/NaN
      phone: phone || null, // Gửi null nếu rỗng
      isActive,
        avatar: avatarToSend || undefined,
      roleId: roleIdToSend, // <--- Sử dụng roleId số đã ánh xạ (đảm bảo là number sau khi kiểm tra)
      description: description || null, // Thêm mô tả vai trò
      hireDate: hireDate || new Date().toISOString().split('T')[0],
    };
    
    // Kiểm tra departmentId sau khi parse (nếu không rỗng)
    if (employeeData.departmentId !== null && isNaN(employeeData.departmentId)) {
        setError("Department ID không hợp lệ.");
        setIsLoading(false);
        return;
    }

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
            {/* Department Dropdown */}
            <div>
              <label htmlFor="departmentId" className="block mb-2 text-sm font-medium text-gray-900">Phòng ban</label>
              <select
                id="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">Chọn phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Description - Mô tả vai trò */}
            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">Mô tả vai trò</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Mô tả vai trò của nhân viên"
                rows={3}
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
             {/* Active Status */}
             <div>
              <label htmlFor="isActive" className="block mb-2 text-sm font-medium text-gray-900">Trạng thái</label>
              <select
                id="isActive"
                value={isActive.toString()}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="true">Đang làm việc</option>
                <option value="false">Đã nghỉ việc</option>
              </select>
            </div>
             {/* Role Dropdown */}
             <div>
              <label htmlFor="roleType" className="block mb-2 text-sm font-medium text-gray-900">Vai trò</label>
              <select
                id="roleType"
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                <option value="">Chọn vai trò</option>
                {roles.map((role) => (
                  <option key={role.type} value={role.type}>
                    {/* Sử dụng mapping để lấy tên hiển thị tiếng Việt */}
                    {roleDisplayNameMapping[role.type] || role.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Avatar Upload - Thay thế input URL bằng tải file */}
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm font-medium text-gray-900">Ảnh đại diện</label>
              <div className="flex items-center space-x-4">
                {/* Hiển thị ảnh xem trước nếu có */}
                {previewUrl && (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Avatar preview" 
                      className="h-20 w-20 object-cover rounded-full"
                    />
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                      title="Xóa ảnh"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                {/* Input file ẩn */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Button chọn file */}
                <button
                  type="button"
                  onClick={handleChooseFile}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <i className="fas fa-upload mr-2"></i>
                  {selectedFile ? 'Đổi ảnh khác' : 'Chọn ảnh'}
                </button>
                
                {selectedFile && (
                  <span className="text-sm text-gray-500">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                )}
              </div>
              
              {/* Hiển thị trạng thái xử lý ảnh */}
              {isProcessingImage && (
                <div className="mt-2 text-sm text-blue-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang xử lý ảnh...
                </div>
              )}
              
              {/* Cho phép nhập URL trực tiếp như phương án dự phòng */}
              <div className="mt-3">
                <label htmlFor="avatar" className="block mb-2 text-sm font-medium text-gray-500">Hoặc nhập URL ảnh</label>
              <input
                type="text"
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="https://example.com/avatar.jpg"
              />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200 rounded-b">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isProcessingImage}
              className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 mr-2 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || isProcessingImage}
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
            >
              {isLoading || isProcessingImage ? (
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