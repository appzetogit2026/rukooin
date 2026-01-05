import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';

// Random Booking ID Generator
const generateBookingId = () => 'BKID' + Math.floor(100000 + Math.random() * 900000);

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, totalAmount } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const booking = new Booking({
      bookingId: generateBookingId(),
      userId: req.user._id,
      hotelId,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      status: 'confirmed', // Mock confirmation for now
      paymentStatus: 'pending' // Default to pending
    });

    const savedBooking = await booking.save();
    res.status(201).json(savedBooking);

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

/**
 * @desc    Get my bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hotelId', 'name address images rating')
      .sort({ createdAt: -1 });

    // Transform for frontend format
    const formattedBookings = bookings.map(b => ({
      id: b.bookingId,
      hotel: {
        name: b.hotelId?.name,
        location: `${b.hotelId?.address?.city}, ${b.hotelId?.address?.state}`,
        image: b.hotelId?.images?.[0],
        rating: b.hotelId?.rating?.average
      },
      dates: {
        checkIn: new Date(b.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        checkOut: new Date(b.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      },
      guests: b.guests,
      price: b.totalAmount,
      status: b.status,
      paymentStatus: b.paymentStatus
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};
