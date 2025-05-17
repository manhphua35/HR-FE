import React, { useState, useEffect } from 'react';
import { EmployeeService, Employee } from '../services/EmployeeService';
// Import các modal
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal'; // Import modal xác nhận xóa
import { useAuth } from '../contexts/AuthContext';
import EditEmployeeModal from '../components/modals/EmployeeModal/EditEmployeeModal';
import CreateEmployeeModal from '../components/modals/EmployeeModal/CreateEmployeeModal';
import ViewEmployeeModal from '../components/modals/EmployeeModal/ViewEmployeeModal';

// Định nghĩa các trạng thái có thể có để lọc, dựa trên trường `isActive` từ API
const POSSIBLE_STATUSES = ['Đang làm việc', 'Đã nghỉ việc'];

// Không cần STATUS_MAP nữa vì lọc trực tiếp bằng isActive

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  
  // State cho modal sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // State cho modal xem chi tiết
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  
  // State cho modal xác nhận xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingEmployeeInfo, setDeletingEmployeeInfo] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // State loading riêng cho việc xóa

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // Số nhân viên mỗi trang, có thể thay đổi

  // Lấy thông tin người dùng hiện tại từ context
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, [currentUser]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      let data: Employee[] = [];
      
      // Kiểm tra vai trò người dùng
      if (currentUser?.role?.roleType === "DEPARTMENT_HEAD" && currentUser?.departmentId) {
        // Nếu là trưởng phòng, chỉ lấy nhân viên trong phòng ban của họ
        data = await EmployeeService.getDepartmentEmployees(Number(currentUser.departmentId));
      } else {
        // Nếu là HR hoặc Admin, lấy tất cả nhân viên
        data = await EmployeeService.getAllEmployees();
      }
      
      setEmployees(data);
      setError("");
    } catch (err) {
      setError("Lấy danh sách nhân viên thất bại");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    // Kiểm tra null/undefined trước khi gọi toLowerCase() bằng optional chaining (?.)
    // và cung cấp giá trị mặc định ('') nếu thuộc tính không tồn tại
    // Đổi nameMatch thành fullNameMatch và sử dụng employee.fullName
    const fullNameMatch = (employee.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const positionMatch = (employee.position?.title || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = fullNameMatch || emailMatch || positionMatch; // Cập nhật matchesSearch

    // Kiểm tra department và status với chuẩn hóa chuỗi (trim, lowercase)
    const departmentName = (employee.department?.name || '').trim().toLowerCase();
    const filterDepartment = departmentFilter.trim().toLowerCase();
    const matchesDepartment = filterDepartment === "" || departmentName === filterDepartment;

    // Lọc theo trạng thái isActive
    const filterStatus = statusFilter.trim().toLowerCase();
    let matchesStatus = true; // Mặc định là khớp nếu không chọn bộ lọc
    if (filterStatus === "đang làm việc") {
      matchesStatus = employee.isActive === true;
    } else if (filterStatus === "đã nghỉ việc") {
      matchesStatus = employee.isActive === false;
    }

    // Ghi log để kiểm tra (có thể xóa sau khi debug xong)
    // if (filterStatus !== "") {
    //    
    // }


    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Hàm xử lý khi thêm nhân viên thành công (đóng modal, tải lại danh sách)
  const handleAddEmployeeSuccess = () => {
    setIsAddModalOpen(false);
    fetchEmployees();
  };
  
  // Hàm xử lý khi sửa nhân viên thành công
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null); // Xóa dữ liệu nhân viên đang sửa
    fetchEmployees();
  };

  // Hàm mở modal sửa và set dữ liệu nhân viên
  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };
  
  // Hàm mở modal xem chi tiết và set dữ liệu nhân viên
  const handleOpenViewModal = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Logic tạo các nút phân trang (ví dụ đơn giản)
  const renderPaginationButtons = () => {
    const buttons = [];
    // Nút Previous
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Trước</span>
        <i className="fas fa-chevron-left h-5 w-5"></i>
      </button>
    );

    // Nút số trang (hiển thị tối đa 5 nút xung quanh trang hiện tại)
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }
    
    if (startPage > 1) {
       buttons.push(<button key={1} onClick={() => handlePageChange(1)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">1</button>);
       if (startPage > 2) {
         buttons.push(<span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>);
       }
    }


    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          aria-current={currentPage === i ? 'page' : undefined}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            currentPage === i
              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
          } focus:z-20 focus:outline-offset-0`}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>);
      }
      buttons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">{totalPages}</button>);
    }


    // Nút Next
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Sau</span>
        <i className="fas fa-chevron-right h-5 w-5"></i>
      </button>
    );

    return buttons;
  };

  // Hàm mở modal xác nhận xóa
  const handleDelete = (id: number, name: string) => {
    setDeletingEmployeeInfo({ id, name });
    setIsDeleteModalOpen(true);
  };

  // Hàm thực thi việc xóa sau khi xác nhận
  const executeDelete = async () => {
    if (!deletingEmployeeInfo) return;

    setIsDeleting(true); // Bắt đầu loading xóa
    setError(""); // Xóa lỗi cũ nếu có

    try {
      await EmployeeService.deleteEmployee(deletingEmployeeInfo.id);
      // Cân nhắc dùng toast notification thay cho alert
      alert(`Đã xóa thành công nhân viên "${deletingEmployeeInfo.name}"!`);
      setIsDeleteModalOpen(false); // Đóng modal
      setDeletingEmployeeInfo(null); // Reset thông tin
      fetchEmployees(); // Tải lại danh sách
    } catch (err) {
      const errorMsg = `Xóa nhân viên "${deletingEmployeeInfo.name}" thất bại: ${err instanceof Error ? err.message : String(err)}`;
      setError(errorMsg); // Hiển thị lỗi ở đầu trang
      console.error(err);
      // Cân nhắc hiển thị lỗi trong modal hoặc dùng toast
      alert(errorMsg);
      setIsDeleteModalOpen(false); // Đóng modal ngay cả khi lỗi
      setDeletingEmployeeInfo(null);
    } finally {
      setIsDeleting(false); // Kết thúc loading xóa
    }
  };


  // Get unique department names for filter dropdown, lọc bỏ giá trị null/undefined/empty
  // Chuẩn hóa và lấy tên phòng ban duy nhất cho dropdown
  const departments = Array.from(
    new Set(
      employees
        .map(employee => (employee.department?.name || '').trim().toLowerCase()) // Chuẩn hóa ngay khi map
        .filter(name => name) // Lọc bỏ chuỗi rỗng sau khi chuẩn hóa
    )
  );

  // Biến statuses không còn cần thiết vì dùng POSSIBLE_STATUSES

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
          <div className="relative w-full lg:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">Tất cả phòng ban</option>
              {/* Sửa lỗi: Sử dụng tên department (string) cho value và nội dung */}
              {/* Hiển thị tên phòng ban đã chuẩn hóa (có thể viết hoa chữ cái đầu nếu muốn) */}
              {departments.map((deptName, index) => (
                <option key={index} value={deptName}>
                  {/* Viết hoa chữ cái đầu tiên của mỗi từ cho đẹp hơn */}
                  {deptName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {/* Sử dụng mảng trạng thái cố định */}
              {/* Thêm kiểu dữ liệu cho status và index */}
              {POSSIBLE_STATUSES.map((status: string, index: number) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
            
            {/* Thêm onClick để mở modal */}
            <button
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fas fa-plus mr-2"></i>Thêm nhân viên
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Nhân viên</th>
                <th scope="col" className="px-6 py-3">Chức vụ & Phòng ban</th>
                <th scope="col" className="px-6 py-3">Ngày vào làm</th>
                <th scope="col" className="px-6 py-3">Điện thoại</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
                <th scope="col" className="px-6 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* Sử dụng currentEmployees thay vì filteredEmployees */}
              {currentEmployees.map(employee => (
                <tr key={employee.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {/* Đổi alt={employee.name} thành alt={employee.fullName} */}
                        {/* Sử dụng logo192.png làm ảnh đại diện mặc định */}
                        <img className="h-10 w-10 rounded-full object-cover" src={employee.avatar || '/logo192.png'} alt={employee.fullName} />
                      </div>
                      <div className="ml-4">
                         {/* Đổi {employee.name} thành {employee.fullName} */}
                        <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Sửa lỗi: Hiển thị title của position, xử lý null */}
                    <div className="text-sm text-gray-900">{employee.description || 'N/A'}</div>
                    {/* Sửa lỗi: Hiển thị name của department, xử lý null */}
                    <div className="text-xs text-gray-500">{employee.department?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                     {/* Đổi {employee.joinDate} thành {employee.hireDate} */}
                    <div className="text-sm text-gray-900">{employee.hireDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{employee.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Hiển thị trạng thái dựa trên isActive */}
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.isActive
                        ? 'bg-green-100 text-green-800' // Đang làm việc
                        : 'bg-red-100 text-red-800'     // Đã nghỉ việc
                    }`}>
                      {employee.isActive ? 'Đang làm việc' : 'Đã nghỉ việc'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                        // Gọi handleOpenViewModal với employee tương ứng
                        onClick={() => handleOpenViewModal(employee)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        title="Sửa"
                        // Gọi handleOpenEditModal với employee tương ứng
                        onClick={() => handleOpenEditModal(employee)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                        // Gọi handleDelete với id và fullName của nhân viên
                        onClick={() => handleDelete(employee.id, employee.fullName)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            {/* Cập nhật hiển thị số lượng */}
            Hiển thị <span className="font-medium">{filteredEmployees.length > 0 ? startIndex + 1 : 0}</span> đến <span className="font-medium">{Math.min(endIndex, filteredEmployees.length)}</span> trong tổng số <span className="font-medium">{filteredEmployees.length}</span> nhân viên (Tổng: {employees.length})
          </div>
          {/* Render các nút phân trang động */}
          {totalPages > 1 && (
             <div>
               <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                 {renderPaginationButtons()}
               </nav>
             </div>
          )}
        </div>
      </div>

      {/* Hiển thị modal nếu isAddModalOpen là true */}
      {isAddModalOpen && (
        <CreateEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddEmployeeSuccess}
        />
      )}

      {/* Hiển thị modal sửa nếu isEditModalOpen là true */}
      {isEditModalOpen && editingEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEmployee(null); // Đảm bảo xóa dữ liệu khi đóng
          }}
          onSuccess={handleEditSuccess}
          employeeData={editingEmployee} // Truyền dữ liệu nhân viên đang sửa
        />
      )}

      {/* Hiển thị modal xem chi tiết nếu isViewModalOpen là true */}
      {isViewModalOpen && viewingEmployee && (
        <ViewEmployeeModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingEmployee(null); // Đảm bảo xóa dữ liệu khi đóng
          }}
          employeeData={viewingEmployee}
        />
      )}

      {/* Hiển thị modal xác nhận xóa */}
      {isDeleteModalOpen && deletingEmployeeInfo && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (!isDeleting) { // Chỉ cho phép đóng nếu không đang xóa
              setIsDeleteModalOpen(false);
              setDeletingEmployeeInfo(null);
            }
          }}
          onConfirm={executeDelete}
          title="Xác nhận xóa nhân viên"
          message={`Bạn có chắc chắn muốn xóa nhân viên "${deletingEmployeeInfo.name}"? Hành động này không thể hoàn tác.`}
        />
      )}
    </div>
  );
};

export default Employees;