import ContactMessage from '../models/ContactMessage.js';
import emailService from '../services/emailService.js';
import mongoose from 'mongoose';

export const createContactMessage = async (req, res) => {
  try {
    const { audience } = req.params;
    const { name, email, phone, subject, message } = req.body;

    if (!['user', 'partner'].includes(audience)) {
      return res.status(400).json({ success: false, message: 'Invalid audience' });
    }

    if (!name || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Name, subject and message are required' });
    }

    const doc = await ContactMessage.create({
      audience,
      name,
      email,
      phone,
      subject,
      message
    });

    // NOTIFICATION: Notify Admin (Email + In-App)
    try {
      // Dynamic import or ensure model is registered
      // Best to rely on User model if Admin is a User with role='admin', 
      // BUT if you have a separate Admin schema, we must use that.
      // Based on previous file reads, it seems 'User' is used for everything usually, 
      // but 'Admin' model reference exists in code. Let's try finding User with role 'admin' first.

      const adminUser = await mongoose.model('User').findOne({ role: { $in: ['admin', 'superadmin'] } }).sort({ createdAt: 1 });

      if (adminUser) {
        // 1. Send Email
        if (adminUser.email) {
          emailService.sendAdminSupportQueryEmail(adminUser.email, doc).catch(e => console.error('Email failed:', e));
        }

        // 2. Create In-App Notification
        const Notification = mongoose.model('Notification');
        await Notification.create({
          userId: adminUser._id,
          userType: 'admin', // or 'user' depending on schema, usually 'admin' for dashboard
          title: `New Support Message: ${subject}`,
          body: `From: ${name} (${audience}). Click to view.`,
          type: 'support_message',
          data: { messageId: doc._id, audience },
          isRead: false
        });
      }
    } catch (err) {
      console.warn('Could not notify admin about support query:', err);
    }

    res.status(201).json({ success: true, message: 'Message submitted successfully', contact: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

