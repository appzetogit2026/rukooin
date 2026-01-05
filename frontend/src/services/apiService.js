import axios from 'axios';

// Base URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6769/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token and Log
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
  return config;
}, (error) => Promise.reject(error));

// User Auth Services
export const authService = {
  // Send OTP
  sendOtp: async (phone) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify OTP & Login/Register
  verifyOtp: async (data) => {
    try {
      const response = await api.post('/auth/verify-otp', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify Partner OTP & Register
  verifyPartnerOtp: async (data) => {
    try {
      const response = await api.post('/auth/partner/verify-otp', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.hotelId) {
          localStorage.setItem('primaryHotelId', response.data.hotelId);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Save Onboarding Step (Draft)
  saveOnboardingStep: async (data) => {
    try {
      const response = await api.post('/hotels/onboarding/step', data);
      return response.data;
    } catch (error) {
      console.warn("Draft Save Error:", error);
      return null;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};



// Booking Services
export const bookingService = {
  create: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getMyBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Hotel Services (Updated)
export const hotelService = {
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/hotels?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getMyHotels: async () => {
    try {
      const response = await api.get('/hotels/partner/my-hotels');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getCurrentLocation: async () => {
    try {
      const response = await api.get('/hotels/location/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  uploadImages: async (formData) => {
    try {
      const response = await api.post('/hotels/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// User Profile Services
export const userService = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  toggleSavedHotel: async (hotelId) => {
    try {
      const response = await api.post(`/users/saved-hotels/${hotelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;
