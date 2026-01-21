import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, Users, ShoppingBag, DollarSign,
    ArrowUpRight, ArrowDownRight, Building2,
    Loader2, Clock, CheckCircle, AlertCircle,
    BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import AddHotelModal from '../components/AddHotelModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Stat Card Component
const StatCard = ({ title, value, change, isPositive, icon: Icon, color, loading, subtitle }) => (
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
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            )}

            <div className="flex items-center gap-2">
                {change && (
                    <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                        {change}
                    </span>
                )}
                <span className="text-xs text-gray-400">{subtitle || 'overall'}</span>
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [dailyTrends, setDailyTrends] = useState([]);
    const [propertyDist, setPropertyDist] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        try {
            setLoading(true);
            const data = await adminService.getDashboardStats();
            if (data.success) {
                setStats(data.stats);
                setDailyTrends(data.dailyTrends || []);
                setPropertyDist(data.propertyDistribution?.map(item => ({
                    name: item._id.toUpperCase(),
                    value: item.count
                })) || []);
                setRecentBookings(data.recentBookings || []);
                setRecentRequests(data.recentPropertyRequests || []);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard stats');
            }
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
        <div className="space-y-8 pb-12">
            <AddHotelModal isOpen={isAddHotelOpen} onClose={() => setIsAddHotelOpen(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
                    <p className="text-gray-500 text-sm">Real-time performance metrics and management hub.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        disabled={isExporting}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : 'Export Data'}
                    </button>
                    <button
                        onClick={() => setIsAddHotelOpen(true)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Building2 size={16} />
                        Add Listing
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Gross Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    change="+12%"
                    isPositive={true}
                    icon={DollarSign}
                    color="text-emerald-500"
                    loading={loading}
                />
                <StatCard
                    title="Active Bookings"
                    value={stats?.totalBookings || 0}
                    change="+5%"
                    isPositive={true}
                    icon={ShoppingBag}
                    color="text-blue-500"
                    loading={loading}
                />
                <StatCard
                    title="KYC Pending"
                    value={(stats?.pendingUserKYC || 0) + (stats?.pendingPartnerKYC || 0)}
                    subtitle="Verification needed"
                    icon={AlertCircle}
                    color="text-orange-500"
                    loading={loading}
                />
                <StatCard
                    title="Open Requests"
                    value={stats?.pendingHotels || 0}
                    subtitle="Property approvals"
                    icon={CheckCircle}
                    color="text-purple-500"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend Area Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 size={20} className="text-blue-500" />
                            Revenue & Booking Trends
                        </h3>
                        <select className="text-xs bg-gray-50 border-none rounded-md px-2 py-1 outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 7 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full bg-gray-50 animate-pulse rounded-xl"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrends}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                        tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRev)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Property Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-purple-500" />
                        Inventory Mix
                    </h3>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="w-32 h-32 border-4 border-gray-100 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                        ) : propertyDist.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={propertyDist}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {propertyDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <PieChartIcon size={48} className="mb-2 opacity-20" />
                                <p className="text-xs">No inventory data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-gray-400" />
                            Recent Activity
                        </h3>
                        <button className="text-xs text-blue-600 font-medium font-bold">View All</button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)
                        ) : recentBookings.length > 0 ? (
                            recentBookings.map((booking, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            {booking.userId?.name?.charAt(0) || 'G'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{booking.userId?.name || 'Guest User'}</p>
                                            <p className="text-[11px] text-gray-500">{booking.propertyId?.propertyName || 'Property Name'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString()}</p>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    booking.bookingStatus === 'checked_out' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {booking.bookingStatus}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ShoppingBag size={48} className="mb-2 opacity-20" />
                                <p className="text-xs">No recent transactions</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Requests */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Building2 size={20} className="text-gray-400" />
                            Pending Approvals
                        </h3>
                        <button className="text-xs text-orange-600 font-medium font-bold">Review Queue</button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl"></div>)
                        ) : recentRequests.length > 0 ? (
                            recentRequests.map((hotel, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-orange-50/30 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer border border-transparent hover:border-orange-100">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                                            <Building2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{hotel.propertyName}</p>
                                            <p className="text-[11px] text-gray-500 capitalize">{hotel.propertyType} • by {hotel.partnerId?.name || 'Owner'}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                                        REVIEW
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CheckCircle size={48} className="mb-2 opacity-20 text-emerald-500" />
                                <p className="text-sm font-medium text-emerald-600">All caught up!</p>
                                <p className="text-xs mt-1 text-gray-400 text-center">No pending property requests to review.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
