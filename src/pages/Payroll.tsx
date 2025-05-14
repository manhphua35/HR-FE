import React, { useState, useEffect } from 'react';
import { PayrollService, Payroll, PayrollUpdateData, ComponentType } from '../services/PayrollService';
import { EmployeeService } from '../services/EmployeeService';
import { useAuth } from '../contexts/AuthContext';
import PayrollComponentModal from '../components/modals/PayrollModal/PayrollComponentModal';
import PayrollAddDeductionModal from '../components/modals/PayrollModal/PayrollAddDeductionModal';
import PayrollHistoryModal from '../components/modals/PayrollModal/PayrollHistoryModal';

// Số lượng dòng hiển thị trên mỗi trang
const ITEMS_PER_PAGE = 10;

const PayrollPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedPayrollId, setSelectedPayrollId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [processingPayroll, setProcessingPayroll] = useState(false);
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);

  const fetchData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [payroll, employeesData] = await Promise.all([
        PayrollService.processBatchPayroll(selectedMonth, selectedYear),
        EmployeeService.getAllEmployees()
      ]);
      
      // Thêm payrolls vào thông tin employee để có thể chọn trong modal
      const employeesWithPayrolls = employeesData.map(employee => ({
        ...employee,
        payrolls: payroll.filter(p => p.userId === employee.id || (p.user && p.user.id === employee.id))
      }));
      
      // Lấy danh sách các department duy nhất từ dữ liệu nhân viên
      const uniqueDepartments = Array.from(
        new Set(
          employeesWithPayrolls
            .filter(emp => emp.department !== null)
            .map(emp => JSON.stringify({ id: emp.department!.id, name: emp.department!.name }))
        )
      ).map(depString => JSON.parse(depString));
      
      setPayrollData(payroll);
      setEmployees(employeesWithPayrolls);
      setDepartments(uniqueDepartments);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, currentUser]);

  const handleProcessPayroll = async () => {
    if (!currentUser) return;
    
    setProcessingPayroll(true);
    try {
      const payroll = await PayrollService.processBatchPayroll(selectedMonth, selectedYear);
      
      // Cập nhật employees với danh sách payroll mới
      const updatedEmployees = employees.map(employee => ({
        ...employee,
        payrolls: payroll.filter(p => p.userId === employee.id || (p.user && p.user.id === employee.id))
      }));
      
      setPayrollData(payroll);
      setEmployees(updatedEmployees);
      setError(null);
      
      // Refresh lại trang để hiển thị đầy đủ dữ liệu mới
      window.location.reload();
    } catch (err) {
      console.error('Failed to process payroll:', err);
      setError('Không thể tính lương');
    } finally {
      setProcessingPayroll(false);
    }
  };

  const handleUpdatePayroll = async (data: any) => {
    if (!currentUser) {
      setError('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      // Xử lý cập nhật lương cơ bản
      if (data.baseSalary) {
        // Tìm payroll hiện tại của nhân viên
        const employee = employees.find(e => e.id === data.employeeId);
        const employeePayrolls = employee?.payrolls || [];
        
        if (employeePayrolls.length > 0) {
          // Lấy bảng lương của tháng và năm hiện tại
          const currentPayroll = employeePayrolls.find(
            (p: { month: number; year: number }) => p.month === selectedMonth && p.year === selectedYear
          );
          
          if (currentPayroll) {
            const updatePayload: PayrollUpdateData = {
              baseSalary: data.baseSalary,
              note: data.description || 'Cập nhật lương cơ bản'
            };
            
            await PayrollService.updatePayroll(currentPayroll.id, updatePayload);
            
            // Cập nhật thông tin nhân viên
            await EmployeeService.updateEmployeeBaseSalary(data.employeeId, data.baseSalary);
          } else {
            setError('Không tìm thấy bảng lương của tháng này cho nhân viên đã chọn');
            return;
          }
        } else {
          // Nếu chưa có bảng lương, chỉ cập nhật thông tin nhân viên
          await EmployeeService.updateEmployeeBaseSalary(data.employeeId, data.baseSalary);
        }
      } else {
        // Tìm bảng lương của nhân viên cho tháng hiện tại
        const employee = employees.find(e => e.id === data.employeeId);
        const employeePayrolls = employee?.payrolls || [];
        let payrollId;
        
        if (employeePayrolls.length > 0) {
          const currentPayroll = employeePayrolls.find(
            (p: { month: number; year: number }) => p.month === selectedMonth && p.year === selectedYear
          );
          
          if (currentPayroll) {
            payrollId = currentPayroll.id;
          } else {
            setError('Không tìm thấy bảng lương của tháng này cho nhân viên đã chọn');
            return;
          }
        } else {
          setError('Nhân viên chưa có bảng lương cho tháng này');
          return;
        }
        
        // Cấu trúc payload dựa trên dữ liệu gửi đi từ modal
        const updatePayload: PayrollUpdateData = {
          bonus: data.amount,
          note: data.description,
          componentType: data.componentType,
          shouldAdd: data.shouldAdd || false
        };
        
        await PayrollService.updatePayroll(payrollId, updatePayload);
      }
      
      // Refresh bảng lương
      fetchData();
      
      // Đóng modal đã được submit
      if (isBonusModalOpen) {
        setIsBonusModalOpen(false);
      }
      
      setSelectedEmployee(null);
      
      // Refresh lại trang để hiển thị đầy đủ dữ liệu mới
      window.location.reload();
    } catch (err) {
      console.error('Failed to update payroll:', err);
      setError('Không thể cập nhật bảng lương');
    }
  };

  const handleAddDeduction = async (data: { employeeId: number; deductionAmount: number; deductionNote: string }) => {
    if (!currentUser) {
      setError('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      // Tìm bảng lương của nhân viên cho tháng hiện tại
      const employee = employees.find(e => e.id === data.employeeId);
      const employeePayrolls = employee?.payrolls || [];
      let payrollId;
      
      if (employeePayrolls.length > 0) {
        const currentPayroll = employeePayrolls.find(
          (p: { month: number; year: number }) => p.month === selectedMonth && p.year === selectedYear
        );
        
        if (currentPayroll) {
          payrollId = currentPayroll.id;
        } else {
          setError('Không tìm thấy bảng lương của tháng này cho nhân viên đã chọn');
          return;
        }
      } else {
        setError('Nhân viên chưa có bảng lương cho tháng này');
        return;
      }
      
      const updatePayload: PayrollUpdateData = {
        deductionAmount: data.deductionAmount,
        deductionNote: data.deductionNote,
        componentType: ComponentType.DEDUCTION
      };
      
      await PayrollService.updatePayroll(payrollId, updatePayload);
      
      fetchData(); // Refresh bảng lương
      setIsDeductionModalOpen(false); // Đóng modal khấu trừ
      setError(null);
      
      // Refresh lại trang để hiển thị đầy đủ dữ liệu mới
      window.location.reload();
    } catch (err) {
      console.error('Failed to add deduction:', err);
      setError('Không thể thêm khấu trừ. Vui lòng thử lại.');
    }
  };

  const openHistoryModal = (payrollId: number) => {
    setSelectedPayrollId(payrollId);
    setIsHistoryModalOpen(true);
  };

  // Xử lý lọc theo phòng ban và searchTerm
  const filterPayrollData = () => {
    if (!Array.isArray(payrollData)) {
      return [];
    }
    
    let filtered = payrollData.filter(item => {
      const fullNameMatch = item.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const departmentMatch = departmentFilter === 'all' || 
        (item.user?.department && item.user.department.id.toString() === departmentFilter);
      
      return fullNameMatch && departmentMatch;
    });
    
    // Sắp xếp theo phòng ban và tên
    filtered.sort((a, b) => {
      // Sắp xếp theo tên phòng ban
      const deptA = a.user?.department?.name || '';
      const deptB = b.user?.department?.name || '';
      
      if (deptA !== deptB) {
        return deptA.localeCompare(deptB);
      }
      
      // Nếu cùng phòng ban, sắp xếp theo tên nhân viên
      const nameA = a.user?.fullName || '';
      const nameB = b.user?.fullName || '';
      return nameA.localeCompare(nameB);
    });
    
    return filtered;
  };

  const filteredData = filterPayrollData();
  
  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Chuyển trang
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const formatMoney = (amount: string | number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">
          Vui lòng đăng nhập để xem bảng lương
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Bảng lương công ty</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsDeductionModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-minus mr-2"></i>
            Thêm khấu trừ
          </button>
          <button
            onClick={() => setIsBonusModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>
            Thêm tiền thưởng
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tháng
                </label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Năm
                </label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng ban
                </label>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">Tất cả phòng ban</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                    placeholder="Tìm kiếm theo tên nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4">Tên nhân viên</th>
                  <th scope="col" className="px-6 py-4">Phòng ban</th>
                  <th scope="col" className="px-6 py-4">Lương cơ bản</th>
                  <th scope="col" className="px-6 py-4">Phụ cấp</th>
                  <th scope="col" className="px-6 py-4">Khấu trừ</th>
                  <th scope="col" className="px-6 py-4">Phúc lợi</th>
                  <th scope="col" className="px-6 py-4">Thưởng</th>
                  <th scope="col" className="px-6 py-4">Thuế</th>
                  <th scope="col" className="px-6 py-4">Thực lãnh</th>
                  <th scope="col" className="px-6 py-4">Ghi chú</th>
                  <th scope="col" className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{item.user?.fullName}</td>
                      <td className="px-6 py-4">{item.user?.department?.name || '-'}</td>
                      <td className="px-6 py-4">{formatMoney(item.baseSalary)}</td>
                      <td className="px-6 py-4 text-green-600">{formatMoney(item.totalAllowance)}</td>
                      <td className="px-6 py-4 text-red-600">{formatMoney(item.totalDeduction)}</td>
                      <td className="px-6 py-4 text-blue-600">{formatMoney(item.totalBenefit)}</td>
                      <td className="px-6 py-4 text-green-600">{formatMoney(item.bonus)}</td>
                      <td className="px-6 py-4 text-red-600">{formatMoney(item.tax)}</td>
                      <td className="px-6 py-4 font-semibold">{formatMoney(item.netSalary)}</td>
                      <td className="px-6 py-4">{item.note || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openHistoryModal(item.id)}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Lịch sử thay đổi"
                        >
                          <i className="fas fa-history"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-gray-700">
                  Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} của {filteredData.length} bản ghi
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PayrollAddDeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => {
          setIsDeductionModalOpen(false);
        }}
        onSubmit={handleAddDeduction}
        employees={employees}
      />
      
      <PayrollComponentModal
        isOpen={isBonusModalOpen}
        onClose={() => {
          setIsBonusModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleUpdatePayroll}
        title="Thêm tiền thưởng/phụ cấp"
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={setSelectedEmployee}
      />
      
      <PayrollHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedPayrollId(null);
        }}
        payrollId={selectedPayrollId}
      />
    </div>
  );
};

export default PayrollPage;