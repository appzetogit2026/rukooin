import ContactMessage from '../models/ContactMessage.js';
import emailService from '../services/emailService.js';
import notificationService from '../services/notificationService.js';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';
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
      message,
      userId: req.user ? req.user._id : undefined
    });

    // NOTIFICATION: Notify Admin
    notificationService.sendToAdmins({
      title: `New Support Message: ${subject}`,
      body: `From: ${name} (${audience}).`
    }, { type: 'support_message', messageId: doc._id }).catch(e => console.error('Admin notification failed:', e));

    res.status(201).json({ success: true, message: 'Message submitted successfully', contact: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

