import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ArrowRight, ShieldCheck, Heart, Star, MapPin,
    Wifi, Tv, Car, Wine, Shield, Flame, Dumbbell, Wind, Waves, Utensils
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import FilterBottomSheet from '../modals/FilterBottomSheet';
import { hotelService, userService } from '../../services/apiService';
import toast from 'react-hot-toast';

const FACILITY_ICONS = {
    wifi: <Wifi size={14} />,
    tv: <Tv size={14} />,
    parking: <Car size={14} />,
    bar: <Wine size={14} />,
    cctv: <Shield size={14} />,
    fire: <Flame size={14} />,
    gym: <Dumbbell size={14} />,
    ac: <Wind size={14} />,
    pool: <Waves size={14} />,
    restaurant: <Utensils size={14} />
};

const ListingCard = ({ hotel, onSaveToggle }) => {
    const navigate = useNavigate();
    const [isSaved, setIsSaved] = useState(hotel.isSaved || false);
    const [saving, setSaving] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    const toggleSave = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to save hotels');
            return;
        }

        if (saving) return;
        try {
            setSaving(true);
            const res = await userService.toggleSavedHotel(hotel.id);
            const newState = !isSaved;
            setIsSaved(newState);

            // Sync local storage
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            if (res.savedHotels) {
                userData.savedHotels = res.savedHotels;
                localStorage.setItem('user', JSON.stringify(userData));
            }

            if (onSaveToggle) onSaveToggle(hotel.id, newState);
            toast.success(newState ? 'Added to saved places' : 'Removed from saved places');
        } catch (error) {
            console.error('Error toggling save:', error);
            toast.error('Failed to update saved places');
        } finally {
            setSaving(false);
        }
    };

    const displayImages = hotel.images && hotel.images.length > 0
        ? hotel.images.filter(img => ['facade', 'reception', 'common'].includes(img.category?.toLowerCase()) || !img.category).map(img => img.url || img)
        : ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"];

    const handleScroll = (e) => {
        const width = e.target.offsetWidth;
        const scrollLeft = e.target.scrollLeft;
        const index = Math.round(scrollLeft / width);
        setCurrentImgIndex(index);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full"
            onClick={() => navigate(`/hotel/${hotel.id}`)}
        >
            <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 w-full group cursor-pointer hover:shadow-lg transition-all duration-300">
                <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                    <div
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full scroll-smooth"
                    >
                        {displayImages.map((src, i) => (
                            <div key={i} className="min-w-full h-full snap-center">
                                <img
                                    src={src}
                                    className="w-full h-full object-cover"
                                    alt={`${hotel.name} - ${i + 1}`}
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dots */}
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 px-1.5 py-1 bg-black/20 backdrop-blur-md rounded-full pointer-events-none">
                            {displayImages.map((_, i) => (
                                <div key={i} className={twMerge(
                                    "w-1 h-1 rounded-full transition-all duration-300",
                                    currentImgIndex === i ? "bg-white w-2.5" : "bg-white/40"
                                )} />
                            ))}
                        </div>
                    )}

                    {/* Heart Button */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        disabled={saving}
                        onClick={toggleSave}
                        className="absolute top-2.5 left-2.5 p-2 bg-black/10 backdrop-blur-md rounded-full shadow-lg z-10 hover:bg-black/20 transition-all border border-white/20"
                    >
                        <Heart
                            size={16}
                            className={`transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                    </motion.button>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-surface tracking-tight">{hotel.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-lg border border-yellow-100 shadow-sm">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-yellow-700">{hotel.rating}</span>
                        </div>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                        <ShieldCheck size={10} className="text-accent" /> {hotel.location}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-50 pt-3">
                        {hotel.facilities?.slice(0, 3).map((f, i) => (
                            <div key={i} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg text-gray-500 border border-transparent">
                                <span className="text-accent">{FACILITY_ICONS[f.toLowerCase()] || <Shield size={10} />}</span>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AllHotelsList = () => {
    const [sortOpen, setSortOpen] = useState(false);
    const [activeSort, setActiveSort] = useState("Recommended");
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [scrollTarget, setScrollTarget] = useState(null);

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Hotels
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const data = await hotelService.getAll();
                setHotels(data);
            } catch (err) {
                console.error("Failed to fetch hotels", err);
                setError(err.message);
                // Fallback to mock data if API fails (optional, but good for dev if backend empty)
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading hotels...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-500">Error loading hotels: {error}</div>;
    }

    return (
        <section className="w-full px-5 py-2 pb-24">

            {/* 1. Results Count & Price Info */}
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-surface">{hotels.length} Rukkos found</h2>
                <p className="text-xs text-gray-500 mb-1">Price per room per night</p>
            </div>

            {/* 2. Filter / Sort Row */}
            <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar items-center pr-2">
                {/* Sort Button */}
                <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-surface whitespace-nowrap bg-white flex-shrink-0"
                >
                    Sort <ChevronDown size={14} className={sortOpen ? "rotate-180" : ""} />
                </button>

                {/* Locality */}
                <button
                    onClick={() => { setScrollTarget("Locality"); setFilterSheetOpen(true); }}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-surface whitespace-nowrap bg-white flex-shrink-0"
                >
                    Locality <ChevronDown size={14} />
                </button>

                {/* Price */}
                <button
                    onClick={() => { setScrollTarget("Price"); setFilterSheetOpen(true); }}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-surface whitespace-nowrap bg-white flex-shrink-0"
                >
                    Price <ChevronDown size={14} />
                </button>

                {/* More Mock Filters to test scrolling */}
                <button
                    onClick={() => { setScrollTarget("Categories"); setFilterSheetOpen(true); }}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-surface whitespace-nowrap bg-white flex-shrink-0"
                >
                    Category <ChevronDown size={14} />
                </button>
                <button
                    onClick={() => { setScrollTarget("RoomFacilities"); setFilterSheetOpen(true); }}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-300 text-sm font-medium text-surface whitespace-nowrap bg-white flex-shrink-0"
                >
                    Amenities <ChevronDown size={14} />
                </button>

                {/* Spacer to push content behind the sticky button if needed, or just let sticky do its job */}
                <div className="w-2 flex-shrink-0"></div>

                {/* Filters Icon (Sticky at the end) */}
                <button
                    onClick={() => { setScrollTarget(null); setFilterSheetOpen(true); }}
                    className="sticky right-0 p-2 border border-gray-300 rounded-full text-surface bg-white shadow-[-8px_0_12px_rgba(255,255,255,1)] z-20 flex-shrink-0 ml-auto"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                </button>
            </div>

            {/* 3. Sort Options Dropdown */}
            <AnimatePresence>
                {sortOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="flex gap-2 flex-wrap">
                            {["Popularity", "Guest Ratings", "Price Low to High", "Price High to Low"].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { setActiveSort(opt); setSortOpen(false); }}
                                    className={`text-xs px-3 py-1.5 rounded-lg border ${activeSort === opt ? 'bg-surface text-white border-surface' : 'bg-transparent text-gray-500 border-gray-200'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Vertical List of Large Cards */}
            <div className="flex flex-col gap-6">
                {hotels.length > 0 ? hotels.map((hotel) => (
                    <ListingCard key={hotel._id || hotel.id} hotel={{
                        id: hotel._id || hotel.id,
                        name: hotel.name,
                        location: hotel.address?.city || hotel.location || 'Unknown Location',
                        images: hotel.images || [],
                        rating: hotel.rating?.average || hotel.rating || 0,
                        facilities: hotel.facilities || []
                    }} />
                )) : (
                    <p className="text-center text-gray-500">No hotels found.</p>
                )}
            </div>

            {/* Filter Bottom Sheet */}
            <FilterBottomSheet
                isOpen={filterSheetOpen}
                onClose={() => setFilterSheetOpen(false)}
                scrollToSection={scrollTarget}
            />

        </section>
    );
};

export default AllHotelsList;
