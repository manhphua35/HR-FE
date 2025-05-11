import React, { useState, useEffect } from 'react';
import { PayrollService, Payroll } from '../services/PayrollService';
import PayrollComponentModal from '../components/modals/PayrollComponentModal';
import { EmployeeService } from '../services/EmployeeService';
import { useAuth } from '../contexts/AuthContext';

const PayrollPage: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [processingPayroll, setProcessingPayroll] = useState(false);

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
      
      setPayrollData(payroll);
      setEmployees(employeesWithPayrolls);
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
    } catch (err) {
      console.error('Failed to process payroll:', err);
      setError('Không thể tính lương');
    } finally {
      setProcessingPayroll(false);
    }
  };

  const handleUpdatePayroll = async (data: any) => {
    if (!currentUser || !data.payrollId) {
      setError('Vui lòng chọn bảng lương');
      return;
    }

    try {
      const updatedPayroll = await PayrollService.updatePayroll(data.payrollId, {
        bonus: data.amount,
        note: data.description
      });
      
      // Refresh bảng lương
      fetchData();
      
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Failed to update payroll:', err);
      setError('Không thể cập nhật bảng lương');
    }
  };

  // Filter theo search term
  const filteredData = Array.isArray(payrollData) 
    ? payrollData.filter(item => 
        item.user && item.user.fullName ? item.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    : [];

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm tiền thưởng
        </button>
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
            <div className="flex items-center gap-4">
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
              <div className="self-end">
                <button
                  onClick={handleProcessPayroll}
                  disabled={processingPayroll}
                  className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                >
                  {processingPayroll ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calculator mr-2"></i>
                      Tính lương
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="relative flex-1">
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4">Tên nhân viên</th>
                  <th scope="col" className="px-6 py-4">Lương cơ bản</th>
                  <th scope="col" className="px-6 py-4">Phụ cấp</th>
                  <th scope="col" className="px-6 py-4">Khấu trừ</th>
                  <th scope="col" className="px-6 py-4">Phúc lợi</th>
                  <th scope="col" className="px-6 py-4">Thưởng</th>
                  <th scope="col" className="px-6 py-4">Thuế</th>
                  <th scope="col" className="px-6 py-4">Thực lãnh</th>
                  <th scope="col" className="px-6 py-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{item.user?.fullName}</td>
                      <td className="px-6 py-4">{formatMoney(item.baseSalary)}</td>
                      <td className="px-6 py-4 text-green-600">{formatMoney(item.totalAllowance)}</td>
                      <td className="px-6 py-4 text-red-600">{formatMoney(item.totalDeduction)}</td>
                      <td className="px-6 py-4 text-blue-600">{formatMoney(item.totalBenefit)}</td>
                      <td className="px-6 py-4 text-green-600">{formatMoney(item.bonus)}</td>
                      <td className="px-6 py-4 text-red-600">{formatMoney(item.tax)}</td>
                      <td className="px-6 py-4 font-semibold">{formatMoney(item.netSalary)}</td>
                      <td className="px-6 py-4">{item.note || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PayrollComponentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleUpdatePayroll}
        title="Thêm tiền thưởng"
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={setSelectedEmployee}
      />
    </div>
  );
};

export default PayrollPage;