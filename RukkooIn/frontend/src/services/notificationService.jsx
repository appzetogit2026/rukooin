import { requestForToken, onMessageListener } from '../config/firebase';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  async init(userId) {
    if (!userId) return;

    // 1. Request Permission & Get Token
    const token = await requestForToken();

    if (token) {
      // 2. Send Token to Backend
      await this.saveTokenToBackend(token);
    }

    // 3. Listen for Foreground Messages
    onMessageListener().then(payload => {
      console.log('Foreground Notification:', payload);
      this.showToast(payload);
    });
  }

  async saveTokenToBackend(token) {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) return;

      await axios.put(`${API_URL}/auth/update-fcm`, {
        fcmToken: token,
        platform: 'web'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('FCM Token synced with backend');
    } catch (error) {
      console.error('Failed to sync FCM token:', error);
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
