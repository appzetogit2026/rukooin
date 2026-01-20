import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentConfig from '../config/payment.config.js';
import Booking from '../models/Booking.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Offer from '../models/Offer.js';
import Property from '../models/Property.js';

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
        create: () => Promise.reject(new Error("Razorpay Not Initialized")),
        fetch: () => Promise.reject(new Error("Razorpay Not Initialized"))
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
      error: error.error?.description || error.message
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

    // 1. Verify Signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', PaymentConfig.razorpayKeySecret)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    let booking;

    if (bookingId) {
      // --- LEGACY FLOW (Pre-Existing Booking) ---
      booking = await Booking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      booking.paymentId = razorpay_payment_id;
      booking.paymentMethod = 'razorpay';
      await booking.save();

    } else {
      // --- NEW FLOW (Deferred Creation) ---
      // Fetch Order to retrieve Notes containing booking details
      const order = await razorpay.orders.fetch(razorpay_order_id);
      if (!order || !order.notes || order.notes.type !== 'booking_init') {
        // Fallback: If notes missing, we can't create booking properly.
        // But we have payment. This is a critical edge case.
        return res.status(400).json({ message: 'Order context missing. Cannot create booking.' });
      }

      const notes = order.notes;

      // Fetch Booking Property to get Type
      const property = await Property.findById(notes.propertyId).select('propertyType');
      const propertyType = property ? property.propertyType : 'Hotel';

      const newBookingId = 'BK' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

      booking = await Booking.create({
        userId: notes.userId,
        bookingId: newBookingId,
        propertyId: notes.propertyId,
        propertyType: propertyType,
        roomTypeId: notes.roomTypeId,
        bookingUnit: notes.bookingUnit,
        checkInDate: notes.checkInDate,
        checkOutDate: notes.checkOutDate,
        totalNights: Number(notes.totalNights),
        guests: JSON.parse(notes.guests),
        pricePerNight: Number(notes.pricePerNight),
        baseAmount: Number(notes.baseAmount),
        extraCharges: Number(notes.extraCharges),
        taxes: Number(notes.taxes),
        discount: Number(notes.discount),
        couponCode: notes.couponCode || null,
        adminCommission: Number(notes.adminCommission),
        partnerPayout: Number(notes.partnerPayout),
        totalAmount: Number(notes.totalAmount),
        paymentStatus: 'paid', // Immediately Paid
        bookingStatus: 'confirmed',
        paymentMethod: 'razorpay',
        paymentId: razorpay_payment_id
      });

      // Create Ledger
      await AvailabilityLedger.create({
        propertyId: notes.propertyId,
        roomTypeId: notes.roomTypeId,
        inventoryType: notes.bookingUnit,
        source: 'platform',
        referenceId: booking._id,
        startDate: new Date(notes.checkInDate),
        endDate: new Date(notes.checkOutDate),
        units: 1,
        createdBy: 'system'
      });

      // Increment Offer Usage
      if (notes.couponCode) {
        await Offer.findOneAndUpdate({ code: notes.couponCode }, { $inc: { usageCount: 1 } });
      }
    }

    // --- PARTNER WALLET CREDIT LOGIC (Common) ---
    try {
      const fullBooking = await Booking.findById(booking._id).populate('propertyId');
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
          partnerWallet.balance += payout;
          partnerWallet.totalEarnings += payout;
          await partnerWallet.save();

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
    } catch (err) { console.error("Wallet Credit Failed", err); }

    // --- ADMIN WALLET CREDIT LOGIC ---
    try {
      const commission = booking.adminCommission || 0;
      const taxes = booking.taxes || 0;
      const totalAdminCredit = commission + taxes;

      if (totalAdminCredit > 0) {
        const AdminUser = mongoose.model('User');
        // Find *any* admin to associate the system wallet with (since Wallet requires a partnerId/userId)
        // In a real system, you'd have a specific "System User" or "Super Admin".
        const adminUser = await AdminUser.findOne({ role: { $in: ['admin', 'superadmin'] } }).sort({ createdAt: 1 });

        if (adminUser) {
          let adminWallet = await Wallet.findOne({ role: 'admin' });

          if (!adminWallet) {
            adminWallet = await Wallet.create({
              partnerId: adminUser._id,
              role: 'admin',
              balance: 0
            });
          }

          // Credit the wallet (Commission + Tax)
          adminWallet.balance += totalAdminCredit;
          // Note: totalEarnings usually tracks revenue. We'll add both here as per request 
          // (assuming Admin handles tax remittance).
          adminWallet.totalEarnings += totalAdminCredit;
          await adminWallet.save();

          // Log Transaction
          await Transaction.create({
            walletId: adminWallet._id,
            partnerId: adminUser._id,
            type: 'credit',
            category: 'commission_tax', // Updated category
            amount: totalAdminCredit,
            balanceAfter: adminWallet.balance,
            description: `Commission (₹${commission}) & Tax (₹${taxes}) for Booking #${booking.bookingId}`,
            reference: booking.bookingId,
            status: 'completed',
            metadata: { bookingId: booking._id.toString() }
          });
          console.log(`[Payment] Credited ₹${totalAdminCredit} (Comm: ${commission}, Tax: ${taxes}) to Admin Wallet`);
        } else {
          console.warn("⚠️ No Admin user found. Cannot credit commission/tax.");
        }
      }
    } catch (err) { console.error("Admin Wallet Credit Failed", err); }

    // Return full populated booking for confirmation page
    const populatedBooking = await Booking.findById(booking._id)
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
