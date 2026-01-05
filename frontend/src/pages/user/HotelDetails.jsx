import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Heart, Star, MapPin,
    Wifi, Coffee, Car, Shield, ChevronRight, Users, Utensils,
    Calendar, UserCheck, TicketPercent, CheckCircle, Info, ThumbsUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import BookingBottomSheet from '../../components/modals/BookingBottomSheet';
import showSaveToast from '../../utils/toastUtils.jsx';
import { hotelService, userService } from '../../services/apiService';

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
    const [showBookingSheet, setShowBookingSheet] = useState(false);

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

    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                setLoading(true);
                const data = await hotelService.getById(id);
                // Transform API data to Component state format if needed
                const transformed = {
                    ...data,
                    name: data.name,
                    location: data.address?.city || data.location,
                    price: data.price,
                    originalPrice: data.originalPrice || (data.price + 500),
                    rating: data.rating?.average || 4.5,
                    ratingCount: data.rating?.count + " ratings" || "100+ ratings",
                    images: data.images?.length > 0 ? data.images : [
                        "https://images.unsplash.com/photo-1590490360182-c583ca46fd08?w=800&q=80",
                        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80"
                    ],
                    amenities: [
                        { icon: Wifi, name: "Free Wifi" },
                        { icon: Coffee, name: "Breakfast" },
                        { icon: Car, name: "Parking" },
                        { icon: Shield, name: "Sanitized" },
                        { icon: Utensils, name: "Restaurant" },
                        { icon: Users, name: "Reception" }
                    ],
                    whyChoose: [
                        {
                            title: "Express check-in",
                            image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&q=80",
                            video: true
                        },
                        {
                            title: "Spacious and hygienic rooms",
                            image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80",
                            video: false
                        },
                        {
                            title: "Premium Amenities",
                            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
                            video: false
                        }
                    ],
                    ratings: [
                        { label: "Cleanliness", score: data.rating?.breakdown?.cleanliness || 4.8 },
                        { label: "Location", score: data.rating?.breakdown?.location || 4.5 },
                        { label: "Check-in", score: data.rating?.breakdown?.checkIn || 5.0 },
                        { label: "Value", score: data.rating?.breakdown?.value || 4.7 }
                    ]
                };
                setHotel(transformed);
            } catch (err) {
                console.error("Fetch Hotel Details Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchHotel();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
    if (error || !hotel) return <div className="h-screen flex items-center justify-center">Hotel not found</div>;

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
            const offset = 150; // Offset for sticky header height
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
        // Offset for header
        const y = ref.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const handleImgError = (index) => {
        setImgError(prev => ({ ...prev, [index]: true }));
    };

    const getDisplayImage = (src, index) => {
        return imgError[index] ? PLACEHOLDER_IMAGE : src;
    };

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
                        <h2 className="text-sm font-bold text-surface truncate max-w-[50%] opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
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
                    {hotel.images.map((img, i) => (
                        <div key={i} className="relative w-full h-full flex-shrink-0 snap-center">
                            <img
                                src={getDisplayImage(img, i)}
                                onError={() => handleImgError(i)}
                                alt={`${hotel.name} - ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Image Category Label (moved to top-left with more padding for header) */}
                            <div className="absolute top-16 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                <span className="text-white text-xs font-bold tracking-wide">
                                    {i === 0 ? "Bedroom" : i === 1 ? "Reception Area" : i === 2 ? "Lobby & Waiting" : i === 3 ? "Washroom" : "Hotel Facade"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>
                </div>

                {/* Counter Badge (Moved to Top Right) */}
                <div className="absolute top-16 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold pointer-events-none z-10">
                    {currentImgIndex + 1} / {hotel.images.length}
                </div>

                {/* Thumbnails (Overlay at Bottom) */}
                <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                    <p className="text-white text-xs font-bold mb-2 ml-1 drop-shadow-md">Photos</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                        {hotel.images.slice(0, 10).map((img, i) => (
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
                                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 shadow-lg cursor-pointer transition-all ${currentImgIndex === i ? 'border-surface scale-105 ring-2 ring-black/20' : 'border-white/50 opacity-90'}`}
                            >
                                <img
                                    src={getDisplayImage(img, i)}
                                    onError={() => handleImgError(i)}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-0.5 text-center">
                                    <span className="text-[7px] font-bold text-white uppercase tracking-wider block truncate">
                                        {i === 0 ? "Room" : i === 1 ? "Recep." : i === 2 ? "Lobby" : i === 3 ? "Wash." : "View"}
                                    </span>
                                </div>
                                {/* See All Overlay for last item */}
                                {i === 9 && hotel.images.length > 10 && (
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-1">
                                        <span className="text-lg font-bold">+{hotel.images.length - 10}</span>
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
                            {hotel.rating} <Star size={10} fill="currentColor" />
                        </div>
                        <span className="text-xs text-gray-500">({hotel.ratingCount})</span>
                        <span className="text-xs font-bold text-blue-600 ml-auto" onClick={() => navigate('/map')}>View on map</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{hotel.location}</p>

                    <div className="mt-4 inline-flex items-center gap-2 bg-surface/5 px-3 py-1.5 rounded-lg border border-surface/10">
                        <Shield size={14} className="text-surface" />
                        <span className="text-xs font-bold text-surface">Company-Serviced</span>
                    </div>

                    <h3 className="font-bold text-surface text-sm mt-6 mb-4">Why choose Company-Serviced?</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                        {hotel.whyChoose.map((item, i) => (
                            <div key={i} className="relative min-w-[200px] h-[120px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                <img src={item.image} className="w-full h-full object-cover brightness-75" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-3">
                                    <span className="text-white font-bold text-xs leading-tight">{item.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Offers Section */}
                <section ref={offersRef}>
                    <h3 className="font-bold text-surface text-lg mb-3">Browse through special offers</h3>
                    <div className="bg-white border border-dashed border-accent rounded-xl p-4 shadow-sm relative overflow-hidden">
                        <div className="flex gap-4 items-start relative z-10">
                            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black">
                                <TicketPercent size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-surface text-sm">Get upto 75% off using code...</h4>
                                    <span className="bg-surface text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Applied</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Use <span className="font-bold text-surface">NEWRUKKO</span> to avail this offer.</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/hotel/${id || 1}/offers`)} className="text-xs font-bold text-blue-600 mt-2 ml-1 hover:underline">View all offers</button>
                </section>

                {/* 5. Booking Details Section */}
                <section ref={bookingRef}>
                    <h3 className="font-bold text-surface text-lg mb-3">Your booking details</h3>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center p-4 border-b border-gray-100">
                            <div className="w-10 flex justify-center text-gray-400"><Calendar size={20} /></div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400">Dates</p>
                                <p className="text-sm font-bold text-blue-600">Tue, 23 Dec - Wed, 24 Dec</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 border-b border-gray-100">
                            <div className="w-10 flex justify-center text-gray-400"><Users size={20} /></div>
                            <div className="flex-1 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-400">Guest</p>
                                    <p className="text-sm font-medium text-surface">1 room • 2 guests</p>
                                </div>
                                <button className="text-xs font-bold text-blue-600">Change</button>
                            </div>
                        </div>
                        <div className="flex items-center p-4">
                            <div className="w-10 flex justify-center text-gray-400"><UserCheck size={20} /></div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400">Booking for</p>
                                <p className="text-sm font-medium text-blue-600">hritikraghuwanshi</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Ratings & Reviews (Enhanced) */}
                <section ref={ratingRef} className="pt-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-surface text-lg">Ratings & Reviews</h3>
                        <button className="text-sm font-bold text-blue-600 flex items-center">
                            Write a review <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex flex-col items-center justify-center w-24 h-24 bg-surface/5 rounded-2xl border border-surface/10">
                                <span className="text-4xl font-black text-surface leading-none">{hotel.rating}</span>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star size={12} fill="currentColor" className="text-surface" />
                                    <span className="text-xs font-bold text-surface">Excellent</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-3">
                                {hotel.ratings.map((r, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-gray-500 font-medium group-hover:text-surface transition-colors">{r.label}</span>
                                            <span className="font-bold text-surface">{r.score}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(r.score / 5) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full ${r.score >= 4.8 ? 'bg-surface' : 'bg-surface/70'}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable User Reviews */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="min-w-[280px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                        {i === 0 ? 'RJ' : i === 1 ? 'MK' : 'AS'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-surface">{i === 0 ? 'Rahul Jain' : i === 1 ? 'Mohit Kumar' : 'Ankit Singh'}</h4>
                                        <p className="text-[10px] text-gray-400">Oct 2024 • Family Trip</p>
                                    </div>
                                    <div className="ml-auto bg-green-50 px-2 py-1 rounded text-xs font-bold text-green-700 flex items-center gap-1">
                                        5.0 <Star size={8} fill="currentColor" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                    {i === 0 ? "Excellent stay! The rooms were super clean and the staff was very polite. Highly recommended for families looking for a safe stay." :
                                        i === 1 ? "Great value for money. Checking in was smooth and the location is perfect near the railway station." :
                                            "Room service was quick. Food quality is amazing. Will definitely visit again."}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate(`/hotel/${id || 1}/reviews`)}
                            className="w-full py-3 bg-white border border-gray-200 text-surface font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            View all 1,139 reviews
                        </button>
                    </div>
                </section>

                {/* 7. Amenities (Interactive Grid) */}
                <section ref={amenitiesRef} className="pt-4">
                    <h3 className="font-bold text-surface text-lg mb-4">Amenities</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {hotel.amenities.map((am, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05, backgroundColor: "#F3F4F6" }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center text-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm transition-colors cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-full bg-surface/5 flex items-center justify-center text-surface transition-colors">
                                    <am.icon size={20} strokeWidth={1.5} />
                                </div>
                                <span className="text-[10px] text-gray-600 font-bold leading-tight">{am.name}</span>
                            </motion.div>
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
                        {[
                            { name: "Indore Junction", dist: "4.5 km", time: "15 min" },
                            { name: "Rajwada Palace", dist: "6.2 km", time: "25 min" },
                            { name: "Airport", dist: "12 km", time: "40 min" }
                        ].map((loc, i) => (
                            <div key={i} className={`flex items-center justify-between p-4 ${i !== 2 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors rounded-xl`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-surface">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-surface">{loc.name}</h4>
                                        <p className="text-xs text-gray-400">{loc.time} drive</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-surface bg-gray-100 px-2 py-1 rounded-lg">{loc.dist}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 10. Pricing Breakup (With Coupon Input) */}
                <section ref={pricingRef} className="pt-2 pb-6">
                    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface/5 rounded-full -mr-16 -mt-16 blur-xl pointer-events-none"></div>

                        <h3 className="font-bold text-surface text-lg mb-4 relative z-10">Price Breakup</h3>

                        {/* Coupon Input Area */}
                        <div className="mb-6 relative z-10">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Apply Coupon</label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 flex items-center overflow-hidden focus-within:border-surface focus-within:ring-1 focus-within:ring-surface transition-all">
                                    <TicketPercent size={18} className="text-surface flex-shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="w-full py-2.5 px-2 text-sm font-bold text-surface placeholder:font-normal placeholder:text-gray-400 outline-none uppercase"
                                        defaultValue="NEWRUKKO"
                                    />
                                </div>
                                <button className="bg-surface text-white font-bold text-xs px-4 rounded-xl shadow-md active:scale-95 transition-transform">
                                    APPLY
                                </button>
                            </div>
                            <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-1">
                                <CheckCircle size={10} /> Discount worth ₹3,488 applied successfully!
                            </p>
                        </div>

                        <div className="space-y-3 text-sm relative z-10 border-t border-dashed border-gray-200 pt-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-gray-500 group-hover:text-surface transition-colors">1 Room x 1 Night</span>
                                <span className="font-medium text-surface">₹4386</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-green-600 flex items-center gap-1"><TicketPercent size={14} /> Total Discount</span>
                                <span className="font-bold text-green-600">- ₹3488</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <div className="flex items-center gap-1 text-gray-500">
                                    <span>Taxes & Service Fees</span>
                                    <Info size={12} className="text-gray-400 cursor-help" />
                                </div>
                                <span className="font-medium text-surface">₹100</span>
                            </div>

                            <div className="my-4 border-t border-dashed border-gray-300"></div>

                            <div className="flex justify-between items-end">
                                <span className="font-bold text-surface text-base">Total Amount</span>
                                <div className="text-right leading-none">
                                    <span className="font-black text-surface text-2xl table-cell align-bottom">₹998</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 bg-green-500/10 border border-green-500/20 text-green-700 text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                            <ThumbsUp size={14} />
                            Great Deal! You saved ₹3,488
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Price Bar */}
            <div className={`fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 p-4 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] flex justify-between items-center transition-transform duration-300`}>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-surface">₹{hotel.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{hotel.originalPrice}</span>
                    </div>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md w-fit mt-0.5">
                        Includes Taxes
                    </span>
                </div>
                <button
                    onClick={() => setShowBookingSheet(true)}
                    className="bg-[#D32F2F] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
                >
                    Book Now
                </button>
            </div>

            {/* Booking Bottom Sheet */}
            <BookingBottomSheet
                isOpen={showBookingSheet}
                onClose={() => setShowBookingSheet(false)}
                hotelData={hotel}
                onConfirm={(bookingData) => {
                    // Navigate immediately - sheet will unmount as we leave the page
                    navigate('/booking-confirmation', {
                        state: {
                            animate: true,
                            booking: bookingData,
                            hotel: hotel
                        }
                    });
                }}
            />

        </div>
    );
};

export default HotelDetails;
