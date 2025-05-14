import React, { useState, useEffect } from 'react';

interface Employee {
  id: number;
  fullName: string;
  payrolls?: { id: number; month: number; year: number }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { employeeId: number; deductionAmount: number; deductionNote: string }) => void;
  employees: Employee[];
}

const PayrollAddDeductionModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, employees }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    deductionAmount: '',
    deductionNote: ''
  });

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employeeId: '',
        deductionAmount: '',
        deductionNote: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      employeeId: parseInt(formData.employeeId),
      deductionAmount: parseFloat(formData.deductionAmount),
      deductionNote: formData.deductionNote
    });
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
                <h3 className="text-xl font-semibold text-gray-800">Thêm khấu trừ</h3>
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
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Nhân viên
                  </label>
                  <select
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
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
                  <label htmlFor="deductionAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền khấu trừ
                  </label>
                  <input
                    id="deductionAmount"
                    type="number"
                    value={formData.deductionAmount}
                    onChange={(e) => setFormData({ ...formData, deductionAmount: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="10000"
                  />
                </div>

                <div>
                  <label htmlFor="deductionNote" className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do khấu trừ
                  </label>
                  <textarea
                    id="deductionNote"
                    value={formData.deductionNote}
                    onChange={(e) => setFormData({ ...formData, deductionNote: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
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
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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

export default PayrollAddDeductionModal;
