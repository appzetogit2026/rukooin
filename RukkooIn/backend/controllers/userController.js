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

/**
 * @desc    Get user notifications
 * @route   GET /api/users/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const Notification = (await import('../models/Notification.js')).default;

    // Create filter for the current user
    const filter = {
      userId: req.user._id,
      userType: req.user.role === 'partner' ? 'partner' : 'user'
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.json({
      success: true,
      notifications,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Initialize/Mark Notification as Read (optional, but requested implicitly functionality usually goes with this)
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const Notification = (await import('../models/Notification.js')).default;

    const notification = await Notification.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete Notifications (Single or Bulk)
 * @route   DELETE /api/users/notifications
 * @access  Private
 * @body    { ids: ["id1", "id2"] } or implicit query for single
 */
export const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    const Notification = (await import('../models/Notification.js')).default;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No notification IDs provided' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    }); // end deleteMany

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete Notifications Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Mark All Notifications as Read
 * @route   PUT /api/users/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    const Notification = (await import('../models/Notification.js')).default;

    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark All Read Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
