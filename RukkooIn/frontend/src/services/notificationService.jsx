import { requestForToken, onMessageListener } from '../config/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  async init(userId, role = 'user') {
    console.log('[NotificationService] Init called for userId:', userId, 'role:', role);
    if (!userId) {
      console.warn('[NotificationService] Init aborted: No userId');
      return;
    }

    // 1. Request Permission & Get Token
    console.log('[NotificationService] Requesting FCM token...');
    const token = await requestForToken();
    console.log('[NotificationService] FCM Token retrieved:', token ? 'YES' : 'NO');

    if (token) {
      // 2. Send Token to Backend
      await this.saveTokenToBackend(token, role);
    }

    // 3. Listen for Foreground Messages
    onMessageListener().then(payload => {
      console.log('Foreground Notification:', payload);
      this.showToast(payload);
    });
  }

  async saveTokenToBackend(token, role) {
    try {
      console.log('[NotificationService] Attempting to save token to backend for role:', role);

      let authToken;
      if (role === 'admin') {
        authToken = localStorage.getItem('adminToken');
      } else {
        // Default to 'token' for user and partner
        authToken = localStorage.getItem('token');
      }

      if (!authToken) {
        console.warn(`[NotificationService] No auth token found for role ${role}`);
        return;
      }

      console.log('[NotificationService] Sending Update Request to:', `${API_URL}/auth/update-fcm`);
      await axios.put(`${API_URL}/auth/update-fcm`, {
        fcmToken: token,
        platform: 'web'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('[NotificationService] FCM Token synced with backend SUCCESSFULLY');
    } catch (error) {
      console.error('[NotificationService] Failed to sync FCM token:', error.response?.data || error.message);
    }
  }

  showToast(payload) {
    const { title, body } = payload.notification || {};
    toast((t) => (
      <div onClick={() => toast.dismiss(t.id)} className="cursor-pointer bg-white p-4 rounded-lg shadow-lg border-l-4 border-teal-800">
        <strong className="block mb-1 text-teal-900">{title}</strong>
        <div className="text-gray-700">{body}</div>
      </div>
    ), {
      duration: 5000,
      position: 'top-right'
    });
  }
}

export default new NotificationService();
