import axios from '../config/axios'; // Use configured axios instance
import { API_URL } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Font cho tiếng Việt
// Cần chuyển đổi phông chữ sang định dạng Base64
const VN_FONT = {
  // Mã hóa base64 của phông chữ Roboto - hỗ trợ tiếng Việt
  normal: 'AAEAAAATAQAABAAwRkZUTXgQdwMAAAE8AAAAHEdERUYAJwCMAAAAVAAAACBPUy8yepiS8AAAAXAAAABWY21hcNHUuswAAALIAAABamN2dCAG5x6YAAAEZAAAAChmcGdtD7QvpwAABJwAAAJlZ2x5ZpwBUVUAAAUcAAANFGhlYWQX/A6jAAAYIAAAADZoaGVhCH8DnQAAGFgAAAAkaG10eCMGARoAABh8AAAAVmxvY2EWUhYEAAAYyAAAACxtYXhwAX8A+gAAGPQAAAAgbmFtZdYLsFMAABkUAAABQXBvc3QBxQCnAAAaWAAAAEtwcmVwhmfafQAAIngAAABvAAEAAAACAAAGdaD9Xw889QALAgAAAAAA1jj9zQAAAADZVZmD////+wIAAe8AAAAIAAIAAAAAAAAAAQAAA3j/bgAAAf////8CAAEAAAAAAAAAAAAAAAAAAAAAEAABAAAAFgBbAAUAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEACQAAAAEAAAAAAAIABwByAAEAAAAAAAMACQA8AAEAAAAAAAQACQCHAAEAAAAAAAUACwAbAAEAAAAAAAYACQBXAAEAAAAAAAoAGgC8AAMAAQQJAAEAEgAJAAMAAQQJAAIADgB5AAMAAQQJAAMAEgBFAAMAAQQJAAQAEgCQAAMAAQQJAAUAFgAmAAMAAQQJAAYAEgBgAAMAAQQJAAoANADWAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAUgBvAGIAbwB0AG8AIABSAGUAZwB1AGwAYQByACAAOgAgADIANwAtADEALQAyADAAMQA1AABGb250Rm9yZ2UgMi4wIDogUm9ib3RvIFJlZ3VsYXIgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAFYAZQByAHMAaQBvAG4AIAAxAC4ARgBvAG4AdABGAG8AcgBnAGUAIAAyAC4AMAAgADoAIABSAG8AYgBvAHQAbwAtAFIAZQBnAHUAbABhAHIAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAFZlcnNpb24gMS4Gb250Rm9yZ2UgMi4wIDogUm9ib3RvLVJlZ3VsYXIgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAAAAAAAAAAAAAAAAAAAAAAAAABcAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAGEAYgBjAGQAZQBmAGcAaABpAGoAawBsAG0AbgBvAHAAcQByAHMAcw',
  bold: 'AAEAAAATAQAABAAwRkZUTXeEt+0AAAE8AAAAHEdERUYAJwCMAAAAVAAAACBPUy8yeuJUHwAAAXAAAABWY21hcNEzuDoAAALMAAABZmN2dCAG5x6YAAAEfAAAAChmcGdtD7QvpwAABMQAAAJlZ2x5ZoVf2GMAAAUcAAAMyGhlYWQX/eB0AAAZxAAAADZoaGVhCIAD3wAAGfwAAAAkaG10eBwAA+MAABogAAAAXGxvY2EYdhfuAAAagAAAADBtYXhwAYABCwAAE0AAAAAgbmFtZVvgcfkAABrQAAABOXBvc3QBxgCnAAAcDAAAAEtwcmVwhmfafQAAHUAAAABvAAEAAAACAAAiZXHYXw889QALAgAAAAAA1i1+jgAAAADZVc2b////+wIAAfsAAAAIAAIAAAAAAAAAAQAAAeL/FQAAAgD////+AgABAAAAAAAAAAAAAAAAAAAAABUAAQAAABYAXQAGAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABAAwAAAABAAAAAAACAAcALgABAAAAAAADAAwAVAABAAAAAAAEAAwAhgABAAAAAAAFAAsArgABAAAAAAAGAAwAuQABAAAAAAAKABoBCgADAAEECQABABgADAADAAEECQACAA4ANQADAAEECQADABgAYAADAAEECQAEABgAkgADAAEECQAFABYAuQADAAEECQAGABgAxQADAAEECQAKADQBJABSAG8AYgBvAHQAbwAtAEIAbwBsAGQAAFJvYm90by1Cb2xkAABCAG8AbABkAABCb2xkAABGAG8AbgB0AEYAbwByAGcAZQAgADIALgAwACAAOgAgAFIAbwBiAG8AdABvACAASQB0AGEAbABpAGMAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBSb2JvdG8gSXRhbGljIDogMjctMS0yMDE1AABSAG8AYgBvAHQAbwAtAEIAbwBsAGQAAFJvYm90by1Cb2xkAABWAGUAcgBzAGkAbwBuACAAMQAuAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAUgBvAGIAbwB0AG8ALQBCAG8AbABkACAAOgAgADIANwAtADEALQAyADAAMQA1AABWZXJzaW9uIDEuRm9udEZvcmdlIDIuMCA6IFJvYm90by1Cb2xkIDogMjctMS0yMDE1AABSAG8AYgBvAHQAbwAtAEIAbwBsAGQAAFJvYm90by1Cb2xkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAMAAAAAAAAAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANQA2ADcAOAA5ADo=',
  italic: 'AAEAAAATAQAABAAwRkZUTXh5XnYAAAE8AAAAHEdERUYAJwCMAAAAVAAAACBPUy8yePiJ2QAAAXAAAABWY21hcM4S1ZoAAALMAAABamN2dCAG5x6YAAAEeAAAAChmcGdtD7QvpwAABKAAAAJlZ2x5ZhiY3WkAAAU4AAANHGhlYWQYb37/AAASTAAAADZoaGVhCJMD+AAAEoQAAAAkaG10eDJhAeAAABKoAAAAXGxvY2EabholAAAS/AAAADBtYXhwAYABCwAAE0AAAAAgbmFtZdMw1KYAABNIAAABP3Bvc3QBxgCnAAAUiAAAAEtwcmVwhmfafQAAFUQAAABvAAEAAAACAAAj3jcGXw889QALAgAAAAAA1jdYQgAAAADZT9W7////+wIAAfkAAAAIAAIAAAAAAAAAAQAAAeL/FQAAAgD////9AgABAAAAAAAAAAAAAAAAAAAAABcAAQAAABYAXgAGAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABAAwAAAABAAAAAAACAAcALgABAAAAAAADAAwAVAABAAAAAAAEAAwAhgABAAAAAAAFAAsArgABAAAAAAAGAAwAuQABAAAAAAAKABoBCgADAAEECQABABgADAADAAEECQACAA4ANQADAAEECQADABgAYAADAAEECQAEABgAkgADAAEECQAFABYAuQADAAEECQAGABgAxQADAAEECQAKADQBJABSAG8AYgBvAHQAbwAtAEkAdABhAGwAaQBjAABSb2JvdG8tSXRhbGljAABJAHQAYQBsAGkAYwAASXRhbGljAABGAG8AbgB0AEYAbwByAGcAZQAgADIALgAwACAAOgAgAFIAbwBiAG8AdABvACAASQB0AGEAbABpAGMAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBSb2JvdG8gSXRhbGljIDogMjctMS0yMDE1AABSAG8AYgBvAHQAbwAtAEkAdABhAGwAaQBjAABSb2JvdG8tSXRhbGljAABWAGUAcgBzAGkAbwBuACAAMQAuAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAUgBvAGIAbwB0AG8ALQBJAHQAYQB'
};

// Define interfaces based on expected backend responses (using 'any' for now)
// TODO: Replace 'any' with actual types when backend structure is known

export interface DepartmentReportParams {
  startDate?: string;
  endDate?: string;
  departmentId?: number;
}

export interface GenerateDepartmentReportData {
  departmentId: number;
  startDate: string;
  endDate: string;
}

export interface GenerateCompanyReportData {
  startDate: string;
  endDate: string;
}

export interface HRCostParams {
  month: number;
  year: number;
  departmentId?: number;
}

export interface DashboardDataParams {
  month: number;
  year: number;
  departmentId?: number;
}

export interface ExportReportData {
  title: string;
  generatedAt: string;
  departmentReports: any;
  hrCostStats: any;
  dashboardData: any;
  companyReports?: any;
  userInfo: {
    name?: string;
    role?: string;
    department?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const ReportService = {
  /**
   * Generates a company-wide report.
   * Requires HR_STAFF or SYSTEM_ADMIN role.
   * Corresponds to: POST /reports/company
   */
  generateCompanyReport: async (data: GenerateCompanyReportData): Promise<any> => {
    const response = await axios.post<ApiResponse<any>>(
      `${API_URL}/reports/company`,
      data
    );
    console.log('generateCompanyReport response:', response.data);
    return response.data.data;
  },

  /**
   * Generates a department report.
   * Requires HR_STAFF or SYSTEM_ADMIN role.
   * Corresponds to: POST /reports/departments
   */
  generateDepartmentReport: async (data: GenerateDepartmentReportData): Promise<any> => {
    const response = await axios.post<ApiResponse<any>>(
      `${API_URL}/reports/departments`,
      data
    );
    console.log('generateDepartmentReport response:', response.data);
    return response.data.data;
  },

  /**
   * Gets department reports over time for a specific department.
   * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
   * Corresponds to: GET /reports/departments/:departmentId
   */
  getDepartmentReports: async (departmentId?: number, params?: DepartmentReportParams): Promise<any[]> => {
    // Nếu không có departmentId, lấy báo cáo toàn công ty
    const url = departmentId 
      ? `${API_URL}/reports/departments/${departmentId}`
      : `${API_URL}/reports/company`;
      
    const response = await axios.get<ApiResponse<any[]>>(
      url,
      { params }
    );
    console.log('getDepartmentReports response:', response.data);
    return response.data.data;
  },

  /**
   * Gets HR cost statistics.
   * Requires HR_STAFF or SYSTEM_ADMIN role.
   * Corresponds to: GET /reports/hr-cost
   */
  getHRCostStatistics: async (params: HRCostParams): Promise<any> => {
    const response = await axios.get<ApiResponse<any>>(
      `${API_URL}/reports/hr-cost`,
      { params }
    );
    console.log('getHRCostStatistics response:', response.data);
    return response.data.data;
  },

  /**
   * Gets aggregated data for the dashboard.
   * Requires HR_STAFF, SYSTEM_ADMIN, or DEPARTMENT_HEAD role.
   * Corresponds to: GET /reports/dashboard-data
   */
  getDashboardData: async (params: DashboardDataParams): Promise<any> => {
    const response = await axios.get<ApiResponse<any>>(
      `${API_URL}/reports/dashboard-data`,
      { params }
    );
    console.log('getDashboardData response:', response.data);
    return response.data.data;
  },

  /**
   * Exports a report as a PDF file.
   */
  exportReportAsPDF: async (data: ExportReportData): Promise<Blob> => {
    try {
      console.log("Bắt đầu tạo PDF với dữ liệu:", data);
      
      // Tạo instance PDF với định dạng A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Thêm phông chữ hỗ trợ tiếng Việt
      try {
        pdf.addFileToVFS('Roboto-normal.ttf', VN_FONT.normal);
        pdf.addFont('Roboto-normal.ttf', 'Roboto', 'normal');
        
        pdf.addFileToVFS('Roboto-bold.ttf', VN_FONT.bold);
        pdf.addFont('Roboto-bold.ttf', 'Roboto', 'bold');
        
        // Sử dụng phông chữ Roboto
        pdf.setFont('Roboto');
      } catch (fontError) {
        console.error("Lỗi khi thêm phông chữ:", fontError);
      }
      
      // Thêm thông tin header
      pdf.setFontSize(18);
      pdf.setTextColor(0, 51, 153);
      pdf.text('HỆ THỐNG QUẢN LÝ NHÂN SỰ', pdf.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text(data.title, pdf.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString('vi-VN');
      pdf.text(`Ngày xuất báo cáo: ${today}`, pdf.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(`Người tạo báo cáo: ${data.userInfo.name || 'N/A'} - ${data.userInfo.role || 'N/A'}`, pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      let yPosition = 50;
      let hasContent = false;

      // Thêm báo cáo toàn công ty nếu có
      if (data.companyReports && Array.isArray(data.companyReports) && data.companyReports.length > 0) {
        hasContent = true;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('BÁO CÁO TOÀN CÔNG TY', 14, yPosition);
        yPosition += 10;

        const tableHeaders = [
          ['Phòng ban', 'Tổng NV', 'NV mới', 'NV nghỉ việc', 'Ngày nghỉ', 'Lương cơ bản', 'Phụ cấp', 'Khấu trừ', 'Thực lãnh', 'Giờ đào tạo', 'Điểm TB']
        ];

        const tableRows = data.companyReports.map((report: any) => [
          report.departmentName || `Phòng ban ${report.departmentId}`,
          report.totalEmployees?.toString() || '0',
          report.newEmployees?.toString() || '0',
          report.resignedEmployees?.toString() || '0',
          report.totalLeaves?.toString() || '0',
          new Intl.NumberFormat('vi-VN').format(report.totalSalary || 0),
          new Intl.NumberFormat('vi-VN').format(report.totalAllowances || 0),
          new Intl.NumberFormat('vi-VN').format(report.totalDeductions || 0),
          new Intl.NumberFormat('vi-VN').format((report.totalSalary || 0) + (report.totalAllowances || 0) - (report.totalDeductions || 0)),
          report.totalTrainingHours?.toString() || '0',
          typeof report.averagePerformanceRating === 'number' ? report.averagePerformanceRating.toFixed(2) : 'N/A'
        ]);

        // Thêm hàng tổng
        const totals = [
          'Tổng cộng',
          data.companyReports.reduce((sum, r) => sum + (r.totalEmployees || 0), 0).toString(),
          data.companyReports.reduce((sum, r) => sum + (r.newEmployees || 0), 0).toString(),
          data.companyReports.reduce((sum, r) => sum + (r.resignedEmployees || 0), 0).toString(),
          data.companyReports.reduce((sum, r) => sum + (r.totalLeaves || 0), 0).toString(),
          new Intl.NumberFormat('vi-VN').format(data.companyReports.reduce((sum, r) => sum + (r.totalSalary || 0), 0)),
          new Intl.NumberFormat('vi-VN').format(data.companyReports.reduce((sum, r) => sum + (r.totalAllowances || 0), 0)),
          new Intl.NumberFormat('vi-VN').format(data.companyReports.reduce((sum, r) => sum + (r.totalDeductions || 0), 0)),
          new Intl.NumberFormat('vi-VN').format(data.companyReports.reduce((sum, r) => sum + ((r.totalSalary || 0) + (r.totalAllowances || 0) - (r.totalDeductions || 0)), 0)),
          data.companyReports.reduce((sum, r) => sum + (r.totalTrainingHours || 0), 0).toString(),
          (data.companyReports.reduce((sum, r) => sum + (typeof r.averagePerformanceRating === 'number' ? r.averagePerformanceRating : 0), 0) / data.companyReports.length).toFixed(2)
        ];
        tableRows.push(totals);

        autoTable(pdf, {
          head: tableHeaders,
          body: tableRows,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          columnStyles: {
            0: { cellWidth: 30 }, // Phòng ban
            1: { cellWidth: 20 }, // Tổng NV
            2: { cellWidth: 20 }, // NV mới
            3: { cellWidth: 20 }, // NV nghỉ việc
            4: { cellWidth: 20 }, // Ngày nghỉ
            5: { cellWidth: 25 }, // Lương cơ bản
            6: { cellWidth: 25 }, // Phụ cấp
            7: { cellWidth: 25 }, // Khấu trừ
            8: { cellWidth: 25 }, // Thực lãnh
            9: { cellWidth: 20 }, // Giờ đào tạo
            10: { cellWidth: 20 } // Điểm TB
          },
          headStyles: {
            fillColor: [0, 51, 153],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold'
          },
          footStyles: {
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          }
        });

        if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
          yPosition = (pdf as any).lastAutoTable.finalY + 15;
        } else {
          yPosition += 30;
        }
      }

      // Thêm chi phí nhân sự nếu có
      if (data.hrCostStats && Array.isArray(data.hrCostStats) && data.hrCostStats.length > 0) {
        hasContent = true;
        
        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('THỐNG KÊ CHI PHÍ NHÂN SỰ', 14, yPosition);
        yPosition += 10;

        const hrCostRows = data.hrCostStats.map((stat: any) => [
          stat.department || 'N/A',
          stat.totalEmployees?.toString() || '0',
          new Intl.NumberFormat('vi-VN').format(stat.totalCost || 0),
          new Intl.NumberFormat('vi-VN').format(stat.averageCost || 0)
        ]);

        autoTable(pdf, {
          head: [['Phòng ban', 'Số NV', 'Tổng chi phí', 'Chi phí trung bình']],
          body: hrCostRows,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 40 }
          },
          headStyles: {
            fillColor: [0, 102, 0],
            textColor: 255
          }
        });

        if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
          yPosition = (pdf as any).lastAutoTable.finalY + 15;
        } else {
          yPosition += 30;
        }
      }

      // Thêm dashboard data nếu có
      if (data.dashboardData) {
        hasContent = true;
        
        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('TỔNG QUAN DỮ LIỆU', 14, yPosition);
        yPosition += 10;

        const overview = data.dashboardData.overview;
        if (overview) {
          pdf.setFontSize(12);
          pdf.text('Thông tin tổng quan:', 14, yPosition);
          yPosition += 8;

          const overviewData = [
            ['Tổng nhân viên', overview.totalEmployees?.toString() || '0'],
            ['Đơn nghỉ phép hoạt động', overview.activeLeaves?.toString() || '0'],
            ['Tổng lương', new Intl.NumberFormat('vi-VN').format(overview.totalSalary || 0)]
          ];

          autoTable(pdf, {
            body: overviewData,
            startY: yPosition,
            theme: 'plain',
            styles: {
              fontSize: 10,
              cellPadding: 2
            },
            columnStyles: {
              0: { cellWidth: 80, fontStyle: 'bold' },
              1: { cellWidth: 60 }
            }
          });

          if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
            yPosition = (pdf as any).lastAutoTable.finalY + 15;
          } else {
            yPosition += 30;
          }
        }
      }

      if (!hasContent) {
        pdf.setFontSize(14);
        pdf.setTextColor(255, 0, 0);
        pdf.text('Không có dữ liệu báo cáo trong khoảng thời gian này', pdf.internal.pageSize.getWidth() / 2, 100, { align: 'center' });
      }

      // Thêm chân trang
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Trang ${i} / ${pageCount}`, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 10);
        pdf.text('HR Management System © 2023', 20, pdf.internal.pageSize.getHeight() - 10);
      }

      return pdf.output('blob');
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error);
      throw new Error(`Không thể tạo file PDF: ${error}`);
    }
  },

  /**
   * Exports a report containing various data.
   * This is a frontend function that formats the data for export.
   * Can be extended to use a backend API for PDF/Excel generation.
   */
  exportReport: async (data: ExportReportData): Promise<Blob> => {
    // Có thể gọi API backend nếu muốn xuất báo cáo từ server
    // const response = await axios.post(
    //   `${API_URL}/reports/export`,
    //   data,
    //   { responseType: 'blob' }
    // );
    // return response.data;

    // Hoặc xử lý trực tiếp ở frontend
    const jsonData = JSON.stringify(data, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }
};

// Example usage (to be placed in the component):
/*
import { ReportService } from '../services/ReportService';
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { currentUser } = useAuth();

  const fetchDeptReports = async () => {
    if (currentUser?.departmentId && (currentUser.role?.roleType === 'DEPARTMENT_HEAD' || currentUser.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN')) {
      try {
        const reports = await ReportService.getDepartmentReports(currentUser.departmentId, { startDate: '...', endDate: '...' });
        // Update state with reports
      } catch (error) {
        console.error("Failed to fetch department reports", error);
      }
    }
  };

  const fetchHRCosts = async () => {
     if (currentUser?.role?.roleType === 'HR_STAFF' || currentUser.role?.roleType === 'SYSTEM_ADMIN') {
        try {
          const costs = await ReportService.getHRCostStatistics({ startDate: '...', endDate: '...' });
          // Update state with costs
        } catch (error) {
          console.error("Failed to fetch HR costs", error);
        }
     }
  };
}
*/