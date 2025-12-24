import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, SlidersHorizontal, MapPin, Calendar, Star, ChevronDown, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import HotelCard from '../../components/cards/HotelCard';
import FilterBottomSheet from '../../components/modals/FilterBottomSheet';

const ListingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Initial State from Navigation
    const { destination: initialDestination, dates, guests, isNearMe } = location.state || {
        destination: "Indore",
        dates: { checkIn: null, checkOut: null },
        guests: { rooms: 1, adults: 2 },
        isNearMe: false
    };

    // 2. Local State
    const [searchQuery, setSearchQuery] = useState(isNearMe ? "" : initialDestination);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [activeFilter, setActiveFilter] = useState(isNearMe ? "Near Me" : "Recommended");
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    // Advanced Filters State (Lifted from FilterBottomSheet)
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [priceRange, setPriceRange] = useState([500, 5000]);
    const [isHighRated, setIsHighRated] = useState(false);

    // Mock Hotels Data (Expanded with Cities)
    const allHotels = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1571474005506-6690ca67b4d9?w=800&q=80",
            name: "Rukko Premier: Skyline",
            location: "Vijay Nagar, Indore",
            city: "Indore",
            price: "2499",
            rating: "4.9",
            tags: ["Recommended", "Luxury", "Flagship", "Rukkos welcome couples", "Near Me"],
            amenities: ["Free Wifi", "Breakfast", "AC", "Parking"]
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
            name: "Rukko Grand: Central",
            location: "Bhawarkua, Indore",
            city: "Indore",
            price: "1899",
            rating: "4.7",
            tags: ["Recommended", "Budget", "Couple Friendly", "Rukkos welcome couples"],
            amenities: ["Couple Friendly", "Parking", "TV"]
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            name: "Rukko Elite: The Palace",
            location: "Old Palasia, Indore",
            city: "Indore",
            price: "3200",
            rating: "5.0",
            tags: ["Recommended", "Luxury", "Business Travellers", "Townhouse"],
            amenities: ["Pool", "Spa", "Gym", "Power backup"]
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
            name: "Rukko Stay: Green View",
            location: "Rau, Indore",
            city: "Indore",
            price: "1200",
            rating: "4.3",
            tags: ["Budget", "Spot On", "Near Me"],
            amenities: ["Budget", "Clean", "CCTV Cameras"]
        },
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
            name: "Rukko Comfort: Airport",
            location: "Airport Road, Indore",
            city: "Indore",
            price: "1500",
            rating: "4.0",
            tags: ["Near Me", "Silver Key"],
            amenities: ["Transfer", "Wifi", "Kitchen"]
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
            name: "Rukko Lake View",
            location: "Shamla Hills, Bhopal",
            city: "Bhopal",
            price: "2200",
            rating: "4.6",
            tags: ["Recommended", "Luxury"],
            amenities: ["Lake View", "Wifi", "Breakfast"]
        },
        {
            id: 7,
            image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
            name: "Rukko Business Hub",
            location: "MP Nagar, Bhopal",
            city: "Bhopal",
            price: "1800",
            rating: "4.4",
            tags: ["Business Travellers", "Budget"],
            amenities: ["Conference Room", "Wifi", "Parking"]
        },
        {
            id: 8,
            image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
            name: "Rukko Marine Drive",
            location: "Marine Drive, Mumbai",
            city: "Mumbai",
            price: "4500",
            rating: "4.8",
            tags: ["Recommended", "Luxury", "Sea View"],
            amenities: ["Sea View", "Pool", "Spa", "Restaurant"]
        },
        {
            id: 9,
            image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
            name: "Rukko Connaught",
            location: "Connaught Place, Delhi",
            city: "Delhi",
            price: "3800",
            rating: "4.7",
            tags: ["Recommended", "Central Location"],
            amenities: ["Metro Nearby", "Restaurant", "Bar"]
        },
        {
            id: 10,
            image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
            name: "Rukko Beach Resort",
            location: "Calangute, Goa",
            city: "Goa",
            price: "3500",
            rating: "4.9",
            tags: ["Recommended", "Beach", "Luxury"],
            amenities: ["Beach Access", "Pool", "Bar", "Wifi"]
        }
    ];

    const filters = ["Recommended", "Price: Low to High", "Rating: 4.5+", "Near Me", "Budget"];

    // 3. Filtering Logic
    const filteredHotels = useMemo(() => {
        return allHotels.filter(hotel => {
            // 1. Search Query / City Filter
            const matchesSearch = searchQuery === "" || searchQuery === "Near Me" ||
                hotel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hotel.city.toLowerCase().includes(searchQuery.toLowerCase());

            // 2. Tab Filter
            let matchesTab = true;
            if (activeFilter === "Recommended") matchesTab = hotel.rating >= 4.5;
            if (activeFilter === "Rating: 4.5+") matchesTab = hotel.rating >= 4.5;
            if (activeFilter === "Budget") matchesTab = parseInt(hotel.price) < 2000;
            if (activeFilter === "Near Me") matchesTab = hotel.tags.includes("Near Me");

            // 3. Advanced Filters
            // Price Range
            const price = parseInt(hotel.price);
            const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

            // High Rated Toggle
            const matchesRating = !isHighRated || hotel.rating >= 4.0;

            // Selected Checkbox Filters
            // Hotel must match ALL selected filters to be rigorous, 
            // OR use .some() if you want broad matching. Let's use strict match for now.
            const matchesAdvancedFilters = selectedFilters.every(filter => {
                const combinedAttributes = [hotel.location, hotel.city, ...hotel.tags, ...hotel.amenities];
                return combinedAttributes.includes(filter);
            });

            return matchesSearch && matchesTab && matchesPrice && matchesRating && matchesAdvancedFilters;
        }).sort((a, b) => {
            if (activeFilter === "Price: Low to High") return parseInt(a.price) - parseInt(b.price);
            return 0; // Default order
        });
    }, [searchQuery, activeFilter, allHotels, selectedFilters, priceRange, isHighRated]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 pb-20"
        >
            {/* 1. Header & Search Bar (Sticky & Premium) */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm pt-safe-top transition-all">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all shrink-0"
                    >
                        <ArrowLeft size={22} className="text-surface" />
                    </button>

                    {/* Interactive Search Field */}
                    <div
                        className={`
                            flex-1 bg-gray-50 border border-gray-200 rounded-full flex items-center shadow-sm transition-all duration-300
                            ${isSearchActive ? 'ring-2 ring-surface/10 bg-white' : ''}
                        `}
                    >
                        {/* Input Area */}
                        <div className="flex-1 flex items-center pl-4 py-2 relative">
                            {/* Animated Placeholder / Value */}
                            <input
                                type="text"
                                value={searchQuery}
                                onFocus={() => setIsSearchActive(true)}
                                onBlur={() => setIsSearchActive(false)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent outline-none text-sm font-bold text-surface placeholder:text-gray-400"
                                placeholder="Search location or hotel..."
                            />
                            {/* Clear Button (only when typing) */}
                            {searchQuery && (
                                <button onMouseDown={(e) => { e.preventDefault(); setSearchQuery(""); }} className="p-1 mr-2 text-gray-400 hover:text-surface">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Search Action / Details */}
                        <div className="pr-1 py-1 flex items-center gap-2">
                            {!isSearchActive && (
                                <span className="text-[10px] text-gray-400 font-medium hidden sm:block whitespace-nowrap">
                                    {dates?.checkIn ? `${new Date(dates.checkIn).getDate()} ${new Date(dates.checkIn).toLocaleString('default', { month: 'short' })}` : ''} • {guests.adults + guests.children} Guest
                                </span>
                            )}
                            <div className="bg-white rounded-full p-2 shadow-sm border border-gray-100 shrink-0">
                                <Search size={16} className="text-accent" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Horizontal Filter Row */}
                <div className="px-4 pb-3 overflow-x-auto no-scrollbar flex gap-2">
                    <button
                        onClick={() => setIsFilterSheetOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap active:scale-95 transition-all shadow-sm
                        ${selectedFilters.length > 0 || isHighRated ? 'bg-surface text-white border-surface' : 'bg-gray-100 text-surface'}`}
                    >
                        <SlidersHorizontal size={14} className={selectedFilters.length > 0 || isHighRated ? "text-white" : "text-surface"} />
                        {(selectedFilters.length > 0 || isHighRated) && (
                            <span className="text-[10px] bg-white text-surface px-1.5 rounded-full font-bold ml-1">
                                {selectedFilters.length + (isHighRated ? 1 : 0)}
                            </span>
                        )}
                    </button>
                    {filters.map((filter, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveFilter(filter)}
                            className={`
                                text-xs font-bold px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300 active:scale-95
                                ${activeFilter === filter
                                    ? 'bg-surface text-white border-surface shadow-lg shadow-surface/20'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Hotel Listings */}
            <div className="p-4 space-y-5">
                {/* Result Count */}
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800">
                        {filteredHotels.length} properties found
                    </h2>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                        Sort by <ChevronDown size={14} />
                    </div>
                </div>

                {filteredHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode='popLayout'>
                            {filteredHotels.map((hotel) => (
                                <motion.div
                                    layout
                                    key={hotel.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <HotelCard {...hotel} className="w-full shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No hotels found</h3>
                        <p className="text-sm text-gray-500">Try changing your location or filters.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveFilter("Recommended");
                                setSelectedFilters([]);
                                setPriceRange([500, 5000]);
                                setIsHighRated(false);
                            }}
                            className="mt-6 text-sm font-bold text-accent underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Filter Bottom Sheet */}
            <FilterBottomSheet
                isOpen={isFilterSheetOpen}
                onClose={() => setIsFilterSheetOpen(false)}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                highRated={isHighRated}
                setHighRated={setIsHighRated}
                filteredCount={filteredHotels.length}
            />

        </motion.div>
    );
};

export default ListingPage;
