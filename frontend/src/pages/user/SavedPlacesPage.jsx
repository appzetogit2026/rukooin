import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const SavedPlacesPage = () => {
    const navigate = useNavigate();

    // Load saved hotels from localStorage
    const [savedHotels, setSavedHotels] = React.useState([]);

    React.useEffect(() => {
        const loadSaved = () => {
            const saved = localStorage.getItem('savedHotels');
            if (saved) {
                setSavedHotels(JSON.parse(saved));
            }
        };
        loadSaved();

        // Listen for storage events (if user un-saves in another tab)
        window.addEventListener('storage', loadSaved);
        return () => window.removeEventListener('storage', loadSaved);
    }, []);

    const removeSaved = (e, id) => {
        e.stopPropagation();
        const updated = savedHotels.filter(h => h.id !== id);
        setSavedHotels(updated);
        localStorage.setItem('savedHotels', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-surface text-white p-6 pb-8 rounded-b-[30px] shadow-lg sticky top-0 z-30">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Saved Places</h1>
                </div>
                <h2 className="text-2xl font-black">Your Favorites</h2>
                <p className="text-sm text-white/70">Hotels you have loved and saved.</p>
            </div>

            <div className="px-5 pt-4 relative z-10 space-y-4 pb-24">
                {savedHotels.length > 0 ? (
                    savedHotels.map((hotel, index) => (
                        <motion.div
                            key={hotel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/hotel/${hotel.id}`)}
                            className="bg-white rounded-2xl p-3 shadow-md border border-gray-100 flex gap-3 cursor-pointer active:scale-95 transition-transform"
                        >
                            <img src={hotel.image} alt={hotel.name} className="w-24 h-24 rounded-xl object-cover" />
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-surface text-base line-clamp-1">{hotel.name}</h3>
                                        <button onClick={(e) => removeSaved(e, hotel.id)} className="text-red-500 hover:scale-110 transition-transform">
                                            <Heart size={18} fill="#ef4444" className="text-red-500" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {hotel.location}
                                    </p>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                                        <Star size={10} fill="currentColor" /> {hotel.rating}
                                    </span>
                                    <span className="text-sm font-bold text-surface">₹{hotel.price}<span className="text-[10px] text-gray-400 font-normal">/night</span></span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center pt-20 opacity-50">
                        <Heart size={48} className="text-gray-300 mb-2" />
                        <p className="text-gray-500 font-bold">No saved places yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPlacesPage;
