import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl font-medium text-gray-600 mt-4">Không tìm thấy trang</p>
      <p className="text-gray-500 mt-2 mb-6">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        to="/dashboard" 
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Quay lại Trang chủ
      </Link>
    </div>
  );
};

export default NotFound;
