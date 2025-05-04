import React, { useState, useEffect } from 'react';
import { DepartmentService, Department, DepartmentSummary } from '../services/DepartmentService';

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [summary, setSummary] = useState<DepartmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      const [departmentsData, summaryData] = await Promise.all([
        DepartmentService.getDepartments(),
        DepartmentService.getDepartmentSummary()
      ]);
      setDepartments(departmentsData);
      setSummary(summaryData);
      setError("");
    } catch (err) {
      setError("Lấy dữ liệu phòng ban thất bại");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
        <button className="mt-3 md:mt-0 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
          + Thêm phòng ban
        </button>
      </div>

      {/* Department Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Departments</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{summary.totalDepartments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Employees</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{summary.totalEmployees}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Avg. Team Size</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{summary.averageTeamSize}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Budget</h3>
            <p className="mt-2 text-3xl font-bold text-primary">{summary.totalBudget}</p>
          </div>
        </div>
      )}

      {/* Department Cards */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Department List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <div key={department.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-primary text-lg">{department.name}</h4>
                <button className="text-gray-500 hover:text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Employees:</span>
                  <span className="font-medium">{department.employeeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-medium">{department.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">{department.budget}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 bg-primary-light text-primary font-medium rounded hover:bg-primary hover:text-white transition-colors duration-200">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Departments;