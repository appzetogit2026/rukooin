import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, Star, MapPin,
    Wifi, Coffee, Car, Shield, ChevronRight, Users, Utensils,
    Calendar, UserCheck, TicketPercent, CheckCircle, Info, ThumbsUp, BedDouble, X, Sparkles, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { hotelService, userService, bookingService, offerService } from '../../services/apiService';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState({});
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const imageContainerRef = useRef(null);

    // Initial check if hotel is saved (requires fetching profile or passing prop)
    useEffect(() => {
        const checkSavedStatus = async () => {
            try {
                // Ideally this should be checked against user profile
                // For now, we rely on local state or simple check if we had user object
                const user = JSON.parse(localStorage.getItem('user'));
                if (user && user.savedHotels && user.savedHotels.includes(id)) {
                    setIsSaved(true);
                }
            } catch (e) {
                console.error(e);
            }
        };
        checkSavedStatus();
    }, [id]);

    const handleToggleSave = async () => {
        try {
            await userService.toggleSavedHotel(id);
            setIsSaved(!isSaved);
            showSaveToast(!isSaved);

            // Update local user object to reflect change immediately (optional)
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                if (!isSaved) {
                    user.savedHotels = [...(user.savedHotels || []), id];
                } else {
                    user.savedHotels = (user.savedHotels || []).filter(hid => hid !== id);
                }
                localStorage.setItem('user', JSON.stringify(user));
            }

        } catch (err) {
            console.error(err);
            // If error is 401, maybe redirect to login or show toast
            if (err.message && err.message.includes('token')) {
                // simple alert for now
                alert("Please login to save hotels");
            }
        }
    };

    // Reset scroll on ID change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleImageScroll = () => {
        if (imageContainerRef.current) {
            const scrollLeft = imageContainerRef.current.scrollLeft;
            const width = imageContainerRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setCurrentImgIndex(index);
        }
    };

    // Scroll Spy State
    const [activeTab, setActiveTab] = useState('Overview');
    const [showStickyHeader, setShowStickyHeader] = useState(false);

    // Refs for scrolling to sections
    const overviewRef = useRef(null);
    const offersRef = useRef(null);
    const bookingRef = useRef(null);
    const ratingRef = useRef(null);
    const amenitiesRef = useRef(null);
    const nearbyRef = useRef(null);
    const pricingRef = useRef(null);

    // Placeholder Image
    const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80";

    const MOCK_REVIEWS = [
        { id: 1, user: "Rahul Sharma", rating: 5, comment: "Amazing stay! The staff was incredibly helpful and the rooms were spotless.", date: "2 days ago" },
        { id: 2, user: "Priya V.", rating: 4, comment: "Great location and very comfortable beds. Highly recommend for business trips.", date: "1 week ago" },
        { id: 3, user: "Amit K.", rating: 4, comment: "Value for money. The breakfast spread was impressive.", date: "2 weeks ago" }
    ];

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [bookingData, setBookingData] = useState({
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        guests: 1,
        rooms: 1,
        userName: JSON.parse(localStorage.getItem('user'))?.name || 'Guest User'
    });

    const [isBooking, setIsBooking] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [activeOffers, setActiveOffers] = useState([]);
    const [showOffersModal, setShowOffersModal] = useState(false);

    // Derived Data based on selection (Moved up to fix ReferenceError)
    const selectedRoom = hotel?.rooms?.find(r => r._id === selectedRoomId);

    const displayImages = selectedRoomId && selectedRoom?.images?.length > 0
        ? selectedRoom.images.map(img => img.url || img)
        : (hotel?.images?.length > 0
            ? (hotel.images.filter(img => ['facade', 'reception', 'common', 'lobby', 'facade'].includes(img.category?.toLowerCase())).length > 0
                ? hotel.images.filter(img => ['facade', 'reception', 'common', 'lobby'].includes(img.category?.toLowerCase())).map(img => img.url || img)
                : hotel.images.map(img => img.url || img))
            : [PLACEHOLDER_IMAGE]);

    const displayAmenities = selectedRoomId && selectedRoom?.amenities
        ? selectedRoom.amenities
        : (hotel?.facilities || []);

    const displayPrice = selectedRoomId ? selectedRoom.price : (hotel?.price || 0);
    const displayOriginalPrice = selectedRoomId ? (selectedRoom.price + 500) : (hotel?.originalPrice || (hotel?.price ? hotel.price + 500 : 0));

    const nights = Math.max(1, Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)));
    const baseTotal = displayPrice * bookingData.rooms * nights;
    const finalTotal = appliedCoupon ? (baseTotal - appliedCoupon.discount) : baseTotal;

    const handleApplyCoupon = async (codeToApply) => {
        const code = codeToApply || couponInput;
        if (!code) return toast.error("Please enter a coupon code");

        try {
            setIsValidatingCoupon(true);
            const res = await offerService.validate(code, baseTotal);
            setAppliedCoupon(res);
            toast.success(`Coupon Applied! ₹${res.discount} saved.`);
            if (showOffersModal) setShowOffersModal(false);
        } catch (err) {
            toast.error(err.message || "Invalid coupon code");
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleDirectBooking = async () => {
        // 1. Auth Check
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            toast.error("Please login to book");
            navigate('/login');
            return;
        }

        // 2. Room Selection Check
        if (!selectedRoomId) {
            toast.error("Please select a room category first");
            const categorySection = document.getElementById('room-categories');
            if (categorySection) {
                categorySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            setIsBooking(true);
            const nights = Math.max(1, Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)));

            const bookingPayload = {
                hotelId: id,
                roomId: selectedRoomId,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: {
                    rooms: bookingData.rooms,
                    adults: bookingData.guests,
                    children: 0
                },
                totalAmount: finalTotal,
                couponCode: appliedCoupon?.offerCode,
                discountAmount: appliedCoupon?.discount || 0
            };

            const response = await bookingService.create(bookingPayload);

            console.log('Booking API Response:', response);
            console.log('Booking ID from response:', response.booking?.bookingId);

            toast.success("Booking Initiated!");

            navigate('/booking-confirmation', {
                state: {
                    animate: true,
                    booking: {
                        ...bookingPayload,
                        id: response.booking?.bookingId || response.bookingId || response.id,
                        bookingId: response.booking?.bookingId || response.bookingId,
                        pricing: response.booking?.pricing,
                        checkIn: { dateNum: new Date(bookingData.checkIn).getDate(), month: new Date(bookingData.checkIn).toLocaleDateString('en-US', { month: 'short' }), day: new Date(bookingData.checkIn).toLocaleDateString('en-US', { weekday: 'short' }), fullDate: bookingData.checkIn },
                        checkOut: { dateNum: new Date(bookingData.checkOut).getDate(), month: new Date(bookingData.checkOut).toLocaleDateString('en-US', { month: 'short' }), day: new Date(bookingData.checkOut).toLocaleDateString('en-US', { weekday: 'short' }), fullDate: bookingData.checkOut }
                    },
                    hotel: {
                        name: hotel.name,
                        price: displayPrice,
                        address: hotel.address?.street + ", " + hotel.address?.city,
                        image: displayImages[0],
                        rating: hotel.rating
                    }
                }
            });
        } catch (err) {
            console.error("Booking failed:", err);
            toast.error(err.message || "Failed to create booking. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    // Auto-update userName if storage changes or on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.name) {
            setBookingData(prev => ({ ...prev, userName: user.name }));
        }
    }, []);

    // Scroll Spy & Sticky Header Logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // Sticky Header Toggle
            if (scrollY > 300) {
                setShowStickyHeader(true);
            } else {
                setShowStickyHeader(false);
            }

            // Auto Active Tab Logic
            const offset = 150;
            const sections = [
                { id: 'Overview', ref: overviewRef },
                { id: 'Offers', ref: offersRef },
                { id: 'Booking', ref: bookingRef },
                { id: 'Rating', ref: ratingRef },
                { id: 'Amenities', ref: amenitiesRef },
                { id: 'Nearby', ref: nearbyRef },
                { id: 'Pricing', ref: pricingRef }
            ];

            for (let section of sections) {
                const element = section.ref.current;
                if (element) {
                    const top = element.offsetTop - offset;
                    const bottom = top + element.offsetHeight;
                    if (scrollY >= top && scrollY < bottom) {
                        setActiveTab(section.id);
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (ref, tabName) => {
        setActiveTab(tabName);
        const y = ref.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                setLoading(true);
                const data = await hotelService.getById(id);

                // Keep the raw data for easier access
                setHotel(data);

                // Initially no room selected
                setSelectedRoomId(null);
            } catch (err) {
                console.error("Fetch Hotel Details Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHotel();
    }, [id]);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await offerService.getActive();
                setActiveOffers(data);
            } catch (err) {
                console.error("Fetch Offers Error:", err);
            }
        };
        fetchOffers();
    }, []);


    const handleImgError = (index) => {
        setImgError(prev => ({ ...prev, [index]: true }));
    };

    const getDisplayImage = (src, index) => {
        return imgError[index] ? PLACEHOLDER_IMAGE : src;
    };

    // Early returns AFTER all hooks
    if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-surface border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !hotel) return <div className="h-screen flex items-center justify-center text-red-500">Hotel not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-32">

            {/* 1. Sticky Navigation Header */}
            <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${showStickyHeader ? 'bg-white shadow-md' : 'bg-transparent'}`}>
                <div className="flex justify-between items-center px-4 py-2">
                    <button
                        onClick={() => navigate(-1)}
                        className={`${showStickyHeader ? 'bg-gray-100 text-surface' : 'bg-white/80 backdrop-blur-md text-surface'} p-2 rounded-full shadow-sm transition`}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {showStickyHeader && (
                        <h2 className="text-sm font-bold text-surface truncate max-w-[50%]">
                            {hotel.name}
                        </h2>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleToggleSave}
                            className={`${showStickyHeader ? 'bg-gray-100 text-surface' : 'bg-white/80 backdrop-blur-md text-surface'} p-2 rounded-full shadow-sm transition active:scale-95`}
                        >
                            <Heart size={20} className={isSaved ? "fill-red-500 text-red-500" : ""} />
                        </button>
                    </div>
                </div>

                {/* Tabs Row (Compacted & Animated) */}
                {showStickyHeader && (
                    <div className="flex gap-2 px-5 pb-1 overflow-x-auto no-scrollbar bg-white">
                        {['Overview', 'Offers', 'Booking', 'Rating', 'Amenities', 'Nearby', 'Pricing'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    if (tab === 'Overview') scrollToSection(overviewRef, 'Overview');
                                    if (tab === 'Offers') scrollToSection(offersRef, 'Offers');
                                    if (tab === 'Booking') scrollToSection(bookingRef, 'Booking');
                                    if (tab === 'Rating') scrollToSection(ratingRef, 'Rating');
                                    if (tab === 'Amenities') scrollToSection(amenitiesRef, 'Amenities');
                                    if (tab === 'Nearby') scrollToSection(nearbyRef, 'Nearby');
                                    if (tab === 'Pricing') scrollToSection(pricingRef, 'Pricing');
                                }}
                                className={`
                               relative 
                               text-sm font-bold whitespace-nowrap px-3 py-2 
                               transition-colors duration-200 
                               ${activeTab === tab ? 'text-surface' : 'text-gray-400'}
                             `}
                            >
                                {/* Text */}
                                <span className="relative z-10">
                                    {tab === 'Overview' ? 'Details' : tab}
                                </span>

                                {/* Active Indicator Animation */}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface rounded-full"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Hero Image Carousel */}
            <div className="relative w-full h-[320px] bg-white overflow-hidden">
                <div
                    ref={imageContainerRef}
                    onScroll={handleImageScroll}
                    className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                >
                    {displayImages.map((img, i) => (
                        <div key={i} className="relative w-full h-full flex-shrink-0 snap-center">
                            <img
                                src={getDisplayImage(img, i)}
                                onError={() => handleImgError(i)}
                                alt={`${hotel.name} - ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Image Category Label (moved to top-left with more padding for header) */}
                            <div className="absolute top-16 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <span className="text-white text-xs font-bold tracking-wide uppercase">
                                    {selectedRoomId ? (selectedRoom?.title || "Room") : "Hotel Photos"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
                </div>

                {/* Counter Badge (Moved to Top Right) */}
                <div className="absolute top-16 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none z-10">
                    {currentImgIndex + 1} / {displayImages.length}
                </div>

                {/* Thumbnails (Overlay at Bottom) */}
                <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                    <p className="text-white text-xs font-bold mb-2 ml-1 drop-shadow-md">Thumbnails</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                        {displayImages.slice(0, 10).map((img, i) => (
                            <div
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (imageContainerRef.current) {
                                        imageContainerRef.current.scrollTo({
                                            left: i * imageContainerRef.current.offsetWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 shadow-lg cursor-pointer transition-all ${currentImgIndex === i ? 'border-surface scale-105 ring-2 ring-black/20' : 'border-white/50 opacity-90'}`}
                            >
                                <img
                                    src={getDisplayImage(img, i)}
                                    onError={() => handleImgError(i)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-0.5 text-center">
                                    <span className="text-[7px] font-bold text-white uppercase tracking-wider block truncate">
                                        PHOTO {i + 1}
                                    </span>
                                </div>
                                {/* See All Overlay for last item */}
                                {i === 9 && displayImages.length > 10 && (
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-1">
                                        <span className="text-lg font-bold">+{displayImages.length - 10}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-5 mt-4 flex flex-col gap-6">

                {/* 3. Overview Section */}
                <section ref={overviewRef} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-xl font-bold text-surface leading-snug">{hotel.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {hotel.rating || 3} <Star size={10} fill="currentColor" />
                        </div>
                        {hotel.numReviews > 0 && (
                            <span className="text-xs text-gray-500">({hotel.numReviews} reviews)</span>
                        )}
                        <span className="text-xs font-bold text-blue-600 ml-auto cursor-pointer">View on map</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{hotel.address?.city}, {hotel.address?.state}</p>

                    {hotel.isCompanyServiced && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-surface/5 px-3 py-1.5 rounded-lg border border-surface/10">
                            <Shield size={14} className="text-surface" />
                            <span className="text-xs font-bold text-surface">Company-Serviced</span>
                        </div>
                    )}

                    {/* Category Selection */}
                    <div className="mt-6" id="room-categories">
                        <h3 className="font-bold text-surface text-sm mb-3">Select Room Category</h3>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                            {hotel.rooms?.map((room) => (
                                <button
                                    key={room._id}
                                    onClick={() => setSelectedRoomId(selectedRoomId === room._id ? null : room._id)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xl border transition-all ${selectedRoomId === room._id ? 'bg-surface text-white border-surface shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    <p className="text-sm font-bold leading-tight">{room.title}</p>
                                    <p className={`text-[10px] mt-0.5 ${selectedRoomId === room._id ? 'text-white/80' : 'text-gray-400'}`}>₹{room.price}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {hotel.isCompanyServiced && (
                        <>
                            <h3 className="font-bold text-surface text-sm mt-6 mb-4">Why choose Company-Serviced?</h3>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                                {[
                                    { title: "Express check-in", image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&q=80" },
                                    { title: "Spacious and hygienic rooms", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80" }
                                ].map((item, i) => (
                                    <div key={i} className="relative min-w-[200px] h-[120px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                        <img src={item.image} className="w-full h-full object-cover brightness-75" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-3">
                                            <span className="text-white font-bold text-xs leading-tight">{item.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* 4. Offers Section */}
                <section ref={offersRef}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-surface text-lg">Special offers</h3>
                        {activeOffers.length > 3 && (
                            <button
                                onClick={() => setShowOffersModal(true)}
                                className="text-xs font-bold text-accent hover:underline"
                            >
                                Browse more
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {(activeOffers.length > 0 ? activeOffers.slice(0, 3) : [
                            { title: "Get upto 75% off", code: "NEWRUKKO", _id: 'default' }
                        ]).map((offer) => (
                            <div
                                key={offer._id}
                                className={`bg-white border-2 border-dashed ${appliedCoupon?.offerCode === offer.code ? 'border-accent bg-accent/5' : 'border-gray-100'} rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all`}
                            >
                                <div className="flex gap-4 items-center relative z-10">
                                    <div className={`w-12 h-12 rounded-full ${appliedCoupon?.offerCode === offer.code ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-500'} flex items-center justify-center font-black flex-shrink-0`}>
                                        <TicketPercent size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-surface text-sm">{offer.title}</h4>
                                            <button
                                                onClick={() => handleApplyCoupon(offer.code)}
                                                className={`text-[10px] font-bold px-3 py-1 rounded-full shadow-sm transition-all ${appliedCoupon?.offerCode === offer.code ? 'bg-accent text-white' : 'bg-surface text-white hover:bg-surface/90'}`}
                                            >
                                                {appliedCoupon?.offerCode === offer.code ? 'Applied' : 'Apply'}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Code: <span className="font-bold text-surface uppercase">{offer.code}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. Booking Form Section */}
                <section ref={bookingRef} className="scroll-mt-32">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-surface text-lg">Your booking details</h3>
                        {!selectedRoomId && (
                            <span className="text-[10px] bg-red-50 text-red-500 font-bold px-2 py-1 rounded-full animate-pulse border border-red-100">
                                Please select a room category
                            </span>
                        )}
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/40 divide-y divide-gray-50">
                        {/* Dates Row */}
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Calendar size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Check-in / Check-out</p>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                    <div className="relative group flex-1 w-full sm:w-auto">
                                        <input
                                            type="date"
                                            value={bookingData.checkIn}
                                            onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                                            className="w-full text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="hidden sm:block w-px h-4 bg-gray-200" />
                                    <div className="relative group flex-1 w-full sm:w-auto text-left sm:text-right">
                                        <input
                                            type="date"
                                            value={bookingData.checkOut}
                                            onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                                            className="w-full text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 cursor-pointer sm:text-right"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guests & Rooms Row */}
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                <Users size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Accommodation Plan</p>
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gray-100 hover:border-surface/20 transition-all">
                                        <BedDouble size={14} className="text-gray-400" />
                                        <select
                                            value={bookingData.rooms}
                                            onChange={(e) => {
                                                const rooms = parseInt(e.target.value);
                                                setBookingData({ ...bookingData, rooms });
                                            }}
                                            className="text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none"
                                        >
                                            {Array.from({ length: selectedRoom?.qty || 5 }, (_, i) => i + 1).map(v => (
                                                <option key={v} value={v}>{v} Room{v > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gray-100 hover:border-surface/20 transition-all">
                                        <Users size={14} className="text-gray-400" />
                                        <select
                                            value={bookingData.guests}
                                            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                                            className="text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 cursor-pointer outline-none"
                                        >
                                            {Array.from({ length: (selectedRoom?.occupancy || 3) * bookingData.rooms }, (_, i) => i + 1).map(v => (
                                                <option key={v} value={v}>{v} Guest{v > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Booking For Row */}
                        <div className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                                <UserCheck size={22} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Primary Guest</p>
                                <div className="flex items-center group">
                                    <input
                                        type="text"
                                        value={bookingData.userName}
                                        onChange={(e) => setBookingData({ ...bookingData, userName: e.target.value })}
                                        placeholder="Full Name"
                                        className="w-full text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 placeholder:font-normal placeholder:text-gray-300"
                                    />
                                    <CheckCircle size={14} className="text-green-500 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        {/* Coupon Code Row */}
                        {!appliedCoupon ? (
                            <div className="p-4 bg-accent/5 flex items-center gap-4 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                                    <TicketPercent size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter Coupon Code"
                                        className="flex-1 text-sm font-bold text-surface bg-transparent border-none p-0 focus:ring-0 placeholder:font-normal placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isValidatingCoupon}
                                        className="text-xs font-black text-accent uppercase tracking-wider hover:bg-accent/10 py-2 px-3 rounded-lg transition-all"
                                    >
                                        {isValidatingCoupon ? "Checking..." : "Apply"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 flex items-center gap-4 transition-colors border-y border-green-100">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-green-200 flex items-center justify-center text-green-600 flex-shrink-0 animate-bounce">
                                    <Sparkles size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-green-600 uppercase font-black tracking-widest leading-none mb-1">Coupon Applied</p>
                                        <button onClick={() => { setAppliedCoupon(null); setCouponInput(''); }} className="text-[10px] text-red-500 font-bold">Remove</button>
                                    </div>
                                    <p className="text-sm font-bold text-surface">{appliedCoupon.offerCode} - ₹{appliedCoupon.discount} Saved!</p>
                                </div>
                            </div>
                        )}

                    </div>
                </section>

                {/* 6. Ratings Section */}
                <section ref={ratingRef} className="pt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-surface text-lg">Ratings & Reviews</h3>
                        <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-surface">{hotel.rating || 3}</span>
                            {hotel.numReviews > 0 && (
                                <span className="text-xs text-gray-400 font-medium">({hotel.numReviews} reviews)</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Overall Rating Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-surface rounded-3xl flex flex-col items-center justify-center text-white shadow-xl shadow-surface/20 mb-3 rotate-3">
                                <span className="text-3xl font-black leading-none">{hotel.rating || 3}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Rating</span>
                            </div>
                            <h4 className="font-black text-surface text-lg uppercase tracking-tight">Excellent</h4>
                            {hotel.numReviews > 0 && (
                                <p className="text-xs text-gray-400 mt-1 font-medium">Based on {hotel.numReviews} verified reviews</p>
                            )}
                        </div>

                        {/* Recent Reviews List */}
                        <div className="space-y-3">
                            {(hotel.reviews && hotel.reviews.length > 0 ? hotel.reviews.slice(0, 3) : MOCK_REVIEWS).map((rev, i) => (
                                <div key={rev._id || rev.id} className="bg-white p-4 rounded-2xl border border-gray-50 shadow-sm hover:border-surface/10 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-surface">
                                                {rev.user?.substring(0, 2).toUpperCase() || "GU"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-surface leading-none">{rev.user || "Guest User"}</p>
                                                <p className="text-[9px] text-gray-400 mt-1 font-medium">{rev.date || "Recent"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded text-green-700 text-[10px] font-black">
                                            {rev.rating} <Star size={8} fill="currentColor" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium capitalize">
                                        "{rev.comment || rev.text}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. Amenities */}
                <section ref={amenitiesRef} className="pt-4">
                    <h3 className="font-bold text-surface text-lg mb-4">Amenities</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {displayAmenities.slice(0, 7).map((am, i) => (
                            <div key={i} className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl border border-gray-100 bg-white">
                                <div className="w-10 h-10 rounded-full bg-surface/5 flex items-center justify-center text-surface">
                                    <Utensils size={20} />
                                </div>
                                <span className="text-[9px] text-gray-500 font-bold leading-tight uppercase tracking-tight">{am}</span>
                            </div>
                        ))}
                        <motion.button
                            onClick={() => navigate(`/hotel/${id || 1}/amenities`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl border border-blue-100 bg-blue-50 cursor-pointer w-full"
                        >
                            <span className="text-lg font-black text-blue-600">+12</span>
                            <span className="text-[10px] font-bold text-blue-600">More</span>
                        </motion.button>
                    </div>
                </section>

                {/* 8. You Might Also Like (Scrollable Cards) */}
                <section>
                    <h3 className="font-bold text-surface text-lg mb-4">You might also like</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
                        {[1, 2, 3, 4].map((_, i) => (
                            <motion.div
                                key={i}
                                onClick={() => {
                                    navigate(`/hotel/${100 + i}`);
                                    window.scrollTo(0, 0);
                                }} // Mock ID
                                className="min-w-[240px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg shadow-gray-100/50 cursor-pointer"
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="h-32 bg-gray-200 relative overflow-hidden group">
                                    <img
                                        src={hotel.images[i] || hotel.images[0]}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div
                                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Define mockItem again as it is needed for saving
                                            const mockItem = {
                                                id: 100 + i,
                                                name: "Super Collection O",
                                                location: "Vijay Nagar, Indore",
                                                image: hotel.images[i] || hotel.images[0],
                                                rating: 4.5,
                                                price: 799
                                            };

                                            // Updated Save Logic with State Update
                                            const currentSaved = JSON.parse(localStorage.getItem('savedHotels') || '[]');
                                            const isAlreadySaved = currentSaved.some(h => h.id === mockItem.id);

                                            let newSaved;
                                            if (isAlreadySaved) {
                                                newSaved = currentSaved.filter(h => h.id !== mockItem.id);
                                                showSaveToast(false);
                                            } else {
                                                newSaved = [...currentSaved, mockItem];
                                                showSaveToast(true);
                                            }
                                            localStorage.setItem('savedHotels', JSON.stringify(newSaved));

                                            // Trigger re-render
                                            setImgError(prev => ({ ...prev }));
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            className={`${JSON.parse(localStorage.getItem('savedHotels') || '[]').some(h => h.id === 100 + i)
                                                ? "fill-red-500 text-red-500"
                                                : "text-gray-400"
                                                } active:scale-90 transition-transform`}
                                        />
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        4.5 ★
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-surface text-sm truncate">Super Collection O</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">Vijay Nagar, Indore</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 line-through">₹2400</span>
                                            <span className="font-black text-surface text-lg leading-none">₹799</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/hotel/${100 + i}`);
                                                window.scrollTo(0, 0);
                                            }}
                                            className="text-xs font-bold text-white bg-surface px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 9. What's Nearby (Visual Timeline) */}
                <section ref={nearbyRef} className="pt-2">
                    <h3 className="font-bold text-surface text-lg mb-4">What's nearby?</h3>
                    <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
                        {(hotel.nearbyLocations?.length > 0 ? hotel.nearbyLocations : [
                            { name: "Indore Junction", distance: "4.5 km", time: "15 min drive" },
                            { name: "Rajwada Palace", distance: "6.2 km", time: "25 min drive" },
                            { name: "Airport", distance: "12 km", time: "40 min drive" }
                        ]).map((loc, i, arr) => (
                            <div key={i} className={`flex items-center justify-between p-4 ${i !== arr.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors rounded-xl`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-surface">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-surface">{loc.name}</h4>
                                        <p className="text-xs text-gray-400">{loc.time}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-surface bg-gray-100 px-2 py-1 rounded-lg">{loc.distance}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 10. Pricing Section */}
                <section ref={pricingRef} className="pt-2 pb-6">
                    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-surface text-lg mb-4">Price Breakup</h3>
                        <div className="space-y-3 text-sm border-t border-dashed border-gray-200 pt-4">
                            <div className="flex justify-between items-center text-gray-500">
                                <span>{bookingData.rooms} Room x {nights} Night</span>
                                <span className="font-bold text-surface">₹{baseTotal}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="flex items-center gap-1"><TicketPercent size={14} /> Coupon {appliedCoupon.offerCode}</span>
                                    <span className="font-bold">- ₹{appliedCoupon.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-gray-400">
                                <span>Taxes & Service Fees</span>
                                <span className="font-bold">₹0</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 border-t border-dashed pt-3">
                                <span className="font-bold text-surface">Total Amount</span>
                                <span className="font-black text-surface text-2xl">₹{finalTotal}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-10 text-center">
                    <div className="p-8 rounded-[32px] bg-surface text-white shadow-2xl shadow-surface/20">
                        <Sparkles className="mx-auto mb-4 text-accent" size={32} />
                        <h3 className="text-xl font-black mb-2">Ready for your stay?</h3>
                        <p className="text-white/60 text-sm mb-6">Complete your booking at {hotel.name} and enjoy your trip!</p>
                        <button
                            onClick={handleDirectBooking}
                            disabled={isBooking}
                            className="w-full bg-white text-surface font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isBooking ? 'Processing...' : 'Complete Booking Now'}
                            {!isBooking && <ChevronRight size={20} />}
                        </button>
                    </div>
                </section>
            </div>

            {/* Footer Price Bar */}
            <div className={`fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex justify-between items-center`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-surface">₹{finalTotal}</span>
                        {appliedCoupon && <span className="text-xs text-gray-400 line-through">₹{baseTotal}</span>}
                    </div>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md w-fit mt-0.5">Includes Taxes</span>
                </div>
                <button
                    onClick={handleDirectBooking}
                    disabled={isBooking}
                    className="bg-surface text-white px-6 sm:px-8 py-4 min-h-[48px] rounded-xl font-bold text-sm shadow-lg shadow-surface/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isBooking ? 'Processing...' : 'Book Now'}
                    {!isBooking && <ChevronRight size={18} />}
                </button>
            </div>

            {/* 11. Offers Browse Modal */}
            <AnimatePresence>
                {showOffersModal && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowOffersModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-surface">Available Offers</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select an offer to apply</p>
                                </div>
                                <button
                                    onClick={() => setShowOffersModal(false)}
                                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                {activeOffers.map((offer) => (
                                    <div
                                        key={offer._id}
                                        className={`p-4 rounded-2xl border-2 transition-all ${appliedCoupon?.offerCode === offer.code ? 'border-accent bg-accent/5' : 'border-gray-100'}`}
                                    >
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                                                <Tag size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-surface text-sm uppercase">{offer.code}</h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">{offer.subtitle}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleApplyCoupon(offer.code)}
                                                        className={`text-xs font-bold px-4 py-1.5 rounded-xl transition-all ${appliedCoupon?.offerCode === offer.code ? 'bg-accent text-white' : 'border-2 border-surface text-surface hover:bg-surface hover:text-white'}`}
                                                    >
                                                        {appliedCoupon?.offerCode === offer.code ? 'Applied' : 'Apply'}
                                                    </button>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-50">
                                                    <p className="text-[10px] text-gray-500 font-medium">Valid until {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'TBD'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HotelDetails;
