import { getFirebaseAdmin } from '../config/firebase.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

class NotificationService {
  /**
   * Helper function to get all FCM tokens from a user (app + web)
   * @param {Object} user - User document
   * @returns {Array<string>} - Array of FCM tokens
   */
  getUserFcmTokens(user) {
    const tokens = [];

    // Get platform-based tokens (app and web)
    if (user.fcmTokens) {
      if (user.fcmTokens.app) tokens.push(user.fcmTokens.app);
      if (user.fcmTokens.web) tokens.push(user.fcmTokens.web);
    }

    return tokens.filter(Boolean); // Remove null/undefined
  }

  /**
   * Send notification to a single FCM token
   * @param {string} fcmToken - FCM token of the device
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>} - Result of sending notification
   */
  async sendToToken(fcmToken, notification, data = {}) {
    try {
      const admin = getFirebaseAdmin();

      if (!admin) {
        throw new Error('Firebase Admin not initialized');
      }

      // Convert all data values to strings (FCM requirement)
      const stringifiedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
      }

      const message = {
        token: fcmToken,
        notification: {
          title: notification.title || 'Rukkoin',
          body: notification.body || '',
        },
        data: {
          ...stringifiedData,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'rukkoin_channel',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
          fcmOptions: {
            link: data.url || '/',
          },
        },
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      console.error('Error sending notification to token:', error);

      // Handle invalid token
      if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
        return {
          success: false,
          error: 'Invalid or unregistered token',
          code: error.code,
        };
      }

      throw error;
    }
  }

  /**
   * Send notification to a user or admin by ID
   * @param {string} userId - User or Admin ID
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @param {string} userType - 'user', 'admin' (default: 'user')
   * @returns {Promise<Object>} - Result of sending notification
   */
  async sendToUser(userId, notification, data = {}, userType = 'user') {
    try {
      let user;

      if (userType === 'admin') {
        // Dynamic import to avoid circular dependency issues if any, or just standard import
        const Admin = (await import('../models/Admin.js')).default;
        user = await Admin.findById(userId);
      } else {
        user = await User.findById(userId);
      }

      if (!user) {
        return {
          success: false,
          error: `${userType} not found`,
        };
      }

      // Get all FCM tokens (app + web)
      const fcmTokens = this.getUserFcmTokens(user);

      if (fcmTokens.length === 0) {
        // Still save notification to database even without FCM token
        try {
          await Notification.create({
            userId: user._id,
            userType: userType, // 'user' or 'admin'
            title: notification.title || 'Rukkoin',
            body: notification.body || '',
            data: data || {},
            type: data.type || 'general',
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save notification to database:', dbError);
        }
        return {
          success: false,
          error: 'User does not have FCM token',
        };
      }

      // Send to all tokens (app + web)
      let lastResult = null;
      let successCount = 0;

      for (const token of fcmTokens) {
        try {
          const result = await this.sendToToken(token, notification, data);
          if (result.success) {
            successCount++;
            lastResult = result;
          }
        } catch (err) {
          console.error('FCM send exception:', err);
        }
      }

      // Save notification to database if at least one token was sent successfully
      if (successCount > 0) {
        try {
          await Notification.create({
            userId: user._id,
            userType: userType,
            title: notification.title || 'Rukkoin',
            body: notification.body || '',
            data: data || {},
            type: data.type || 'general',
            fcmMessageId: lastResult?.messageId || null
          });
        } catch (dbError) {
          console.error('[ERROR] Failed to save notification to database:', dbError);
        }
      }

      return {
        success: successCount > 0,
        successCount
      };
    } catch (error) {
      console.error('[ERROR] Error sending notification to user:', error);
      throw error;
    }
  }
}

export default new NotificationService();
