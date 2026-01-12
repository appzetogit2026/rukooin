import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Clock, Users, ChevronRight,
    Star, Phone, MessageCircle, MoreHorizontal,
    CheckCircle, XCircle, AlertCircle, Ticket
} from 'lucide-react';
import { bookingService } from '../../services/apiService';

const BookingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [bookings, setBookings] = useState({ upcoming: [], completed: [], cancelled: [] });
    const [loading, setLoading] = useState(true);

    // Fetch Bookings
    React.useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getMyBookings();

                // Categorize bookings
                const categorized = {
                    upcoming: [],
                    completed: [],
                    cancelled: []
                };

                data.forEach(booking => {
                    const status = booking.status.toLowerCase();
                    if (status === 'confirmed' || status === 'pending') {
                        categorized.upcoming.push(booking);
                    } else if (status === 'completed') {
                        categorized.completed.push(booking);
                    } else if (status === 'cancelled') {
                        categorized.cancelled.push(booking);
                    }
                });

                setBookings(categorized);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const currentBookings = bookings[activeTab] || [];

    const getStatusBadge = (status, paymentStatus) => {
        if (status === 'confirmed') {
            if (paymentStatus === 'paid') {
                return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Paid</span>;
            }
            return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><AlertCircle size={10} /> Pay at Hotel</span>;
        }
        if (status === 'completed') {
            return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Completed</span>;
        }
        if (status === 'cancelled') {
            return <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><XCircle size={10} /> Cancelled</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-surface text-white px-5 pt-10 pb-6">
                <h1 className="text-2xl font-black mb-1">My Bookings</h1>
                <p className="text-sm text-white/70">Manage your stays and trips</p>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
                <div className="flex">
                    {[
                        { id: 'upcoming', label: 'Upcoming', count: bookings.upcoming.length },
                        { id: 'completed', label: 'Completed', count: bookings.completed.length },
                        { id: 'cancelled', label: 'Cancelled', count: bookings.cancelled.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-4 text-sm font-bold relative transition-colors ${activeTab === tab.id ? 'text-surface' : 'text-gray-400'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-surface text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeBookingTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-5 py-6 pb-32">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-8 h-8 border-4 border-surface border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : currentBookings.length === 0 ? (
                        // Empty State
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Ticket size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-surface mb-2">No {activeTab} bookings</h3>
                            <p className="text-sm text-gray-500 text-center max-w-[280px] mb-6">
                                {activeTab === 'upcoming' && "Your upcoming trips will appear here once you make a booking."}
                                {activeTab === 'completed' && "Completed stays will be shown here after checkout."}
                                {activeTab === 'cancelled' && "Any cancelled bookings will appear here."}
                            </p>
                            {activeTab !== 'cancelled' && (
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="bg-surface text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-surface/30 active:scale-95 transition-transform"
                                >
                                    Explore Hotels
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        // Bookings List
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {currentBookings.map((booking, index) => {
                                // Map backend data to UI format
                                const hotel = booking.hotelId || {};
                                const price = booking.totalAmount || 0;
                                const checkIn = new Date(booking.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                const checkOut = new Date(booking.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                                return (
                                    <motion.div
                                        key={booking._id || booking.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => navigate('/booking-confirmation', { state: { booking: booking } })}
                                        className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
                                    >
                                        {/* Top Section */}
                                        <div className="flex">
                                            {/* Hotel Image */}
                                            <div className="w-28 h-32 bg-gray-200 shrink-0 relative">
                                                <img
                                                    src={hotel.images?.[0] || 'https://via.placeholder.com/150'}
                                                    alt={hotel.name || 'Hotel'}
                                                    className={`w-full h-full object-cover ${activeTab === 'cancelled' ? 'grayscale' : ''}`}
                                                />
                                                {/* Rating Badge */}
                                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                    <Star size={8} fill="currentColor" /> {hotel.rating || 4.5}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 p-4">
                                                {/* Status & ID */}
                                                <div className="flex justify-between items-start mb-2">
                                                    {getStatusBadge(booking.status, booking.paymentStatus)}
                                                    <span className="text-[10px] text-gray-400 font-medium">#{booking.bookingId}</span>
                                                </div>

                                                {/* Hotel Name */}
                                                <h3 className="font-bold text-surface text-sm leading-tight mb-1 line-clamp-1">
                                                    {hotel.name || 'Unknown Hotel'}
                                                </h3>

                                                {/* Location */}
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                                                    <MapPin size={10} /> {hotel.address?.city || hotel.location || 'Location'}
                                                </p>

                                                {/* Dates */}
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="bg-gray-50 px-2 py-1 rounded-lg font-medium text-surface">
                                                        {checkIn}
                                                    </div>
                                                    <span className="text-gray-300">→</span>
                                                    <div className="bg-gray-50 px-2 py-1 rounded-lg font-medium text-surface">
                                                        {checkOut}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Section */}
                                        <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-medium">Total Amount</p>
                                                <p className="text-lg font-black text-surface">₹{price}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Action Buttons */}
                                                {activeTab === 'upcoming' && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); window.location.href = 'tel:+919876543210'; }}
                                                            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-surface hover:bg-gray-50"
                                                        >
                                                            <Phone size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                            className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg shadow-green-300"
                                                        >
                                                            <MessageCircle size={16} fill="currentColor" />
                                                        </button>
                                                    </>
                                                )}

                                                {activeTab === 'completed' && booking.canReview && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); }}
                                                        className="bg-accent text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-accent/30"
                                                    >
                                                        Rate Stay
                                                    </button>
                                                )}

                                                {activeTab === 'cancelled' && (
                                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                                                        Refund {booking.refundStatus || 'N/A'}
                                                    </span>
                                                )}

                                                <ChevronRight size={20} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Action FAB for Upcoming */}
            {activeTab === 'upcoming' && currentBookings.length > 0 && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-24 right-5 z-30"
                >
                    <button className="w-14 h-14 bg-surface text-white rounded-full shadow-2xl shadow-surface/50 flex items-center justify-center active:scale-90 transition-transform">
                        <MoreHorizontal size={24} />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default BookingsPage;
