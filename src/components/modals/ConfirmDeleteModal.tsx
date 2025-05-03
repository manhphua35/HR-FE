import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // Hàm sẽ được gọi khi xác nhận xóa
  itemName: string; // Tên của mục cần xóa (ví dụ: tên nhân viên)
  itemType?: string; // Loại mục (ví dụ: 'nhân viên'), mặc định là 'mục này'
  isLoading?: boolean; // Trạng thái loading khi đang xóa
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  itemType = 'mục này',
  isLoading = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-5">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
          <button 
            type="button" 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" 
            onClick={onClose}
            disabled={isLoading} // Vô hiệu hóa khi đang loading
          >
            <i className="fas fa-times w-5 h-5"></i>
            <span className="sr-only">Đóng modal</span>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="mb-5 text-center">
          <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa {itemType}?</p>
          <p className="font-medium text-gray-900 mt-1">{itemName}</p>
          <p className="text-sm text-red-600 mt-2">Hành động này không thể hoàn tác.</p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center pt-5 border-t mt-5 space-x-4">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading} // Vô hiệu hóa khi đang loading
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={isLoading} // Vô hiệu hóa khi đang loading
            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Đang xóa...
              </>
            ) : (
              'Xác nhận xóa'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;