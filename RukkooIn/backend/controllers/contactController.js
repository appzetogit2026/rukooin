import ContactMessage from '../models/ContactMessage.js';
import notificationService from '../services/notificationService.js'; // Added

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

    // --- NOTIFICATION HOOK: NEW SUPPORT QUERY ---
    try {
      const AdminModel = (await import('../models/Admin.js')).default;
      const admins = await AdminModel.find({ role: { $in: ['admin', 'superadmin'] }, isActive: true });

      for (const admin of admins) {
        notificationService.sendToUser(admin._id, {
          title: 'New Support Message 📬',
          body: `From: ${name} (${audience}). Subject: ${subject}`
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>New Support Query (${audience})</h3>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; border-left: 4px solid #ccc; padding: 10px;">${message}</blockquote>
          `,
          type: 'support_query',
          data: { contactId: doc._id }
        }, 'admin');
      }
    } catch (notifErr) { console.error('Support Notif Error:', notifErr.message); }
    // ------------------------------------------

    res.status(201).json({ success: true, message: 'Message submitted successfully', contact: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

