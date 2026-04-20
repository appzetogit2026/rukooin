import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../../services/apiService';
import toast from 'react-hot-toast';

const ExclusiveOffers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

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

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1
        })
    };

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + offers.length) % offers.length);
    };

    // Auto-play Logic
    useEffect(() => {
        if (offers.length <= 1) return;
        
        const timer = setInterval(() => {
            paginate(1);
        }, 5000); // Increased to 5 seconds for better readability

        return () => clearInterval(timer);
    }, [offers.length]);

    if (loading) {
        return (
            <div className="py-2 px-5">
                <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4"></div>
                <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center">
                    <Loader2 className="text-gray-200 animate-spin" size={24} />
                </div>
            </div>
        );
    }

    if (error || (offers.length === 0 && !loading)) {
        return null;
    }

    const handleOfferClick = () => {
        navigate('/listings');
    };

    const currentOffer = offers[currentIndex];

    return (
        <section className="py-2 mt-2 w-full overflow-hidden">
            <div className="flex items-center justify-between pl-5 pr-5 mb-4">
                <h2 className="text-xl font-black text-surface flex items-center gap-2 uppercase tracking-tighter">
                    Exclusive offers
                    <span className="bg-surface text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                </h2>
            </div>

            <div className="relative px-5">
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl shadow-surface/5 border border-gray-100 bg-white aspect-[21/9] md:aspect-[3/1]">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 w-full h-full cursor-pointer"
                            onClick={handleOfferClick}
                        >
                            <img
                                src={currentOffer.image}
                                alt={currentOffer.title || 'Offer'}
                                className="w-full h-full object-cover select-none pointer-events-none"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Pagination Dots */}
                {offers.length > 1 && (
                    <div className="flex justify-center items-center gap-1.5 mt-4">
                        {offers.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > currentIndex ? 1 : -1);
                                    setCurrentIndex(idx);
                                }}
                                className={`transition-all duration-500 rounded-full ${
                                    idx === currentIndex 
                                    ? 'w-6 h-2 bg-surface shadow-md shadow-surface/20' 
                                    : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ExclusiveOffers;
