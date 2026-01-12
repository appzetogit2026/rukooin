import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, Wifi, Tv, Car, Wine, Shield, Flame,
    Dumbbell, Wind, Waves, Utensils, Heart, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { userService } from '../../services/apiService';
import toast from 'react-hot-toast';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80";

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

const HotelCard = ({
    id,
    images = [],
    name,
    location,
    rating = 0,
    facilities = [],
    className
}) => {
    const navigate = useNavigate();
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const gallery = images.filter(img =>
        ['facade', 'reception', 'common'].includes(img.category?.toLowerCase()) || !img.category
    ).map(img => img.url || img);

    const displayImages = gallery.length > 0 ? gallery : [PLACEHOLDER_IMAGE];

    // Check if saved on mount
    useEffect(() => {
        const checkSavedStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // We can't easily check for a single hotel without fetching all saved or having the user object
                // For now, check local storage cache if available, or just rely on state
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user?.savedHotels?.includes(id)) {
                    setIsSaved(true);
                }
            } catch (err) {
                console.error("Failed to check saved status", err);
            }
        };
        checkSavedStatus();
    }, [id]);

    const handleScroll = (e) => {
        const width = e.target.offsetWidth;
        const scrollLeft = e.target.scrollLeft;
        const index = Math.round(scrollLeft / width);
        setCurrentImgIndex(index);
    };

    const toggleSave = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to save hotels');
            return;
        }

        if (loading) return;

        try {
            setLoading(true);
            const res = await userService.toggleSavedHotel(id);
            setIsSaved(!isSaved);

            // Update local user object to keep it in sync
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (res.savedHotels) {
                user.savedHotels = res.savedHotels;
                localStorage.setItem('user', JSON.stringify(user));
            }

            toast.success(isSaved ? 'Removed from saved places' : 'Added to saved places');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to update saved places');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/hotel/${id}`)}
            className={twMerge(
                "bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-[260px] cursor-pointer group transition-all duration-300 hover:shadow-lg",
                className
            )}
        >
            {/* Image Scroller */}
            <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                <div
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full scroll-smooth"
                >
                    {displayImages.map((src, i) => (
                        <div key={i} className="min-w-full h-full snap-center">
                            <img
                                src={src}
                                className="h-full w-full object-cover"
                                alt={`${name} - ${i + 1}`}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>

                {/* Dots Indicator */}
                {displayImages.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 px-1.5 py-1 bg-black/20 backdrop-blur-md rounded-full pointer-events-none">
                        {displayImages.map((_, i) => (
                            <div
                                key={i}
                                className={twMerge(
                                    "w-1 h-1 rounded-full transition-all duration-300",
                                    currentImgIndex === i ? "bg-white w-2.5" : "bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                )}

                {/* Heart Icon */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    disabled={loading}
                    onClick={toggleSave}
                    className="absolute top-2.5 left-2.5 p-2 bg-black/10 backdrop-blur-md rounded-full shadow-lg z-10 hover:bg-black/20 transition-all border border-white/20"
                >
                    <Heart
                        size={16}
                        className={`transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                </motion.button>
            </div>

            {/* Content Body */}
            <div className="p-4 pt-3 text-surface">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-lg font-bold tracking-tight text-surface leading-snug line-clamp-1">{name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-lg border border-yellow-100">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold text-yellow-700">{rating || 3}</span>
                    </div>
                </div>

                <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {location}
                </p>

                {/* Facilities Row */}
                <div className="flex flex-wrap gap-1.5 mt-3 border-t border-gray-50 pt-3">
                    {facilities.slice(0, 3).map((facility, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg text-gray-500 border border-transparent">
                            <span className="text-accent">{FACILITY_ICONS[facility.toLowerCase()] || <Shield size={10} />}</span>
                            {facility}
                        </div>
                    ))}
                    {facilities.length > 3 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold uppercase bg-gray-50 px-1.5 py-1 rounded-lg text-gray-400">
                            +{facilities.length - 3}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HotelCard;
