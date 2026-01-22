import { axiosInstance } from '../app/admin/store/adminStore';

const adminService = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard-stats');
    return response.data;
  },
  getPendingVerifications: async () => {
    const response = await axiosInstance.get('/admin/pending-verifications');
    return response.data;
  },

  getFinanceData: async () => {
    const response = await axiosInstance.get('/admin/finance-data');
    return response.data;
  },

  getTransactions: async (params) => {
    const response = await axiosInstance.get('/admin/transactions', { params });
    return response.data;
  },

  processWithdrawal: async (data) => {
    const response = await axiosInstance.post('/admin/process-withdrawal', data);
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

  updateHotelStatus: async (hotelId, statusData) => {
    // Handle both old (string) and new (object) payload formats
    const payload = typeof statusData === 'string'
      ? { hotelId, status: statusData }
      : { hotelId, ...statusData };
    const response = await axiosInstance.put('/admin/update-hotel-status', payload);
    return response.data;
  },

  updatePropertyDetails: async (propertyId, updateData) => {
    const response = await axiosInstance.put(`/admin/update-property/${propertyId}`, updateData);
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

  updateUserStatus: async (userId, statusData) => {
    // Handle both old (boolean) and new (object) payload formats
    const payload = typeof statusData === 'boolean'
      ? { userId, isBlocked: statusData }
      : { userId, ...statusData };
    const response = await axiosInstance.put('/admin/update-user-status', payload);
    return response.data;
  },
  updatePartnerApproval: async (userId, status) => {
    const response = await axiosInstance.put('/admin/update-partner-approval', { userId, status });
    return response.data;
  },

  deleteUser: async (userId, role = 'user') => {
    const response = await axiosInstance.delete('/admin/delete-user', { data: { userId, role } });
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

  verifyPropertyDocuments: async (propertyId, action, adminRemark) => {
    const response = await axiosInstance.put('/admin/verify-documents', { propertyId, action, adminRemark });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await axiosInstance.get(`/admin/user-details/${userId}`);
    return response.data;
  },

  getPartnerDetails: async (userId) => {
    const response = await axiosInstance.get(`/admin/partner-details/${userId}`);
    return response.data;
  },

  updatePartnerSettings: async (userId, settingsData) => {
    const response = await axiosInstance.put('/admin/update-partner-settings', { userId, ...settingsData });
    return response.data;
  },

  getHotelDetails: async (hotelId) => {
    const response = await axiosInstance.get(`/admin/hotel-details/${hotelId}`);
    return response.data;
  },

  getBookingDetails: async (bookingId) => {
    const response = await axiosInstance.get(`/admin/booking-details/${bookingId}`);
    return response.data;
  },

  getLegalPages: async (params) => {
    const response = await axiosInstance.get('/admin/legal-pages', { params });
    return response.data;
  },

  saveLegalPage: async (payload) => {
    const response = await axiosInstance.post('/admin/legal-pages', payload);
    return response.data;
  },

  getContactMessages: async (params) => {
    const response = await axiosInstance.get('/admin/contact-messages', { params });
    return response.data;
  },

  updateContactStatus: async (id, status) => {
    const response = await axiosInstance.put(`/admin/contact-messages/${id}/status`, { status });
    return response.data;
  },

  addTicketNote: async (id, note) => {
    const response = await axiosInstance.post(`/admin/contact-messages/${id}/notes`, { note });
    return response.data;
  },

  replyToTicket: async (id, message) => {
    const response = await axiosInstance.post(`/admin/contact-messages/${id}/reply`, { message });
    return response.data;
  },

  getPlatformSettings: async () => {
    const response = await axiosInstance.get('/admin/platform-settings');
    return response.data;
  },

  updatePlatformSettings: async (payload) => {
    const response = await axiosInstance.put('/admin/platform-settings', payload);
    return response.data;
  },

  updateAdminProfile: async (payload) => {
    const response = await axiosInstance.put('/auth/admin/update-profile', payload);
    return response.data;
  },

  // getReviews: async (params) => {
  //   const response = await axiosInstance.get('/admin/reviews', { params });
  //   return response.data;
  // },

  // updateReviewStatus: async (reviewId, status) => {
  //   const response = await axiosInstance.put('/admin/update-review-status', { reviewId, status });
  //   return response.data;
  // },

  // deleteReview: async (reviewId) => {
  //   const response = await axiosInstance.delete('/admin/delete-review', { data: { reviewId } });
  //   return response.data;
  // },

  // Banner Management
  getBanners: async () => {
    const response = await axiosInstance.get('/admin/banners');
    return response.data;
  },
  createBanner: async (data) => {
    const response = await axiosInstance.post('/admin/banners', data);
    return response.data;
  },
  updateBanner: async (id, data) => {
    const response = await axiosInstance.put(`/admin/banners/${id}`, data);
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await axiosInstance.delete(`/admin/banners/${id}`);
    return response.data;
  },

  // FAQ Management
  getFaqs: async (params) => {
    const response = await axiosInstance.get('/admin/faqs', { params });
    return response.data;
  },
  createFaq: async (data) => {
    const response = await axiosInstance.post('/admin/faqs', data);
    return response.data;
  },
  updateFaq: async (id, data) => {
    const response = await axiosInstance.put(`/admin/faqs/${id}`, data);
    return response.data;
  },
  deleteFaq: async (id) => {
    const response = await axiosInstance.delete(`/admin/faqs/${id}`);
    return response.data;
  },

  // Offer Management
  getOffers: async () => {
    const response = await axiosInstance.get('/offers/all');
    return response.data;
  },
  createOffer: async (data, headers = {}) => {
    const response = await axiosInstance.post('/offers', data, { headers });
    return response.data;
  },
  updateOffer: async (id, data, headers = {}) => {
    const response = await axiosInstance.put(`/offers/${id}`, data, { headers });
    return response.data;
  },
  deleteOffer: async (id) => {
    const response = await axiosInstance.delete(`/offers/${id}`);
    return response.data;
  },

  // Notification Management
  getNotifications: async (params) => {
    const response = await axiosInstance.get('/admin/notifications', { params });
    return response.data;
  },
  sendBroadcast: async (data) => {
    const response = await axiosInstance.post('/admin/notifications/broadcast', data);
    return response.data;
  },
  deleteNotificationRecord: async (id) => {
    const response = await axiosInstance.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  // Analytics & Reports
  getAnalytics: async () => {
    const response = await axiosInstance.get('/admin/analytics');
    return response.data;
  },
  exportBookings: async () => {
    const response = await axiosInstance.get('/admin/reports/bookings/export', { responseType: 'blob' });
    return response.data;
  },

  // Staff Management (Superadmin)
  getAllStaff: async () => {
    const response = await axiosInstance.get('/admin/staff');
    return response.data;
  },
  createStaff: async (data) => {
    const response = await axiosInstance.post('/admin/staff', data);
    return response.data;
  },
  updateStaff: async (id, data) => {
    const response = await axiosInstance.put(`/admin/staff/${id}`, data);
    return response.data;
  },
  deleteStaff: async (id) => {
    const response = await axiosInstance.delete(`/admin/staff/${id}`);
    return response.data;
  },

  // Audit Logs (Superadmin)
  getAuditLogs: async (params = {}) => {
    const response = await axiosInstance.get('/admin/audit-logs', { params });
    return response.data;
  }
};

export default adminService;
