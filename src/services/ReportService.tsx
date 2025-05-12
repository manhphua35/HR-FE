// import axios from '../config/axios'; // Use configured axios instance
// import { API_URL } from '../config';
// import { Font, Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';
// import React from 'react';

// // Đăng ký font hỗ trợ tiếng Việt - cần phải nhúng font Roboto thông qua URL
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { 
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
//       fontWeight: 'normal' 
//     },
//     { 
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
//       fontWeight: 'bold' 
//     },
//     { 
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf',
//       fontStyle: 'italic',
//       fontWeight: 'normal'
//     }
//   ],
// });

// // Đảm bảo không ngắt từ tiếng Việt
// Font.registerHyphenationCallback(word => [word]);

// // Định nghĩa styles cho PDF
// const styles = StyleSheet.create({
//   page: {
//     flexDirection: 'column',
//     backgroundColor: '#FFFFFF',
//     padding: 30,
//     fontFamily: 'Roboto'
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     flexGrow: 1
//   },
//   header: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#003399',
//     fontWeight: 'bold'
//   },
//   title: {
//     fontSize: 16,
//     marginBottom: 10,
//     textAlign: 'center'
//   },
//   subtitle: {
//     fontSize: 12,
//     marginBottom: 10,
//     textAlign: 'center',
//     color: '#666666'
//   },
//   tableContainer: {
//     marginTop: 10,
//     marginBottom: 20
//   },
//   tableHeader: {
//     backgroundColor: '#003399',
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#000000',
//     alignItems: 'center',
//     height: 24,
//     textAlign: 'center',
//     fontWeight: 'bold',
//     color: '#FFFFFF'
//   },
//   tableRow: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#CCCCCC',
//     alignItems: 'center',
//     height: 24
//   },
//   tableRowEven: {
//     backgroundColor: '#F2F2F2'
//   },
//   tableRowTotal: {
//     backgroundColor: '#E0E0E0',
//     fontWeight: 'bold'
//   },
//   tableCell: {
//     textAlign: 'center',
//     flex: 1,
//     padding: 4,
//     fontSize: 9
//   },
//   text: {
//     fontSize: 10,
//     marginBottom: 5
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15
//   },
//   statBox: {
//     width: '30%',
//     padding: 10,
//     backgroundColor: '#F0F7FF',
//     borderRadius: 5
//   },
//   statTitle: {
//     fontSize: 10,
//     color: '#0066CC'
//   },
//   statValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginTop: 5
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 30,
//     left: 30,
//     right: 30,
//     textAlign: 'center',
//     fontSize: 8,
//     color: '#666666'
//   },
//   pageNumber: {
//     position: 'absolute',
//     bottom: 30,
//     right: 30,
//     fontSize: 8,
//     color: '#666666'
//   }
// });

// // Define interfaces based on expected backend responses (using 'any' for now)
// // TODO: Replace 'any' with actual types when backend structure is known

// export interface DepartmentReportParams {
//   startDate?: string;
//   endDate?: string;
//   departmentId?: number;
// }

// export interface GenerateDepartmentReportData {
//   departmentId: number;
//   startDate: string;
//   endDate: string;
// }

// export interface GenerateCompanyReportData {
//   startDate: string;
//   endDate: string;
// }

// export interface HRCostParams {
//   month: number;
//   year: number;
//   departmentId?: number;
// }

// export interface DashboardDataParams {
//   month: number;
//   year: number;
//   departmentId?: number;
// }

// export interface ExportReportData {
//   title: string;
//   generatedAt: string;
//   departmentReports: any;
//   hrCostStats: any;
//   dashboardData: any;
//   companyReports?: any;
//   userInfo: {
//     name?: string;
//     role?: string;
//     department?: string;
//   };
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// }

// // Định nghĩa interface cho bảng
// interface PDFTableProps {
//   headers: string[];
//   data: any[][];
//   includeTotal?: boolean;
// }

// // Component để hiển thị bảng trong PDF
// const PDFTable = ({ headers, data, includeTotal = false }: PDFTableProps) => {
//   return React.createElement(
//     View, 
//     { style: styles.tableContainer },
//     React.createElement(
//       View, 
//       { style: styles.tableHeader },
//       headers.map((header: string, index: number) => 
//         React.createElement(
//           Text, 
//           { key: index, style: styles.tableCell }, 
//           header
//         )
//       )
//     ),
//     data.map((row: any[], rowIndex: number) => {
//       const isTotal = includeTotal && rowIndex === data.length - 1;
//       return React.createElement(
//         View, 
//         { 
//           key: rowIndex, 
//           style: [
//             styles.tableRow, 
//             rowIndex % 2 === 1 ? styles.tableRowEven : {}, 
//             isTotal ? styles.tableRowTotal : {}
//           ]
//         },
//         row.map((cell: any, cellIndex: number) => 
//           React.createElement(
//             Text, 
//             { key: cellIndex, style: styles.tableCell }, 
//             cell
//           )
//         )
//       );
//     })
//   );
// };

// // Định nghĩa interface cho Report Document
// interface ReportDocumentProps {
//   data: ExportReportData;
// }

// // Component cho báo cáo PDF
// const ReportDocument = ({ data }: ReportDocumentProps) => {
//   // Định dạng số tiền
//   const formatCurrency = (amount: number | undefined): string => {
//     return new Intl.NumberFormat('vi-VN').format(amount || 0);
//   };

//   // Tạo các row dữ liệu cho bảng báo cáo công ty
//   const createCompanyReportRows = () => {
//     if (!data.companyReports || data.companyReports.length === 0) return [];
    
//     const reportRows = data.companyReports.map((report: any) => [
//       report.departmentName || `Phòng ban ${report.departmentId}`,
//       report.totalEmployees?.toString() || '0',
//       report.newEmployees?.toString() || '0',
//       report.resignedEmployees?.toString() || '0',
//       report.totalLeaves?.toString() || '0',
//       formatCurrency(report.totalSalary || 0),
//       formatCurrency(report.totalAllowances || 0),
//       formatCurrency(report.totalDeductions || 0),
//       formatCurrency((report.totalSalary || 0) + (report.totalAllowances || 0) - (report.totalDeductions || 0)),
//       report.totalTrainingHours?.toString() || '0',
//       typeof report.averagePerformanceRating === 'number' ? report.averagePerformanceRating.toFixed(2) : 'N/A'
//     ]);
    
//     // Thêm hàng tổng cộng
//     reportRows.push([
//       'Tổng cộng',
//       data.companyReports.reduce((sum: number, r: any) => sum + (r.totalEmployees || 0), 0).toString(),
//       data.companyReports.reduce((sum: number, r: any) => sum + (r.newEmployees || 0), 0).toString(),
//       data.companyReports.reduce((sum: number, r: any) => sum + (r.resignedEmployees || 0), 0).toString(),
//       data.companyReports.reduce((sum: number, r: any) => sum + (r.totalLeaves || 0), 0).toString(),
//       formatCurrency(data.companyReports.reduce((sum: number, r: any) => sum + (r.totalSalary || 0), 0)),
//       formatCurrency(data.companyReports.reduce((sum: number, r: any) => sum + (r.totalAllowances || 0), 0)),
//       formatCurrency(data.companyReports.reduce((sum: number, r: any) => sum + (r.totalDeductions || 0), 0)),
//       formatCurrency(data.companyReports.reduce((sum: number, r: any) => sum + ((r.totalSalary || 0) + (r.totalAllowances || 0) - (r.totalDeductions || 0)), 0)),
//       data.companyReports.reduce((sum: number, r: any) => sum + (r.totalTrainingHours || 0), 0).toString(),
//       (data.companyReports.reduce((sum: number, r: any) => sum + (typeof r.averagePerformanceRating === 'number' ? r.averagePerformanceRating : 0), 0) / data.companyReports.length).toFixed(2)
//     ]);
    
//     return reportRows;
//   };
  
//   // Tạo các row dữ liệu cho bảng chi phí nhân sự
//   const createHRCostRows = () => {
//     if (!data.hrCostStats || data.hrCostStats.length === 0) return [];
    
//     return data.hrCostStats.map((stat: any) => [
//       stat.department || 'N/A',
//       stat.totalEmployees?.toString() || '0',
//       formatCurrency(stat.totalCost || 0),
//       formatCurrency(stat.averageCost || 0)
//     ]);
//   };

//   return React.createElement(
//     Document,
//     {},
//     React.createElement(
//       Page,
//       { size: 'A4', orientation: 'landscape', style: styles.page },
//       // Header
//       React.createElement(Text, { style: styles.header }, "HỆ THỐNG QUẢN LÝ NHÂN SỰ"),
//       React.createElement(Text, { style: styles.title }, data.title),
//       React.createElement(Text, { style: styles.subtitle }, `Ngày xuất báo cáo: ${data.generatedAt}`),
//       React.createElement(Text, { style: styles.subtitle }, `Người tạo báo cáo: ${data.userInfo.name || 'N/A'} - ${data.userInfo.role || 'N/A'}`),
      
//       // Báo cáo toàn công ty
//       data.companyReports && data.companyReports.length > 0 && React.createElement(
//         View,
//         { style: styles.section },
//         React.createElement(
//           Text, 
//           { style: [styles.text, { fontWeight: 'bold', fontSize: 14 }] }, 
//           "BÁO CÁO TOÀN CÔNG TY"
//         ),
//         React.createElement(
//           PDFTable,
//           {
//             headers: [
//               'Phòng ban', 'Tổng NV', 'NV mới', 'NV nghỉ việc', 
//               'Ngày nghỉ', 'Lương cơ bản', 'Phụ cấp', 
//               'Khấu trừ', 'Thực lãnh', 'Giờ đào tạo', 'Điểm TB'
//             ],
//             data: createCompanyReportRows(),
//             includeTotal: true
//           }
//         )
//       ),
      
//       // Chi phí nhân sự
//       data.hrCostStats && data.hrCostStats.length > 0 && React.createElement(
//         View,
//         { style: styles.section, break: true },
//         React.createElement(
//           Text, 
//           { style: [styles.text, { fontWeight: 'bold', fontSize: 14 }] }, 
//           "THỐNG KÊ CHI PHÍ NHÂN SỰ"
//         ),
//         React.createElement(
//           PDFTable,
//           {
//             headers: ['Phòng ban', 'Số NV', 'Tổng chi phí', 'Chi phí trung bình'],
//             data: createHRCostRows()
//           }
//         )
//       ),
      
//       // Dashboard data
//       data.dashboardData && React.createElement(
//         View,
//         { style: styles.section, break: true },
//         React.createElement(
//           Text, 
//           { style: [styles.text, { fontWeight: 'bold', fontSize: 14 }] }, 
//           "TỔNG QUAN DỮ LIỆU"
//         ),
//         data.dashboardData.overview && React.createElement(
//           View,
//           {},
//           React.createElement(
//             Text, 
//             { style: [styles.text, { fontWeight: 'bold', marginTop: 10 }] }, 
//             "Thông tin tổng quan:"
//           ),
//           React.createElement(
//             View,
//             { style: styles.statsContainer },
//             React.createElement(
//               View,
//               { style: styles.statBox },
//               React.createElement(Text, { style: styles.statTitle }, "Tổng nhân viên"),
//               React.createElement(Text, { style: styles.statValue }, data.dashboardData.overview.totalEmployees?.toString() || '0')
//             ),
//             React.createElement(
//               View,
//               { style: styles.statBox },
//               React.createElement(Text, { style: styles.statTitle }, "Đơn nghỉ phép hoạt động"),
//               React.createElement(Text, { style: styles.statValue }, data.dashboardData.overview.activeLeaves?.toString() || '0')
//             ),
//             React.createElement(
//               View,
//               { style: styles.statBox },
//               React.createElement(Text, { style: styles.statTitle }, "Tổng lương"),
//               React.createElement(Text, { style: styles.statValue }, formatCurrency(data.dashboardData.overview.totalSalary || 0))
//             )
//           )
//         )
//       ),
      
//       // No data message
//       !data.companyReports && !data.hrCostStats && !data.dashboardData && React.createElement(
//         View,
//         { style: styles.section },
//         React.createElement(
//           Text, 
//           { style: [styles.text, { color: 'red', textAlign: 'center', marginTop: 40 }] }, 
//           "Không có dữ liệu báo cáo trong khoảng thời gian này"
//         )
//       ),
      
//       // Footer
//       React.createElement(Text, { style: styles.footer }, "HR Management System © 2023"),
//       React.createElement(
//         Text, 
//         { 
//           style: styles.pageNumber,
//           render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
//             `Trang ${pageNumber} / ${totalPages}`
//           )
//         }
//       )
//     )
//   );
// };

// export const ReportService = {
//   /**
//    * Generates a company-wide report.
//    * Requires HR_STAFF or SYSTEM_ADMIN role.
//    * Corresponds to: POST /reports/company
//    */
//   generateCompanyReport: async (data: GenerateCompanyReportData): Promise<any> => {
//     const response = await axios.post<ApiResponse<any>>(
//       `${API_URL}/reports/company`,
//       data
//     );
//     console.log('generateCompanyReport response:', response.data);
//     return response.data.data;
//   },

//   /**
//    * Generates a department report.
//    * Requires HR_STAFF or SYSTEM_ADMIN role.
//    * Corresponds to: POST /reports/departments
//    */
//   generateDepartmentReport: async (data: GenerateDepartmentReportData): Promise<any> => {
//     const response = await axios.post<ApiResponse<any>>(
//       `${API_URL}/reports/departments`,
//       data
//     );
//     console.log('generateDepartmentReport response:', response.data);
//     return response.data.data;
//   },

//   /**
//    * Gets department reports over time for a specific department.
//    * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
//    * Corresponds to: GET /reports/departments/:departmentId
//    */
//   getDepartmentReports: async (departmentId?: number, params?: DepartmentReportParams): Promise<any[]> => {
//     // Nếu không có departmentId, lấy báo cáo toàn công ty
//     const url = departmentId 
//       ? `${API_URL}/reports/departments/${departmentId}`
//       : `${API_URL}/reports/company`;
      
//     const response = await axios.get<ApiResponse<any[]>>(
//       url,
//       { params }
//     );
//     console.log('getDepartmentReports response:', response.data);
//     return response.data.data;
//   },

//   /**
//    * Gets HR cost statistics.
//    * Requires HR_STAFF or SYSTEM_ADMIN role.
//    * Corresponds to: GET /reports/hr-cost
//    */
//   getHRCostStatistics: async (params: HRCostParams): Promise<any> => {
//     const response = await axios.get<ApiResponse<any>>(
//       `${API_URL}/reports/hr-cost`,
//       { params }
//     );
//     console.log('getHRCostStatistics response:', response.data);
//     return response.data.data;
//   },

//   /**
//    * Gets aggregated data for the dashboard.
//    * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
//    * Corresponds to: GET /reports/dashboard-data
//    */
//   getDashboardData: async (params: DashboardDataParams): Promise<any> => {
//     const response = await axios.get<ApiResponse<any>>(
//       `${API_URL}/reports/dashboard-data`,
//       { params }
//     );
//     console.log('getDashboardData response:', response.data);
//     return response.data.data;
//   },

//   /**
//    * Exports a report as a PDF file.
//    */
//   exportReportAsPDF: async (reportData: ExportReportData): Promise<Blob> => {
//     try {
//       console.log("Bắt đầu tạo PDF với dữ liệu:", reportData);
      
//       // Tạo đối tượng Document với dữ liệu báo cáo
//       const pdfDocument = React.createElement(ReportDocument, { data: reportData });
      
//       // Tạo Blob từ Document
//       const blob = await pdf(pdfDocument).toBlob();
//       return blob;
//     } catch (error) {
//       console.error("Lỗi khi tạo PDF:", error);
//       throw new Error(`Không thể tạo file PDF: ${error}`);
//     }
//   },

//   /**
//    * Exports a report containing various data.
//    * This is a frontend function that formats the data for export.
//    * Can be extended to use a backend API for PDF/Excel generation.
//    */
//   exportReport: async (data: ExportReportData): Promise<Blob> => {
//     // Có thể gọi API backend nếu muốn xuất báo cáo từ server
//     // const response = await axios.post(
//     //   `${API_URL}/reports/export`,
//     //   data,
//     //   { responseType: 'blob' }
//     // );
//     // return response.data;

//     // Hoặc xử lý trực tiếp ở frontend
//     const jsonData = JSON.stringify(data, null, 2);
//     return new Blob([jsonData], { type: 'application/json' });
//   }
// };

// // Example usage (to be placed in the component):
// /*
// import { ReportService } from '../services/ReportService';
// import { useAuth } from '../contexts/AuthContext';

// const MyComponent = () => {
//   const { currentUser } = useAuth();

//   const fetchDeptReports = async () => {
//     if (currentUser?.departmentId && (currentUser.role?.roleType === 'DEPARTMENT_HEAD' || currentUser.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN')) {
//       try {
//         const reports = await ReportService.getDepartmentReports(currentUser.departmentId, { startDate: '...', endDate: '...' });
//         // Update state with reports
//       } catch (error) {
//         console.error("Failed to fetch department reports", error);
//       }
//     }
//   };

//   const fetchHRCosts = async () => {
//      if (currentUser?.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN') {
//         try {
//           const costs = await ReportService.getHRCostStatistics({ startDate: '...', endDate: '...' });
//           // Update state with costs
//         } catch (error) {
//           console.error("Failed to fetch HR costs", error);
//         }
//      }
//   };
// }
// */ 
export {}; 