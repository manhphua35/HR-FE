// Trong development, các request sẽ được proxy đến http://localhost:3001
// Trong production, thay thế bằng URL thực tế của API
export const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'http://localhost:3001' // Sử dụng biến môi trường hoặc mặc định trong production
  : 'http://localhost:3001'; // Sử dụng trực tiếp localhost:3001 trong development