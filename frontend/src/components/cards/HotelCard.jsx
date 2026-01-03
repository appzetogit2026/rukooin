import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Wifi, Dumbbell, ImageOff, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80";

const HotelCard = ({
    id,
    image,
    name,
    location,
    price,
    rating,
    amenities = [],
    className
}) => {
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    // Check if saved via local storage (simple implementation)
    const [isSaved, setIsSaved] = useState(() => {
        const saved = localStorage.getItem('savedHotels');
        if (!saved) return false;
        return JSON.parse(saved).some(h => h.id === id);
    });

    const displayImage = (image && !imgError) ? image : PLACEHOLDER_IMAGE;

    const toggleSave = (e) => {
        e.stopPropagation(); // Prevent navigation
        const newState = !isSaved;
        setIsSaved(newState);

        const currentSaved = JSON.parse(localStorage.getItem('savedHotels') || '[]');
        if (newState) {
            // Add
            const newItem = { id, image, name, location, price, rating };
            localStorage.setItem('savedHotels', JSON.stringify([...currentSaved, newItem]));
        } else {
            // Remove
            const filtered = currentSaved.filter(h => h.id !== id);
            localStorage.setItem('savedHotels', JSON.stringify(filtered));
        }
    };

    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/hotel/${id}`)}
            className={twMerge(
                "bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 w-[240px] cursor-pointer group transition-shadow hover:shadow-md",
                className
            )}
        >
            {/* Image Container */}
            <div className="relative h-40 w-full bg-gray-200">
                <img
                    src={displayImage}
                    alt={name}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Price Tag */}

                {/* Heart Icon for Saved Places */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={toggleSave}
                    className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-md rounded-full shadow-lg z-10 hover:bg-white/30 transition-colors"
                >
                    <Heart
                        size={18}
                        className={`transition-colors duration-300 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                </motion.button>

                {/* Price Tag */}
                <div className="absolute top-4 right-4 bg-gray-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    <span className="text-white font-bold text-sm">
                        ₹{price}<span className="text-[10px] font-normal opacity-80 pl-1">/night</span>
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-3 text-surface">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold leading-tight line-clamp-1 group-hover:text-accent transition-colors">{name}</h3>
                    {/* Rating */}
                    <div className="flex items-center gap-1 bg-surface/5 px-1.5 py-0.5 rounded-md">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-1">
                    <MapPin size={12} /> {location}
                </p>

                {/* Amenities Row */}
                <div className="flex gap-3 mt-4 text-gray-400 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md">
                        <BedDouble size={14} className="text-accent" /> 2 Beds
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md">
                        <Wifi size={14} className="text-accent" /> Wifi
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md">
                        <Dumbbell size={14} className="text-accent" /> Gym
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HotelCard;
