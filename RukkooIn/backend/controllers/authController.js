import emailService from '../services/emailService.js';
import notificationService from '../services/notificationService.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import smsService from '../utils/smsService.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const sendOtp = async (req, res) => {
  try {
    const { phone, type, role = 'user' } = req.body; // type: 'login' or 'register'

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    let user;
    let Model = role === 'partner' ? Partner : User;

    if (type === 'login') {
      user = await Model.findOne({ phone });
      if (!user) {
        // If login but user not found, we can either error or treat as "new user" flow for users
        // For Partner, stricter check usually.
        if (role === 'partner') {
          return res.status(404).json({ message: 'Partner not found.' });
        }
        // For User, we might allow auto-register via verifyOtp, so we just send OTP to generic storage
      }
    }

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Store in Otp collection for new/unregistered users
      await Otp.findOneAndUpdate(
        { phone },
        { phone, otp, expiresAt: otpExpires, tempData: { role } },
        { upsert: true, new: true }
      );
    }

    // Send SMS
    await smsService.sendOTP(phone, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

export const registerPartner = async (req, res) => {
  try {
    const { name, email, phone, password, address, documents } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingPartner = await Partner.findOne({ $or: [{ email }, { phone }] });
    if (existingPartner) {
      return res.status(409).json({ message: 'Partner already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const passwordHash = await bcrypt.hash(password, 10);

    // Store registration data temporarily
    await Otp.findOneAndUpdate(
      { phone },
      {
        phone,
        otp,
        expiresAt: otpExpires,
        tempData: {
          name,
          email,
          phone,
          passwordHash,
          address,
          role: 'partner',
          documents,
          partnerApprovalStatus: 'pending'
        }
      },
      { upsert: true }
    );

    // Send SMS
    await smsService.sendOTP(phone, otp);

    res.status(200).json({ message: 'OTP sent for registration verification' });
  } catch (error) {
    console.error('Register Partner Error:', error);
    res.status(500).json({ message: 'Server error initiating registration' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    // ... (existing verification logic)
    const { phone, otp, name, email, role = 'user' } = req.body;

    // ... (logic to verify OTP)
    // Select Model based on Role
    let Model = role === 'partner' ? Partner : User;

    // 1. Check if it's an existing user (Login Flow)
    let user = await Model.findOne({ phone }).select('+otp +otpExpires');
    let isRegistration = false;

    if (user) {
      // ... (existing login logic)
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP has expired' });
      }
      user.otp = undefined;
      user.otpExpires = undefined;
    } else {
      // ... (existing registration logic)
      if (role === 'partner') {
        return res.status(404).json({ message: 'Partner not found. Please use partner registration.' });
      }
      const otpRecord = await Otp.findOne({ phone });
      if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid request or OTP expired. Please request OTP again.' });
      }
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (otpRecord.tempData && otpRecord.tempData.role && otpRecord.tempData.role !== role) {
        return res.status(400).json({ message: 'Invalid role context.' });
      }
      if (!name) {
        return res.status(400).json({ message: 'Name is required for registration.' });
      }
      if (email) {
        const emailExists = await Model.findOne({ email });
        if (emailExists) return res.status(409).json({ message: 'Email already exists.' });
      }

      user = new User({
        name,
        phone,
        email,
        role: 'user',
        isVerified: true,
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
      isRegistration = true;
      await Otp.deleteOne({ phone });
    }

    // Save/Update User
    if (isRegistration || (role === 'user' && (name || email))) {
      // ... (update name/email logic)
      if (name) user.name = name;
      if (email) {
        if (email !== user.email) {
          const emailExists = await Model.findOne({ email, _id: { $ne: user._id } });
          if (emailExists) return res.status(409).json({ message: 'Email already in use.' });
          user.email = email;
        }
      }
      user.isVerified = true;
    }

    // ... (partner check logic)

    await user.save();

    // NOTIFICATION & EMAIL TRIGGERS (USER REGISTRATION)
    if (isRegistration && role === 'user') {
      // Send Welcome Email
      if (user.email) {
        emailService.sendUserWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));
      }

      // Send Welcome Notification (Stored + Push if token exists later)
      // Since token might not be here, we trust the frontend will sync it later, or we store a notification for the inbox.
      notificationService.sendToUser(user._id, {
        title: 'Welcome aboard!',
        body: 'Find your perfect stay today.'
      }, { type: 'welcome' }, 'user').catch(err => console.error('Failed to send welcome notification:', err));
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: isRegistration ? 'Registration successful' : 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPartner: user.isPartner || (role === 'partner'),
        partnerApprovalStatus: user.partnerApprovalStatus
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

// ... (registerPartner)

export const verifyPartnerOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // 1. Check OTP in Otp collection
    const otpRecord = await Otp.findOne({ phone });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid request or OTP expired. Please register again.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // 2. Create Partner from tempData
    const userData = otpRecord.tempData;
    // ... (validations)
    if (!userData) {
      return res.status(400).json({ message: 'Registration data not found. Please register again.' });
    }
    if (userData.role !== 'partner') {
      return res.status(400).json({ message: 'Invalid registration context.' });
    }

    const existingUser = await Partner.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: 'Partner account already exists.' });
    }

    // Create New Partner
    const newPartner = new Partner({
      ...userData,
      password: userData.passwordHash || await bcrypt.hash(Math.random().toString(36), 10),
      isVerified: true
    });

    await newPartner.save();

    // 3. Cleanup OTP
    await Otp.deleteOne({ phone });

    // NOTIFICATION & EMAIL TRIGGERS (PARTNER REGISTRATION)
    if (newPartner.email) {
      emailService.sendPartnerRegistrationEmail(newPartner).catch(err => console.error('Failed to send partner confirmation email:', err));
    }

    // Notify Admins
    const admins = await Admin.find({ role: { $in: ['admin', 'superadmin'] } });
    for (const admin of admins) {
      notificationService.sendToUser(
        admin._id,
        {
          title: 'New Partner Registration',
          body: `${newPartner.name} has registered and needs review.`
        },
        { type: 'partner_registration', partnerId: newPartner._id },
        'admin' // Assuming sendToUser handles 'admin' type correctly
      ).catch(err => console.error('Failed to notify admin:', err));
    }

    const token = generateToken(newPartner._id, newPartner.role);

    res.status(200).json({
      success: true,
      message: 'Partner registration completed successfully.',
      token,
      user: {
        id: newPartner._id,
        name: newPartner.name,
        email: newPartner.email,
        phone: newPartner.phone,
        role: newPartner.role,
        isPartner: newPartner.isPartner,
        partnerApprovalStatus: newPartner.partnerApprovalStatus
      }
    });

  } catch (error) {
    console.error('Verify Partner OTP Error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email or Phone already exists for this role.' });
    }
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

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is deactivated' });
    }

    const isMatched = await bcrypt.compare(password, admin.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    admin.lastLogin = new Date();
    await admin.save();

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
    // req.user is already populated by authMiddleware (which checks User, Partner, Admin)
    const user = req.user;

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
        isPartner: user.isPartner || false,
        partnerApprovalStatus: user.partnerApprovalStatus,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const currentUser = req.user; // From middleware

    // Determine Model based on role
    let Model = currentUser.role === 'partner' ? Partner : User;
    if (['admin', 'superadmin'].includes(currentUser.role)) {
      // Admins use updateAdminProfile usually, but if they hit this:
      Model = Admin;
    }

    let user = await Model.findById(currentUser._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) {
      if (email !== user.email) {
        const existingUser = await Model.findOne({ email, _id: { $ne: user._id } });
        if (existingUser) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        user.email = email;
      }
    }
    if (phone) {
      if (phone !== user.phone) {
        const existingUser = await Model.findOne({ phone, _id: { $ne: user._id } });
        if (existingUser) {
          return res.status(409).json({ message: 'Phone number already in use' });
        }
        user.phone = phone;
      }
    }

    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        zipCode: address.zipCode || user.address?.zipCode || '',
        country: address.country || user.address?.country || 'India',
        coordinates: {
          lat: address.coordinates?.lat || user.address?.coordinates?.lat,
          lng: address.coordinates?.lng || user.address?.coordinates?.lng
        }
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPartner: user.isPartner || false,
        address: user.address
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
  // ... (Keep existing implementation)
  try {
    if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins can update this profile' });
    }

    const { name, email, phone } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (name) {
      admin.name = name;
    }

    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (existingEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      admin.email = email;
    }

    if (phone && phone !== admin.phone) {
      const existingPhone = await Admin.findOne({ phone, _id: { $ne: admin._id } });
      if (existingPhone) {
        return res.status(409).json({ message: 'Phone number already in use' });
      }
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
 * @desc    Upload Documents (Public for Registration)
 * @route   POST /api/auth/partner/upload-docs
 * @access  Public
 */
export const uploadDocs = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No documents provided' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/**
 * @desc    Update FCM Token for Push Notifications
 * @route   PUT /api/auth/update-fcm
 * @access  Private
 */
export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required' });

    const user = req.user; // From middleware (User, Partner, or Admin)

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure fcmTokens object exists
    if (!user.fcmTokens) {
      user.fcmTokens = {};
    }

    // Defaulting to web for now, can be extended to 'app'
    user.fcmTokens.web = fcmToken;

    // For backward compatibility if schema uses single field, but our models have fcmTokens object now
    // If Admin doesn't have fcmTokens object in schema yet, we might need to check. 
    // Assuming Admin schema is similar or we just save to the document.

    await user.save();

    res.json({ success: true, message: 'FCM Token updated successfully' });
  } catch (error) {
    console.error('Update FCM Token Error:', error);
    res.status(500).json({ message: 'Server error updating FCM token' });
  }
};
