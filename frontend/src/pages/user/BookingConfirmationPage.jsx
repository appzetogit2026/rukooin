import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Calendar, Clock, Lock,
    CreditCard, Phone, MessageCircle, HelpCircle,
    ChevronRight, Users, Copy, CheckCircle,
    ShieldCheck, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const BookingConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Success Animation State
    // Success Animation State
    const [showSuccess, setShowSuccess] = useState(location.state?.animate || false);

    // Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [guestName, setGuestName] = useState("Hritik Raghuwanshi"); // Editable state

    useEffect(() => {
        if (showSuccess) {
            // Clear the state so animation doesn't replay on refresh or back
            window.history.replaceState({}, '');

            // Trigger Flower Blast (Confetti)
            const duration = 2000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#ACDCD9', '#004F4D', '#ffffff'] // Theme Colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#ACDCD9', '#004F4D', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            // 2. Blast from center specifically
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ACDCD9', '#004F4D', '#ffffff']
                });
            }, 500);

            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Mock Data (In reality, receive via location.state)
    const booking = {
        id: "BKID882390",
        amount: "998",
        paymentMethod: "Pay at Hotel",
        status: "Confirmed",
        hotel: {
            name: "Super Collection O Ring Road",
            address: "Plot No. 16, 17 & 18, Scheme No. 94, Ring Road, Bhawarkua, Indore, Madhya Pradesh",
            image: "https://images.unsplash.com/photo-1590490360182-c583ca46fd08?w=800&q=80",
            rating: "4.6"
        },
        dates: {
            checkIn: "23 Dec",
            checkOut: "24 Dec",
            checkInDay: "Tue",
            checkOutDay: "Wed",
            nights: 1
        },
        user: {
            name: guestName,
            phone: "+91 98765 43210",
            email: "hritik@example.com"
        },
        guests: {
            rooms: 1,
            adults: 2
        }
    };

    const [whatsappEnabled, setWhatsappEnabled] = useState(true);

    // Handlers
    const handleDirections = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.hotel.address)}`, '_blank');
    };

    const handleCall = () => {
        window.location.href = "tel:+919876543210";
    };

    const handleSupport = () => {
        navigate('/support');
    };

    const handlePayment = () => {
        navigate('/payment');
    };

    return (
        <div className="relative min-h-screen bg-gray-50">
            <AnimatePresence>
                {showSuccess && (
                    <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
                        {/* Top Curtain */}
                        <motion.div
                            initial={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="h-[50vh] w-full bg-surface relative z-20 pointer-events-auto"
                        />

                        {/* Bottom Curtain */}
                        <motion.div
                            initial={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                            className="h-[50vh] w-full bg-surface relative z-20 pointer-events-auto"
                        />

                        {/* Centered Content (Checkmark) */}
                        <motion.div
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-900/50"
                            >
                                <motion.svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#004F4D"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <motion.path
                                        d="M20 6L9 17l-5-5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    />
                                </motion.svg>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <h1 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h1>
                                <p className="text-white/80 text-sm font-medium">Getting your trip ready...</p>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content (Revealed after split) */}
            <div className={`pb-24 transition-all duration-500 ${showEditModal || showCancelModal ? 'brightness-50 scale-[0.98]' : ''}`}>
                {/* 1. Header: Booking Status & Amount */}
                <div className="bg-surface text-white px-5 pt-8 pb-16 relative rounded-b-[30px] shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <button onClick={() => navigate('/bookings')} className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="text-right">
                            <p className="text-xs text-white/70 font-medium">Booking ID</p>
                            <p className="text-sm font-bold tracking-wider">{booking.id}</p>
                        </div>
                    </div>

                    <div className="text-center mb-2 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-3 py-1 rounded-full backdrop-blur-md mb-3">
                            <CheckCircle size={14} className="text-green-400 fill-current" />
                            <span className="text-xs font-bold text-green-100 uppercase tracking-wide">Booking Confirmed</span>
                        </div>
                        <h1 className="text-4xl font-black mb-1">₹{booking.amount}</h1>
                        <p className="text-sm text-white/80 font-medium bg-white/10 px-3 py-1 rounded-lg mb-4">
                            {booking.paymentMethod}
                        </p>

                        <button
                            onClick={handlePayment}
                            className="bg-white text-surface font-black text-sm py-3 px-8 rounded-xl shadow-lg shadow-black/10 active:scale-95 transition-transform flex items-center gap-2 animate-[pulse_3s_infinite]"
                        >
                            <CreditCard size={18} />
                            PAY NOW
                        </button>
                        <p className="text-[10px] text-white/60 mt-2 font-medium">To avoid queue at hotel</p>
                    </div>
                </div>

                <div className="px-5 -mt-10 relative z-10 flex flex-col gap-5">

                    {/* 2. Hotel Info Card */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 border border-white">
                        <div className="flex gap-4 cursor-pointer" onClick={() => navigate('/hotel/1')}>
                            <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <img src={booking.hotel.image} className="w-full h-full object-cover" alt="Hotel" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold text-surface text-sm leading-tight mb-1">{booking.hotel.name}</h2>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{booking.hotel.address}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        {booking.hotel.rating} ★
                                    </span>
                                    <span className="text-[10px] text-gray-400">• Premium Partner</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Action Grid */}
                        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-50">
                            {[
                                { icon: Clock, label: "Check In", color: "text-blue-600", bg: "bg-blue-50", action: () => alert("Check-in starts at 12:00 PM") },
                                { icon: MapPin, label: "Directions", color: "text-green-600", bg: "bg-green-50", action: handleDirections },
                                { icon: Phone, label: "Call Hotel", color: "text-surface", bg: "bg-surface/5", action: handleCall },
                                { icon: HelpCircle, label: "Need Help", color: "text-orange-500", bg: "bg-orange-50", action: handleSupport },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.action}
                                    className="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
                                >
                                    <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-full flex items-center justify-center transition-transform group-active:scale-90`}>
                                        <action.icon size={18} />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 leading-tight text-center">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Booking Details */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">

                        {/* Dates */}
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Check-in</p>
                                <p className="font-bold text-surface text-lg">{booking.dates.checkIn}</p>
                                <p className="text-xs text-gray-500">{booking.dates.checkInDay}, 12:00 PM</p>
                            </div>
                            <div className="flex flex-col items-center px-4">
                                <div className="border-t-2 border-dashed border-gray-200 w-12 mb-1"></div>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {booking.dates.nights} Night
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-medium mb-0.5">Check-out</p>
                                <p className="font-bold text-surface text-lg">{booking.dates.checkOut}</p>
                                <p className="text-xs text-gray-500">{booking.dates.checkOutDay}, 11:00 AM</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-50"></div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-1 gap-4">

                            {/* Reserved For */}
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reserved For</p>
                                        <p className="text-sm font-bold text-surface">{booking.user.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Rooms & Guests */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Occupancy</p>
                                        <p className="text-sm font-bold text-surface">{booking.guests.rooms} Room, {booking.guests.adults} Guests</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Contact Information</p>
                                    <p className="text-xs font-bold text-surface">{booking.user.phone}</p>
                                    <p className="text-xs text-gray-500">{booking.user.email}</p>
                                </div>
                                <button onClick={() => setShowEditModal(true)} className="text-xs font-bold text-accent">Edit</button>
                            </div>
                        </div>
                    </div>

                    {/* 5. WhatsApp Update */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-200">
                                <MessageCircle size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-surface">Get updates on WhatsApp</h3>
                                <p className="text-[10px] text-gray-500">Booking details, maps & directions</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${whatsappEnabled ? 'bg-[#25D366]' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${whatsappEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                    </div>

                    {/* 6. Rules & Policies */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Important Information</h3>

                        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <div className="p-4 border-b border-gray-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} className="text-orange-500" />
                                    <h4 className="text-sm font-bold text-surface">Rules & Restrictions</h4>
                                </div>
                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 pl-1">
                                    <li>Couples are welcome</li>
                                    <li>Guests can check in using any local or outstation ID proof (PAN Card not accepted).</li>
                                    <li>This hotel is serviced under the trade name of Rukko Stay.</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-gray-50/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={16} className="text-surface" />
                                    <h4 className="text-sm font-bold text-surface">Cancellation Policy</h4>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Free cancellation until <span className="font-bold text-surface">23 Dec, 11:00 AM</span>.
                                    After that, the cancellation fee will be ₹998.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 7. Manage Booking Buttons */}
                    <div className="space-y-3 pb-8">
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="w-full bg-white border border-gray-200 text-surface font-bold py-3.5 rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Users size={16} />
                            Modify Guest Name
                        </button>

                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="w-full bg-red-50 text-red-600 font-bold py-3.5 rounded-xl text-sm active:scale-[0.98] transition-all hover:bg-red-100 flex items-center justify-center gap-2"
                        >
                            Cancel Booking
                        </button>
                    </div>

                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* EDIT GUEST MODAL */}
                {showEditModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.5 }}
                            onDragEnd={(e, info) => {
                                if (info.offset.y > 100) {
                                    setShowEditModal(false);
                                }
                            }}
                            className="bg-white w-full max-w-md rounded-t-[30px] p-6 relative z-10 pointer-events-auto shadow-2xl cursor-grab active:cursor-grabbing"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 hover:bg-gray-400 transition-colors" />
                            <h3 className="text-lg font-bold text-surface mb-2">Edit Guest Details</h3>
                            <p className="text-xs text-gray-500 mb-6">Update the primary guest name for this booking.</p>

                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Guest Name</label>
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-surface focus:outline-none focus:border-surface focus:ring-1 focus:ring-surface transition-all"
                                />
                            </div>

                            <button
                                onClick={() => setShowEditModal(false)}
                                className="w-full bg-surface text-white font-bold py-3.5 rounded-xl shadow-lg shadow-surface/30 active:scale-95 transition-transform"
                            >
                                Save Changes
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* CANCEL BOOKING MODAL */}
                {showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0, bottom: 0.5 }}
                            onDragEnd={(e, info) => {
                                if (info.offset.y > 100) {
                                    setShowCancelModal(false);
                                }
                            }}
                            className="bg-white w-full max-w-md rounded-t-[30px] p-6 relative z-10 pointer-events-auto shadow-2xl cursor-grab active:cursor-grabbing"
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 hover:bg-gray-400 transition-colors" />
                            <div className="flex items-center gap-3 mb-2 text-red-600">
                                <AlertTriangle size={24} />
                                <h3 className="text-lg font-bold">Cancel Booking?</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Are you sure you want to cancel? This action cannot be undone.
                                <br /><span className="text-xs text-gray-400 mt-1 block">Cancellation fee: ₹998 may apply after 11:00 AM.</span>
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 bg-gray-100 text-surface font-bold py-3.5 rounded-xl active:scale-95 transition-transform"
                                >
                                    Don't Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        navigate('/');
                                    }}
                                    className="flex-1 bg-red-50 text-red-600 border border-red-100 font-bold py-3.5 rounded-xl active:scale-95 transition-transform"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookingConfirmationPage;
