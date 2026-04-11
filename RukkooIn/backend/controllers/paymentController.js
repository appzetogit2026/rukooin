import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentConfig from '../config/payment.config.js';
import Booking from '../models/Booking.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Offer from '../models/Offer.js';
import Property from '../models/Property.js';
import mongoose from 'mongoose';
import emailService from '../services/emailService.js';
import notificationService from '../services/notificationService.js';
import smsService from '../utils/smsService.js';
import whatsappService from '../utils/whatsappService.js';
import referralService from '../services/referralService.js';

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

      const order = await razorpay.orders.fetch(razorpay_order_id);
      const notes = order?.notes || {};

      if (booking.paymentMethod === 'prepaid') {
        booking.paymentStatus = 'partial';
        booking.amountPaid = Number(notes.advanceAmount) || Math.floor(booking.totalAmount * 0.3);
        booking.remainingAmount = Number(notes.remainingAmount) || (booking.totalAmount - booking.amountPaid);
      } else {
        booking.paymentStatus = 'paid';
        booking.paymentMethod = notes.paymentMethod || 'razorpay';
        booking.amountPaid = booking.totalAmount;
        booking.remainingAmount = 0;
      }
      
      booking.bookingStatus = 'confirmed';
      booking.paymentId = razorpay_payment_id;
      booking.razorpayOrderId = razorpay_order_id;
      await booking.save();
      
      await finalizePaymentAndUpdateBooking(booking, notes);

    } else {
      // --- NEW FLOW (Deferred Creation) ---
      const order = await razorpay.orders.fetch(razorpay_order_id);
      if (!order || !order.notes || order.notes.type !== 'booking_init') {
        return res.status(400).json({ message: 'Order context missing. Cannot create booking.' });
      }

      const notes = order.notes;
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
        prepaidDiscount: Number(notes.prepaidDiscountAmount) || 0,
        amountPaid: Number(notes.advanceAmount) || Number(notes.totalAmount),
        remainingAmount: Number(notes.remainingAmount) || (Number(notes.totalAmount) - (Number(notes.amountPaid) || 0)) || 0,
        paymentStatus: notes.paymentMethod === 'prepaid' ? 'partial' : 'paid',
        bookingStatus: 'confirmed',
        paymentMethod: notes.paymentMethod || 'online',
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id
      });

      const walletUsedAmount = Number(notes.walletUsedAmount) || 0;
      if (walletUsedAmount > 0) {
        const userWallet = await Wallet.findOne({ partnerId: notes.userId, role: 'user' });
        if (userWallet) {
          await userWallet.debit(walletUsedAmount, `Partial Wallet Payment for Booking #${newBookingId}`, newBookingId, 'booking_payment');
        }
      }

      if (notes.couponCode) {
        await Offer.findOneAndUpdate({ code: notes.couponCode }, { $inc: { usageCount: 1 } });
      }

      await finalizePaymentAndUpdateBooking(booking, notes);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: await Booking.findById(booking._id).populate({ path: 'propertyId', populate: { path: 'partnerId', select: 'phone' } }).populate('roomTypeId').populate('userId', 'name email phone')
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

/**
 * Helper: Finalize Settlement and Notifications after payment
 */
const finalizePaymentAndUpdateBooking = async (booking, notesFromOrder) => {
  try {
    const notes = notesFromOrder || {};
    const fullBookingForSettlement = await Booking.findById(booking._id).populate('propertyId');
    
    const paymentMeta = {};
    if (notes && notes.type === 'booking_init') {
      paymentMeta.partnerPayout = Number(notes.partnerPayout);
      paymentMeta.adminCommission = Number(notes.adminCommission);
      paymentMeta.taxes = Number(notes.taxes);
      paymentMeta.advanceAmount = Number(notes.advanceAmount);
    } else {
      paymentMeta.partnerPayout = fullBookingForSettlement.partnerPayout;
      paymentMeta.adminCommission = fullBookingForSettlement.adminCommission;
      paymentMeta.taxes = fullBookingForSettlement.taxes;
      paymentMeta.advanceAmount = fullBookingForSettlement.amountPaid;
    }

    const partnerId = fullBookingForSettlement.propertyId?.partnerId;
    const commission = paymentMeta.adminCommission || 0;
    const taxes = paymentMeta.taxes || 0;
    const totalAdminCredit = commission + taxes;

    if (partnerId) {
      let partnerWallet = await Wallet.findOne({ partnerId: partnerId, role: 'partner' });
      if (!partnerWallet) {
        partnerWallet = await Wallet.create({ partnerId: partnerId, role: 'partner', balance: 0 });
      }
      
      if (fullBookingForSettlement.paymentMethod === 'prepaid') {
        const advanceAmount = paymentMeta.advanceAmount || 0;
        const partnerShareOfAdvance = advanceAmount - totalAdminCredit;
        if (partnerShareOfAdvance > 0) {
          await partnerWallet.credit(partnerShareOfAdvance, `Advance Payment for Booking #${fullBookingForSettlement.bookingId}`, fullBookingForSettlement.bookingId, 'booking_payment');
        } else if (partnerShareOfAdvance < 0) {
          await partnerWallet.debit(Math.abs(partnerShareOfAdvance), `Commission Shortfall for Prepaid Booking #${fullBookingForSettlement.bookingId}`, fullBookingForSettlement.bookingId, 'commission_deduction');
        }
      } else {
        const taxableAmount = (paymentMeta.partnerPayout || 0) + (paymentMeta.adminCommission || 0);
        if (taxableAmount > 0) {
          await partnerWallet.credit(taxableAmount, `Payment for Booking #${fullBookingForSettlement.bookingId}`, fullBookingForSettlement.bookingId, 'booking_payment');
          if (commission > 0) {
            await partnerWallet.debit(commission, `Platform Commission for Booking #${fullBookingForSettlement.bookingId}`, fullBookingForSettlement.bookingId, 'commission_deduction');
          }
        }
      }
    }

    if (totalAdminCredit > 0) {
      const AdminUser = mongoose.model('User');
      const adminUser = await AdminUser.findOne({ role: { $in: ['admin', 'superadmin'] } }).sort({ createdAt: 1 });
      if (adminUser) {
        let adminWallet = await Wallet.findOne({ role: 'admin' });
        if (!adminWallet) {
          adminWallet = await Wallet.create({ partnerId: adminUser._id, role: 'admin', balance: 0 });
        }
        await adminWallet.credit(totalAdminCredit, `Commission (₹${commission}) & Tax (₹${taxes}) for Booking #${fullBookingForSettlement.bookingId}`, fullBookingForSettlement.bookingId, 'commission_tax');
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: 'propertyId', populate: { path: 'partnerId', select: 'phone' } })
      .populate('roomTypeId')
      .populate('userId', 'name email phone');

    const user = populatedBooking.userId;
    const property = populatedBooking.propertyId;

    if (user && user.email) {
      emailService.sendBookingConfirmationEmail(user, populatedBooking).catch(err => console.error('Email trigger failed:', err));
    }
    if (user) {
      notificationService.sendToUser(user._id, {
        title: 'Booking Confirmed!',
        body: `You are going to ${property?.propertyName || 'Hotel'}.`
      }, { type: 'booking', bookingId: populatedBooking._id }, 'user').catch(err => console.error('User Push failed:', err));
    }
    if (populatedBooking.bookingStatus === 'confirmed') {
      whatsappService.sendBookingConfirmation(populatedBooking).catch(err => console.error('WhatsApp trigger failed:', err));
    }

    if (property && property.partnerId) {
      notificationService.sendToPartner(property.partnerId, {
        title: 'Payment Confirmed',
        body: `Payment for Booking #${populatedBooking.bookingId} received.`
      }, { type: 'payment_confirmed', bookingId: populatedBooking._id }).catch(err => console.error('Partner Push failed:', err));

      const PartnerModel = mongoose.model('Partner');
      const partnerUser = await PartnerModel.findById(property.partnerId);
      if (partnerUser) {
        if (partnerUser.phone) {
          smsService.sendSMS(partnerUser.phone, `Payment Received! Booking #${populatedBooking.bookingId} payment confirmed.`).catch(err => console.error('Partner SMS failed:', err));
        }
        if (partnerUser.email) {
          emailService.sendPartnerBookingStatusUpdateEmail(partnerUser, populatedBooking, 'Payment Received Online').catch(e => console.error(e));
        }
      }
    }

    if (populatedBooking.userId) {
      const uId = populatedBooking.userId._id || populatedBooking.userId;
      referralService.processBookingCompletion(uId, populatedBooking._id).catch(e => console.error('Referral Trigger Error:', e));
    }

    return true;
  } catch (error) {
    console.error("Finalize Payment Logic Failed:", error);
    throw error;
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
    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;
    console.log(`📨 Webhook received: ${event}`);

    switch (event) {
      case 'order.paid':
        const orderId = payload.order.entity.id;
        const booking = await Booking.findOne({ razorpayOrderId: orderId });
        if (booking && booking.paymentStatus !== 'paid') {
           const fullOrder = await razorpay.orders.fetch(orderId);
           booking.paymentStatus = (fullOrder.notes?.paymentMethod === 'prepaid') ? 'partial' : 'paid';
           booking.paymentMethod = fullOrder.notes?.paymentMethod || 'online';
           booking.bookingStatus = 'confirmed';
           booking.paymentId = payload.payment?.entity?.id || booking.paymentId; 
           await booking.save();
           await finalizePaymentAndUpdateBooking(booking, fullOrder.notes);
           console.log(`[Webhook] Automatically confirmed Booking #${booking.bookingId}`);
        }
        break;
      case 'payment.captured':
        console.log('Payment captured:', payload.payment.entity.id);
        break;
      case 'payment.failed':
        console.log('Payment failed:', payload.payment.entity.id);
        break;
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

/**
 * @desc    Get payment details
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment details' });
  }
};

/**
 * @desc    Process refund
 */
export const processRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus !== 'paid') return res.status(400).json({ message: 'Booking not paid' });
    
    const refund = await razorpay.payments.refund(booking.paymentId, {
      amount: Math.round((amount || booking.totalAmount) * 100),
      notes: { reason, bookingId: booking._id.toString() }
    });
    
    booking.paymentStatus = 'refunded';
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();
    
    await AvailabilityLedger.deleteMany({ source: 'platform', referenceId: booking._id });
    res.json({ success: true, message: 'Refund processed successfully', refund });
  } catch (error) {
    res.status(500).json({ message: 'Refund processing failed', error: error.message });
  }
};
