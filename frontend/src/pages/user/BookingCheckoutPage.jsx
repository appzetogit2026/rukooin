import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Users, MapPin, CreditCard,
  ShieldCheck, Lock, ChevronRight, Building, CheckCircle, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingService, paymentService } from '../../services/apiService';

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BookingCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data passed from PropertyDetailsPage
  const {
    property,
    selectedRoom,
    dates,
    guests,
    priceBreakdown,
    taxRate
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    if (!property || !dates) {
      toast.error("Invalid booking details");
      navigate('/');
    }
  }, [property, dates, navigate]);

  if (!property || !dates) return null;

  const handleConfirmBooking = async () => {
    // Check key 'token' instead of full user object to allow proceeding if session is valid
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to continue");
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);

    // Common Payload for both methods
    const payload = {
      propertyId: property._id,
      roomTypeId: selectedRoom._id,
      checkInDate: dates.checkIn,
      checkOutDate: dates.checkOut,
      guests: {
        adults: guests.adults,
        children: guests.children,
        extraAdults: priceBreakdown?.extraAdultsCount || 0,
        extraChildren: priceBreakdown?.extraChildrenCount || 0
      },
      bookingUnit: selectedRoom.inventoryType || 'room',
      couponCode: priceBreakdown?.couponCode || null,
      paymentMethod: paymentMethod === 'online' ? 'razorpay' : 'pay_at_hotel', // 'razorpay' for DB consistency
      paymentStatus: 'pending', // Always pending initially
      totalAmount: priceBreakdown.grandTotal
    };

    try {
      if (paymentMethod === 'pay_at_hotel') {
        // --- PAY AT HOTEL FLOW ---
        console.log("Creating Pay-at-Hotel booking:", payload);
        const response = await bookingService.create(payload);

        if (response.success && response.booking) {
          toast.success("Booking Confirmed!");
          navigate('/booking-confirmation', {
            state: {
              booking: response.booking,
              animate: true
            }
          });
        } else {
          throw new Error(response.message || "Booking failed");
        }

      } else if (paymentMethod === 'online') {
        // --- PAY NOW (RAZORPAY) FLOW ---

        // 1. Load Razorpay SDK
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        // 2. Create Booking (Pending)
        console.log("Creating Pending Booking for Payment:", payload);
        const bookingRes = await bookingService.create(payload);
        if (!bookingRes.success || !bookingRes.booking) {
          throw new Error(bookingRes.message || "Failed to initialize booking");
        }
        const bookingId = bookingRes.booking._id || bookingRes.booking.id;

        // 3. Create Razorpay Order
        const orderRes = await paymentService.createOrder(bookingId);
        if (!orderRes.success) {
          throw new Error("Failed to create payment order");
        }

        const { order, razorpayKeyId } = orderRes;

        // 4. Open Razorpay Checkout
        const options = {
          key: razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: "Rukko Hotels", // Or Property Name
          description: `Booking #${bookingId.substring(0, 8)}`,
          // image: "logo_url_here",
          order_id: order.id,
          handler: async function (response) {
            try {
              // 5. Verify Payment on Success
              const verifyPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingId
              };

              const verifyRes = await paymentService.verifyPayment(verifyPayload);

              if (verifyRes.success) {
                toast.success("Payment Successful!");
                navigate('/booking-confirmation', {
                  state: {
                    booking: verifyRes.booking, // Updated booking from backend
                    animate: true
                  }
                });
              } else {
                toast.error("Payment Verification Failed");
              }

            } catch (err) {
              console.error("Payment Verification Error:", err);
              toast.error("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          notes: {
            bookingId: bookingId
          },
          theme: {
            color: "#000000"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description || "Payment Failed");
        });
        rzp.open();
      }

    } catch (error) {
      console.error("Booking/Payment Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      // Only stop loading if we are NOT waiting for razorpay user action
      // Actually, for Razorpay, the modal opens and we are technically "idle" waiting for user.
      // But we can keep loading true to prevent double clicks until modal opens? 
      // Let's set loading false here, but maybe user can click again? 
      // Better to keep a separate state or just set false. 
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Review & Pay</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* 1. Property Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-xl overflow-hidden shrink-0">
            <img
              src={property.images?.cover || property.coverImage || "https://via.placeholder.com/150"}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{property.propertyType}</span>
            <h2 className="font-bold text-gray-900 leading-tight mb-1">{property.name}</h2>
            <p className="text-xs text-gray-500 mb-2">{property.address?.city || property.address}, {property.address?.state}</p>
            <div className="flex items-center gap-1">
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {property.avgRating || 'New'} ★
              </span>
            </div>
          </div>
        </div>

        {/* 2. Trip Details */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Your Trip</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Dates</p>
              <p className="text-sm font-bold text-gray-800">{priceBreakdown?.nights} Nights</p>
              <p className="text-xs text-gray-600">{dates.checkIn} - {dates.checkOut}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Guests</p>
              <p className="text-sm font-bold text-gray-800">{guests.adults} Adults, {guests.children} Children</p>
              <p className="text-xs text-gray-600">{guests.rooms} Room(s)</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 font-medium mb-1">Room Type</p>
              <p className="text-sm font-bold text-gray-800">{selectedRoom.type || selectedRoom.name}</p>
            </div>
          </div>
        </div>

        {/* 3. Price Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Price Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Base Price ({priceBreakdown?.nights} nights)</span>
              <span>₹{priceBreakdown?.totalBasePrice?.toLocaleString()}</span>
            </div>
            {(priceBreakdown?.totalExtraAdultCharge > 0) && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Extra Adults Charges</span>
                <span>₹{priceBreakdown.totalExtraAdultCharge.toLocaleString()}</span>
              </div>
            )}
            {(priceBreakdown?.totalExtraChildCharge > 0) && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Extra Children Charges</span>
                <span>₹{priceBreakdown.totalExtraChildCharge.toLocaleString()}</span>
              </div>
            )}
            {(priceBreakdown?.discountAmount > 0) && (
              <div className="flex justify-between text-sm text-green-700 font-medium">
                <span className="flex items-center gap-1"><Tag size={12} /> Coupon Discount</span>
                <span>- ₹{priceBreakdown.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxes & Fees ({taxRate || 0}%)</span>
              <span>₹{priceBreakdown?.taxAmount?.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Payable</span>
              <span className="text-xl font-black text-gray-900">₹{priceBreakdown?.grandTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 4. Payment Options */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Payment Method</h3>
          <div className="space-y-3">
            {/* Option 1: Pay at Hotel */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'pay_at_hotel' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input
                type="radio"
                name="payment"
                className="mt-1"
                checked={paymentMethod === 'pay_at_hotel'}
                onChange={() => setPaymentMethod('pay_at_hotel')}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 text-sm">Pay at Hotel</span>
                  <Building size={16} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pay the full amount when you check-in at the property. No upfront payment required.
                </p>
              </div>
            </label>

            {/* Option 2: Pay Now */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input
                type="radio"
                name="payment"
                className="mt-1"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 text-sm">Pay Now</span>
                  <div className="flex gap-2">
                    <CreditCard size={16} className="text-gray-500" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  Secure online payment via UPI, Card, or Netbanking.
                </p>
                {/* Badges */}
                <div className="flex gap-2">
                  <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Fast Checkout</span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Secure</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-gray-900 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                {paymentMethod === 'online' ? 'Pay & Book' : 'Confirm Booking'}
                <ChevronRight size={20} />
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
            <Lock size={10} />
            Your data is secure. By booking, you agree to our Terms.
          </p>
        </div>

      </div>
    </div>
  );
};

export default BookingCheckoutPage;
