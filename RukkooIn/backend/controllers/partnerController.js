import Notification from '../models/Notification.js';

/**
 * @desc    Get partner notifications
 * @route   GET /api/partners/notifications
 * @access  Private (Partner)
 */
export const getPartnerNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.user._id,
      userType: 'partner'
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get Partner Notifications Error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

/**
 * @desc    Mark partner notification as read
 * @route   PUT /api/partners/notifications/:id/read
 * @access  Private (Partner)
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id, userType: 'partner' },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Mark all partner notifications as read
 * @route   PUT /api/partners/notifications/read-all
 * @access  Private (Partner)
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, userType: 'partner', isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete partner notifications
 * @route   DELETE /api/partners/notifications
 * @access  Private (Partner)
 */
export const deleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;

    if (ids && Array.isArray(ids)) {
      await Notification.deleteMany({
        _id: { $in: ids },
        userId: req.user._id,
        userType: 'partner'
      });
    } else if (req.query.id) {
      await Notification.deleteOne({
        _id: req.query.id,
        userId: req.user._id,
        userType: 'partner'
      });
    } else {
      return res.status(400).json({ message: 'Notification ID(s) required' });
    }

    res.json({ success: true, message: 'Notifications deleted' });
  } catch (error) {
    console.error('Delete Notifications Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
