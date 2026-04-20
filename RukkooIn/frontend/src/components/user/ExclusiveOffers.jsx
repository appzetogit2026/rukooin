import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../../services/apiService';
import toast from 'react-hot-toast';

const ExclusiveOffers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    
    // Motion controls for manual swipe and auto-scroll
    const x = useMotionValue(0);
    const controls = useAnimation();

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const data = await offerService.getActive();
                setOffers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch Offers Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    // Handle Infinite Auto-Scroll Animation
    useEffect(() => {
        if (offers.length === 0 || isPaused) {
            controls.stop();
            return;
        }

        const bannerWidth = 232; // item width (220) + gap (12)
        const totalWidth = offers.length * bannerWidth;

        // Create a continuous animation
        const startAnimation = () => {
            const currentX = x.get();
            const distanceLeft = totalWidth + currentX; // How much left before reset
            const duration = (distanceLeft / 40); // 40 pixels per second speed approx

            controls.start({
                x: -totalWidth,
                transition: {
                    duration: duration,
                    ease: "linear",
                    onComplete: () => {
                        x.set(0); // Reset to start for seamless loop
                        startAnimation();
                    }
                }
            });
        };

        startAnimation();

        return () => controls.stop();
    }, [offers.length, isPaused, controls, x]);

    if (loading) {
        return (
            <div className="py-2 pl-5">
                <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-3"></div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {[1, 2].map(i => (
                        <div key={i} className="min-w-[220px] h-[120px] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
                            <Loader2 className="text-gray-200 animate-spin" size={20} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || (offers.length === 0 && !loading)) {
        return null;
    }

    // Triple offers list to give enough buffer for dragging left/right
    const loopedOffers = [...offers, ...offers, ...offers];

    const handleOfferClick = () => {
        // Just navigate to listings, no copying or extra logic.
        navigate('/listings');
    };

    return (
        <section className="py-2 mt-2 overflow-hidden">
            <h2 className="text-xl font-bold text-surface mb-3 flex items-center gap-2 pl-5">
                Exclusive offers for you
                <div className="bg-accent/10 px-2 py-0.5 rounded text-[10px] font-bold text-accent">NEW</div>
            </h2>

            {/* Swipeable & Auto-scroll container */}
            <div className="flex w-full overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.div
                    drag="x"
                    animate={controls}
                    style={{ x, width: 'max-content' }}
                    dragConstraints={{ 
                        left: -((offers.length * 2) * 232), // Logic bound for cloned list
                        right: 0 
                    }}
                    onDragStart={() => setIsPaused(true)}
                    onDragEnd={(event, info) => {
                        setIsPaused(false);
                        // If we dragged too far left/right, snap to reset point
                        const currentX = x.get();
                        const singleListWidth = offers.length * 232;
                        if (currentX < -singleListWidth) {
                            x.set(currentX + singleListWidth);
                        }
                    }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="flex gap-3 pl-5"
                >
                    {loopedOffers.map((offer, idx) => (
                        <div
                            key={`${offer._id || offer.id}-${idx}`}
                            onClick={() => handleOfferClick(offer)}
                            className="relative min-w-[220px] h-[120px] rounded-2xl overflow-hidden shadow-md shadow-gray-200/50 cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
                        >
                            <img
                                src={offer.image}
                                alt={offer.title || 'Offer'}
                                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ExclusiveOffers;
