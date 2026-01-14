import { axiosInstance } from '../app/admin/store/adminStore';

const adminService = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard-stats');
    return response.data;
  },

  getUsers: async (params) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  getHotels: async (params) => {
    const response = await axiosInstance.get('/admin/hotels', { params });
    return response.data;
  },

  getPropertyRequests: async () => {
    const response = await axiosInstance.get('/admin/property-requests');
    return response.data;
  },

  getBookings: async (params) => {
    const response = await axiosInstance.get('/admin/bookings', { params });
    return response.data;
  },

  updateHotelStatus: async (hotelId, status) => {
    const response = await axiosInstance.put('/admin/update-hotel-status', { hotelId, status });
    return response.data;
  },

  getReviews: async (params) => {
    const response = await axiosInstance.get('/admin/reviews', { params });
    return response.data;
  },

  updateReviewStatus: async (reviewId, status) => {
    const response = await axiosInstance.put('/admin/update-review-status', { reviewId, status });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete('/admin/delete-review', { data: { reviewId } });
    return response.data;
  },

  updateUserStatus: async (userId, isBlocked) => {
    const response = await axiosInstance.put('/admin/update-user-status', { userId, isBlocked });
    return response.data;
  },
  updatePartnerApproval: async (userId, status) => {
    const response = await axiosInstance.put('/admin/update-partner-approval', { userId, status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete('/admin/delete-user', { data: { userId } });
    return response.data;
  },

  deleteHotel: async (hotelId) => {
    const response = await axiosInstance.delete('/admin/delete-hotel', { data: { hotelId } });
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await axiosInstance.put('/admin/update-booking-status', { bookingId, status });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axiosInstance.get(`/admin/user-details/${userId}`);
    return response.data;
  },

  getHotelDetails: async (hotelId) => {
    const response = await axiosInstance.get(`/admin/hotel-details/${hotelId}`);
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await axiosInstance.get(`/admin/booking-details/${bookingId}`);
    return response.data;
  }
};

export default adminService;
