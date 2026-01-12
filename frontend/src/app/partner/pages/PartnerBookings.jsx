import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar, User, Phone, MessageSquare,
    Clock, CheckCircle, XCircle, MoreVertical,
    MapPin, ChevronRight, Search, Filter
} from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';
import { bookingService } from '../../../services/apiService';

// --- Components ---

const BookingCard = ({ booking, index }) => {
    const statusColors = {
        pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
        completed: 'bg-green-50 text-green-600 border-green-100',
        cancelled: 'bg-red-50 text-red-500 border-red-100',
    };

    const statusLabels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    // Helper to format dates
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    // Calculate nights
    const calculateNights = (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    };

    const guestName = booking.userId?.name || 'Guest';
    const checkInDate = formatDate(booking.checkIn);
    const checkOutDate = formatDate(booking.checkOut);
    const nights = calculateNights(booking.checkIn, booking.checkOut);
    const guestCount = booking.guests?.adults + (booking.guests?.children || 0);
    const roomsCount = booking.guests?.rooms || 1;
    const hotelName = booking.hotelId?.name || 'Hotel';

    return (
        <div className="booking-card bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm relative active:scale-[0.98] transition-all">
            {/* Header: ID & Status */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        ID: {booking.bookingId}
                    </span>
                    <h3 className="text-lg font-black text-[#003836] leading-none">
                        {guestName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{hotelName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-[#004F4D]" />
                    <span className="font-medium">{checkInDate} - {checkOutDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} className="text-[#004F4D]" />
                    <span className="font-medium">{nights} Night{nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-[#004F4D]" />
                    <span className="font-medium">{guestCount} Guest{guestCount > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-[#004F4D]" />
                    <span className="font-medium">{roomsCount} Room{roomsCount > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 col-span-2 mt-1 pt-3 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Earning</span>
                    <span className="font-black text-[#004F4D] text-lg ml-auto">₹{booking.partnerEarning || 0}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-dashed border-gray-200">
                {booking.status === 'confirmed' && (
                    <button className="flex-1 bg-[#004F4D] text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                        View Details
                    </button>
                )}
                {booking.userId?.phone && (
                    <a href={`tel:${booking.userId.phone}`} className="w-10 h-10 rounded-xl bg-gray-50 text-[#003836] flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
                        <Phone size={16} />
                    </a>
                )}
                <button className="w-10 h-10 rounded-xl bg-gray-50 text-[#003836] flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

// --- Main Page ---

const PartnerBookings = () => {
    const [activeTab, setActiveTab] = useState('confirmed');
    const [allBookings, setAllBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    // Fetch bookings from API
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await bookingService.getPartnerBookings();
                console.log('Partner Bookings:', data);
                setAllBookings(data);
            } catch (error) {
                console.error('Failed to fetch partner bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Filter Logic
    const filteredBookings = allBookings.filter(b => {
        if (activeTab === 'all') return true;
        return b.status === activeTab;
    });

    // Animation Effect
    useEffect(() => {
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll('.booking-card');
            gsap.fromTo(cards,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [activeTab, filteredBookings.length]);

    const tabs = [
        { id: 'confirmed', label: 'Upcoming' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Bookings" subtitle="Manage reservations" />

            {/* Quick Actions / Search (Placeholder for future) */}
            <div className="px-4 py-2">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search guest name or ID..."
                        className="w-full h-12 bg-white rounded-2xl pl-12 pr-4 text-sm font-medium border border-gray-100 shadow-sm focus:outline-none focus:border-[#004F4D]/20 transition-colors"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#004F4D] hover:bg-gray-100 transition-colors">
                        <Filter size={16} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-[73px] z-30 bg-gray-50/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100 overflow-x-auto no-scrollbar mb-4">
                <div className="flex gap-2 min-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeTab === tab.id
                                ? 'bg-[#004F4D] text-white border-[#004F4D] shadow-lg shadow-[#004F4D]/20'
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <main ref={containerRef} className="max-w-3xl mx-auto px-4">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, idx) => (
                        <BookingCard key={booking._id || booking.id || idx} booking={booking} index={idx} />
                    ))
                ) : (
                    <div className="text-center py-16 opacity-50">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 grayscale">
                            <Calendar size={32} className="text-white" />
                        </div>
                        <p className="font-bold text-gray-400">No {activeTab} bookings</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PartnerBookings;
