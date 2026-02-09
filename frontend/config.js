// API Configuration
// Change this URL when deploying to production
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5008'  // Local development
    : 'https://student-fee-backend-db3b.onrender.com';  // Production

console.log('🌐 API URL:', API_URL);
