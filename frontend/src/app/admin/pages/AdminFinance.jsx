import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight,
    CreditCard, Calendar, CheckCircle, Clock, Loader2, Building2, Users
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

// --- MOCK DATA ---
const INITIAL_SUBSCRIPTIONS = [
    { id: 1, hotel: "Grand Palace Hotel", plan: "Premium", type: "PLATFORM", amt: "₹15,000", date: "15 Oct 2024", status: "ACTIVE" },
    { id: 2, hotel: "Ocean View Resort", plan: "Basic", type: "PLATFORM", amt: "₹5,000", date: "14 Oct 2024", status: "ACTIVE" },
    { id: 3, hotel: "Mountain Retreat", plan: "Market Pro", type: "MARKET_DATA", amt: "₹8,000", date: "12 Oct 2024", status: "ACTIVE" },
    { id: 4, hotel: "City Inn", plan: "Market Basic", type: "MARKET_DATA", amt: "₹3,000", date: "10 Oct 2024", status: "ACTIVE" },
];

const FinanceStatCard = ({ title, value, subtext, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtext && <p className={`text-xs mt-1 ${color}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const AdminFinance = () => {
    const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: () => { } });

    // Filter Logic
    const filteredSubscriptions = useMemo(() => {
        if (statusFilter === 'All Status') return subscriptions;
        return subscriptions.filter(s => s.status === statusFilter.toUpperCase());
    }, [subscriptions, statusFilter]);

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Revenue Overview</h2>
                    <p className="text-gray-500 text-sm">Track subscription income and booking commissions.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg">
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FinanceStatCard
                    title="Total Revenue"
                    value="₹3,45,200"
                    subtext="+18% growth"
                    color="text-green-600"
                    icon={TrendingUp}
                />
                <FinanceStatCard
                    title="Platform Subs"
                    value="₹1,80,000"
                    subtext="23 Active Hotels"
                    color="text-blue-600"
                    icon={Building2}
                />
                <FinanceStatCard
                    title="Market Price Subs"
                    value="₹60,000"
                    subtext="8 Hotels subscribed"
                    color="text-orange-600"
                    icon={TrendingUp}
                />
                <FinanceStatCard
                    title="Commissions (20%)"
                    value="₹1,05,200"
                    subtext="From 142 bookings"
                    color="text-purple-600"
                    icon={Wallet}
                />
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform Access Revenue */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <Building2 size={16} className="text-blue-600" />
                                Platform Access
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Core subscription revenue</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Premium</p>
                                <p className="text-xs font-bold text-blue-600">₹1,20,000</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Basic</p>
                                <p className="text-xs font-bold text-blue-600">₹60,000</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Intelligence Revenue */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <TrendingUp size={16} className="text-orange-600" />
                                Market Intelligence
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Plans to see market prices</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Market Pro</p>
                                <p className="text-xs font-bold text-orange-600">₹40,000</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Market Lite</p>
                                <p className="text-xs font-bold text-orange-600">₹20,000</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Commission Revenue */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-purple-50">
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <Wallet size={16} className="text-purple-600" />
                                Commissions
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">20% on confirmed bookings</p>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Bookings</p>
                                <p className="text-xs font-bold text-purple-600">142</p>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs font-bold text-gray-900">Earnings</p>
                                <p className="text-xs font-bold text-purple-600">₹1,05,200</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Subscriptions Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-lg">Active Hotel Subscriptions</h3>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-black"
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Expired</option>
                    </select>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Hotel Name</th>
                            <th className="p-4 font-semibold text-gray-600">Plan</th>
                            <th className="p-4 font-semibold text-gray-600">Monthly Fee</th>
                            <th className="p-4 font-semibold text-gray-600">Next Billing</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <AnimatePresence>
                            {filteredSubscriptions.map((sub, i) => (
                                <motion.tr
                                    key={sub.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="p-4 font-medium text-gray-900">{sub.hotel}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${sub.plan === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {sub.plan}
                                        </span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-900">{sub.amt}</td>
                                    <td className="p-4 text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} /> {sub.nextBilling}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {filteredSubscriptions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">No subscriptions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp size={18} />
                    Subscription Model Details
                </h4>
                <div className="text-sm text-blue-800 space-y-3">
                    <div className="p-3 bg-white/50 rounded-lg border border-blue-100">
                        <p><strong>1. Platform Access Plans:</strong> Core entry fee for hotels to list and take bookings. (Basic/Premium)</p>
                    </div>
                    <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                        <p className="text-orange-900"><strong>2. Market Intelligence Plans:</strong> <span className="font-black">REQUIRED TO VIEW MARKET PRICES.</span> Hotels can subscribe separately to see competitor rates.</p>
                    </div>
                    <p><strong>Booking Commission:</strong> Platform earns 20% commission on every confirmed room booking.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;
