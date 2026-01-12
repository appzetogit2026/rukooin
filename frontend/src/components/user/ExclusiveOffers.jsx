import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../../services/apiService';
import toast from 'react-hot-toast';

const ExclusiveOffers = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                const data = await offerService.getActive();
                setOffers(data);
            } catch (err) {
                console.error("Fetch Offers Error:", err);
                setError(err.message);
                // toast.error("Failed to load exclusive offers");
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    if (loading) {
        return (
            <div className="py-2 pl-5">
                <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4"></div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {[1, 2].map(i => (
                        <div key={i} className="min-w-[300px] h-[180px] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
                            <Loader2 className="text-gray-200 animate-spin" size={24} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || (offers.length === 0 && !loading)) {
        return null; // Don't show the section if no offers or error
    }

    return (
        <section className="py-2 pl-5 mt-2">
            <h2 className="text-xl font-bold text-surface mb-4 flex items-center gap-2">
                Exclusive offers for you
                <div className="bg-accent/10 px-2 py-0.5 rounded text-[10px] font-bold text-accent">NEW</div>
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-4 pr-5 snap-x no-scrollbar">
                {offers.map((offer) => (
                    <motion.div
                        key={offer._id || offer.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            // Copy code to clipboard as a courtesy
                            navigator.clipboard.writeText(offer.code);
                            toast.success(`Code ${offer.code} copied!`);
                            navigate('/listings');
                        }}
                        className={`
                            relative 
                            min-w-[300px] 
                            h-[180px] 
                            rounded-2xl 
                            overflow-hidden 
                            snap-center 
                            shadow-lg shadow-gray-200/50
                            cursor-pointer
                        `}
                    >
                        {/* Background Image */}
                        <img
                            src={offer.image}
                            alt={offer.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-5 text-white`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-accent text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black leading-tight max-w-[70%] drop-shadow-md">{offer.title}</h3>
                            <p className="text-xs font-semibold text-gray-300 mt-2 max-w-[60%] leading-relaxed drop-shadow-md">{offer.subtitle}</p>

                            <div className="mt-4 flex items-center gap-3">
                                <button className="px-5 py-2 bg-white text-black text-xs font-black rounded-xl hover:shadow-xl transition-all shadow-md active:scale-95">
                                    {offer.btnText || "Copy Code"}
                                </button>
                                <span className="text-[10px] text-white/60 font-medium border-l border-white/20 pl-3">Code: <span className="text-white font-bold">{offer.code}</span></span>
                            </div>
                        </div>

                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ExclusiveOffers;
