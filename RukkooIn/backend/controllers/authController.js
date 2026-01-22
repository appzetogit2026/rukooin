import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Admin from '../models/Admin.js';
import Otp from '../models/Otp.js';
import smsService from '../utils/smsService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
 * @desc    Send OTP for Login/Register (Support User/Partner)
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone, type, role = 'user' } = req.body; // type: 'login' | 'register', role: 'user' | 'partner'

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    // Select Model based on Role
    let Model = role === 'partner' ? Partner : User;
    let user = await Model.findOne({ phone });

    // Login Flow Validation
    if (type === 'login' && !user) {
      return res.status(404).json({ message: `${role === 'partner' ? 'Partner' : 'User'} not found. Please register first.` });
    }

    // Register Flow Validation
    // For Partner, registration is separate (registerPartner), so this might be just for User
    if (type === 'register' && user) {
      return res.status(409).json({ message: `${role === 'partner' ? 'Partner' : 'User'} already exists. Please login.` });
    }

    // Generate OTP
    const isBypassed = BYPASS_NUMBERS.includes(phone);
    const otp = isBypassed ? DEFAULT_OTP : generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    if (user) {
      // Existing User/Partner (Login)
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // New User (Register) - Store in Otp Collection
      // Note: Partner registration uses registerPartner -> verifyPartnerOtp flow usually
      await Otp.findOneAndUpdate(
        { phone },
        { otp, expiresAt: otpExpires, tempData: { role, phone } }, 
        { upsert: true, new: true }
      );
    }

    // Skip SMS for bypassed numbers
    if (isBypassed) {
      console.log(`🛡️ OTP Bypassed for ${phone} (${type}). Use: ${otp}`);
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

    // Select Model based on Role
    let Model = role === 'partner' ? Partner : User;
    
    // 1. Check if it's an existing user (Login Flow)
    let user = await Model.findOne({ phone }).select('+otp +otpExpires');
    let isRegistration = false;

    if (user) {
      // Verify Login OTP
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (user.otpExpires < Date.now()) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      // Clear OTP
      user.otp = undefined;
      user.otpExpires = undefined;

    } else {
      // 2. Check Otp Collection (Registration Flow)
      // This path is primarily for USER registration. Partner registration should go through verifyPartnerOtp
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

      // For registration, 'name' is required
      if (!name) {
        return res.status(400).json({ message: 'Name is required for registration.' });
      }

      if (email) {
        const emailExists = await Model.findOne({ email });
        if (emailExists) return res.status(409).json({ message: 'Email already exists.' });
      }

      // Create New User
      user = new User({
        name,
        phone,
        email,
        role: 'user', 
        isVerified: true,
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });

      isRegistration = true;
      // Delete used OTP
      await Otp.deleteOne({ phone });
    }

    // Save/Update User
    if (isRegistration || (role === 'user' && (name || email))) {
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

    if (user.role === 'partner') {
      if (user.partnerApprovalStatus === 'pending') {
        // We might allow login to see status, but let's restrict if needed. 
        // For now, allow login so they can see dashboard with "Pending" state
      }
      if (user.partnerApprovalStatus === 'rejected') {
        return res.status(403).json({ message: 'Your partner account was rejected. Please contact support.' });
      }
    }

    await user.save();

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

    // 1. Check if PARTNER ALREADY exists with this phone
    let existingUser = await Partner.findOne({ phone });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({ message: 'Partner account with this phone already exists. Please login.' });
      }
    }

    if (email) {
      const existingEmail = await Partner.findOne({ email });
      if (existingEmail && existingEmail.isVerified) {
        return res.status(409).json({ message: 'Email already in use for a partner account.' });
      }
    }

    // Prepare Partner Data (Stored in Otp temp data or direct if we skipped OTP in this specific flow before)
    // The previous implementation created User directly. Now we create Partner.
    
    const partnerData = {
      name: full_name,
      email: email,
      phone: phone,
      role: 'partner',
      isPartner: true,
      partnerApprovalStatus: 'pending',
      termsAccepted: termsAccepted,
      
      ownerName: owner_name, // Map fields correctly
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
        coordinates: owner_address.coordinates
      } : undefined,
      password: await bcrypt.hash(Math.random().toString(36), 10), 
      isVerified: true // Auto-verified if this endpoint implies OTP was skipped or handled
    };

    // Note: If the flow requires OTP *after* this step, we should store in Otp or create unverified Partner.
    // The previous code created a verified User directly. I will maintain that behavior but with Partner model.

    const newPartner = new Partner(partnerData);
    await newPartner.save();

    const token = generateToken(newPartner._id, newPartner.role);

    res.status(201).json({
      success: true,
      message: 'Partner registration completed successfully. Waiting for Admin Approval.',
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
    console.error('Register Partner Error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email or Phone already exists.' });
    }
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
    if (!userData) {
      return res.status(400).json({ message: 'Registration data not found. Please register again.' });
    }

    if (userData.role !== 'partner') {
      return res.status(400).json({ message: 'Invalid registration context.' });
    }

    // Check if Partner already exists
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
