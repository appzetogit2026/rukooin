import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Building2, Loader2, Clock } from 'lucide-react';
import AddHotelModal from '../components/AddHotelModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

// Stat Card Component
const StatCard = ({ title, value, change, isPositive, icon: Icon, color, loading }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
            <Icon size={48} />
        </div>

        <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-md mb-2"></div>
            ) : (
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
            )}

            <div className="flex items-center gap-2">
                <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                    {change}
                </span>
                <span className="text-xs text-gray-400">total overall</span>
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            if (data.success) {
                setStats(data.stats);
                setRecentBookings(data.recentBookings);
                setRecentRequests(data.recentPropertyRequests);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            toast.success("Monthly Report generated successfully.");
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
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    change="+0%"
                    isPositive={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    change="+0%"
                    isPositive={true}
                    icon={ShoppingBag}
                    color="text-blue-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    change="+0%"
                    isPositive={true}
                    icon={Users}
                    color="text-purple-500"
                    loading={loading}
                />
                <StatCard
                    title="Pending Properties"
                    value={stats?.pendingHotels || 0}
                    change="Review needed"
                    isPositive={false}
                    icon={Building2}
                    color="text-orange-500"
                    loading={loading}
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        Recent Bookings
                    </h3>

                    <div className="flex-1 space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)
                        ) : recentBookings.length > 0 ? (
                            recentBookings.map((booking, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                            {booking.userId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{booking.userId?.name || 'Guest User'}</p>
                                            <p className="text-xs text-gray-500">{booking.hotelId?.name || 'Unknown Hotel'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">₹{booking.totalAmount}</p>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ShoppingBag size={48} className="mb-2 opacity-20" />
                                <p>No recent bookings found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Requests */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-gray-400" />
                        Pending Property Requests
                    </h3>

                    <div className="flex-1 space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)
                        ) : recentRequests.length > 0 ? (
                            recentRequests.map((hotel, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{hotel.name}</p>
                                            <p className="text-xs text-gray-500">by {hotel.ownerId?.name || 'Partner'}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-black bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                        View Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Building2 size={48} className="mb-2 opacity-20" />
                                <p>No pending requests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
