import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';
import Property from '../models/Property.js';
import PaymentConfig from '../config/payment.config.js';

// Initialize Razorpay
let razorpay;
try {
  if (PaymentConfig.razorpayKeyId && PaymentConfig.razorpayKeySecret) {
    razorpay = new Razorpay({
      key_id: PaymentConfig.razorpayKeyId,
      key_secret: PaymentConfig.razorpayKeySecret
    });
  } else {
    // For Development without Keys
    console.warn("⚠️ Razorpay Keys missing. Payment features will fail if used.");
    razorpay = {
      orders: {
        create: () => Promise.reject(new Error("Razorpay Not Initialized"))
      },
      payments: {
        fetch: () => Promise.reject(new Error("Razorpay Not Initialized")),
        refund: () => Promise.reject(new Error("Razorpay Not Initialized"))
      }
    };
  }
} catch (err) {
  console.error("Razorpay Init Failed:", err.message);
}

/**
 * @desc    Create Razorpay order for booking payment
 * @route   POST /api/payments/create-order
 * @access  Private
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking already paid' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(booking.pricing.userPayableAmount * 100), // Amount in paise
      currency: PaymentConfig.currency,
      receipt: booking.bookingId,
      notes: {
        bookingId: booking.bookingId,
        userId: booking.userId.toString(),
        hotelId: booking.hotelId.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Update booking with order ID
    booking.paymentDetails = {
      ...booking.paymentDetails,
      razorpayOrderId: order.id
    };
    await booking.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      booking: {
        bookingId: booking.bookingId,
        amount: booking.pricing.userPayableAmount,
        pricing: booking.pricing
      },
      razorpayKeyId: PaymentConfig.razorpayKeyId
    });

  } catch (error) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', PaymentConfig.razorpayKeySecret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Find booking
    const booking = await Booking.findOne({ bookingId }).populate('hotelId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentDetails = {
      ...booking.paymentDetails,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      method: 'razorpay',
      paidAt: new Date()
    };
    await booking.save();

    // Credit partner wallet
    try {
      const hotel = booking.hotelId;
      let wallet = await Wallet.findOne({ partnerId: hotel.ownerId });

      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await Wallet.create({
          partnerId: hotel.ownerId,
          balance: 0
        });
      }

      // Credit partner earning
      await wallet.credit(
        booking.pricing.partnerEarning,
        `Booking Payment (${booking.bookingId})`,
        booking.bookingId,
        'booking_payment'
      );

      console.log(`✅ Credited ₹${booking.pricing.partnerEarning} to partner wallet`);
    } catch (walletError) {
      console.error('Wallet Credit Error:', walletError);
      // Don't fail the payment, log for manual processing
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

/**
 * @desc    Handle Razorpay webhook
 * @route   POST /api/payments/webhook
 * @access  Public (Razorpay)
 */
export const handleWebhook = async (req, res) => {
  try {
    const secret = PaymentConfig.razorpayKeySecret;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`📨 Webhook received: ${event}`);

    // Handle different events
    switch (event) {
      case 'payment.captured':
        // Payment successful
        console.log('Payment captured:', payload.payment.entity.id);
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed:', payload.payment.entity.id);
        break;

      case 'order.paid':
        // Order paid
        console.log('Order paid:', payload.order.entity.id);
        break;

      default:
        console.log('Unhandled event:', event);
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

/**
 * @desc    Get payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get Payment Details Error:', error);
    res.status(500).json({ message: 'Failed to fetch payment details' });
  }
};

/**
 * @desc    Process refund
 * @route   POST /api/payments/refund/:bookingId
 * @access  Private
 */
export const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Booking not paid' });
    }

    const paymentId = booking.paymentDetails.razorpayPaymentId;
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID not found' });
    }

    // Create refund
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Amount in paise
      notes: {
        reason,
        bookingId
      }
    });

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    booking.paymentDetails.refundId = refund.id;
    booking.paymentDetails.refundedAt = new Date();
    await booking.save();

    // Deduct from partner wallet if already credited
    try {
      const hotel = await Property.findById(booking.hotelId);
      const wallet = await Wallet.findOne({ partnerId: hotel.ownerId });

      if (wallet) {
        await wallet.debit(
          booking.pricing.partnerEarning,
          `Refund for Booking (${booking.bookingId})`,
          booking.bookingId,
          'refund'
        );
      }
    } catch (walletError) {
      console.error('Wallet Debit Error:', walletError);
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Process Refund Error:', error);
    res.status(500).json({ message: 'Refund processing failed', error: error.message });
  }
};
