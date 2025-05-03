import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import axios default
import { PayrollService, PayrollItem, CalculatePayrollData } from '../services/PayrollService'; // Removed PayrollSummary
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Payroll: React.FC = () => { // Changed component name to match export
  const { currentUser } = useAuth();
  // State for list view (Managers/HR/Admin)
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);
  // State for detail view (Employee)
  const [payrollDetail, setPayrollDetail] = useState<PayrollItem | null>(null);
  // State for selected items in the table - REMOVED
  // const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  // const selectAllCheckboxRef = useRef<HTMLInputElement>(null); // Ref for the select all checkbox - REMOVED

  useEffect(() => {
    if (currentUser) { // Ensure currentUser is available before fetching
      fetchPayrollData();
    } else {
      setLoading(false); // Stop loading if no user
      // Optionally set an error or show a message prompting login
      // setError("User not authenticated.");
    }
  }, [selectedMonth, currentUser]); // Add currentUser dependency

  // Determine user role flags
  const isEmployee = currentUser?.role?.roleType === 'EMPLOYEE';
  const isManager = currentUser?.role?.roleType === 'DEPARTMENT_MANAGER';
  const isAdminOrHR = currentUser?.role?.roleType === 'SYSTEM_ADMIN' || currentUser?.role?.roleType === 'HR_MANAGER';

  // Effect to handle the indeterminate state of the select all checkbox - REMOVED
  /*
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const numSelectable = payrollItems.filter(item => item.status !== 'paid').length;
      const numSelected = selectedItems.length;
      selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numSelectable;
      // Also ensure checked state is correct when indeterminate is false
      if (numSelected === 0 || numSelected === numSelectable) {
         selectAllCheckboxRef.current.checked = numSelected === numSelectable && numSelectable > 0;
      }
    }
  }, [selectedItems, payrollItems]);
  */

  const fetchPayrollData = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError("");
    setPayrollItems([]); // Clear previous list data
    setPayrollDetail(null); // Clear previous detail data
    // setSelectedItems([]); // Clear selection - REMOVED

    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const month = parseInt(monthStr);
      const year = parseInt(yearStr);

      // Logic simplified: Only fetch detail for employee view.
      // Manager/Admin/HR view will have an empty list as there's no API to fetch it.
      if (isEmployee) {
        try {
          const detailData = await PayrollService.getMonthlyPayrollDetail(currentUser.id, month, year);
          setPayrollDetail(detailData);
          setPayrollItems([]); // Ensure list is empty for employee view
        } catch (detailErr: any) {
          // Check for isAxiosError property directly on the error object
          if (detailErr.isAxiosError && detailErr.response?.status === 404) {
            // No detail data for employee, which is fine
            setPayrollDetail(null);
            setError(`No payroll record found for you for ${monthStr}/${yearStr}.`); // Inform user
          } else {
             setError("Failed to fetch your payroll details.");
             console.error("Fetch Payroll Detail Error:", detailErr);
             setPayrollDetail(null); // Ensure detail is null on other errors
          }
          setPayrollItems([]); // Ensure list is empty on error too
        }
      } else {
         // For Manager/Admin/HR, set items to empty as there's no list API
         setPayrollItems([]);
         setPayrollDetail(null); // Ensure detail is null for these roles
         // Optionally set an info message instead of an error
         // setError("Payroll list view is currently unavailable.");
      }
    } catch (err: any) { // Catch any unexpected errors during setup (like date parsing)
      setError("An unexpected error occurred while preparing to fetch payroll data.");
      console.error("Payroll Data Prep Error:", err);
      setPayrollItems([]);
      setPayrollDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // Renamed and updated to use calculateMonthlyPayroll
  const handleCalculatePayroll = async () => {
    try {
      const [yearStr, monthStr] = selectedMonth.split('-');
      const data: CalculatePayrollData = {
        month: parseInt(monthStr),
        year: parseInt(yearStr)
        // Optionally add employeeIds: [currentUser.id] if backend supports calculating for specific users
      };
      await PayrollService.calculateMonthlyPayroll(data);
      fetchPayrollData(); // Refresh data after calculation
    } catch (err) {
      setError('Failed to calculate payroll');
      console.error(err);
    }
  };

  // --- Bulk Action Handlers (for HR/Admin) - REMOVED (No backend API) ---
  /*
  const handleApproveSelected = async () => {
    if (!isAdminOrHR || selectedItems.length === 0) return;
    try {
      await PayrollService.approvePayrollItems(selectedItems);
      setSelectedItems([]); // Clear selection after action
      fetchPayrollData(); // Refresh data
    } catch (err) {
      setError('Failed to approve selected payroll items');
      console.error(err);
    }
  };
  */
  /*
  const handleProcessSelected = async () => {
    if (!isAdminOrHR || selectedItems.length === 0) return;
    try {
      await PayrollService.processPayrollPayments(selectedItems);
      setSelectedItems([]); // Clear selection after action
      fetchPayrollData(); // Refresh data
    } catch (err) {
      setError('Failed to process payments for selected items');
      console.error(err);
    }
  };
  */

  // Removed handleExportReport (can be added back if needed)

  // --- Selection Handlers - REMOVED ---
  /*
  const handleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };
  */
  /*
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      // Select only items that are eligible for bulk actions (e.g., not already paid)
      const allSelectableIds = payrollItems
        .filter(item => item.status !== 'paid') // Example filter
        .map(item => item.id);
      setSelectedItems(allSelectableIds);
    } else {
      setSelectedItems([]);
    }
  };
  */

  // Function to handle finalizing a single payroll item (if applicable)
  const handleFinalizePayroll = async (payrollId: number) => {
    if (!isAdminOrHR) return; // Allow HR or Admin
    try {
      await PayrollService.finalizeMonthlyPayroll(payrollId);
      fetchPayrollData(); // Refresh data
    } catch (err) {
      setError('Failed to finalize payroll');
      console.error(err);
    }
  };


  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Show error only if it's a real error, not just missing data
  // Display error if it exists
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Role checks already defined above (isEmployee, isManager, isAdminOrHR)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Management</h2>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md" // Use p-2 for consistency
          />
          {/* Updated button to Calculate Payroll */}
          {isAdminOrHR && ( // Only HR/Admin can calculate
             <button
              onClick={handleCalculatePayroll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading} // Disable while loading
            >
              Calculate Payroll
            </button>
          )}
          {/* Removed Export Report button */}
        </div>
      </div>

      {/* --- Conditional Rendering based on Role --- */}

      {/* View for Employee */}
      {isEmployee && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
          <h3 className="text-lg font-semibold mb-4">My Payroll Details for {selectedMonth}</h3>
          {loading ? <p>Loading details...</p> : payrollDetail ? (
            <div className="space-y-4">
              {/* Display details (same as before) */}
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium text-gray-600">Employee:</span> {payrollDetail.employeeName} (ID: {payrollDetail.employeeId})</div>
                <div><span className="font-medium text-gray-600">Department:</span> {payrollDetail.department}</div>
                <div><span className="font-medium text-gray-600">Position:</span> {payrollDetail.position}</div>
                <div><span className="font-medium text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${payrollDetail.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payrollDetail.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      payrollDetail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {payrollDetail.status}
                  </span>
                </div>
                <div><span className="font-medium text-gray-600">Base Salary:</span> {(payrollDetail.baseSalary ?? 0).toLocaleString()} VND</div>
                <div><span className="font-medium text-gray-600">Overtime:</span> {(payrollDetail.overtime ?? 0).toLocaleString()} VND</div>
                <div><span className="font-medium text-gray-600">Bonus:</span> {(payrollDetail.bonus ?? 0).toLocaleString()} VND</div>
                <div><span className="font-medium text-gray-600">Deductions:</span> {(payrollDetail.deductions ?? 0).toLocaleString()} VND</div>
                <div><span className="font-medium text-gray-600">Tax:</span> {(payrollDetail.tax ?? 0).toLocaleString()} VND</div>
                <div><span className="font-medium text-gray-600">Insurance:</span> {(payrollDetail.insurance ?? 0).toLocaleString()} VND</div>
                <div className="col-span-2 text-lg font-bold"><span className="font-medium text-gray-600">Net Salary:</span> {(payrollDetail.netSalary ?? 0).toLocaleString()} VND</div>
                {payrollDetail.paymentDate && <div><span className="font-medium text-gray-600">Payment Date:</span> {format(new Date(payrollDetail.paymentDate), 'yyyy-MM-dd')}</div>}
              </div>
              {/* Finalize button for individual item (if HR/Admin is viewing their own) */}
              {isAdminOrHR && payrollDetail.status !== 'paid' && payrollDetail.status !== 'approved' && (
                <div className="mt-4">
                  <button
                    onClick={() => handleFinalizePayroll(payrollDetail.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Finalize My Payroll
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              No payroll data available for you for the selected month.
            </p>
          )}
        </div>
      )}

      {/* View for Manager/HR/Admin */}
      {(isManager || isAdminOrHR) && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isAdminOrHR ? 'Company Payroll' : 'Department Payroll'} for {selectedMonth}
            </h3>
             {/* Bulk Action Buttons for HR/Admin - REMOVED */}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Checkbox column removed */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  {/* Department shown for Admin/HR, not Manager */}
                  {isAdminOrHR && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary (VND)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {/* Actions column only for Admin/HR */}
                  {isAdminOrHR && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                   // Adjusted colspan based on whether Department column is shown
                  <tr><td colSpan={isAdminOrHR ? 6 : 4} className="text-center py-4">Loading data...</td></tr>
                ) : payrollItems.length > 0 ? ( // This condition will likely always be false now
                  payrollItems.map((item) => (
                    <tr key={item.id}>
                      {/* Checkbox cell removed */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.employeeName} (ID: {item.employeeId})</td>
                      {isAdminOrHR && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.department}</td>}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{(item.netSalary ?? 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${item.status === 'paid' ? 'bg-green-100 text-green-800' :
                            item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {item.status}
                        </span>
                      </td>
                      {isAdminOrHR && (
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          {item.status !== 'paid' && item.status !== 'approved' && ( // Finalize button logic remains, but won't be rendered if items are empty
                            <button
                              onClick={() => handleFinalizePayroll(item.id)}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              disabled={loading}
                            >
                              Finalize
                            </button>
                          )}
                          {/* Add other actions like 'View Detail' if needed */}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                   // Adjusted colspan and message
                  <tr><td colSpan={isAdminOrHR ? 6 : 4} className="text-center py-4 text-sm text-gray-500">No payroll list data available. {isAdminOrHR && "Try calculating payroll first."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll; // Changed component name to match export