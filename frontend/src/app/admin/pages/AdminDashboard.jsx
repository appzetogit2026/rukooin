import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Building2, Loader2 } from 'lucide-react';
import AddHotelModal from '../components/AddHotelModal';

// Stat Card Component
const StatCard = ({ title, value, change, isPositive, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
            <Icon size={48} />
        </div>

        <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>

            <div className="flex items-center gap-2">
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {change}
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);

    const handleDownloadReport = () => {
        setIsExporting(true);
        // Simulate Download
        setTimeout(() => {
            setIsExporting(false);
            alert("Monthly Report downloaded successfully.");
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <AddHotelModal isOpen={isAddHotelOpen} onClose={() => setIsAddHotelOpen(false)} />

            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                    <p className="text-gray-500 text-sm">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        disabled={isExporting}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : 'Download Report'}
                    </button>
                    <button
                        onClick={() => setIsAddHotelOpen(true)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Add New Hotel
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="₹45,231.89"
                    change="+20.1%"
                    isPositive={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                />
                <StatCard
                    title="Active Bookings"
                    value="2,345"
                    change="+15.2%"
                    isPositive={true}
                    icon={ShoppingBag}
                    color="text-blue-500"
                />
                <StatCard
                    title="New Users"
                    value="12,345"
                    change="+5.4%"
                    isPositive={true}
                    icon={Users}
                    color="text-purple-500"
                />
                <StatCard
                    title="Hotel Growth"
                    value="34"
                    change="-2.3%"
                    isPositive={false}
                    icon={Building2}
                    color="text-orange-500"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                        <select className="text-xs border border-gray-200 rounded-md p-1 bg-gray-50 text-gray-600 outline-none">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart Simulation */}
                    <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div
                                    className="w-full bg-gray-100 rounded-t-sm relative overflow-hidden group-hover:bg-blue-50 transition-colors"
                                    style={{ height: '100%' }}
                                >
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                        className="absolute bottom-0 w-full bg-black rounded-t-sm opacity-80 group-hover:opacity-100"
                                    ></motion.div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {[
                            { type: '🚀', msg: 'New Hotel "Grand Palace" registered', time: '2 mins ago' },
                            { type: '💰', msg: 'Payout of ₹45,000 released', time: '1 hour ago' },
                            { type: '👤', msg: 'New User "Rahul S." verified', time: '3 hours ago' },
                            { type: '⚠️', msg: 'Dispute raised for Booking #9012', time: '5 hours ago' },
                            { type: '⭐', msg: '5-Star review received for Hotel XYZ', time: '1 day ago' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs">
                                    {item.type}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.msg}</p>
                                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
