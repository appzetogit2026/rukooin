import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import HotelCard from '../cards/HotelCard';

const CARD_WIDTH = 240;
const CARD_GAP = 8;

// Mock Data for Categories
const allHotels = {
    Recommended: [
        { id: 1, image: "https://images.unsplash.com/photo-1571474005506-6690ca67b4d9?w=800&q=80", name: "Grand Hotel Bucuresti", location: "Nicolae Balcescu", price: "2000", rating: "5.0", isVerified: true, amenities: ["2 Beds", "Wifi"] },
        { id: 2, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80", name: "Radisson Blu", location: "Calea Victoriei", price: "1500", rating: "4.8", isVerified: true, amenities: ["1 Bed", "Spa"] },
        { id: 3, image: "https://images.unsplash.com/photo-1590490360182-c583ca46fd08?w=800&q=80", name: "Hilton Athenee", location: "Bucharest", price: "3200", rating: "4.9", isVerified: true, amenities: ["Pool", "Gym"] },
        { id: 4, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", name: "Sheraton", location: "Dorobanti", price: "2800", rating: "4.7", isVerified: true, amenities: ["Gym", "Bar"] },
        { id: 5, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", name: "Marriott", location: "Parliament", price: "3500", rating: "4.9", isVerified: true, amenities: ["Luxury", "Spa"] }
    ],
    "Recently Viewed": [
        { id: 6, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", name: "Lotus Therme", location: "Oradea", price: "2800", rating: "4.7", isVerified: false, amenities: ["Spa", "Pool"] },
        { id: 7, image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80", name: "Alpin Resort", location: "Poiana Brasov", price: "4000", rating: "4.5", isVerified: true, amenities: ["Ski", "Pool"] },
        { id: 8, image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&q=80", name: "Kronwell", location: "Brasov", price: "2200", rating: "4.8", isVerified: true, amenities: ["Business", "Wifi"] }
    ],
    Premium: [
        { id: 9, image: "https://images.unsplash.com/photo-1512918760532-3edbedaa0261?w=800&q=80", name: "Luxury Villa Mamaia", location: "Mamaia", price: "8000", rating: "5.0", isVerified: true, amenities: ["Beach", "Bar"] },
        { id: 10, image: "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?w=800&q=80", name: "Sky Penthouse", location: "Bucharest", price: "12000", rating: "5.0", isVerified: true, amenities: ["View", "Private"] },
        { id: 11, image: "https://images.unsplash.com/photo-1602002418082-a20118a1b6bc?w=800&q=80", name: "Danube Delta Resort", location: "Tulcea", price: "4500", rating: "4.9", isVerified: true, amenities: ["Nature", "Boat"] },
        { id: 12, image: "https://images.unsplash.com/photo-1535827841776-632379036bfe?w=800&q=80", name: "Castle Stay", location: "Transylvania", price: "6000", rating: "4.9", isVerified: true, amenities: ["History", "Tour"] }
    ],
    Budget: [
        { id: 13, image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80", name: "City Hostel", location: "Old Town", price: "500", rating: "4.2", isVerified: false, amenities: ["Bunk", "Wifi"] },
        { id: 14, image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", name: "Pod Hotel", location: "Sector 3", price: "300", rating: "4.0", isVerified: false, amenities: ["Capsule", "Safe"] },
        { id: 15, image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", name: "Guest House", location: "Sibiu", price: "800", rating: "4.6", isVerified: true, amenities: ["Cozy", "Breakfast"] }
    ],
    Villas: [
        { id: 16, image: "https://images.unsplash.com/photo-1613490493576-2f045a12e858?w=800&q=80", name: "Mountain Cabin", location: "Sinaia", price: "3500", rating: "4.9", isVerified: true, amenities: ["Fireplace", "View"] },
        { id: 17, image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80", name: "Lake House", location: "Snagov", price: "5000", rating: "4.8", isVerified: true, amenities: ["Lake", "Boat"] },
        { id: 18, image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80", name: "Forest Retreat", location: "Apuseni", price: "2500", rating: "4.9", isVerified: true, amenities: ["Nature", "Quiet"] }
    ]
};

const AnimatedCard = ({ children, index, scrollX }) => {
    const centerPosition = index * (CARD_WIDTH + CARD_GAP);
    const inputRange = [
        centerPosition - (CARD_WIDTH + CARD_GAP),
        centerPosition,
        centerPosition + (CARD_WIDTH + CARD_GAP)
    ];
    // Slightly adjusted scale/opacity to make the "peek" clearer
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

const QuickPicks = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Recommended");
    // Default to empty array if key not found
    const currentHotels = allHotels[activeTab] || [];

    // Using simple ref for container
    const containerRef = useRef(null);
    const { scrollX } = useScroll({ container: containerRef });

    // Auto-scroll to centered position of *second* item (index 1) if enough items exist
    // so that user sees a card on the left immediately.
    useEffect(() => {
        if (containerRef.current && currentHotels.length > 1) {
            const centerOffset = (CARD_WIDTH + CARD_GAP); // Position of 2nd card
            containerRef.current.scrollTo({ left: centerOffset, behavior: 'auto' });
        } else if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'auto' });
        }
    }, [activeTab, currentHotels.length]);

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

                {/* Empty State if no hotels */}
                {currentHotels.length === 0 && (
                    <div className="w-full text-center text-gray-400 py-10 text-sm">
                        No hotels found in this category.
                    </div>
                )}
            </div>
        </section>
    );
};

export default QuickPicks;
