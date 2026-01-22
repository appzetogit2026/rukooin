import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send an email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - Email body (HTML)
   * @param {string} text - Email body (Text fallback)
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'RukkooIn'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('Message sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // user: Welcome Email
  async sendUserWelcomeEmail(user) {
    const subject = 'Welcome to RukkooIn!';
    const html = `
      <h1>Welcome to RukkooIn, ${user.name || 'Traveler'}!</h1>
      <p>We are excited to have you on board.</p>
      <p>Here are your profile details:</p>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
      </ul>
      <p>Find your perfect stay today!</p>
    `;
    return this.sendEmail({ to: user.email, subject, html, text: 'Welcome to RukkooIn!' });
  }

  // user: Booking Confirmation
  async sendBookingConfirmationEmail(user, booking) {
    const subject = `Booking Confirmation: #${booking.bookingId}`;
    const html = `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${user.name},</p>
      <p>Your booking #${booking.bookingId} has been successfully confirmed.</p>
      <p><strong>Status:</strong> Confirmed</p>
      <p>Thank you for choosing RukkooIn.</p>
    `;
    return this.sendEmail({ to: user.email, subject, html, text: `Booking #${booking.bookingId} Confirmed.` });
  }

  // user: Booking Cancellation
  async sendBookingCancellationEmail(user, booking, refundAmount) {
    const subject = `Booking #${booking.bookingId} Cancellation Confirmed`;
    const html = `
      <h1>Booking Cancelled</h1>
      <p>Dear ${user.name},</p>
      <p>Your booking #${booking.bookingId} has been cancelled.</p>
      <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
      <p>We hope to see you again soon.</p>
    `;
    return this.sendEmail({ to: user.email, subject, html, text: `Booking #${booking.bookingId} Cancelled.` });
  }

  // partner: Registration Received
  async sendPartnerRegistrationEmail(partner) {
    const subject = 'Registration Received - RukkooIn Partner';
    const html = `
      <h1>Registration Received</h1>
      <p>Dear ${partner.name},</p>
      <p>We have received your registration request.</p>
      <p>Your account is currently waiting for Admin Approval. You will be notified once reviewed.</p>
    `;
    return this.sendEmail({ to: partner.email, subject, html, text: 'Registration Received. Waiting for Admin Approval.' });
  }

  // partner: Account Approved
  async sendPartnerApprovedEmail(partner) {
    const subject = 'Congrats! Your Partner Account is Approved';
    const html = `
      <h1>Account Approved!</h1>
      <p>Dear ${partner.name},</p>
      <p>Congratulations! Your Partner account has been approved.</p>
      <p>You can now login and start listing your properties.</p>
    `;
    return this.sendEmail({ to: partner.email, subject, html, text: 'Congrats! Your Partner Account is Approved. Login now.' });
  }

  // partner: Account Rejected
  async sendPartnerRejectedEmail(partner, reason) {
    const subject = 'Account Application Update';
    const html = `
      <h1>Account Application Update</h1>
      <p>Dear ${partner.name},</p>
      <p>We regret to inform you that your application has been rejected.</p>
      <p><strong>Reason:</strong> ${reason || 'Criteria not met'}</p>
      <p>Please contact support for more details.</p>
    `;
    return this.sendEmail({ to: partner.email, subject, html, text: `Account Application Update. Reason: ${reason}` });
  }

  // admin: New Property Notification
  async sendAdminNewPropertyEmail(adminEmail, property) {
    const subject = `New Property List Request: ${property.name}`;
    const html = `
      <h1>New Property Request</h1>
      <p>A new property "<strong>${property.name}</strong>" has been listed.</p>
      <p>Please verify the documents in the admin panel.</p>
    `;
    return this.sendEmail({ to: adminEmail, subject, html, text: `New Property List Request: ${property.name}. Verify Docs.` });
  }

  // admin: New Support Query
  async sendAdminSupportQueryEmail(adminEmail, contact) {
    const subject = `New Support Message from ${contact.name}`;
    const html = `
      <h1>New Support Message</h1>
      <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
      <p><strong>Message:</strong></p>
      <p>${contact.message}</p>
    `;
    return this.sendEmail({ to: adminEmail, subject, html, text: `New Support Message from ${contact.name}.` });
  }
}

export default new EmailService();
