import React, { useState, useEffect } from 'react';
import { ReportService, DepartmentReportParams, HRCostParams, DashboardDataParams } from '../services/ReportService';
import { useAuth } from '../contexts/AuthContext';
import { format, subMonths } from 'date-fns';

// Removed local RoleType enum definition. Will use string literals from currentUser.

const Reports: React.FC = () => {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // State for new report data
  const [departmentReports, setDepartmentReports] = useState<any[] | null>(null);
  const [hrCostStats, setHrCostStats] = useState<any | null>(null);
  const [dashboardData, setDashboardData] = useState<any | null>(null);

  // Determine user roles for conditional fetching and rendering using string literals from AuthContext
  // Assuming 'HR_MANAGER' in frontend maps to 'HR_STAFF' in backend routes
  // Assuming 'DEPARTMENT_MANAGER' in frontend maps to 'DEPARTMENT_HEAD' in backend routes
  const userRole = currentUser?.role?.roleType;
  const isHrOrAdmin = userRole === 'HR_MANAGER' || userRole === 'SYSTEM_ADMIN';
  const isDeptHead = userRole === 'DEPARTMENT_MANAGER';

  useEffect(() => {
    if (currentUser) { // Only fetch if user data is available
      fetchReportData();
    } else {
      setLoading(false); // Stop loading if no user
      setError("User data not available.");
    }
  }, [startDate, endDate, currentUser]); // Re-fetch when dates or user change

  const fetchReportData = async () => {
    if (!currentUser?.role?.roleType) {
      setError("User role not defined.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setDepartmentReports(null);
    setHrCostStats(null);
    setDashboardData(null);

    // Reverted: Send dates in YYYY-MM-DD format as originally intended.
    // If 400 error persists, the issue is likely in the backend controller logic.
    // Extract month and year from endDate for HR Cost and Dashboard Data APIs
    const dateObj = new Date(endDate);
    const month = dateObj.getMonth() + 1; // JS months are 0-indexed
    const year = dateObj.getFullYear();

    const deptParams: DepartmentReportParams = { startDate, endDate }; // Keep using startDate/endDate for this one
    const hrCostParams: HRCostParams = { month, year };
    let dashboardParams: DashboardDataParams = { month, year };


    try {
      const promises = [];

      // Fetch Department Reports (HR, Admin, Dept Head) - Uses startDate, endDate
      if ((isHrOrAdmin || isDeptHead) && currentUser.departmentId) {
         // For HR/Admin, maybe allow selecting department? For now, use user's dept if DeptHead.
         // Let's assume for now DeptHead sees their own, HR/Admin might need a selector later.
         if (isDeptHead) {
             promises.push(
                 ReportService.getDepartmentReports(currentUser.departmentId, deptParams) // Use deptParams
                     .then(data => setDepartmentReports(data))
                     .catch(err => {
                         console.error("Failed to fetch department reports:", err);
                         setError(prev => prev + "\nFailed to fetch department reports.");
                     })
             );
         }
         // TODO: Add logic for HR/Admin to fetch reports for specific/all departments if needed
      }

      // Fetch HR Cost Statistics (HR, Admin)
      if (isHrOrAdmin) {
        promises.push(
          ReportService.getHRCostStatistics(hrCostParams) // Use hrCostParams
            .then(data => setHrCostStats(data))
            .catch(err => {
              console.error("Failed to fetch HR cost statistics:", err);
              setError(prev => prev + "\nFailed to fetch HR cost statistics.");
            })
        );
      }

      // Fetch Dashboard Data (HR, Admin, Dept Head)
      if (isHrOrAdmin || isDeptHead) {
        // Add departmentId for Dept Head if backend filters based on it
        if (isDeptHead && currentUser.departmentId) {
            dashboardParams.departmentId = currentUser.departmentId; // Add to the existing dashboardParams
        }
         promises.push(
             ReportService.getDashboardData(dashboardParams) // Use dashboardParams (already contains month, year, and potentially deptId)
                 .then(data => setDashboardData(data))
                 .catch(err => {
                     console.error("Failed to fetch dashboard data:", err);
                     setError(prev => prev + "\nFailed to fetch dashboard data.");
                 })
         );
      }

      await Promise.all(promises);

    } catch (err) {
      // Catch errors not caught by individual promises (e.g., setup errors)
      setError('An unexpected error occurred while fetching report data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export function removed - needs clarification based on backend
  /*
  const handleExport = async () => {
    // ... implementation needed based on new backend export APIs ...
  };
  */

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          {/* Export button removed */}
          {/*
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <i className="fas fa-download mr-2"></i>
            Export Report
          </button>
          */}
        </div>
      </div>

      {/* Removed Tabs */}

      {loading ? (
        <div className="p-6 text-center">Loading report data...</div>
      ) : error ? (
        <div className="p-6 text-red-500 whitespace-pre-line">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Display HR Cost Statistics (HR/Admin only) */}
          {isHrOrAdmin && hrCostStats && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">HR Cost Statistics</h3>
              {/* Render hrCostStats data - using JSON.stringify as placeholder */}
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(hrCostStats, null, 2)}
              </pre>
            </div>
          )}

          {/* Display Department Reports (Dept Head sees their own) */}
          {isDeptHead && departmentReports && (
             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
               <h3 className="text-xl font-semibold mb-4">Department Reports (Your Department)</h3>
               {/* Render departmentReports data - using JSON.stringify as placeholder */}
               <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                 {JSON.stringify(departmentReports, null, 2)}
               </pre>
             </div>
          )}
          {/* TODO: Add UI for HR/Admin to select and view department reports */}


          {/* Display Dashboard Data (HR/Admin/Dept Head) */}
          {(isHrOrAdmin || isDeptHead) && dashboardData && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">Dashboard Data</h3>
              {/* Render dashboardData - using JSON.stringify as placeholder */}
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(dashboardData, null, 2)}
              </pre>
            </div>
          )}

          {/* Message if no relevant reports are available for the user */}
          {!loading && !error && !hrCostStats && !departmentReports && !dashboardData && (
             <div className="p-6 text-center text-gray-500">No reports available for your role or selected period.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;