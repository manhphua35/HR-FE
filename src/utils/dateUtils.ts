/**
 * Hàm định dạng ngày giờ
 * @param dateString Chuỗi ngày giờ (ISO string)
 * @returns Chuỗi ngày giờ đã định dạng theo locale Việt Nam
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

/**
 * Hàm định dạng ngày
 * @param dateString Chuỗi ngày (ISO string)
 * @returns Chuỗi ngày đã định dạng theo locale Việt Nam
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}; 