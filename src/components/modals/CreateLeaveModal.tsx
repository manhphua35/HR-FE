import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { differenceInDays, parse } from 'date-fns';

type LeaveType = 'ANNUAL' | 'SICK' | 'OTHER';

interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    type: LeaveType;
    reason: string;
    numberOfDays: number;
  }) => Promise<void>;
  title?: string;
}

interface LeaveFormData {
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  numberOfDays: number;
}

const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Tạo đơn nghỉ phép'
}) => {
  const [formData, setFormData] = useState<LeaveFormData>({
    startDate: '',
    endDate: '',
    type: 'ANNUAL',
    reason: '',
    numberOfDays: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically calculate numberOfDays when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDate = parse(formData.startDate, 'yyyy-MM-dd', new Date());
      const endDate = parse(formData.endDate, 'yyyy-MM-dd', new Date());
      
      if (endDate >= startDate) {
        const days = differenceInDays(endDate, startDate) + 1;
        setFormData(prev => ({ ...prev, numberOfDays: days }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate dates
    if (!formData.startDate || !formData.endDate) {
      setError('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    if (formData.numberOfDays > 30) {
      setError('Thời gian nghỉ phép không được quá 30 ngày');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Vui lòng nhập lý do nghỉ phép');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setError('Có lỗi xảy ra khi tạo đơn nghỉ phép');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {title}
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            {formData.startDate && formData.endDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số ngày nghỉ
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg bg-gray-50"
                  value={formData.numberOfDays}
                  readOnly
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại nghỉ phép
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as LeaveType
                }))}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ANNUAL">Nghỉ phép năm</option>
                <option value="SICK">Nghỉ ốm</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Nhập lý do nghỉ phép..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : 'Tạo đơn'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateLeaveModal;