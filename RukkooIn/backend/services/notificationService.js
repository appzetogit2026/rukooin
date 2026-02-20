import { getFirebaseAdmin } from '../config/firebase.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

class NotificationService {
  /**
   * Helper function to get all FCM tokens from a user (app + web)
   * @param {Object} user - User document
   * @returns {Array<string>} - Array of FCM tokens (Unique)
   */
  getUserFcmTokens(user) {
    const tokens = new Set();

    // Get platform-based tokens (app and web)
    if (user.fcmTokens) {
      if (user.fcmTokens.app) tokens.add(user.fcmTokens.app);
      if (user.fcmTokens.web) tokens.add(user.fcmTokens.web);
    }

    return Array.from(tokens).filter(Boolean); // Remove null/undefined and ensure unique
  }

  /**
   * Send notification to a single FCM token (Internal)
   */
  async sendToToken(fcmToken, notification, data = {}, cleanupMeta = null) {
    try {
      const admin = getFirebaseAdmin();
      if (!admin) throw new Error('Firebase Admin not initialized');

      const stringifiedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          stringifiedData[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
      }

      const appUrl = process.env.FRONTEND_URL || 'https://rukkoo.in';
      const fallbackLink = (data.url && data.url.startsWith('http')) ? data.url : `${appUrl}${data.url || '/'}`;

      const message = {
        token: fcmToken,
        notification: {
          title: notification.title || 'Rukkoin',
          body: notification.body || 'New Notification',
        },
        data: {
          ...stringifiedData,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            // Omitted channelId to prevent silent suppression on Android 13+ if channel is missing
          },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          },
          fcmOptions: { link: fallbackLink },
        },
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending notification to token:', error.message || error);

      if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered' ||
        error.message?.includes('NotRegistered')) {

        if (cleanupMeta?.userId && cleanupMeta?.userType) {
          this.cleanupInvalidToken(cleanupMeta.userId, cleanupMeta.userType, fcmToken)
            .catch(e => console.error('[NotificationService] Pruning failed:', e.message));
        }

        return { success: false, error: 'Invalid or unregistered token', code: error.code || 'NotRegistered' };
      }
      throw error;
    }
  }

  /**
   * Removes an invalid FCM token from a user's record
   */
  async cleanupInvalidToken(userId, userType, token) {
    try {
      console.log(`[NotificationService] Pruning invalid token for ${userType} ${userId}...`);
      let Model;
      if (userType === 'admin') {
        Model = (await import('../models/Admin.js')).default;
      } else if (userType === 'partner') {
        Model = (await import('../models/Partner.js')).default;
      } else {
        Model = (await import('../models/User.js')).default;
      }

      const user = await Model.findById(userId);
      if (user && user.fcmTokens) {
        let changed = false;
        if (user.fcmTokens.app === token) {
          user.fcmTokens.app = null;
          changed = true;
        }
        if (user.fcmTokens.web === token) {
          user.fcmTokens.web = null;
          changed = true;
        }
        if (changed) {
          await user.save();
          console.log(`[NotificationService] Successfully pruned dead ${userType} token.`);
        }
      }
    } catch (e) {
      console.error('[NotificationService] Cleanup Error:', e.message);
    }
  }

  /**
   * Send notification to a user, admin or partner by ID
   */
  async sendToUser(userId, notification, data = {}, userType = 'user') {
    try {
      console.log(`[NotificationService] Sending to User: ${userId} (${userType})`);
      let user;

      if (userType === 'admin') {
        const Admin = (await import('../models/Admin.js')).default;
        user = await Admin.findById(userId);
      } else if (userType === 'partner') {
        const Partner = (await import('../models/Partner.js')).default;
        user = await Partner.findById(userId);
      } else {
        user = await User.findById(userId);
      }

      if (!user) {
        console.warn(`[NotificationService] User not found: ${userId} (${userType})`);
        return { success: false, error: `${userType} not found` };
      }

      // 1. DEDUPLICATION: Save unique notification to DB
      let savedNotification;
      try {
        // Simple check: Don't save if same message to same user exists in last 2 seconds (debounce)
        const recentMatch = await Notification.findOne({
          userId: user._id,
          title: notification.title,
          body: notification.body,
          type: data.type || 'general',
          createdAt: { $gte: new Date(Date.now() - 2000) }
        });

        if (recentMatch) {
          console.log('[NotificationService] (DEDUPLICATION) Skipping duplicate notification call.');
          return { success: true, duplicated: true };
        }

        savedNotification = await Notification.create({
          userId: user._id,
          userType: userType,
          title: notification.title || 'Rukkoin',
          body: notification.body || '',
          data: data || {},
          type: data.type || 'general',
        });
      } catch (dbError) {
        console.error('[NotificationService] [ERROR] Failed to save notification to database:', dbError);
      }

      // 2. Get all FCM tokens (Unique Set)
      const fcmTokens = this.getUserFcmTokens(user);
      console.log(`[NotificationService] Found ${fcmTokens.length} Unique FCM tokens for user.`);

      if (fcmTokens.length === 0) {
        return { success: false, error: 'No tokens', notificationId: savedNotification?._id };
      }

      // 3. Send to tokens
      let successCount = 0;
      let lastResult = null;

      for (const token of fcmTokens) {
        try {
          const result = await this.sendToToken(token, notification, data, { userId, userType });
          if (result.success) {
            successCount++;
            lastResult = result;
          }
        } catch (err) {
          console.error('[NotificationService] FCM send exception:', err.message);
        }
      }

      if (successCount > 0 && savedNotification && lastResult?.messageId) {
        savedNotification.fcmMessageId = lastResult.messageId;
        await savedNotification.save().catch(() => { });
      }

      return { success: successCount > 0, successCount, notificationId: savedNotification?._id };
    } catch (error) {
      console.error('[NotificationService] Error in sendToUser:', error);
      throw error;
    }
  }

  /**
   * Send notification to a partner by ID
   * @param {string} partnerId - Partner ID
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<Object>}
   */
  async sendToPartner(partnerId, notification, data = {}) {
    return this.sendToUser(partnerId, notification, data, 'partner');
  }

  /**
   * Send notification to all active admins
   * @param {Object} notification - Notification payload
   * @param {Object} data - Additional data payload
   * @returns {Promise<void>}
   */
  async sendToAdmins(notification, data = {}) {
    try {
      const Admin = (await import('../models/Admin.js')).default;
      const activeAdmins = await Admin.find({ isActive: true });

      if (activeAdmins.length === 0) {
        console.warn('[NotificationService] No active admins found to notify.');
        return;
      }

      console.log(`[NotificationService] Notifying ${activeAdmins.length} admins.`);

      // Send to each admin (using sendToUser to handle DB logging and multi-token push)
      const notifyPromises = activeAdmins.map(admin =>
        this.sendToUser(admin._id, notification, data, 'admin')
          .catch(err => console.error(`[NotificationService] Failed to notify admin ${admin._id}:`, err))
      );

      await Promise.all(notifyPromises);
    } catch (error) {
      console.error('[NotificationService] Error in sendToAdmins:', error);
    }
  }

  /**
   * Broadcast notification to all users or partners
   * @param {string} target - 'all_users', 'all_partners'
   * @param {Object} notification - { title, body }
   * @param {Object} data - payload
   */
  async broadcastToAll(target, notification, data = {}) {
    try {
      console.log(`[NotificationService] 📢 BROADCASTING to ${target}`);
      let targetUsers = [];
      let userType = 'user';

      if (target === 'all_partners') {
        const Partner = (await import('../models/Partner.js')).default;
        targetUsers = await Partner.find({ isVerified: true, partnerApprovalStatus: 'approved' }).select('_id name email fcmTokens');
        userType = 'partner';
      } else {
        targetUsers = await User.find({ isVerified: true }).select('_id name email fcmTokens');
        userType = 'user';
      }

      console.log(`[NotificationService] Found ${targetUsers.length} recipients for broadcast.`);

      // Send to each user
      // Note: For massive scale, we'd use FCM topics or batch, but for now we iterate
      const promises = targetUsers.map(u =>
        this.sendToUser(u._id, notification, data, userType)
          .catch(e => console.error(`Failed broadcast for ${u._id}:`, e))
      );

      return Promise.all(promises);
    } catch (error) {
      console.error('[NotificationService] Broadcast failed:', error);
    }
  }
}

export default new NotificationService();
