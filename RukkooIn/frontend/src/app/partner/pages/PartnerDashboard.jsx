import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Wallet, Building2, CalendarCheck, TrendingUp, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { useLenis } from '../../shared/hooks/useLenis';
import PartnerSidebar from '../components/PartnerSidebar';
import logo from '../../../assets/rokologin-removebg-preview.png';
import usePartnerStore from '../store/partnerStore';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between min-w-[150px]">
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-2xl font-black text-[#003836]">{value}</h3>
            {subtext && <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
            <Icon size={18} className="text-white" />
        </div>
    </div>
);

const BookingItem = ({ booking }) => (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 mb-2 last:mb-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500 text-xs">
                {booking.userId?.name ? booking.userId.name.charAt(0) : '#'}
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-[#003836] line-clamp-1">{booking.userId?.name || 'Guest'}</p>
                <p className="text-[10px] text-gray-400 font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()} • {booking.bookingStatus}
                </p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm font-bold text-[#004F4D]">₹{booking.totalAmount}</p>
            <p className="text-[10px] text-gray-400 font-medium">Earned</p>
        </div>
    </div>
);

const PartnerDashboard = () => {
    useLenis();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Store
    const { dashboardStats, fetchDashboardData, isDashboardLoading } = usePartnerStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col pb-20 md:pb-6">

            {/* Custom Header */}
            <div className="flex items-center justify-between relative h-14 px-4 pt-2 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-100 transition active:scale-95"
                >
                    <Menu size={20} className="text-[#003836]" />
                </button>

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                    <img
                        src={logo}
                        alt="Rukko Logo"
                        className="h-7 object-contain"
                    />
                </div>

                <button
                    onClick={() => navigate('/hotel/wallet')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm active:scale-95 transition-transform"
                >
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Balance</span>
                        <span className="text-xs font-bold text-[#003836]">₹{dashboardStats.walletBalance.toLocaleString()}</span>
                    </div>
                    <div className="w-6 h-6 bg-[#004F4D] rounded-full flex items-center justify-center">
                        <Wallet size={12} className="text-white" />
                    </div>
                </button>
            </div>

            <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">

                {/* Welcome Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#003836]">Dashboard</h1>
                        <p className="text-gray-500 text-sm font-medium">Here's what's happening with your properties today.</p>
                    </div>
                    <button
                        onClick={() => navigate('/hotel/join')}
                        className="flex items-center gap-2 bg-[#004F4D] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-[#004F4D]/20 active:scale-95 transition-transform w-fit"
                    >
                        <Plus size={18} />
                        <span>Add Property</span>
                    </button>
                </div>

                {isDashboardLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={32} className="text-[#004F4D] animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-400">Loading your dashboard...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <StatCard
                                title="Total Earnings"
                                value={`₹${dashboardStats.totalEarnings.toLocaleString()}`}
                                icon={TrendingUp}
                                color="bg-emerald-500"
                                subtext="Lifetime earnings"
                            />
                            <StatCard
                                title="Active Bookings"
                                value={dashboardStats.totalBookings}
                                icon={CalendarCheck}
                                color="bg-blue-500"
                                subtext="Total reservations"
                            />
                            <StatCard
                                title="Properties"
                                value={dashboardStats.activeProperties}
                                icon={Building2}
                                color="bg-orange-500"
                                subtext="Listed on Rukkoin"
                            />
                        </div>

                        {/* Recent Activity Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Bookings List */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-black text-[#003836]">Recent Bookings</h2>
                                    <button onClick={() => navigate('/hotel/bookings')} className="text-[#004F4D] text-xs font-bold flex items-center gap-1 hover:underline">
                                        View All <ArrowRight size={12} />
                                    </button>
                                </div>

                                {dashboardStats.recentBookings.length > 0 ? (
                                    <div className="space-y-1">
                                        {dashboardStats.recentBookings.map((booking) => (
                                            <BookingItem key={booking._id} booking={booking} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CalendarCheck size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">No bookings yet</p>
                                        <p className="text-xs text-gray-300 mt-1">Your recent bookings will appear here</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions / Promo */}
                            <div className="space-y-6">
                                <div className="bg-[#004F4D] rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-[#004F4D]/20">
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-black mb-2">Grow Your Business</h3>
                                        <p className="text-white/80 text-xs font-medium mb-4 leading-relaxed">
                                            Add more properties to reach more guests and increase your earnings.
                                        </p>
                                        <button
                                            onClick={() => navigate('/hotel/join')}
                                            className="bg-white text-[#004F4D] px-4 py-2 rounded-lg text-xs font-bold"
                                        >
                                            Add New Property
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                    <div className="absolute top-4 right-4 text-white/10">
                                        <Building2 size={64} />
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-black text-[#003836] mb-4">Quick Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs font-medium">
                                            <span className="text-gray-500">Profile Completion</span>
                                            <span className="text-[#004F4D] font-bold">85%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-[#004F4D] h-1.5 rounded-full w-[85%]"></div>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center text-xs font-medium">
                                            <span className="text-gray-500">Response Rate</span>
                                            <span className="text-[#004F4D] font-bold">100%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-[#004F4D] h-1.5 rounded-full w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default PartnerDashboard;
