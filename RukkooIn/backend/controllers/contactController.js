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

    // NOTIFICATION: Notify Admin
    try {
      const AdminModel = mongoose.model('Admin');
      const admin = await AdminModel.findOne({ role: { $in: ['admin', 'superadmin'] } });
      if (admin && admin.email) {
        emailService.sendAdminSupportQueryEmail(admin.email, doc).catch(e => console.error(e));
      }
    } catch (err) {
      console.warn('Could not notify admin about support query:', err.message);
    }

    res.status(201).json({ success: true, message: 'Message submitted successfully', contact: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

