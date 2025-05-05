import React, { useState, useEffect } from 'react';
import { PayrollService, PayrollComponentWithUser } from '../services/PayrollService';
import PayrollComponentModal from '../components/modals/PayrollComponentModal';
import { EmployeeService } from '../services/EmployeeService';

const Payroll: React.FC = () => {
  const [components, setComponents] = useState<PayrollComponentWithUser[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allowances, deductions, employeesData] = await Promise.all([
          PayrollService.getPayrollComponentsByType('ALLOWANCE'),
          PayrollService.getPayrollComponentsByType('DEDUCTION'),
          EmployeeService.getAllEmployees()
        ]);
        
        // Gộp và sắp xếp dữ liệu
        const sortedComponents = [...allowances, ...deductions].sort((a, b) => 
          a.user.fullName.localeCompare(b.user.fullName)
        );
        
        setComponents(sortedComponents);
        setEmployees(employeesData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddComponent = async (data: any) => {
    if (!data.userId) {
      setError('Vui lòng chọn nhân viên');
      return;
    }

    try {
      await PayrollService.addPayrollComponent(data);
      
      // Refresh data after adding
      const [allowances, deductions] = await Promise.all([
        PayrollService.getPayrollComponentsByType('ALLOWANCE'),
        PayrollService.getPayrollComponentsByType('DEDUCTION')
      ]);
      
      setComponents([...allowances, ...deductions].sort((a, b) => 
        a.user.fullName.localeCompare(b.user.fullName)
      ));
      setError(null);
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Failed to add payroll component:', err);
      setError('Không thể thêm khoản lương');
    }
  };

  // Filter theo search term
  const filteredData = components.filter(item => 
    item.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMoney = (amount: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-500">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lương thưởng</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>
          Thêm mới
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
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                placeholder="Tìm kiếm theo tên nhân viên hoặc tên khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4">Nhân viên</th>
                  <th scope="col" className="px-6 py-4">Loại</th>
                  <th scope="col" className="px-6 py-4">Tên khoản</th>
                  <th scope="col" className="px-6 py-4">Số tiền</th>
                  <th scope="col" className="px-6 py-4">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.fullName)}&background=random`}
                            alt={item.user.fullName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lương cơ bản: {formatMoney(item.user.baseSalary)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'ALLOWANCE'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.type === 'ALLOWANCE' ? 'Phụ cấp' : 'Khấu trừ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        item.type === 'ALLOWANCE'
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatMoney(item.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Không tìm thấy dữ liệu phù hợp
            </div>
          )}
        </div>
      </div>

      <PayrollComponentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleAddComponent}
        title="Thêm khoản lương mới"
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={setSelectedEmployee}
      />
    </div>
  );
};

export default Payroll;