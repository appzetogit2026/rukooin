import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Tag, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
    const navigate = useNavigate();

    // Mock Notifications
    const notifications = [
        {
            id: 1,
            title: "Booking Confirmed!",
            desc: "Your stay at The Oberoi Grand is confirmed for 12 Oct.",
            type: "booking",
            time: "2 hrs ago",
            icon: Calendar,
            color: "bg-green-100 text-green-600"
        },
        {
            id: 2,
            title: "50% OFF Weekend Sale",
            desc: "Get flat 50% off on all luxury hotels this weekend.",
            type: "offer",
            time: "5 hrs ago",
            icon: Tag,
            color: "bg-purple-100 text-purple-600"
        },
        {
            id: 3,
            title: "Wallet Updated",
            desc: "₹500 has been credited to your Rukko Wallet.",
            type: "wallet",
            time: "1 day ago",
            icon: Info,
            color: "bg-blue-100 text-blue-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-surface text-white p-6 pb-8 rounded-b-[30px] shadow-lg sticky top-0 z-30">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Notifications</h1>
                </div>
                <h2 className="text-2xl font-black">Recent Updates</h2>
                <p className="text-sm text-white/70">Stay updated with your bookings and offers.</p>
            </div>

            <div className="px-5 pt-4 relative z-10 space-y-4 pb-24">
                {notifications.map((notif, index) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                            <notif.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-surface text-sm">{notif.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.desc}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block font-medium">{notif.time}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                    </motion.div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center pt-20 opacity-50">
                        <Bell size={48} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 font-bold">No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
