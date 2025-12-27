import React, { useState, useEffect, useRef } from 'react';
import {
    Calendar, User, Phone, MessageSquare,
    Clock, CheckCircle, XCircle, MoreVertical,
    MapPin, ChevronRight, Search, Filter
} from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';

// --- Components ---

const BookingCard = ({ booking, index }) => {
    const statusColors = {
        upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
        active: 'bg-green-50 text-green-600 border-green-100',
        completed: 'bg-gray-50 text-gray-500 border-gray-100',
        cancelled: 'bg-red-50 text-red-500 border-red-100',
    };

    const statusLabels = {
        upcoming: 'Confirmed',
        active: 'Checked In',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };

    return (
        <div className="booking-card bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm relative active:scale-[0.98] transition-all">
            {/* Header: ID & Status */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                        ID: {booking.id}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 leading-none">
                        {booking.guestName}
                    </h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusColors[booking.status]}`}>
                    {statusLabels[booking.status]}
                </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 text-sm mb-5">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-black" />
                    <span className="font-medium">{booking.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} className="text-black" />
                    <span className="font-medium">{booking.nights} Nights</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-black" />
                    <span className="font-medium">{booking.guests} Guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} className="text-black" />
                    <span className="font-medium">{booking.roomType}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-dashed border-gray-200">
                {booking.status === 'upcoming' && (
                    <button className="flex-1 bg-black text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                        Check In
                    </button>
                )}
                {booking.status === 'active' && (
                    <button className="flex-1 bg-white border border-gray-200 text-gray-900 h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        Check Out
                    </button>
                )}
                <a href={`tel:${booking.phone}`} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
                    <Phone size={16} />
                </a>
                <button className="w-10 h-10 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

// --- Main Page ---

const PartnerBookings = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const containerRef = useRef(null);

    // Mock Data
    const allBookings = [
        { id: 'BK-8821', guestName: 'Arjun Mehta', dates: '12 Aug - 14 Aug', nights: 2, guests: 2, roomType: 'Deluxe Room', status: 'upcoming', phone: '+919876543210' },
        { id: 'BK-8822', guestName: 'Sarah Smith', dates: '10 Aug - 15 Aug', nights: 5, guests: 1, roomType: 'Suite', status: 'active', phone: '+919876543210' },
        { id: 'BK-8820', guestName: 'Rahul Verma', dates: '05 Aug - 06 Aug', nights: 1, guests: 2, roomType: 'Standard', status: 'completed', phone: '+919876543210' },
        { id: 'BK-8819', guestName: 'Priya Singh', dates: '01 Aug - 03 Aug', nights: 2, guests: 2, roomType: 'Deluxe Room', status: 'cancelled', phone: '+919876543210' },
        { id: 'BK-8823', guestName: 'Amit Kumar', dates: '14 Aug - 16 Aug', nights: 2, guests: 2, roomType: 'Standard', status: 'upcoming', phone: '+919876543210' },
    ];

    // Filter Logic
    const filteredBookings = allBookings.filter(b => b.status === activeTab);

    // Animation Effect
    useEffect(() => {
        if (containerRef.current) {
            const cards = containerRef.current.querySelectorAll('.booking-card');
            gsap.fromTo(cards,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [activeTab]);

    const tabs = [
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'active', label: 'Hosting' },
        { id: 'completed', label: 'Past' },
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
                        className="w-full h-12 bg-white rounded-2xl pl-12 pr-4 text-sm font-medium border border-gray-100 shadow-sm focus:outline-none focus:border-black/20 transition-colors"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors">
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
                                    ? 'bg-black text-white border-black shadow-lg shadow-black/20'
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
                        <BookingCard key={booking.id} booking={booking} index={idx} />
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
