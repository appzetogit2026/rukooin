import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Helps with self-signed certs in dev
  }
});

/**
 * Send Email
 * @param {string} to - Recipient Email
 * @param {string} subject - Email Subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    if (!to) {
      console.warn("⚠️ No recipient defined for email:", subject);
      return;
    }

    const info = await transporter.sendMail({
      from: `"Rukkoo" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text, // Plain text version
      html: html || text // Use text as HTML if HTML not provided
    });

    console.log(`📧 Email sent: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};
