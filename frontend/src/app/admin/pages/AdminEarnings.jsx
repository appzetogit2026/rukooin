import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Calendar, Download, Filter,
    ArrowUpRight, CreditCard, Building2, ShoppingBag
} from 'lucide-react';

const EarningStatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtext && <p className="text-xs mt-1 text-green-600 flex items-center gap-1"><ArrowUpRight size={10} /> {subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const AdminEarnings = () => {
    const [filter, setFilter] = useState('ALL'); // ALL, BOOKING, REGISTRATION

    // Mock Earnings Data
    const earnings = [
        { id: "TXN-1001", source: "Booking #BK-90123", type: "BOOKING_COMMISSION", hotel: "Grand Palace Hotel", amount: "₹1,240", date: "15 Oct 2024", status: "CLEARED" },
        { id: "TXN-1002", source: "New Hotel Registration", type: "REGISTRATION_FEE", hotel: "Ocean View Resort", amount: "₹5,000", date: "14 Oct 2024", status: "CLEARED" },
        { id: "TXN-1003", source: "Booking #BK-90124", type: "BOOKING_COMMISSION", hotel: "Grand Palace Hotel", amount: "₹850", date: "12 Oct 2024", status: "PENDING" },
        { id: "TXN-1004", source: "Market Price Subscription", type: "MARKET_INTEL", hotel: "Mountain Retreat", amount: "₹8,000", date: "10 Oct 2024", status: "CLEARED" },
        { id: "TXN-1005", source: "Premium Plan Upgrade", type: "SUBSCRIPTION", hotel: "City Inn", amount: "₹2,500", date: "09 Oct 2024", status: "CLEARED" },
    ];

    const filteredEarnings = filter === 'ALL' ? earnings : earnings.filter(e =>
        filter === 'BOOKING' ? e.type === 'BOOKING_COMMISSION' : e.type !== 'BOOKING_COMMISSION'
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Earnings</h2>
                    <p className="text-gray-500 text-sm">Detailed breakdown of platform commissions and fees.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-black focus:border-black block p-2.5 outline-none"
                    >
                        <option value="ALL">All Sources</option>
                        <option value="BOOKING">Booking Commissions</option>
                        <option value="REGISTRATION">Registration/Fees</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg">
                        <Download size={16} /> Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EarningStatCard
                    title="Total Earning"
                    value="₹4,25,000"
                    subtext="+12% this month"
                    icon={DollarSign}
                    color="bg-emerald-600"
                />
                <EarningStatCard
                    title="From Bookings (15%)"
                    value="₹3,10,000"
                    subtext="245 Commissions"
                    icon={ShoppingBag}
                    color="bg-blue-600"
                />
                <EarningStatCard
                    title="From Onboarding"
                    value="₹1,15,000"
                    subtext="23 New Hotels"
                    icon={Building2}
                    color="bg-purple-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graph Section (Placeholder for Chart) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Earning Trends</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Bookings
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div> Reg. Fees
                            </span>
                        </div>
                    </div>
                    {/* Simulated Graph */}
                    <div className="flex h-64 items-end justify-between gap-1 px-2">
                        {[40, 60, 45, 70, 50, 80, 65, 90, 75, 85, 60, 95].map((h, i) => (
                            <div key={i} className="w-full h-full flex flex-col justify-end gap-1 group">
                                <div className="relative w-full rounded-t-sm overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors" style={{ height: '100%' }}>
                                    {/* Booking Bar (Blue) */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h * 0.7}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05 }}
                                        className="absolute bottom-0 w-full bg-blue-500 opacity-80"
                                    ></motion.div>
                                    {/* Reg Fee Bar (Purple) - Stacked */}
                                    <motion.div
                                        initial={{ height: 0, bottom: 0 }}
                                        animate={{ height: `${h * 0.3}%`, bottom: `${h * 0.7}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }}
                                        className="absolute w-full bg-purple-500 opacity-80"
                                    ></motion.div>
                                </div>
                                <span className="text-[10px] text-gray-400 text-center font-medium">
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4">Income Sources</h3>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <ShoppingBag size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Room Bookings</p>
                                    <p className="text-xs text-gray-500">15% Commission</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">73%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Registrations</p>
                                    <p className="text-xs text-gray-500">One-time Fee</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">27%</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Projected (Nov)</p>
                                <p className="text-2xl font-bold text-gray-900">₹5,20,000</p>
                            </div>
                            <TrendingUp size={24} className="text-green-500 mb-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-gray-900">
                    Recent Earning Transactions
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Transaction ID</th>
                                <th className="p-4 font-semibold text-gray-600">Description</th>
                                <th className="p-4 font-semibold text-gray-600">Type</th>
                                <th className="p-4 font-semibold text-gray-600">Hotel</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Credit Amount</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEarnings.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-xs text-gray-500">{item.id}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900">{item.source}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'BOOKING_COMMISSION'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                                            }`}>
                                            {item.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{item.hotel}</td>
                                    <td className="p-4 text-right font-bold text-emerald-600">
                                        +{item.amount}
                                    </td>
                                    <td className="p-4 text-center text-gray-500 text-xs">
                                        {item.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminEarnings;
