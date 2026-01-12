import axios from 'axios';

// Base URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
}, (error) => Promise.reject(error));

// User Auth Services
export const authService = {
  // Send OTP
  sendOtp: async (phone, type = 'login') => {
    try {
      const response = await api.post('/auth/send-otp', { phone, type });
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

  // Initiate Partner Registration (Step 1 & 2)
  registerPartner: async (data) => {
    try {
      const response = await api.post('/auth/partner/register', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },



  // Update Profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/auth/update-profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
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
  },
  getPartnerBookings: async () => {
    try {
      const response = await api.get('/bookings/partner/all');
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
      const url = params ? `/hotels?${params}` : '/hotels';
      const response = await api.get(url);
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
  },
  getAddressFromCoordinates: async (lat, lng) => {
    try {
      const response = await api.post('/hotels/location/address', { lat, lng });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  saveOnboardingStep: async (data) => {
    try {
      const response = await api.post('/hotels/onboarding/save-step', data);
      return response.data;
    } catch (error) {
      console.warn("Draft Save Error:", error);
      // Return null or throw depending on how you want to handle it. 
      // JoinRokkooin expects a response or throws.
      // If we throw here, the component catches it.
      throw error.response?.data || error.message;
    }
  },
  searchLocation: async (query) => {
    try {
      const response = await api.get(`/hotels/location/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  calculateDistance: async (originLat, originLng, destLat, destLng) => {
    try {
      const response = await api.get(`/hotels/location/distance?originLat=${originLat}&originLng=${originLng}&destLat=${destLat}&destLng=${destLng}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  deleteHotel: async (id) => {
    try {
      const response = await api.delete(`/hotels/${id}`);
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
  // Get Saved Hotels
  getSavedHotels: async () => {
    try {
      const response = await api.get('/users/saved-hotels');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Toggle Saved Hotel
  toggleSavedHotel: async (hotelId) => {
    try {
      const response = await api.post(`/users/saved-hotels/${hotelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Offer & Coupon Services
export const offerService = {
  // Use by users to see available coupons
  getActive: async () => {
    try {
      const response = await api.get('/offers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Validate coupon before booking
  validate: async (code, bookingAmount) => {
    try {
      const response = await api.post('/offers/validate', { code, bookingAmount });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Get all for admin management
  getAll: async () => {
    try {
      const response = await api.get('/offers/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Create new (Admin)
  create: async (offerData) => {
    try {
      const response = await api.post('/offers', offerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default api;

