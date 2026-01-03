import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TicketPercent, CheckCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const OffersPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const offers = [
        {
            code: "NEWRUKKO",
            title: "Get 75% OFF on your first booking",
            desc: "Valid for new users only. Max discount ₹3500.",
            color: "bg-red-50 border-red-200 text-red-600"
        },
        {
            code: "RUKKO30",
            title: "Flat 30% OFF on all bookings",
            desc: "No minimum booking amount. Valid for all users.",
            color: "bg-blue-50 border-blue-200 text-blue-600"
        },
        {
            code: "WEEKEND50",
            title: "50% OFF on Weekend Stays",
            desc: "Valid on Check-ins for Friday, Saturday, Sunday.",
            color: "bg-green-50 border-green-200 text-green-600"
        },
        {
            code: "HSBC20",
            title: "Extra 20% OFF with HSBC Cards",
            desc: "Pay using HSBC Credit Card to avail this offer.",
            color: "bg-orange-50 border-orange-200 text-orange-600"
        }
    ];

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Copied ${code} to clipboard!`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={20} className="text-surface" />
                </button>
                <h1 className="text-lg font-bold text-surface">Available Offers</h1>
            </div>

            <div className="p-5 space-y-4">
                {offers.map((offer, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`rounded-2xl p-5 border shadow-sm ${offer.color.split(' ')[1]} bg-white`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className={`px-3 py-1 rounded border border-dashed font-bold text-sm tracking-widest ${offer.color}`}>
                                {offer.code}
                            </div>
                            <button onClick={() => copyCode(offer.code)} className="text-gray-400 hover:text-surface transition">
                                <Copy size={16} />
                            </button>
                        </div>
                        <h3 className="font-bold text-surface text-base mb-1">{offer.title}</h3>
                        <p className="text-xs text-gray-500">{offer.desc}</p>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Verified Offer
                            </span>
                            <button className="text-xs font-bold text-blue-600">Apply</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default OffersPage;
