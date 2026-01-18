import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentConfig from '../config/payment.config.js';
import Booking from '../models/Booking.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

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
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus === 'paid') return res.status(400).json({ message: 'Booking already paid' });

    let amountInPaise = Math.round(booking.totalAmount * 100);
    if (!amountInPaise || amountInPaise <= 0) return res.status(400).json({ message: 'Invalid booking amount' });

    // WORKAROUND: Razorpay Test Accounts often have a limit (e.g., ₹15,000).
    // If using Test Keys, cap the request amount to ₹10,000 to allow testing the flow.
    const isTestKey = PaymentConfig.razorpayKeyId?.startsWith('rzp_test');
    const MAX_TEST_AMOUNT = 10000 * 100; // ₹10,000

    if (isTestKey && amountInPaise > MAX_TEST_AMOUNT) {
      console.warn(`⚠️ Capping Test Payment of ₹${booking.totalAmount} to ₹10,000 to avoid Razorpay Limit Check.`);
      amountInPaise = MAX_TEST_AMOUNT;
    }

    const options = {
      amount: amountInPaise,
      currency: PaymentConfig.currency,
      receipt: booking._id.toString(),
      notes: {
        bookingId: booking._id.toString(),
        userId: booking.userId.toString(),
        propertyId: booking.propertyId.toString()
      }
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },
      booking: {
        id: booking._id,
        amount: booking.totalAmount,
        status: booking.bookingStatus,
        paymentStatus: booking.paymentStatus
      },
      razorpayKeyId: PaymentConfig.razorpayKeyId
    });
  } catch (error) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.error?.description || error.message // Return specific Razorpay error if available
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', PaymentConfig.razorpayKeySecret)
      .update(sign.toString())
      .digest('hex');
    if (razorpay_signature !== expectedSign) return res.status(400).json({ message: 'Invalid payment signature' });
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    booking.paymentMethod = 'razorpay';
    await booking.save();

    // --- PARTNER WALLET CREDIT LOGIC ---
    try {
      // 1. Get Property to find Partner
      const property = await Booking.findById(bookingId).populate('propertyId'); // Access property via populate or stored ID
      // Actually booking.propertyId is an ID, unless we populate it.
      // But we can assume we need to find the specific wallet for the partner owner.
      // We can fetch Property separately or use populate.
      // Let's rely on Property model check if needed, but booking usually has logic.
      // Wait, we can't easily get partnerId from booking unless populated.
      // Let's populate 'propertyId' to get 'partnerId'.
    } catch (err) { console.error("Wallet Credit Prep Failed", err); }

    const fullBooking = await Booking.findById(bookingId).populate('propertyId'); // We need partnerId from property
    const partnerId = fullBooking.propertyId?.partnerId;

    if (partnerId) {
      let partnerWallet = await Wallet.findOne({ partnerId: partnerId, role: 'partner' });
      if (!partnerWallet) {
        partnerWallet = await Wallet.create({
          partnerId: partnerId,
          role: 'partner',
          balance: 0
        });
      }

      const payout = fullBooking.partnerPayout || 0;
      if (payout > 0) {
        // Credit Wallet
        partnerWallet.balance += payout;
        partnerWallet.totalEarnings += payout;

        // Pending Clearance logic? Usually money is "pending" until checkout.
        // For now, user requested "wallet balance reflect", so we add to balance.
        // If strict logic needed, we'd add to 'pendingClearance' instead.
        // Let's stick to balance for immediate visibility as requested.

        await partnerWallet.save();

        // Create Transaction
        await Transaction.create({
          walletId: partnerWallet._id,
          partnerId: partnerId,
          type: 'credit',
          category: 'booking_payment',
          amount: payout,
          balanceAfter: partnerWallet.balance,
          description: `Payment for Booking #${fullBooking.bookingId}`,
          reference: fullBooking.bookingId,
          status: 'completed',
          metadata: {
            bookingId: fullBooking._id.toString()
          }
        });
        console.log(`[Payment] Credited ₹${payout} to Partner ${partnerId}`);
      }
    }
    // --- END PARTNER WALLET ---

    // Return full populated booking for confirmation page
    const populatedBooking = await Booking.findById(bookingId)
      .populate('propertyId', 'name address images coverImage type checkInTime checkOutTime')
      .populate('roomTypeId', 'name type inventoryType')
      .populate('userId', 'name email phone');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: populatedBooking
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
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus !== 'paid') return res.status(400).json({ message: 'Booking not paid' });
    const refundAmount = Math.round((amount || booking.totalAmount) * 100);
    const paymentId = booking.paymentId;
    if (!paymentId) return res.status(400).json({ message: 'Payment ID not found on booking' });
    const refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmount,
      notes: { reason, bookingId: booking._id.toString() }
    });
    booking.paymentStatus = 'refunded';
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    await AvailabilityLedger.deleteMany({
      source: 'platform',
      referenceId: booking._id
    });
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
