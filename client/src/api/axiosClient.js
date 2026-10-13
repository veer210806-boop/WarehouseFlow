import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('warehouseflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle session expiry
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Only redirect if not already on login
    if (!window.location.pathname.includes('/login')) {
      localStorage.removeItem('warehouseflow_token');
      localStorage.removeItem('warehouseflow_user');
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

/**
 * Format Indian Rupee Currency ₹
 */
export function formatINR(val) {
  const num = Number(val || 0);
  return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

/**
 * Format in Indian Lakhs and Crores (e.g. ₹12.50 L, ₹1.40 Cr)
 */
export function formatINRLakhsCrores(val) {
  const num = Number(val || 0);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(num);
}

/**
 * Convert number to Indian Rupee Words (e.g. "Rupees One Lakh Twenty Thousand Only")
 */
export function formatINRWords(amount) {
  const num = Math.round(Number(amount || 0));
  if (num === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n < 20) return teens[n - 10];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred > 0) {
      result += singleDigits[hundred] + ' Hundred';
      if (rest > 0) result += ' ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundredAndBelow = num % 1000;

  if (crore > 0) {
    words += convertThreeDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (hundredAndBelow > 0) {
    words += convertThreeDigits(hundredAndBelow);
  }

  return 'Rupees ' + words.trim() + ' Only';
}

export default api;
