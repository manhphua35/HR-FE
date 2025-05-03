// Trong development, các request sẽ được proxy đến http://localhost:3001
// Trong production, thay thế bằng URL thực tế của API
export const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'http://localhost:3001' // Use env variable or default in production
  : 'http://localhost:3001'; // Directly use localhost:3001 in development