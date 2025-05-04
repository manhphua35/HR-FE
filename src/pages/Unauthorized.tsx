import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <div className="text-6xl font-bold text-red-500 mb-4">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Truy cập bị từ chối</h1>
      <p className="text-gray-600 mt-4 mb-6">Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
      <Link
        to="/dashboard" 
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Quay lại Trang chủ
      </Link>
    </div>
  );
};

export default Unauthorized;
