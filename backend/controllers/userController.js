import User from '../models/User.js';

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get user's saved hotels
 * @route   GET /api/users/saved-hotels
 * @access  Private
 */
export const getSavedHotels = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedHotels',
      select: 'name location images pricing rating isActive',
      match: { isActive: true } // Only return active hotels
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response
    const savedHotels = user.savedHotels.map(hotel => ({
      id: hotel._id,
      name: hotel.name,
      location: hotel.location?.city || hotel.location?.street || 'N/A',
      image: hotel.images?.[0]?.url || '/placeholder-hotel.jpg',
      rating: hotel.rating || 0,
      price: hotel.pricing?.basePrice || 0
    }));

    res.json({
      success: true,
      savedHotels
    });

  } catch (error) {
    console.error('Get Saved Hotels Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Toggle Saved Hotel (Wishlist)
 * @route   POST /api/users/saved-hotels/:id
 * @access  Private
 */
export const toggleSavedHotel = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const user = await User.findById(req.user._id);

    // Check if hotel is already saved
    const isSaved = user.savedHotels.includes(hotelId);

    if (isSaved) {
      // Remove
      user.savedHotels = user.savedHotels.filter(id => id.toString() !== hotelId);
    } else {
      // Add
      user.savedHotels.push(hotelId);
    }

    await user.save();

    res.json({
      success: true,
      message: isSaved ? 'Removed from saved' : 'Added to saved',
      savedHotels: user.savedHotels
    });

  } catch (error) {
    console.error('Toggle Saved Hotel Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update FCM Token
 * @route   PUT /api/users/fcm-token
 * @access  Private
 */
export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken, platform } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Please provide FCM token'
      });
    }

    const targetPlatform = platform === 'app' ? 'app' : 'web';

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize fcmTokens object if it doesn't exist
    if (!user.fcmTokens) {
      user.fcmTokens = { app: null, web: null };
    }

    // Update the specific platform token
    user.fcmTokens[targetPlatform] = fcmToken;

    await user.save();

    res.json({
      success: true,
      message: `FCM token updated successfully for ${targetPlatform} platform`,
      data: {
        platform: targetPlatform,
        tokenUpdated: true
      }
    });

  } catch (error) {
    console.error('Update FCM Token Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
