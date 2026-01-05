import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
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
 * @desc    Send OTP for Login/Register
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    let user = await User.findOne({ phone });

    // Bypass logic for specific numbers
    const isBypassed = BYPASS_NUMBERS.includes(phone);
    const otp = isBypassed ? DEFAULT_OTP : generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user) {
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create a temporary user for OTP flow
      user = new User({
        phone,
        name: 'Guest',
        password: 'otp-login-placeholder',
        otp,
        otpExpires
      });
      await user.save();
    }

    // Skip SMS for bypassed numbers
    if (isBypassed) {
      console.log(`🛡️ OTP Bypassed for ${phone}. Use: ${otp}`);
      return res.status(200).json({ message: 'OTP sent successfully (Bypassed)', success: true });
    }

    // Send SMS
    const smsResponse = await smsService.sendOTP(phone, otp, 'login/verification');

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
 * @desc    Verify OTP and Authenticate User
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const user = await User.findOne({ phone }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please restart flow.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP & Verify User
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;

    // Update details if provided (Registration flow)
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};

/**
 * @desc    Register a new user (Traditional Email/Pass - if needed fallback)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  // ... Implement if needed, focusing on OTP first as per user request
  res.status(501).json({ message: 'Use OTP flow for registration' });
};

/**
 * @desc    Verify OTP and Register Partner + Hotel
 * @route   POST /api/auth/partner/verify-otp
 * @access  Public
 */
/**
 * @desc    Verify OTP and Register Partner + Hotel (Wizard Flow)
 * @route   POST /api/auth/partner/verify-otp
 * @access  Public
 */
export const verifyPartnerOtp = async (req, res) => {
  try {
    const {
      phone, otp, otpCode, // Accept either otp or otpCode
      // User/Owner details
      ownerName, email,
      // Hotel details from Wizard
      propertyType, spaceType, location, propertyName,
      address, details, facilities, images, kyc,
      // Boolean policies
      coupleFriendly, petsAllowed, smokingAllowed,
      propertyDescription, propertyRating
    } = req.body;

    const finalOtp = otp || otpCode;
    const finalPhone = phone || (kyc && kyc.phone); // Fallback if phone is inside kyc object

    if (!finalPhone || !finalOtp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const user = await User.findOne({ phone: finalPhone }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please restart flow.' });
    }

    if (user.otp !== finalOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP & Verify User
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    user.role = 'partner'; // Set role to partner

    // Update user name/email if provided (might be in kyc or separate)
    if (ownerName) user.name = ownerName;
    if (email) user.email = email;

    await user.save();

    // Import Hotel model dynamically (or ensure top-level import)
    const Hotel = (await import('../models/Hotel.js')).default;

    // Check if we have a draft ID from wizard 
    // (Note: You need to pass hotelDraftId in body from frontend Step 11)
    const { hotelDraftId } = req.body;

    let newHotel;

    if (hotelDraftId) {
      // Update the existing draft hotel
      newHotel = await Hotel.findById(hotelDraftId);
      if (newHotel) {
        newHotel.ownerId = user._id;
        newHotel.status = 'pending';
        // Update other fields if final submission differs from last draft save
        if (kyc) newHotel.kyc = { ...newHotel.kyc, ...kyc }; // Ensure KYC is saved
        // ... ensure other critical fields are set
      }
    }

    // If no draft found or provided, create new (legacy fallback)
    if (!newHotel) {
      newHotel = new Hotel({
        name: propertyName || 'New Property',
        // ... (rest of creation logic) ...
        propertyType,
        spaceType,
        address: {
          street: address?.street,
          city: address?.city,
          state: address?.state,
          zip: address?.zip,
          country: address?.country,
          coordinates: location ? { lat: location.lat, lng: location.lng } : (address?.coordinates ? address.coordinates : undefined)
        },
        images: images?.map(img => ({
          url: img.url || 'placeholder.jpg',
          category: img.category,
          caption: img.name
        })) || [],
        facilities: facilities || [],
        rooms: rooms || [],
        details: {
          totalFloors: details?.totalFloors,
          totalRooms: rooms?.length || details?.totalRooms,
          propertyRating: details?.propertyRating || propertyRating
        },
        policies: {
          ...policies,
          coupleFriendly: !!policies?.coupleFriendly || !!coupleFriendly,
          petsAllowed: !!policies?.petsAllowed || !!petsAllowed,
          smokingAllowed: !!policies?.smokingAllowed || !!smokingAllowed,
          checkInTime: policies?.checkInTime || '12:00 PM',
          checkOutTime: policies?.checkOutTime || '11:00 AM'
        },
        kyc: {
          docType: kyc?.docType,
          idNumber: kyc?.idNumber,
          docFront: kyc?.docFront,
          docBack: kyc?.docBack
        },
        ownerId: user._id,
        status: 'pending' // Pending Admin Approval
      });
    }

    await newHotel.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Partner registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      hotelId: newHotel._id
    });

  } catch (error) {
    console.error('Verify Partner OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying partner OTP' });
  }
};

/**
 * @desc    Login user (Traditional Email/Pass - if needed fallback)
 * @route   POST /api/auth/login
 * @access  Public
 */
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

    // Find user by email and select password
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

