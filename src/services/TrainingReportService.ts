import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
/* Comment out import docx 
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, TextRun, BorderStyle, WidthType, AlignmentType } from 'docx';
*/
import { saveAs } from 'file-saver';
import { TrainingCourse, TrainingStatus, ParticipantStatus } from './TrainingService';
import { format } from 'date-fns';

// Font cho tiếng Việt (base64 string)
const VN_FONT = {
  normal: 'AAEAAAATAQAABAAwRkZUTXgQdwMAAAE8AAAAHEdERUYAJwCMAAAAVAAAACBPUy8yepiS8AAAAXAAAABWY21hcNHUuswAAALIAAABamN2dCAG5x6YAAAEZAAAAChmcGdtD7QvpwAABJwAAAJlZ2x5ZpwBUVUAAAUcAAANFGhlYWQX/A6jAAAYIAAAADZoaGVhCH8DnQAAGFgAAAAkaG10eCMGARoAABh8AAAAVmxvY2EWUhYEAAAYyAAAACxtYXhwAX8A+gAAGPQAAAAgbmFtZdYLsFMAABkUAAABQXBvc3QBxQCnAAAaWAAAAEtwcmVwhmfafQAAIngAAABvAAEAAAACAAAGdaD9Xw889QALAgAAAAAA1jj9zQAAAADZVZmD////+wIAAe8AAAAIAAIAAAAAAAAAAQAAA3j/bgAAAf////8CAAEAAAAAAAAAAAAAAAAAAAAAEAABAAAAFgBbAAUAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEACQAAAAEAAAAAAAIABwByAAEAAAAAAAMACQA8AAEAAAAAAAQACQCHAAEAAAAAAAUACwAbAAEAAAAAAAYACQBXAAEAAAAAAAoAGgC8AAMAAQQJAAEAEgAJAAMAAQQJAAIADgB5AAMAAQQJAAMAEgBFAAMAAQQJAAQAEgCQAAMAAQQJAAUAFgAmAAMAAQQJAAYAEgBgAAMAAQQJAAoANADWAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAFIAZQBnAHUAbABhAHIAAFJlZ3VsYXIAAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAUgBvAGIAbwB0AG8AIABSAGUAZwB1AGwAYQByACAAOgAgADIANwAtADEALQAyADAAMQA1AABGb250Rm9yZ2UgMi4wIDogUm9ib3RvIFJlZ3VsYXIgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAFYAZQByAHMAaQBvAG4AIAAxAC4ARgBvAG4AdABGAG8AcgBnAGUAIAAyAC4AMAAgADoAIABSAG8AYgBvAHQAbwAtAFIAZQBnAHUAbABhAHIAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAFZlcnNpb24gMS5Gb250Rm9yZ2UgMi4wIDogUm9ib3RvLVJlZ3VsYXIgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AUgBlAGcAdQBsAGEAcgAAUm9ib3RvLVJlZ3VsYXIAAAAAAAAAAAAAAAAAAAAAAAAAABcAQQBCAEMARABFAEYARwBIAEkASgBLAEwATQBOAE8AUABRAFIAUwBUAFUAVgBXAFgAWQBaAGEAYgBjAGQAZQBmAGcAaABpAGoAawBsAG0AbgBvAHAAcQByAHMAcw',
  bold: 'AAEAAAATAQAABAAwRkZUTXu6cKIAAAE8AAAAHEdERUYAJwCMAAAAVAAAACBPUy8yem+OqAAAAXAAAABWY21hcN67AuoAAALIAAABWmN2dCAG5x6YAAAEZAAAAChmcGdtD7QvpwAABJwAAAJlZ2x5ZsivQJYAAAUcAAAMGGhlYWQX9T3CAAAYNAAAADZoaGVhCH8DnAAAGGwAAAAkaG10eCLFAdgAABiQAAAAVGxvY2EWMBMkAAAY5AAAACxtYXhwAWQA2gAAGRQAAAAgbmFtZdYLsFMAABk0AAABQXBvc3QBxQCnAAAaWAAAAEtwcmVwhmfafQAAIHgAAABvAAEAAAACAAAUu9SfXw889QALAgAAAAAA1jMEbQAAAADZVe6s////+wIAAe8AAAAIAAIAAAAAAAAAAQAAA3j/bgAAAf////8CAAEAAAAAAAAAAAAAAAAAAAAAEAABAAAAFgAgAAUAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEACQAAAAEAAAAAAAIABwByAAEAAAAAAAMACQA8AAEAAAAAAAQACQCHAAEAAAAAAAUACwAbAAEAAAAAAAYACQBXAAEAAAAAAAoAGgC8AAMAAQQJAAEAEgAJAAMAAQQJAAIADgB5AAMAAQQJAAMAEgBFAAMAAQQJAAQAEgCQAAMAAQQJAAUAFgAmAAMAAQQJAAYAEgBgAAMAAQQJAAoANADWAFIAbwBiAG8AdABvAC0AQgBvAGwAZAAAUm9ib3RvLUJvbGQAAEIAbwBsAGQAAEJvbGQAAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAUgBvAGIAbwB0AG8AIABCAGwAYQBjAGsAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBSb2JvdG8gQmxhY2sgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AQgBvAGwAZAAAUm9ib3RvLUJvbGQAAFYAZQByAHMAaQBvAG4AIAAxAC4ARgBvAG4AdABGAG8AcgBnAGUAIAAyAC4AMAAgADoAIABSAG8AYgBvAHQAbwAgAEIAbwBsAGQAIAA6ACAAMgA3AC0AMQAtADIAMAAxADUAAFZlcnNpb24gMS5Gb250Rm9yZ2UgMi4wIDogUm9ib3RvIEJvbGQgOiAyNy0xLTIwMTUAAFIAbwBiAG8AdABvAC0AQgBvAGwAZAAAUm9ib3RvLUJvbGQAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAXAEEAQgBDAEQARQBGAEcASABJAEoASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBhAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4AbwBwAHEAcgBzAHM'
};

export interface TrainingReport {
  title: string;
  courses: TrainingCourse[];
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  departmentName?: string;
  generateBy: {
    id: number;
    name: string;
    role: string;
  };
}

export enum ExportFormat {
  PDF = 'PDF'
  // WORD = 'WORD' // Sẽ phát triển sau
}

export const TrainingReportService = {
  /**
   * Xuất báo cáo đào tạo dạng PDF sử dụng jsPDF và jsPDF-autoTable
   */
  exportTrainingReportAsPDF: async (data: TrainingReport): Promise<Blob> => {
    try {
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
      
      // Thêm thông tin thời gian và người tạo báo cáo
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString('vi-VN');
      pdf.text(`Ngày xuất báo cáo: ${today}`, pdf.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
      pdf.text(`Người xuất báo cáo: ${data.generateBy.name} (${data.generateBy.role})`, pdf.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
      
      // Thêm thông tin phòng ban nếu có
      if (data.departmentName) {
        pdf.text(`Phòng ban: ${data.departmentName}`, pdf.internal.pageSize.getWidth() / 2, 45, { align: 'center' });
      }
      
      // Thêm thông tin khoảng thời gian nếu có
      if (data.startDate && data.endDate) {
        pdf.text(`Khoảng thời gian: ${data.startDate} - ${data.endDate}`, pdf.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
      }
      
      // Bắt đầu vị trí vẽ bảng
      let yPosition = 60;
      
      // Kiểm tra xem có dữ liệu không
      if (!data.courses || data.courses.length === 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(255, 0, 0);
        pdf.text('Không có dữ liệu khóa học trong khoảng thời gian này', pdf.internal.pageSize.getWidth() / 2, 70, { align: 'center' });
      } else {
        // Chuẩn bị dữ liệu cho bảng khóa học
        const tableHeaders = [
          ['ID', 'Tên khóa học', 'Ngày bắt đầu', 'Ngày kết thúc', 'Trạng thái', 'Địa điểm', 'Giảng viên', 'Phòng ban']
        ];
        
        const tableRows = data.courses.map(course => [
          course.id.toString(),
          course.name,
          new Date(course.startDate).toLocaleDateString('vi-VN'),
          new Date(course.endDate).toLocaleDateString('vi-VN'),
          getStatusText(course.status),
          course.location,
          course.instructor,
          course.department ? course.department.name : 'Toàn công ty'
        ]);
        
        // Vẽ bảng khóa học
        autoTable(pdf, {
          head: tableHeaders,
          body: tableRows,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            font: 'Roboto'
          },
          columnStyles: {
            0: { cellWidth: 15 },  // ID
            1: { cellWidth: 50 },  // Tên khóa học
            2: { cellWidth: 30 },  // Ngày bắt đầu
            3: { cellWidth: 30 },  // Ngày kết thúc
            4: { cellWidth: 25 },  // Trạng thái
            5: { cellWidth: 30 },  // Địa điểm
            6: { cellWidth: 30 },  // Giảng viên
            7: { cellWidth: 35 }   // Phòng ban
          },
          headStyles: {
            fillColor: [0, 51, 153],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          }
        });
        
        // Cập nhật vị trí sau khi vẽ bảng
        if ((pdf as any).lastAutoTable && (pdf as any).lastAutoTable.finalY) {
          yPosition = (pdf as any).lastAutoTable.finalY + 15;
        } else {
          yPosition += 50; // Nếu không có lastAutoTable.finalY, đặt mặc định
        }
        
        // Thêm thống kê tóm tắt
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('THỐNG KÊ TÓM TẮT', 14, yPosition);
        yPosition += 10;
        
        // Tính toán số liệu thống kê
        const totalCourses = data.courses.length;
        const upcomingCourses = data.courses.filter(c => c.status === TrainingStatus.PLANNED).length;
        const ongoingCourses = data.courses.filter(c => c.status === TrainingStatus.ONGOING).length;
        const completedCourses = data.courses.filter(c => c.status === TrainingStatus.COMPLETED).length;
        const cancelledCourses = data.courses.filter(c => c.status === TrainingStatus.CANCELLED).length;
        
        // Dữ liệu cho bảng thống kê
        const statRows = [
          ['Tổng số khóa học', totalCourses.toString()],
          ['Khóa học sắp diễn ra', upcomingCourses.toString()],
          ['Khóa học đang diễn ra', ongoingCourses.toString()],
          ['Khóa học đã hoàn thành', completedCourses.toString()],
          ['Khóa học đã hủy', cancelledCourses.toString()]
        ];
        
        // Vẽ bảng thống kê
        autoTable(pdf, {
          body: statRows,
          startY: yPosition,
          theme: 'plain',
          styles: {
            fontSize: 10,
            cellPadding: 2,
            font: 'Roboto'
          },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 30, halign: 'center' }
          }
        });
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
   * Xuất báo cáo đào tạo dạng Word sử dụng thư viện docx
   * Chức năng này sẽ được phát triển sau
   */
  /*
  exportTrainingReportAsWord: async (data: TrainingReport): Promise<Blob> => {
    try {
      // Tính năng này sẽ được phát triển sau
      throw new Error('Chức năng xuất báo cáo Word đang được phát triển');
    } catch (error) {
      console.error("Lỗi khi tạo Word:", error);
      throw new Error(`Không thể tạo file Word: ${error}`);
    }
  }
  */
};

// Hàm hỗ trợ hiển thị trạng thái
function getStatusText(status: TrainingStatus): string {
  switch (status) {
    case TrainingStatus.PLANNED:
      return 'Sắp diễn ra';
    case TrainingStatus.ONGOING:
      return 'Đang diễn ra';
    case TrainingStatus.COMPLETED:
      return 'Đã hoàn thành';
    case TrainingStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
}

// Hàm hỗ trợ hiển thị trạng thái học viên
function getParticipantStatusText(status: ParticipantStatus): string {
  switch (status) {
    case ParticipantStatus.REGISTERED:
      return 'Đã đăng ký';
    case ParticipantStatus.CONFIRMED:
      return 'Đã xác nhận';
    case ParticipantStatus.ATTENDED:
      return 'Đã tham gia';
    case ParticipantStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
} 