import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const ExclusiveOffers = () => {
    const offers = [
        {
            id: 1,
            title: "Book 1, get 1 free!",
            subtitle: "Book for 2 Nights, Pay for 1",
            image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
            bg: "bg-[#1A1A1A]",
            btnText: "Book now"
        },
        {
            id: 2,
            title: "Deal drop @ 7 PM",
            subtitle: "Flat 50% Off on Premium Stays",
            image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
            bg: "bg-[#8B0000]",
            btnText: "Add to Calendar"
        },
        {
            id: 3,
            title: "Couple's Retreat",
            subtitle: "Special Romantic Dinner Included",
            image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600&q=80",
            bg: "bg-[#004F4D]",
            btnText: "Explore"
        }
    ];

    return (
        <section className="py-2 pl-5 mt-2">
            <h2 className="text-xl font-bold text-surface mb-4">Exclusive offers for you</h2>

            <div className="flex gap-4 overflow-x-auto pb-4 pr-5 snap-x no-scrollbar">
                {offers.map((offer) => (
                    <motion.div
                        key={offer.id}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            relative 
                            min-w-[300px] 
                            h-[180px] 
                            rounded-2xl 
                            overflow-hidden 
                            snap-center 
                            shadow-lg
                            cursor-pointer
                        `}
                    >
                        {/* Background Image */}
                        <img
                            src={offer.image}
                            alt={offer.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex flex-col justify-center p-5 text-white`}>

                            <h3 className="text-2xl font-bold leading-tight max-w-[70%]">{offer.title}</h3>
                            <p className="text-xs font-medium text-gray-300 mt-2 max-w-[60%]">{offer.subtitle}</p>

                            <button className="mt-4 w-fit px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition shadow-md">
                                {offer.btnText}
                            </button>
                        </div>

                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ExclusiveOffers;
