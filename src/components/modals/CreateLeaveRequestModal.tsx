import React, { useState } from 'react';
import { CreateLeaveRequest } from '../../services/LeaveService';

interface CreateLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeaveRequest) => void;
}

const CreateLeaveRequestModal: React.FC<CreateLeaveRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    startDate: '',
    endDate: '',
    type: 'ANNUAL', // Changed initial state to uppercase
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Tạo yêu cầu nghỉ phép
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nghỉ phép
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.type}
                onChange={(e) => setFormData({
                  ...formData,
                  type: e.target.value as CreateLeaveRequest['type']
                })}
                required
              >
                {/* Changed option values to uppercase to match backend enum */}
                <option value="ANNUAL">Nghỉ phép năm</option>
                <option value="SICK">Nghỉ ốm</option>
                <option value="UNPAID">Nghỉ không lương</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.startDate}
                onChange={(e) => setFormData({
                  ...formData,
                  startDate: e.target.value
                })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.endDate}
                onChange={(e) => setFormData({
                  ...formData,
                  endDate: e.target.value
                })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({
                  ...formData,
                  reason: e.target.value
                })}
                required
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            >
              Tạo yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeaveRequestModal;