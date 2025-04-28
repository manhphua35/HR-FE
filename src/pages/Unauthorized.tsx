import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
      <div className="text-6xl font-bold text-red-500 mb-4">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Access Denied</h1>
      <p className="text-gray-600 mt-4 mb-6">You don't have permission to access this page. Please contact your administrator if you think this is an error.</p>
      <Link 
        to="/dashboard" 
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
