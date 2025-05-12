import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { TrainingService } from '../../services/TrainingService';
import { Department } from '../../services/TrainingService';
import { ExportFormat } from '../../services/TrainingReportService';

interface ExportTrainingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (exportFormat: ExportFormat, startDate: string, endDate: string, departmentId?: number) => void;
}

const ExportTrainingReportModal: React.FC<ExportTrainingReportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  // Chỉ còn một định dạng PDF
  const exportFormat = ExportFormat.PDF;
  
  const [startDate, setStartDate] = useState<string>(
    format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Tải danh sách phòng ban khi modal được mở
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await TrainingService.getDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error("Không thể tải danh sách phòng ban:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExport(exportFormat, startDate, endDate, departmentId);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Xuất báo cáo đào tạo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Bỏ phần chọn định dạng báo cáo vì chỉ còn PDF */}

          {/* Khoảng thời gian */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Phòng ban */}
          <div className="mb-6">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Phòng ban (tùy chọn)
            </label>
            <select
              id="department"
              value={departmentId || ""}
              onChange={(e) => setDepartmentId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xuất báo cáo PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportTrainingReportModal; 