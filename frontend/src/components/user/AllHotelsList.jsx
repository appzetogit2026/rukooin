import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterBottomSheet from '../modals/FilterBottomSheet';

const ListingCard = ({ hotel }) => {
    const navigate = useNavigate();

    // Check if saved via local storage
    const [isSaved, setIsSaved] = useState(() => {
        const saved = localStorage.getItem('savedHotels');
        if (!saved) return false;
        return JSON.parse(saved).some(h => h.id === hotel.id);
    });

    const toggleSave = (e) => {
        e.stopPropagation(); // Prevent navigation
        const newState = !isSaved;
        setIsSaved(newState);

        const currentSaved = JSON.parse(localStorage.getItem('savedHotels') || '[]');
        if (newState) {
            // Add
            const newItem = {
                id: hotel.id,
                image: hotel.image,
                name: hotel.name,
                location: hotel.location,
                price: hotel.price,
                rating: hotel.rating
            };
            localStorage.setItem('savedHotels', JSON.stringify([...currentSaved, newItem]));
        } else {
            // Remove
            const filtered = currentSaved.filter(h => h.id !== hotel.id);
            localStorage.setItem('savedHotels', JSON.stringify(filtered));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
            onClick={() => navigate(`/hotel/${hotel.id}`)}
        >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full group cursor-pointer hover:shadow-md transition-all duration-300">
                <div className="relative h-48 w-full">
                    <img src={hotel.image} className="w-full h-full object-cover" alt={hotel.name} />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-xs font-bold text-surface flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={12} className="text-surface" /> Company-Serviced
                    </div>

                    {/* Heart Button */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={toggleSave}
                        className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors z-10"
                    >
                        <Heart
                            size={18}
                            className={`transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                        />
                    </motion.button>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-surface">{hotel.name}</h3>
                        <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                            {hotel.rating} <span className="text-[10px]">★</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{hotel.location}</p>

                    <div className="mt-4 flex gap-2 items-center">
                        <span className="text-xl font-bold text-surface">₹{hotel.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{parseInt(hotel.price) + 800}</span>
                        <span className="text-xs font-bold text-orange-500">38% OFF</span>
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

    // Mock Data (simulating a larger list)
    const hotels = [
        {
            id: 101,
            image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
            name: "Rukko Premier: Skyline",
            location: "Indore, Vijay Nagar",
            price: "1299",
            rating: "4.5",
            isVerified: true,
            amenities: ["Wifi", "AC", "TV"]
        },
        {
            id: 102,
            image: "https://images.unsplash.com/photo-1590490360182-c583ca46fd08?w=800&q=80",
            name: "Rukko Townhouse: Elite",
            location: "Bhawarkua, Indore",
            price: "999",
            rating: "4.2",
            isVerified: true,
            amenities: ["Wifi", "Parking"]
        },
        {
            id: 103,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            name: "Hotel Sai Palace",
            location: "Near Railway Station",
            price: "850",
            rating: "4.0",
            isVerified: false,
            amenities: ["Geyser", "CCTV"]
        },
        {
            id: 104,
            image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
            name: "Rukko Flagship: Central",
            location: "MG Road, Indore",
            price: "1500",
            rating: "4.8",
            isVerified: true,
            amenities: ["Elevator", "Breakfast"]
        }
    ];

    return (
        <section className="w-full px-5 py-2 pb-24">

            {/* 1. Results Count & Price Info */}
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-surface">87 Rukkos found</h2>
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
                {hotels.map((hotel, index) => (
                    <ListingCard key={hotel.id} hotel={hotel} />
                ))}
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
