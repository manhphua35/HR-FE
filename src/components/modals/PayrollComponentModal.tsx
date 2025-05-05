import React from 'react';
import { PayrollComponentWithUser } from '../../services/PayrollService';

type ComponentType = 'ALLOWANCE' | 'DEDUCTION';

interface Employee {
  id: number;
  fullName: string;
  baseSalary: string;
}

interface PayrollComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void; // Đổi type để chấp nhận userId
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
  const [formData, setFormData] = React.useState({
    name: '',
    amount: '',
    type: 'ALLOWANCE' as ComponentType,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      userId: selectedEmployee
    });
    // Reset form
    setFormData({
      name: '',
      amount: '',
      type: 'ALLOWANCE',
      description: ''
    });
    onClose();
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

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khoản
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
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

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Loại
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ComponentType })}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALLOWANCE">Phụ cấp</option>
                    <option value="DEDUCTION">Khấu trừ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
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