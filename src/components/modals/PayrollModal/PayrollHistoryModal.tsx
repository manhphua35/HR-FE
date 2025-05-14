import React, { useState, useEffect } from 'react';
import { PayrollHistoryEntry, PayrollService } from '../../../services/PayrollService';
import { formatDateTime } from '../../../utils/dateUtils';

interface PayrollHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollId: number | null;
}

const PayrollHistoryModal: React.FC<PayrollHistoryModalProps> = ({ isOpen, onClose, payrollId }) => {
  const [historyData, setHistoryData] = useState<PayrollHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  
  // Lấy dữ liệu khi mở modal
  useEffect(() => {
    const fetchHistory = async () => {
      if (!payrollId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await PayrollService.getPayrollHistory(payrollId);
        setHistoryData(data || []);
      } catch (err: any) {
        setError(err.message || 'Không thể tải lịch sử thay đổi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [payrollId, isOpen]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    
    // Kiểm tra nếu là số tiền
    if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(typeof value === 'string' ? parseFloat(value) : value);
    }
    
    return String(value);
  };
  
  const getFieldLabel = (field: string): string => {
    const fieldLabels: Record<string, string> = {
      baseSalary: 'Lương cơ bản',
      bonus: 'Thưởng',
      totalAllowance: 'Phụ cấp',
      totalDeduction: 'Khấu trừ',
      totalBenefit: 'Phúc lợi',
      tax: 'Thuế',
      netSalary: 'Lương thực nhận',
      note: 'Ghi chú',
    };
    
    return fieldLabels[field] || field;
  };

  // Hiện hộp thoại xác nhận trước khi xóa
  const confirmDelete = (timestamp: string) => {
    setEntryToDelete(timestamp);
    setShowConfirmDelete(true);
  };
  
  // Xử lý xóa sau khi đã xác nhận
  const handleDelete = async () => {
    if (!payrollId || !entryToDelete) return;
    
    setIsDeleting(true);
    setDeletingId(entryToDelete);
    
    try {
      const result = await PayrollService.deletePayrollHistoryEntry(payrollId, entryToDelete);
      if (result.success) {
        // Xóa thành công - Cập nhật UI ngay lập tức bằng cách lọc dữ liệu hiện tại
        setHistoryData(prev => prev.filter(entry => entry.timestamp !== entryToDelete));
        setError(null);
        
        // Thông báo cho component cha để refresh dữ liệu
        if (onClose) {
          onClose();
          // Delay để đảm bảo modal đóng trước khi refresh
          setTimeout(() => {
            window.location.reload();
          }, 300);
        }
      } else {
        setError('Không thể xóa mục lịch sử');
      }
    } catch (err: any) {
      setError(err.message || 'Không thể xóa mục lịch sử');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setShowConfirmDelete(false);
      setEntryToDelete(null);
    }
  };

  // Hủy xóa
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setEntryToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Lịch sử thay đổi bảng lương</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-auto flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          {!loading && !error && historyData.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Không có lịch sử thay đổi
            </div>
          )}
          
          {!loading && !error && historyData.length > 0 && (
            <div className="space-y-6">
              {historyData.map((entry, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg shadow-sm bg-white overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gray-50 p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b">
                    <div className="flex flex-col">
                      <div className="flex items-center text-gray-800 font-medium">
                        <i className="fas fa-user-edit mr-2 text-blue-500"></i>
                        {entry.updatedByUser ? (
                          <span>
                            {entry.updatedByUser.fullName}{' '}
                            {entry.updatedByUser.position && <span className="text-gray-500 text-sm">({entry.updatedByUser.position})</span>}
                            {entry.updatedByUser.department && <span className="text-gray-500 text-sm"> - {entry.updatedByUser.department}</span>}
                          </span>
                        ) : (
                          <span className="text-gray-500">Hệ thống</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <i className="fas fa-clock mr-2"></i>
                        {formatDateTime(entry.timestamp)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {entry.reason && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <i className="fas fa-info-circle mr-1"></i>
                          {entry.reason}
                        </div>
                      )}
                      
                      {/* Nút xóa */}
                      <button
                        onClick={() => confirmDelete(entry.timestamp)}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                        title="Xóa mục này"
                      >
                        {isDeleting && deletingId === entry.timestamp ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash-alt"></i>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Nội dung ghi chú cụ thể của lần thay đổi này */}
                  {entry.note && (
                    <div className="px-4 py-3 bg-yellow-50 border-b">
                      <div className="flex">
                        <div className="flex-shrink-0 text-yellow-500">
                          <i className="fas fa-sticky-note mt-1"></i>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Ghi chú</h3>
                          <div className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                            {entry.note}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Thông tin giá trị thay đổi */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết thay đổi:</h3>
                    
                    {/* Tổng kết các giá trị chính */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {entry.changes.some(c => c.field === 'netSalary') && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-xs text-green-500 uppercase font-semibold">Lương thực nhận</div>
                          <div className="flex justify-between mt-1">
                            <div className="text-sm text-gray-600">
                              {formatValue(entry.changes.find(c => c.field === 'netSalary')?.oldValue)}
                            </div>
                            <div className="font-medium">
                              <i className="fas fa-arrow-right text-gray-400 mx-2"></i>
                            </div>
                            <div className="text-sm font-semibold text-green-600">
                              {formatValue(entry.changes.find(c => c.field === 'netSalary')?.newValue)}
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.changes.some(c => c.field === 'totalDeduction') && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="text-xs text-red-500 uppercase font-semibold">Tổng khấu trừ</div>
                          <div className="flex justify-between mt-1">
                            <div className="text-sm text-gray-600">
                              {formatValue(entry.changes.find(c => c.field === 'totalDeduction')?.oldValue)}
                            </div>
                            <div className="font-medium">
                              <i className="fas fa-arrow-right text-gray-400 mx-2"></i>
                            </div>
                            <div className="text-sm font-semibold text-red-600">
                              {formatValue(entry.changes.find(c => c.field === 'totalDeduction')?.newValue)}
                            </div>
                          </div>
                        </div>
                      )}

                      {entry.changes.some(c => c.field === 'bonus') && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-500 uppercase font-semibold">Thưởng</div>
                          <div className="flex justify-between mt-1">
                            <div className="text-sm text-gray-600">
                              {formatValue(entry.changes.find(c => c.field === 'bonus')?.oldValue)}
                            </div>
                            <div className="font-medium">
                              <i className="fas fa-arrow-right text-gray-400 mx-2"></i>
                            </div>
                            <div className="text-sm font-semibold text-blue-600">
                              {formatValue(entry.changes.find(c => c.field === 'bonus')?.newValue)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Chi tiết từng thay đổi */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-2 rounded-tl-lg">Trường</th>
                            <th scope="col" className="px-4 py-2">Giá trị cũ</th>
                            <th scope="col" className="px-4 py-2 rounded-tr-lg">Giá trị mới</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {entry.changes.map((change, changeIndex) => (
                            <tr key={changeIndex} className={changeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 font-medium text-gray-900">{getFieldLabel(change.field)}</td>
                              <td className="px-4 py-3 text-gray-500">
                                <div className={change.field === 'note' ? 'max-w-xs break-words' : ''}>
                                  {formatValue(change.oldValue)}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                <div className={`${change.field === 'note' ? 'max-w-xs break-words' : ''} ${change.field === 'totalDeduction' || change.field === 'tax' ? 'text-red-600' : change.field === 'bonus' || change.field === 'totalAllowance' || change.field === 'totalBenefit' || change.field === 'netSalary' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {formatValue(change.newValue)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
      
      {/* Dialog xác nhận xóa */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center text-red-600 mb-4">
                <i className="fas fa-exclamation-triangle text-2xl mr-3"></i>
                <h3 className="text-lg font-medium">Xác nhận xóa</h3>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa mục lịch sử này không? 
                Thao tác này sẽ khôi phục lại giá trị lương trước khi thay đổi và không thể hoàn tác.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Đang xóa...
                    </>
                  ) : (
                    <>Xóa</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollHistoryModal; 