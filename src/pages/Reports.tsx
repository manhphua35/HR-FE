// import React, { useState, useEffect } from 'react';
// import { ReportService, DepartmentReportParams, HRCostParams, DashboardDataParams } from '../services/ReportService';
// import { useAuth } from '../contexts/AuthContext';
// import { format, subMonths } from 'date-fns';
// import { saveAs } from 'file-saver';
// import { User } from '../types/api';
// import axios from '../config/axios';
// // Thay đổi import, xóa jsPDF và autoTable
// // import jsPDF from 'jspdf';
// // import autoTable from 'jspdf-autotable';
// // Comment out không import docx: import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, TextRun, BorderStyle, WidthType, AlignmentType } from 'docx';

// // Mở rộng interface cho TypeScript để hỗ trợ autoTable
// declare module 'jspdf' {
//   interface jsPDF {
//     autoTable: (options: any) => any;
//   }
// }

// interface Department {
//   id: number;
//   name: string;
//   description: string;
// }

// interface DepartmentResponse {
//   success: boolean;
//   data: Department[];
// }

// // Thêm interface để định nghĩa kiểu dữ liệu cho hrCostStats
// interface HRCostStat {
//   department: string;
//   totalEmployees: number;
//   totalCost: number;
//   averageCost: number;
// }

// interface DepartmentReport {
//   reportDate: string;
//   totalEmployees: number;
//   newEmployees: number;
//   totalLeaves: number;
//   totalSalary: number;
//   averagePerformanceRating?: number;
// }

// const Reports: React.FC = () => {
//   const { currentUser } = useAuth();
//   const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
//   const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>('');
//   const [isGeneratingReport, setIsGeneratingReport] = useState(false);
//   const [exportLoading, setExportLoading] = useState(false);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [successModalMessage, setSuccessModalMessage] = useState('');

//   // State for new report data
//   const [departmentReports, setDepartmentReports] = useState<DepartmentReport[] | null>(null);
//   const [hrCostStats, setHrCostStats] = useState<HRCostStat[] | null>(null);
//   const [dashboardData, setDashboardData] = useState<any | null>(null);
//   const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
//   const [companyReports, setCompanyReports] = useState<any[] | null>(null);

//   // Determine user roles for conditional fetching and rendering using string literals from AuthContext
//   // Assuming 'HR_STAFF' in frontend maps to 'HR_STAFF' in backend routes
//   // Assuming 'DEPARTMENT_MANAGER' in frontend maps to 'DEPARTMENT_HEAD' in backend routes
//   const userRole = currentUser?.role?.roleType;
//   const isHrOrAdmin = userRole === 'HR_STAFF' || userRole === 'SYSTEM_ADMIN';
//   const isDeptHead = userRole === 'DEPARTMENT_MANAGER';

//   useEffect(() => {
//     if (currentUser) { // Only fetch if user data is available
//       fetchReportData();
//     } else {
//       setLoading(false); // Stop loading if no user
//       setError("Dữ liệu người dùng không có sẵn.");
//     }
//   }, [startDate, endDate, currentUser]); // Re-fetch when dates or user change

//   const fetchReportData = async () => {
//     if (!currentUser?.role?.roleType) {
//       setError("Vai trò người dùng chưa được xác định.");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setDepartmentReports(null);
//     setHrCostStats(null);
//     setDashboardData(null);
//     setCompanyReports(null);

//     const dateObj = new Date(endDate);
//     const month = dateObj.getMonth() + 1;
//     const year = dateObj.getFullYear();

//     const deptParams: DepartmentReportParams = { startDate, endDate };
//     const hrCostParams: HRCostParams = { month, year };
//     let dashboardParams: DashboardDataParams = { month, year };

//     try {
//       const promises = [];

//       // Xác định nếu người dùng chọn phòng ban cụ thể
//       const hasSelectedDepartment = selectedDepartmentId || (isDeptHead && currentUser.departmentId);
//       const departmentId = isDeptHead && currentUser.departmentId ? currentUser.departmentId : selectedDepartmentId || undefined;

//       // Nếu là HR hoặc Admin và không chọn phòng ban cụ thể, lấy báo cáo toàn công ty
//       if (isHrOrAdmin && !hasSelectedDepartment) {
//         promises.push(
//           ReportService.getDepartmentReports(undefined, deptParams)
//             .then(data => {
//               if (Array.isArray(data) && data.length > 0) {
//                 setCompanyReports(data);
//               } else {
//               }
//             })
//             .catch(err => {
//               setError(prev => prev + "\nLấy báo cáo toàn công ty thất bại.");
//             })
//         );
//       }

//       // Fetch Department Reports (HR, Admin, Dept Head) khi chọn một phòng ban cụ thể
//       if ((isHrOrAdmin || isDeptHead) && hasSelectedDepartment) {
//         if (departmentId) {
//           console.log("Đang tải báo cáo cho phòng ban:", departmentId);
//           promises.push(
//             ReportService.getDepartmentReports(departmentId, deptParams)
//               .then(data => {
//                 console.log("Department Reports data:", data);
//                 setDepartmentReports(data);
//               })
//               .catch(err => {
//                 console.error("Lấy báo cáo phòng ban thất bại:", err);
//                 setError(prev => prev + "\nLấy báo cáo phòng ban thất bại.");
//               })
//           );
//         }
//       }

//       // Fetch HR Cost Statistics (HR, Admin) với filter phòng ban nếu có
//       if (isHrOrAdmin) {
//         if (departmentId) {
//           hrCostParams.departmentId = departmentId;
//         }
//         promises.push(
//           ReportService.getHRCostStatistics(hrCostParams)
//             .then(data => {
//               console.log("HR Cost data:", data);
//               setHrCostStats(data);
//             })
//             .catch(err => {
//               console.error("Lấy thống kê chi phí nhân sự thất bại:", err);
//               setError(prev => prev + "\nLấy thống kê chi phí nhân sự thất bại.");
//             })
//         );
//       }

//       // Fetch Dashboard Data (HR, Admin, Dept Head) với filter phòng ban nếu có
//       if (isHrOrAdmin || isDeptHead) {
//         if (departmentId) {
//           dashboardParams.departmentId = departmentId;
//         }
//         promises.push(
//           ReportService.getDashboardData(dashboardParams)
//             .then(data => {
//               console.log("Dashboard data:", data);
//               setDashboardData(data);
//             })
//             .catch(err => {
//               console.error("Lấy dữ liệu bảng điều khiển thất bại:", err);
//               setError(prev => prev + "\nLấy dữ liệu bảng điều khiển thất bại.");
//             })
//         );
//       }

//       await Promise.all(promises);

//     } catch (err) {
//       console.error('Lỗi không mong muốn khi fetch dữ liệu:', err);
//       setError('Đã xảy ra lỗi không mong muốn khi lấy dữ liệu báo cáo.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExport = async () => {
//     try {
//       setExportLoading(true);
      
//       // Kiểm tra xem có dữ liệu để xuất không
//       if (!departmentReports && !hrCostStats && !dashboardData && !companyReports) {
//         setError("Không có dữ liệu để xuất báo cáo. Vui lòng tạo báo cáo trước.");
//         setExportLoading(false);
//         return;
//       }
      
//       console.log("Chuẩn bị xuất báo cáo với dữ liệu:", {
//         departmentReports,
//         hrCostStats,
//         dashboardData,
//         companyReports
//       });

//       // Chuẩn bị dữ liệu báo cáo
//       const reportData = {
//         title: `Báo cáo từ ${startDate} đến ${endDate}`,
//         generatedAt: new Date().toLocaleDateString('vi-VN'),
//         departmentReports: departmentReports || [],
//         hrCostStats: hrCostStats || [],
//         dashboardData: dashboardData || null,
//         companyReports: companyReports || [],
//         userInfo: {
//           name: currentUser?.fullName || 'N/A',
//           role: currentUser?.role?.roleType || 'N/A',
//           department: currentUser?.department || 'N/A'
//         }
//       };

//       // Xuất báo cáo PDF sử dụng ReportService
//       const pdfBlob = await ReportService.exportReportAsPDF(reportData);
      
//       // Lưu file PDF
//       saveAs(pdfBlob, `bao-cao-nhan-su-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      
//       // Hiển thị thông báo thành công
//       setSuccessModalMessage('Xuất báo cáo PDF thành công!');
//       setShowSuccessModal(true);
//       setExportLoading(false);
//     } catch (error: any) {
//       console.error("Xuất báo cáo thất bại:", error);
//       setError(`Xuất báo cáo thất bại: ${error.message || "Lỗi không xác định"}. Vui lòng thử lại sau.`);
//       setExportLoading(false);
//     }
//   };

//   const handleGenerateReport = async () => {
//     try {
//       if (!currentUser) {
//         setError("Không có thông tin người dùng.");
//         return;
//       }

//       setIsGeneratingReport(true);

//       const departmentId = isDeptHead ? currentUser.departmentId : selectedDepartmentId;
      
//       // Nếu người dùng là HR Manager hoặc Admin và không chọn phòng ban (chọn toàn công ty)
//       if (isHrOrAdmin && !departmentId) {
//         console.log("Đang tạo báo cáo toàn công ty");
//         try {
//           const response = await ReportService.generateCompanyReport({
//             startDate,
//             endDate
//           });
//           console.log("Kết quả tạo báo cáo toàn công ty:", response);
//           setCompanyReports(response);
//           await fetchReportData();
//           setIsGeneratingReport(false);
//           return;
//         } catch (error) {
//           console.error("Tạo báo cáo toàn công ty thất bại:", error);
//           setError("Tạo báo cáo toàn công ty thất bại. Vui lòng thử lại sau.");
//           setIsGeneratingReport(false);
//           return;
//         }
//       }
      
//       // Trường hợp phải chọn phòng ban (cho Department Head hoặc khi HR Manager/Admin chọn một phòng ban cụ thể)
//       if (!departmentId) {
//         setError("Vui lòng chọn phòng ban để tạo báo cáo.");
//         setIsGeneratingReport(false);
//         return;
//       }
      
//       console.log("Đang tạo báo cáo phòng ban:", departmentId);
//       const response = await ReportService.generateDepartmentReport({
//         departmentId,
//         startDate,
//         endDate
//       });
//       console.log("Kết quả tạo báo cáo phòng ban:", response);
      
//       // Refresh data after generating report
//       console.log("Đang tải lại dữ liệu báo cáo...");
//       await fetchReportData();
      
//     } catch (error) {
//       console.error("Tạo báo cáo thất bại:", error);
//       setError("Tạo báo cáo thất bại. Vui lòng thử lại sau.");
//     } finally {
//       setIsGeneratingReport(false);
//     }
//   };

//   // Thêm useEffect để lấy danh sách phòng ban
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       try {
//         setLoadingDepartments(true);
//         const response = await axios.get<DepartmentResponse>('/departments/list');
//         setDepartments(response.data.data); // Lấy mảng departments từ response.data.data
//       } catch (error) {
//         console.error('Lỗi khi lấy danh sách phòng ban:', error);
//         setError('Không thể lấy danh sách phòng ban');
//       } finally {
//         setLoadingDepartments(false);
//       }
//     };

//     fetchDepartments();
//   }, []);

//   useEffect(() => {
//     // Thêm useEffect để theo dõi sự thay đổi của selectedDepartmentId
//     if (currentUser) {
//       console.log("selectedDepartmentId changed:", selectedDepartmentId);
//       fetchReportData();
//     }
//   }, [selectedDepartmentId]);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Báo cáo</h2>
//         <div className="flex space-x-4">
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-md"
//           />
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-md"
//           />
          
//           {/* Thêm nút tạo báo cáo mới */}
//           {(isHrOrAdmin || isDeptHead) && (
//             <button
//               onClick={handleGenerateReport}
//               disabled={isGeneratingReport}
//               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
//             >
//               {isGeneratingReport ? (
//                 <>
//                   <i className="fas fa-spinner fa-spin mr-2"></i>
//                   Đang tạo...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-plus mr-2"></i>
//                   Tạo báo cáo
//                 </>
//               )}
//             </button>
//           )}
          
//           {/* Nút xuất báo cáo PDF */}
//           {(departmentReports || hrCostStats || dashboardData) && (
//             <button
//               onClick={handleExport}
//               disabled={exportLoading}
//               className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
//             >
//               {exportLoading ? (
//                 <>
//                   <i className="fas fa-spinner fa-spin mr-2"></i>
//                   Đang xuất...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-download mr-2"></i>
//                   Xuất báo cáo PDF
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Phòng ban selector cho admin và HR */}
//       {isHrOrAdmin && (
//         <div className="bg-white rounded-lg shadow-sm p-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Chọn phòng ban
//           </label>
//           <select
//             value={selectedDepartmentId || ''}
//             onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : null)}
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//             disabled={loadingDepartments}
//           >
//             <option value="">Toàn công ty</option>
//             {departments.map((dept) => (
//               <option key={dept.id} value={dept.id}>
//                 {dept.name}
//               </option>
//             ))}
//           </select>
//           {loadingDepartments && (
//             <div className="mt-2 text-sm text-gray-500">
//               Đang tải danh sách phòng ban...
//             </div>
//           )}
//         </div>
//       )}

//       {loading ? (
//         <div className="p-6 text-center">Đang tải dữ liệu báo cáo...</div>
//       ) : error ? (
//         <div className="p-6 text-red-500 whitespace-pre-line">{error}</div>
//       ) : (
//         <div className="space-y-6">
//           {/* Display HR Cost Statistics (HR/Admin only) */}
//           {isHrOrAdmin && hrCostStats && (
//             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//               <h3 className="text-xl font-semibold mb-4">Thống kê chi phí nhân sự</h3>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số nhân viên</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng chi phí</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí trung bình</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {hrCostStats.map((stat: HRCostStat, index: number) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.department}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalEmployees}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stat.totalCost)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stat.averageCost)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Display Department Reports (Dept Head sees their own) */}
//           {isDeptHead && departmentReports && (
//              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//                <h3 className="text-xl font-semibold mb-4">Báo cáo phòng ban (Phòng ban của bạn)</h3>
//                <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày báo cáo</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng nhân viên</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên mới</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng ngày nghỉ</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng lương</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đánh giá TB</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {departmentReports.map((report: DepartmentReport) => (
//                       <tr key={report.reportDate} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportDate ? new Date(report.reportDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.totalEmployees}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.newEmployees}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.totalLeaves}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalSalary)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                           {typeof report.averagePerformanceRating === 'number' 
//                             ? report.averagePerformanceRating.toFixed(2)
//                             : 'N/A'}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//              </div>
//           )}

//           {/* Display Dashboard Data (HR/Admin/Dept Head) */}
//           {(isHrOrAdmin || isDeptHead) && dashboardData && (
//             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//               <h3 className="text-xl font-semibold mb-4">Tổng quan dữ liệu</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
//                   <div className="text-sm text-blue-600 mb-1">Tổng nhân viên</div>
//                   <div className="text-2xl font-bold">{dashboardData.summary.totalEmployees}</div>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg shadow-sm">
//                   <div className="text-sm text-green-600 mb-1">Đơn nghỉ phép hoạt động</div>
//                   <div className="text-2xl font-bold">{dashboardData.summary.activeLeaves}</div>
//                 </div>
//                 <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
//                   <div className="text-sm text-purple-600 mb-1">Tổng lương</div>
//                   <div className="text-2xl font-bold">{dashboardData.summary.totalSalary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dashboardData.summary.totalSalary) : "0 ₫"}</div>
//                 </div>
//               </div>
              
//               <h4 className="text-lg font-semibold mb-3">Thống kê theo phòng ban</h4>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số nhân viên</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn nghỉ phép</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khóa đào tạo</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đánh giá TB</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng lương</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {dashboardData.departments.map((dept: any) => (
//                       <tr key={dept.department} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.department}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.employeeCount}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.leaveCount}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.trainingCount}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.avgPerformance.toFixed(2)}</td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.totalSalary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dept.totalSalary) : "0 ₫"}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Display Company Reports (HR/Admin only) */}
//           {isHrOrAdmin && companyReports && (
//             <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
//               <h3 className="text-xl font-semibold mb-4">Báo cáo toàn công ty</h3>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng nhân viên</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên mới</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên nghỉ việc</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng ngày nghỉ</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lương cơ bản</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phụ cấp</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khấu trừ</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng thực lãnh</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ đào tạo</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm đánh giá TB</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {/* Remove duplicates by using Set */}
//                     {Array.from(new Set(companyReports.map(report => report.departmentId))).map(departmentId => {
//                       const report = companyReports.find(r => r.departmentId === departmentId);
//                       if (!report) return null;
                      
//                       const department = departments.find(d => d.id === departmentId);
//                       const totalNetSalary = Number(report.totalSalary || 0) + Number(report.totalAllowances || 0) - Number(report.totalDeductions || 0);
                      
//                       return (
//                         <tr key={departmentId} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{department?.name || `Phòng ban ${departmentId}`}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.totalEmployees}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.newEmployees}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.resignedEmployees}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.totalLeaves}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalSalary || 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalAllowances || 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.totalDeductions || 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalNetSalary)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.totalTrainingHours}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {typeof report.averagePerformanceRating === 'number'
//                               ? report.averagePerformanceRating.toFixed(2)
//                               : 'N/A'}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                     {/* Summary row */}
//                     {(() => {
//                       // Filter to get only the latest report for each department
//                       const latestReportsPerDepartment = Array.from(new Set(companyReports.map(r => r.departmentId)))
//                         .map(deptId => companyReports.find(r => r.departmentId === deptId))
//                         .filter(report => report) as any[]; // Filter out undefined and type as any[]

//                       if (latestReportsPerDepartment.length === 0 && companyReports.length > 0) {
//                         // Fallback or handle if latestReportsPerDepartment is empty but companyReports is not (should not happen with current logic)
//                         // For safety, you might log or return a simple row if this edge case is hit.
//                         // However, with the current find logic, this should contain the latest reports.
//                       }

//                       return (
//                         <tr className="bg-gray-50 font-semibold">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Tổng cộng</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.reduce((sum, report) => sum + (report.totalEmployees || 0), 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.reduce((sum, report) => sum + (report.newEmployees || 0), 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.reduce((sum, report) => sum + (report.resignedEmployees || 0), 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.reduce((sum, report) => sum + (report.totalLeaves || 0), 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
//                               latestReportsPerDepartment.reduce((sum, report) => sum + Number(report.totalSalary || 0), 0)
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
//                               latestReportsPerDepartment.reduce((sum, report) => sum + Number(report.totalAllowances || 0), 0)
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
//                               latestReportsPerDepartment.reduce((sum, report) => sum + Number(report.totalDeductions || 0), 0)
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
//                               latestReportsPerDepartment.reduce((sum, report) => sum + (
//                                 Number(report.totalSalary || 0) +
//                                 Number(report.totalAllowances || 0) -
//                                 Number(report.totalDeductions || 0)
//                               ), 0)
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.reduce((sum, report) => sum + (report.totalTrainingHours || 0), 0)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {latestReportsPerDepartment.length > 0
//                               ? (latestReportsPerDepartment.reduce((sum, report) => {
//                                   const rating = typeof report.averagePerformanceRating === 'number'
//                                     ? report.averagePerformanceRating
//                                     : 0;
//                                   return sum + rating;
//                                 }, 0) / latestReportsPerDepartment.length).toFixed(2)
//                               : 'N/A'}
//                           </td>
//                         </tr>
//                       );
//                     })()}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Message if no relevant reports are available for the user */}
//           {!loading && !error && !hrCostStats && !departmentReports && !dashboardData && !companyReports && (
//              <div className="p-6 text-center text-gray-500">
//                Không có báo cáo nào cho vai trò của bạn hoặc khoảng thời gian đã chọn. 
//                Vui lòng nhấn nút "Tạo báo cáo" để tạo báo cáo mới.
//              </div>
//           )}
//         </div>
//       )}

//       {/* Thêm Modal thông báo thành công */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-green-600">Thành công</h3>
//               <button
//                 onClick={() => setShowSuccessModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                 </svg>
//               </button>
//             </div>
//             <div className="text-center mb-4">
//               <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
//                 <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                 </svg>
//               </div>
//               <p className="text-gray-700">{successModalMessage}</p>
//             </div>
//             <div className="text-center">
//               <button
//                 onClick={() => setShowSuccessModal(false)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
//               >
//                 Đóng
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Reports;
export {};