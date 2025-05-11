import React, { useState, useEffect } from 'react';
import { Payroll } from '../../services/PayrollService';

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
    description: ''
  });
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        amount: '',
        description: ''
      });
      setSelectedPayroll(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      amount: parseFloat(formData.amount),
      description: formData.description,
      payrollId: selectedPayroll
    });
  };

  // Lấy danh sách bảng lương của nhân viên được chọn
  const employeePayrolls = employees.find(e => e.id === selectedEmployee)?.payrolls || [];

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
                  <div>
                    <label htmlFor="payroll" className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn bảng lương
                    </label>
                    <select
                      id="payroll"
                      value={selectedPayroll || ''}
                      onChange={(e) => setSelectedPayroll(Number(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Chọn bảng lương</option>
                      {/* Hiển thị các bảng lương của nhân viên đã chọn */}
                      {employeePayrolls.map((payroll) => (
                        <option key={payroll.id} value={payroll.id}>
                          Tháng {payroll.month}/{payroll.year}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền thưởng
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