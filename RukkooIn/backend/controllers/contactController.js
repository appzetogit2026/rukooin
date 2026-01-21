import ContactMessage from '../models/ContactMessage.js';
import notificationService from '../services/notificationService.js';

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
    await notificationService.sendToAdmin({
      title: 'New Support Query',
      body: `New Support Message from ${name}.`
    }, {
      sendEmail: true,
      emailHtml: `
        <h3>New Support Message</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Audit:</strong> ${audience}</p>
      `
    });

    res.status(201).json({ success: true, message: 'Message submitted successfully', contact: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting message' });
  }
};

