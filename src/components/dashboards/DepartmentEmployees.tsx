import React, { useState, useEffect } from 'react';
import { EmployeeService, Employee } from '../../services/EmployeeService';
import { useAuth } from '../../contexts/AuthContext';
import ViewEmployeeModal from '../modals/ViewEmployeeModal';

interface DepartmentEmployeesProps {
  departmentId?: string;
}

const DepartmentEmployees: React.FC<DepartmentEmployeesProps> = ({ departmentId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!departmentId && !currentUser?.departmentId) {
        setError("Không tìm thấy ID phòng ban");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Sử dụng departmentId từ props hoặc từ thông tin người dùng
        const deptId = departmentId || currentUser?.departmentId;
        if (!deptId) {
          throw new Error("Không tìm thấy ID phòng ban");
        }
        const data = await EmployeeService.getDepartmentEmployees(Number(deptId));
        setEmployees(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching department employees:", err);
        setError("Không thể tải danh sách nhân viên. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [departmentId, currentUser]);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    const fullNameMatch = (employee.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const positionMatch = (employee.position?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return fullNameMatch || emailMatch || positionMatch;
  });

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error) {
    return <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <p>{error}</p>
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Danh sách nhân viên phòng ban</h2>

      <div className="mb-6">
        <div className="relative w-full max-w-md">
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
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy nhân viên nào.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chức vụ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày vào làm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={employee.avatar || '/logo192.png'} alt={employee.fullName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position?.title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(employee.hireDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewEmployee(employee)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <i className="fas fa-eye mr-1"></i> Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isViewModalOpen && viewingEmployee && (
        <ViewEmployeeModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewingEmployee(null);
          }}
          employeeData={viewingEmployee}
        />
      )}
    </div>
  );
};

export default DepartmentEmployees; 