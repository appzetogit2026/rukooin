import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, MapPin, Search, History, Sparkles, Calendar as CalendarIcon, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../../components/cards/HotelCard';

const SearchPage = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(0);
    const [searchFocused, setSearchFocused] = useState(false);

    // Mock Date Generation
    const days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            id: i,
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: date.getDate(),
            fullDate: date
        };
    });

    const recentSearches = [
        "Vijay Nagar, Indore", "Bhawarkua", "Rau Pithampur"
    ];

    const suggestedHotels = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1571474005506-6690ca67b4d9?w=800&q=80",
            name: "Rukko Premier: Skyline",
            location: "Indore, Vijay Nagar",
            price: "2000",
            rating: "5.0",
            isVerified: true,
            amenities: ["2 Beds", "Wifi"]
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
            name: "Rukko Grand: Central",
            location: "Calea Victoriei",
            price: "1500",
            rating: "4.8",
            isVerified: true,
            amenities: ["1 Bed", "Spa"]
        }
    ];

    const popularCities = [
        { name: "Indore", image: "https://images.unsplash.com/photo-1564053489984-317bbd824340?w=200&q=80" },
        { name: "Bhopal", image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&q=80" },
        { name: "Ujjain", image: "https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=200&q=80" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50/50 pb-20 relative"
        >
            {/* Background Decorative Elements */}
            <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-b from-teal-50/50 to-transparent -z-10" />

            {/* Header section with Glassmorphism */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] pt-safe-top">
                <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Top Row: Back & Title */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:scale-105 active:scale-95 transition-all text-surface"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-lg font-bold text-surface tracking-tight">Plan your stay</h1>
                    </div>

                    {/* Search Input - Hero Style */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`
                            relative flex items-center bg-white rounded-2xl shadow-lg shadow-gray-200/50 border transition-all duration-300
                            ${searchFocused ? 'ring-2 ring-surface/10 border-surface' : 'border-transparent'}
                        `}
                    >
                        <div className="pl-4 pr-3 text-surface">
                            <Search size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 py-3.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Destination</label>
                            <input
                                type="text"
                                placeholder="Search 'Vijay Nagar'..."
                                className="w-full bg-transparent outline-none text-base font-bold text-surface placeholder-gray-300"
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                autoFocus
                            />
                        </div>
                        <button className="mr-2 p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-surface hover:bg-gray-100 transition-colors">
                            <Map size={20} />
                        </button>
                    </motion.div>
                </div>

                {/* Date Scroll Row - Integrated into Header area for better UX */}
                <div className="pl-5 pb-4 overflow-x-auto no-scrollbar flex gap-3">
                    {days.map((d, i) => (
                        <motion.button
                            key={d.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            onClick={() => setSelectedDate(i)}
                            className={`
                                flex-shrink-0 flex flex-col items-center justify-center 
                                w-[62px] h-[72px] rounded-2xl border transition-all duration-300 relative overflow-hidden group
                                ${selectedDate === i
                                    ? 'bg-surface text-white border-surface shadow-lg shadow-surface/20 translate-y-[-2px]'
                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                }
                            `}
                        >
                            {/* Shiny effect on active */}
                            {selectedDate === i && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                            )}

                            <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${selectedDate === i ? 'text-white/80' : 'text-gray-400'}`}>{d.day}</span>
                            <span className="text-xl font-bold font-outfit">{d.date}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-5 pt-6 pb-24 space-y-8">

                {/* 1. Quick Location Action */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-2xl flex items-center gap-4 group"
                >
                    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 w-full border border-blue-100/50">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <MapPin size={22} fill="currentColor" className="text-blue-600/20" strokeWidth={2.5} />
                            <MapPin size={22} className="absolute text-blue-600" strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-surface">Near Current Location</h4>
                            <p className="text-xs text-gray-500 font-medium">Find stays around you</p>
                        </div>
                    </div>
                </motion.button>

                {/* 2. Recent Searches */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <History size={18} className="text-gray-400" />
                        <h3 className="text-sm font-bold text-surface">Recent Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {recentSearches.map((term, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2 shadow-sm hover:shadow-md hover:border-surface/20 transition-all"
                            >
                                <Search size={14} className="text-gray-400" />
                                {term}
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* 3. Popular Cities */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <Sparkles size={18} className="text-yellow-500 fill-yellow-500" />
                        <h3 className="text-sm font-bold text-surface">Popular Cities</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {popularCities.map((city, i) => (
                            <motion.div
                                key={i}
                                className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer"
                            >
                                <img src={city.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                                <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white mb-1">{city.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 4. Suggested Stays - Using existing Hotel Cards */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-base font-bold text-surface">Suggested for You</h3>
                        <span className="text-xs font-bold text-accent cursor-pointer">View All</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {suggestedHotels.map((hotel, index) => (
                            <motion.div
                                key={hotel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                            >
                                <HotelCard {...hotel} className="w-full" />
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>
        </motion.div>
    );
};

export default SearchPage;
