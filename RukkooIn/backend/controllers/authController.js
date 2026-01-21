import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Admin from '../models/Admin.js';
import Otp from '../models/Otp.js';
import smsService from '../utils/smsService.js';
import notificationService from '../services/notificationService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { logAuditAction } from '../utils/auditLogger.js';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Generate OTP (6 digits)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Bypassed numbers and default OTP
const BYPASS_NUMBERS = ['9685974247', '9009925021', '6261096283'];
const DEFAULT_OTP = '123456';

/**
 * @desc    Send OTP for Login/Register
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone, type, role = 'user' } = req.body; // type: 'login' | 'register', role: 'user' | 'partner'

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    let account;
    if (role === 'partner') {
      account = await Partner.findOne({ phone });
    } else {
      account = await User.findOne({ phone });
    }

    // Login Flow Validation
    if (type === 'login' && !account) {
      return res.status(404).json({ message: `${role === 'partner' ? 'Partner' : 'User'} not found. Please register first.` });
    }

    // Register Flow Validation
    if (type === 'register' && account) {
      return res.status(409).json({ message: `${role === 'partner' ? 'Partner' : 'User'} already exists. Please login.` });
    }

    // Generate OTP
    const isBypassed = BYPASS_NUMBERS.includes(phone);
    const otp = isBypassed ? DEFAULT_OTP : generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    if (account) {
      // Existing Account (Login)
      account.otp = otp;
      account.otpExpires = otpExpires;
      await account.save();
    } else {
      // New Account (Register) - Store in Otp Collection
      // Note: For Partner registration, we usually use registerPartner endpoint which handles details + OTP.
      // But if we support simple OTP register start, we can store in Otp collection.
      // However, Partner requires more details.

      if (role === 'partner' && type === 'register') {
        // If accessing send-otp for partner register, we might just store in Otp or expect them to use /partner/register
        // But for consistency let's allow Otp collection storage
      }

      await Otp.findOneAndUpdate(
        { phone },
        { otp, expiresAt: otpExpires, role }, // Store role in Otp to differentiate? Otp model might need update if we want strictness, but phone is unique key usually.
        { upsert: true, new: true }
      );
    }

    // Skip SMS for bypassed numbers
    if (isBypassed) {
      console.log(`🛡️ OTP Bypassed for ${phone} (${type}) [${role}]. Use: ${otp}`);
      return res.status(200).json({ message: 'OTP sent successfully (Bypassed)', success: true });
    }

    // Send SMS
    const smsResponse = await smsService.sendOTP(phone, otp, `${type}/verification`);

    if (!smsResponse.success) {
      console.log(`⚠️ SMS Failed. Use OTP: ${otp} for testing.`);
      return res.status(200).json({
        message: 'SMS Gateway Error. OTP generated for dev.',
        devOtp: otp,
        success: false
      });
    }

    res.status(200).json({ message: 'OTP sent successfully', success: true });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

/**
 * @desc    Verify OTP and Authenticate User (Login or Register)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name, email, role = 'user' } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // 1. Check if it's an existing account (Login Flow)
    let account;
    if (role === 'partner') {
      account = await Partner.findOne({ phone }).select('+otp +otpExpires');
    } else {
      account = await User.findOne({ phone }).select('+otp +otpExpires');
    }

    let isRegistration = false;

    if (account) {
      // Verify Login OTP
      if (String(account.otp) !== String(otp)) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (account.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Clear OTP
      account.otp = undefined;
      account.otpExpires = undefined;

    } else {
      // 2. Check Otp Collection (Registration Flow)
      const otpRecord = await Otp.findOne({ phone });

      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid request or OTP expired. Please request OTP again.' });
      }

      if (String(otpRecord.otp) !== String(otp)) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }

      // Registration Logic
      if (role === 'partner') {
        // Partner registration usually happens via /partner/register which creates the doc first.
        // If we are here, it means we are trying to register via verify-otp which might be missing details.
        // But if the user used send-otp for partner register, we need to create partner here.
        // However, partner needs many fields.
        // Assuming for now simple partner creation or they should use registerPartner.
        return res.status(400).json({ message: 'Please use Partner Registration form.' });
      }

      // For User registration, 'name' is required
      if (!name) {
        return res.status(400).json({ message: 'Name is required for registration.' });
      }

      // Create New User
      account = new User({
        name,
        phone,
        email,
        isVerified: true,
        // No password needed for OTP only
      });

      isRegistration = true;
      // Delete used OTP
      await Otp.deleteOne({ phone });
    }

    // Save/Update Account
    if (isRegistration || (role === 'user' && (name || email))) {
      if (name) account.name = name;
      if (email) account.email = email;
      account.isVerified = true;
    }

    if (!isRegistration && account.role === 'partner') {
      if (account.partnerApprovalStatus === 'pending') {
        return res.status(403).json({ message: 'Your partner account is pending approval.' });
      }
      if (account.partnerApprovalStatus === 'rejected') {
        return res.status(403).json({ message: 'Your partner account was rejected. Please contact support.' });
      }
    }

    await account.save();

    console.log(`✅ OTP Verified for ${role}. Token generated.`);

    // --- NOTIFICATION HOOK: NEW REGISTRATION ---
    if (isRegistration && role === 'user') {
      notificationService.sendToUser(account._id, {
        title: 'Welcome to Rukkoo!',
        body: 'Welcome aboard! Find your perfect stay today.'
      }, {
        sendEmail: true,
        emailHtml: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #004F4D;">Welcome to Rukkoo! 🏨</h1>
            <p>Hi ${account.name || 'User'},</p>
            <p>Thank you for joining Rukkoo. We are excited to help you find your perfect stay.</p>
            <br/>
            <p>Best Regards,<br/>Team Rukkoo</p>
          </div>
        `,
        type: 'welcome'
      }).catch(err => console.error('Welcome Notification Failed:', err));
    }
    // -------------------------------------------

    const token = generateToken(account._id, account.role);

    res.status(200).json({
      message: isRegistration ? 'Registration successful' : 'Login successful',
      token,
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        isPartner: role === 'partner' ? true : (account.isPartner || false),
        partnerApprovalStatus: account.partnerApprovalStatus
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

/**
 * @desc    Register Partner (Step 1 & 2: Details + Send OTP)
 * @route   POST /api/auth/partner/register
 * @access  Public
 */
export const registerPartner = async (req, res) => {
  try {
    const {
      full_name, email, phone, role, termsAccepted,
      owner_name, aadhaar_number, aadhaar_front, aadhaar_back,
      pan_number, pan_card_image, owner_address
    } = req.body;

    // Basic Validation
    if (!phone || !full_name) {
      return res.status(400).json({ message: 'Phone and Name are required' });
    }

    // Check if partner exists
    let partner = await Partner.findOne({ phone });

    if (partner && partner.isVerified) {
      return res.status(409).json({ message: 'Partner with this phone already exists. Please login.' });
    }

    if (email) {
      const emailPartner = await Partner.findOne({ email });
      if (emailPartner && emailPartner.isVerified && (!partner || emailPartner._id.toString() !== partner._id.toString())) {
        return res.status(409).json({ message: 'Email already in use.' });
      }
    }

    // Prepare Partner Data (No OTP needed)
    const partnerData = {
      name: full_name,
      email: email,
      phone: phone,
      role: 'partner',
      partnerApprovalStatus: 'pending',
      // termsAccepted: termsAccepted, 

      aadhaarNumber: aadhaar_number,
      aadhaarFront: aadhaar_front,
      aadhaarBack: aadhaar_back,
      panNumber: pan_number,
      panCardImage: pan_card_image,

      address: owner_address ? {
        street: owner_address.street,
        city: owner_address.city,
        state: owner_address.state,
        zipCode: owner_address.zipCode,
        country: owner_address.country || 'India',
      } : undefined,

      isVerified: true, // Auto-verify phone as we removed OTP step
      otp: undefined,
      otpExpires: undefined
    };

    if (partner) {
      Object.assign(partner, partnerData);
      await partner.save();
    } else {
      partner = await Partner.create(partnerData);
    }

    // --- NOTIFICATION HOOK: PARTNER REGISTRATION ---
    try {
      // 1. Notify Partner (Email)
      if (partner.email) {
        notificationService.sendToUser(partner._id, {
          title: 'Partner Registration Received 📋',
          body: 'Your partner registration has been received and is pending admin approval.'
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>Registration Received</h3>
            <p>Hi ${partner.name},</p>
            <p>Your request to become a Rukkoo Partner has been received.</p>
            <p>Our team will review your details and documents shortly.</p>
            <p>Status: <strong>Pending Approval</strong></p>
          `,
          type: 'partner_register_pending'
        }, 'partner');
      }

      // 2. Notify Admin (Push)
      const admins = await Admin.find({ role: { $in: ['admin', 'superadmin'] }, isActive: true });

      for (const admin of admins) {
        notificationService.sendToUser(admin._id, {
          title: 'New Partner Registration 👤',
          body: `New Partner ${partner.name} has registered. Please review application.`
        }, {
          type: 'admin_action_required',
          data: { userId: partner._id, screen: 'partner_requests' }
        }, 'admin');
      }

    } catch (notifErr) {
      console.error('Partner Notif Error:', notifErr.message);
    }
    // -----------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Partner registration completed successfully. Your account is pending admin approval.',
      user: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        role: partner.role,
        isPartner: true,
        partnerApprovalStatus: partner.partnerApprovalStatus
      }
    });

  } catch (error) {
    console.error('Register Partner Error:', error);
    res.status(500).json({ message: 'Server error during partner registration' });
  }
};

/**
 * @desc    Verify OTP and Finalize Partner Registration
 * @route   POST /api/auth/partner/verify-otp
 * @access  Public
 */
export const verifyPartnerOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const partner = await Partner.findOne({ phone }).select('+otp +otpExpires');

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found. Please register first.' });
    }

    if (String(partner.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (partner.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    partner.otp = undefined;
    partner.otpExpires = undefined;
    partner.isVerified = true;
    partner.partnerApprovalStatus = 'pending';

    await partner.save();

    // --- NOTIFICATION HOOK: PARTNER REGISTRATION ---
    try {
      // 1. Notify Partner (Email)
      if (partner.email) {
        notificationService.sendToUser(partner._id, {
          title: 'Partner Registration Received 📋',
          body: 'Your partner registration has been received and is pending admin approval.'
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>Registration Received</h3>
            <p>Hi ${partner.name},</p>
            <p>Your request to become a Rukkoo Partner has been received.</p>
            <p>Our team will review your details and documents shortly.</p>
            <p>Status: <strong>Pending Approval</strong></p>
          `,
          type: 'partner_register_pending'
        }, 'partner');
      }

      // 2. Notify Admin (Push)
      const admins = await Admin.find({ role: { $in: ['admin', 'superadmin'] }, isActive: true });

      for (const admin of admins) {
        notificationService.sendToUser(admin._id, {
          title: 'New Partner Registration 👤',
          body: `New Partner ${partner.name} has registered. Please review application.`
        }, {
          type: 'admin_action_required',
          data: { userId: partner._id, screen: 'partner_requests' }
        }, 'admin');
      }

    } catch (notifErr) {
      console.error('Partner Notif Error:', notifErr.message);
    }
    // -----------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Partner registration completed successfully. Your account is pending admin approval.',
      user: {
        id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        role: partner.role,
        isPartner: true,
        partnerApprovalStatus: partner.partnerApprovalStatus
      }
    });

  } catch (error) {
    console.error('Verify Partner OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying partner OTP' });
  }
};

/**
 * @desc    Admin Login with Email & Password
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email and select password
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    // Verify password
    const isMatched = await bcrypt.compare(password, admin.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Log the successful login
    await logAuditAction({
      adminId: admin._id,
      action: 'LOGIN',
      description: `Admin ${admin.name} logged in successfully`,
      targetType: 'Admin',
      targetId: admin._id,
      req
    });

    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

/**
 * @desc    Get Current User/Admin/Partner Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPartner: user.role === 'partner',
        partnerApprovalStatus: user.partnerApprovalStatus, // Will be undefined for User
        address: user.address,
        aadhaarNumber: user.aadhaarNumber,
        panNumber: user.panNumber
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update User/Partner Profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // req.user is already the document (User or Partner)
    const account = req.user;
    const Model = account.role === 'partner' ? Partner : User;

    if (name) account.name = name;
    if (email) {
      if (email !== account.email) {
        const existing = await Model.findOne({ email, _id: { $ne: account._id } });
        if (existing) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        account.email = email;
      }
    }
    if (phone) {
      if (phone !== account.phone) {
        const existing = await Model.findOne({ phone, _id: { $ne: account._id } });
        if (existing) {
          return res.status(409).json({ message: 'Phone number already in use' });
        }
        account.phone = phone;
      }
    }

    if (address) {
      account.address = {
        street: address.street || account.address?.street || '',
        city: address.city || account.address?.city || '',
        state: address.state || account.address?.state || '',
        zipCode: address.zipCode || account.address?.zipCode || '',
        country: address.country || account.address?.country || 'India',
        coordinates: account.role === 'partner' ? undefined : { // Partner address in schema is simple, User has coordinates? Check Partner schema.
          lat: address.coordinates?.lat || account.address?.coordinates?.lat,
          lng: address.coordinates?.lng || account.address?.coordinates?.lng
        }
      };
      // Note: Partner schema I created has coordinates?
      // Partner schema: address: { street, city, state, zipCode, country } - NO coordinates field in address subdoc in my previous Write.
      // User schema: address: { ..., coordinates: { lat, lng } }
      // So checking role is good.
    }

    await account.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        isPartner: account.role === 'partner',
        address: account.address
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

/**
 * @desc    Update Admin Profile
 * @route   PUT /api/auth/admin/update-profile
 * @access  Private (Admin/Superadmin)
 */
export const updateAdminProfile = async (req, res) => {
  // ... existing implementation ...
  // Reuse existing code logic
  try {
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins can update this profile' });
    }

    const { name, email, phone } = req.body;
    const admin = req.user; // authMiddleware sets this

    if (name) admin.name = name;

    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (existingEmail) return res.status(409).json({ message: 'Email already in use' });
      admin.email = email;
    }

    if (phone && phone !== admin.phone) {
      const existingPhone = await Admin.findOne({ phone, _id: { $ne: admin._id } });
      if (existingPhone) return res.status(409).json({ message: 'Phone number already in use' });
      admin.phone = phone;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    res.status(500).json({ message: 'Server error updating admin profile' });
  }
};

/**
 * @desc    Update FCM Token
 * @route   PUT /api/auth/update-fcm
 * @access  Private
 */
export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'Token required' });

    const account = req.user;
    account.fcmToken = fcmToken;
    await account.save();

    res.status(200).json({ success: true, message: 'FCM Token updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating FCM token' });
  }
};
