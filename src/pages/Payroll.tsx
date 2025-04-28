import React, { useState, useEffect } from 'react';
import { PayrollService, PayrollItem, PayrollSummary } from '../services/PayrollService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Payroll: React.FC = () => {
  const { currentUser } = useAuth();
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [month, year] = selectedMonth.split('-');
      const [itemsData, summaryData] = await Promise.all([
        PayrollService.getPayrollItems(month, parseInt(year)),
        PayrollService.getPayrollSummary(month, parseInt(year))
      ]);
      setPayrollItems(itemsData);
      setSummary(summaryData);
      setError('');
    } catch (err) {
      setError('Failed to fetch payroll data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      const [month, year] = selectedMonth.split('-');
      await PayrollService.generatePayroll(month, parseInt(year));
      fetchPayrollData();
    } catch (err) {
      setError('Failed to generate payroll');
      console.error(err);
    }
  };

  const handleApprovePayroll = async () => {
    try {
      await PayrollService.approvePayroll(selectedItems);
      fetchPayrollData();
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to approve payroll items');
      console.error(err);
    }
  };

  const handleProcessPayment = async () => {
    try {
      await PayrollService.processPayment(selectedItems);
      fetchPayrollData();
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  const handleExportReport = async () => {
    try {
      const [month, year] = selectedMonth.split('-');
      const blob = await PayrollService.exportPayrollReport(month, parseInt(year));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll-report-${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export report');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const isHR = currentUser?.role === 'hr_manager';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <div className="flex space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          {isHR && (
            <>
              <button
                onClick={handleGeneratePayroll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Generate Payroll
              </button>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payroll Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payroll</p>
                <h3 className="text-2xl font-bold">{summary.totalPayroll.toLocaleString()} VND</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i className="fas fa-users text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <h3 className="text-2xl font-bold">{summary.totalEmployees}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Salary</p>
                <h3 className="text-2xl font-bold">{summary.averageSalary.toLocaleString()} VND</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <i className="fas fa-percentage text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Change</p>
                <h3 className={`text-2xl font-bold ${
                  summary.monthlyComparison.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.monthlyComparison.percentageChange >= 0 ? '+' : ''}
                  {summary.monthlyComparison.percentageChange}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Payroll List</h3>
          {isHR && selectedItems.length > 0 && (
            <div className="space-x-4">
              <button
                onClick={handleApprovePayroll}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve Selected
              </button>
              <button
                onClick={handleProcessPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Process Payment
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isHR && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === payrollItems.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(payrollItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollItems.map((item) => (
                <tr key={item.id}>
                  {isHR && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.employeeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.baseSalary.toLocaleString()} VND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.overtime.toLocaleString()} VND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.bonus.toLocaleString()} VND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.deductions.toLocaleString()} VND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.netSalary.toLocaleString()} VND</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${item.status === 'paid' ? 'bg-green-100 text-green-800' :
                        item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;