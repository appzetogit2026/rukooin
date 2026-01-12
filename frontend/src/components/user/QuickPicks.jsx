import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HotelCard from '../cards/HotelCard';
import { hotelService } from '../../services/apiService';
import toast from 'react-hot-toast';

const CARD_WIDTH = 240;
const CARD_GAP = 8;

const AnimatedCard = ({ children, index, scrollX }) => {
    const centerPosition = index * (CARD_WIDTH + CARD_GAP);
    const inputRange = [
        centerPosition - (CARD_WIDTH + CARD_GAP),
        centerPosition,
        centerPosition + (CARD_WIDTH + CARD_GAP)
    ];
    const scale = useTransform(scrollX, inputRange, [0.85, 1, 0.85]);
    const opacity = useTransform(scrollX, inputRange, [1, 1, 1]);

    return (
        <motion.div
            style={{ scale, opacity, zIndex: useTransform(scrollX, inputRange, [0, 10, 0]) }}
            className="snap-center shrink-0 origin-center"
        >
            {children}
        </motion.div>
    );
};

// Simple card without scroll animations (for loading)
const SimpleCard = ({ children }) => {
    return (
        <div className="snap-center shrink-0">
            {children}
        </div>
    );
};

const QuickPicks = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Recommended");
    const [allHotels, setAllHotels] = useState({});
    const [loading, setLoading] = useState(true);

    const currentHotels = allHotels[activeTab] || [];
    const containerRef = useRef(null);

    // Fetch hotels from backend
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                setLoading(true);
                const data = await hotelService.getAll();

                // Categorize hotels dynamically
                const categorized = {
                    Recommended: [],
                    "Recently Viewed": [],
                    Premium: [],
                    Budget: [],
                    Villas: []
                };

                data.forEach(hotel => {
                    const price = parseInt(hotel.pricing?.basePrice || hotel.price || 0);
                    const hotelData = {
                        id: hotel._id || hotel.id,
                        images: hotel.images || [],
                        name: hotel.name,
                        location: hotel.address?.city || hotel.location?.city || "Unknown",
                        rating: (hotel.rating?.average || hotel.rating || 3),
                        isVerified: hotel.isVerified || false,
                        facilities: hotel.facilities || []
                    };

                    // Add to Recommended (all active hotels)
                    if (hotel.isActive !== false) {
                        categorized.Recommended.push(hotelData);
                    }

                    // Categorize by price
                    if (price >= 5000) {
                        categorized.Premium.push(hotelData);
                    } else if (price < 1500) {
                        categorized.Budget.push(hotelData);
                    }

                    // Categorize by type
                    const type = (hotel.propertyType || "").toLowerCase();
                    if (type.includes("villa") || type.includes("cottage")) {
                        categorized.Villas.push(hotelData);
                    }
                });

                // Remove empty categories
                const filtered = {};
                Object.keys(categorized).forEach(key => {
                    if (categorized[key].length > 0) {
                        filtered[key] = categorized[key];
                    }
                });

                setAllHotels(filtered);
            } catch (error) {
                console.error('Failed to fetch hotels:', error);
                toast.error('Failed to load nearby hotels');
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    // Auto-scroll to centered position
    useEffect(() => {
        if (!loading && containerRef.current && currentHotels.length > 1) {
            const centerOffset = (CARD_WIDTH + CARD_GAP);
            containerRef.current.scrollTo({ left: centerOffset, behavior: 'auto' });
        } else if (!loading && containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'auto' });
        }
    }, [activeTab, currentHotels.length, loading]);

    if (loading) {
        return (
            <section className="w-full py-2 relative overflow-hidden">
                <div className="flex justify-between items-center px-5 mb-2 mt-1">
                    <h2 className="text-xl font-bold text-surface">Nearby Hotels</h2>
                </div>
                <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-surface border-t-transparent rounded-full animate-spin"></div>
                </div>
            </section>
        );
    }

    return (
        <QuickPicksContent
            allHotels={allHotels}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentHotels={currentHotels}
            containerRef={containerRef}
            navigate={navigate}
        />
    );
};

// Separate component that uses useScroll - only rendered when not loading
const QuickPicksContent = ({ allHotels, activeTab, setActiveTab, currentHotels, containerRef, navigate }) => {
    const { scrollX } = useScroll({ container: containerRef });

    return (
        <section className="w-full py-2 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-5 mb-2 mt-1">
                <h2 className="text-xl font-bold text-surface">Nearby Hotels</h2>
                <button
                    onClick={() => navigate('/listings')}
                    className="text-accent text-sm font-semibold hover:underline"
                >
                    See All
                </button>
            </div>

            {/* Tabs */}
            {Object.keys(allHotels).length > 0 && (
                <div className="flex gap-2 px-5 mb-3 overflow-x-auto no-scrollbar items-center">
                    {Object.keys(allHotels).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-4 py-2 rounded-full text-xs font-bold transition-colors duration-300 ${activeTab === tab ? 'text-white' : 'text-surface/70 hover:text-surface'}`}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-accent rounded-full shadow-lg shadow-accent/30"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 whitespace-nowrap">{tab}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Cards Carousel */}
            <div
                ref={containerRef}
                className="flex gap-2 overflow-x-auto pb-1 pt-2 snap-x snap-mandatory no-scrollbar px-[calc(50%-120px)]"
            >
                {currentHotels.map((hotel, index) => (
                    <AnimatedCard key={hotel.id} index={index} scrollX={scrollX}>
                        <HotelCard {...hotel} />
                    </AnimatedCard>
                ))}

                {/* Empty State */}
                {currentHotels.length === 0 && (
                    <div className="w-full text-center text-gray-400 py-10 text-sm">
                        No hotels found in this category.
                    </div>
                )}
            </div>

            {/* If no hotels at all */}
            {Object.keys(allHotels).length === 0 && (
                <div className="text-center text-gray-400 py-10 text-sm">
                    No hotels available nearby.
                </div>
            )}
        </section>
    );
};

export default QuickPicks;
