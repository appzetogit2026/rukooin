import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, User, Phone, Mail, MapPin,
  CreditCard, CheckCircle, XCircle, Clock,
  ChevronLeft, AlertTriangle
} from 'lucide-react';
import { bookingService } from '../../../services/apiService';
import toast from 'react-hot-toast';

const PartnerBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getPartnerBookingDetail(id);
      setBooking(data);
    } catch (error) {
      toast.error("Failed to load booking details");
      navigate('/hotel/bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!window.confirm("Confirm: Guest has paid the full amount at the hotel?")) return;
    try {
      await bookingService.markAsPaid(id);
      toast.success("Marked as Paid Successfully");
      fetchBooking(); // Refresh
    } catch (error) {
      toast.error(error.message || "Action Failed");
    }
  };

  const handleNoShow = async () => {
    if (!window.confirm("Confirm: Guest did NOT arrive? This will cancel the booking and release inventory.")) return;
    try {
      await bookingService.markNoShow(id);
      toast.success("Marked as No Show");
      fetchBooking();
    } catch (error) {
      toast.error(error.message || "Action Failed");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  if (!booking) return null;

  const user = booking.userId || {};
  const property = booking.propertyId || {};
  const room = booking.roomTypeId || {};

  const isPayAtHotel = booking.paymentStatus !== 'paid';
  const canMarkPaid = isPayAtHotel && ['confirmed', 'pending', 'checked_in'].includes(booking.bookingStatus);
  const canMarkNoShow = ['confirmed', 'pending'].includes(booking.bookingStatus); // Usually valid if date is passed or today, but logic can be loose for partner manual control

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/hotel/bookings')} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">Booking Details</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking ID</span>
            <p className="text-xl font-black text-gray-900">#{booking.bookingId || booking._id.slice(-6).toUpperCase()}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${booking.bookingStatus === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
              booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                booking.bookingStatus === 'no_show' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-100'
            }`}>
            {booking.bookingStatus.replace('_', ' ')}
          </div>
        </div>

        {/* Guest Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-gray-400" /> Guest Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-lg text-gray-500">
                {user.name?.[0] || 'G'}
              </div>
              <div>
                <p className="font-bold text-gray-900">{user.name || 'Guest'}</p>
                <p className="text-sm text-gray-500">Joined via App</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <a href={`tel:${user.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <Phone size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                  <p className="font-semibold text-gray-900">{user.phone || 'N/A'}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                  <p className="font-semibold text-gray-900 truncate max-w-[150px]">{user.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" /> Stay Details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Check-in</p>
              <p className="font-bold text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Check-out</p>
              <p className="font-bold text-gray-900">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl mb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Room Type</p>
            <p className="font-bold text-gray-900">{room.name || room.type || 'Standard Room'}</p>
            <p className="text-xs text-gray-500 mt-1">{booking.bookingUnit} • {booking.totalNights} Night(s)</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-gray-400" /> Payment & Payout
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Amount (Collect from Guest)</span>
              <span className="font-bold text-gray-900 text-lg">₹{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Partner Payout (Earnings)</span>
              <span className="font-bold text-green-700">₹{booking.partnerPayout}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {booking.paymentStatus === 'paid' ? 'PAID' : 'PAY AT HOTEL'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {canMarkPaid && (
            <button
              onClick={handleMarkPaid}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} /> Mark Payment Received
            </button>
          )}

          {canMarkNoShow && (
            <button
              onClick={handleNoShow}
              className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <AlertTriangle size={20} /> Mark as No Show
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PartnerBookingDetail;
