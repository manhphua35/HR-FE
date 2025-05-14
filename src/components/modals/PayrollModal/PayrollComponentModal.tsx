import React, { useState, useEffect } from 'react';
import { Payroll, ComponentType } from '../../../services/PayrollService';

interface Employee {
  id: number;
  fullName: string;
  baseSalary: string;
  payrolls?: Payroll[];
}

interface PayrollComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  employees: Employee[];
  selectedEmployee: number | null;
  onSelectEmployee: (id: number) => void;
}

const PayrollComponentModal: React.FC<PayrollComponentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  employees,
  selectedEmployee,
  onSelectEmployee
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    componentType: ComponentType.BONUS as string,
    shouldAdd: true,
    baseSalary: ''
  });
  const [isEditingBaseSalary, setIsEditingBaseSalary] = useState(false);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        amount: '',
        description: '',
        componentType: ComponentType.BONUS,
        shouldAdd: true,
        baseSalary: ''
      });
      setIsEditingBaseSalary(false);
    }
  }, [isOpen]);

  // Cập nhật lương cơ bản của nhân viên được chọn
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      if (employee) {
        setFormData(prev => ({
          ...prev,
          baseSalary: employee.baseSalary
        }));
      }
    }
  }, [selectedEmployee, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingBaseSalary) {
      onSubmit({
        baseSalary: parseFloat(formData.baseSalary),
        description: formData.description,
        employeeId: selectedEmployee,
        shouldAdd: false
      });
    } else {
      onSubmit({
        amount: parseFloat(formData.amount),
        description: formData.description,
        employeeId: selectedEmployee,
        componentType: formData.componentType,
        shouldAdd: formData.shouldAdd
      });
    }
  };

  const toggleSalaryEdit = () => {
    setIsEditingBaseSalary(!isEditingBaseSalary);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center pb-4 mb-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                    Nhân viên
                  </label>
                  <select
                    id="employee"
                    value={selectedEmployee || ''}
                    onChange={(e) => onSelectEmployee(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEmployee && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">Lương cơ bản:</span> {
                        new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(parseFloat(formData.baseSalary) || 0)
                      }
                    </div>
                    <button
                      type="button"
                      onClick={toggleSalaryEdit}
                      className={`px-3 py-1 text-xs font-medium rounded ${isEditingBaseSalary ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                    >
                      {isEditingBaseSalary ? 'Hủy' : 'Chỉnh sửa lương'}
                    </button>
                  </div>
                )}

                {isEditingBaseSalary ? (
                  <div>
                    <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 mb-2">
                      Lương cơ bản mới
                    </label>
                    <input
                      id="baseSalary"
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="100000"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="componentType" className="block text-sm font-medium text-gray-700 mb-2">
                        Loại cập nhật
                      </label>
                      <select
                        id="componentType"
                        value={formData.componentType}
                        onChange={(e) => setFormData({ ...formData, componentType: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value={ComponentType.BONUS}>Thưởng</option>
                        <option value={ComponentType.ALLOWANCE}>Phụ cấp</option>
                        <option value={ComponentType.BENEFIT}>Phúc lợi</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Số tiền
                      </label>
                      <input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                        min="0"
                        step="1000"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        id="shouldAdd"
                        type="checkbox"
                        checked={formData.shouldAdd}
                        onChange={(e) => setFormData({ ...formData, shouldAdd: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="shouldAdd" className="ml-2 block text-sm text-gray-700">
                        Cộng dồn vào giá trị hiện tại (thay vì thay thế giá trị)
                      </label>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayrollComponentModal;