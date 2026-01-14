import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, DollarSign, Calendar, Download, Filter,
    ArrowUpRight, CreditCard, Building2, ShoppingBag
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

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
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const commissionRate = 0.20;

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            try {
                setLoading(true);
                const data = await adminService.getDashboardStats();
                if (data.success) {
                    setStats(data.stats);
                    setTransactions(data.recentBookings || []);
                }
            } catch (error) {
                if (error.response?.status !== 401) {
                    toast.error('Failed to load earnings data');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = filter === 'ALL'
        ? transactions
        : transactions.filter(() => filter === 'BOOKING' ? true : false);

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
                    value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                    subtext=""
                    icon={DollarSign}
                    color="bg-emerald-600"
                />
                <EarningStatCard
                    title="From Bookings (15%)"
                    value={`₹${Math.round((stats?.totalRevenue || 0) * commissionRate).toLocaleString()}`}
                    subtext={`${stats?.confirmedBookings || 0} Commissions`}
                    icon={ShoppingBag}
                    color="bg-blue-600"
                />
                <EarningStatCard
                    title="From Onboarding"
                    value="₹0"
                    subtext=""
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
                                    <p className="text-xs text-gray-500">Platform Commission</p>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900">—</span>
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
                            <span className="font-bold text-gray-900">—</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Projected (Nov)</p>
                                <p className="text-2xl font-bold text-gray-900">₹0</p>
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
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td colSpan="6" className="p-4">
                                            <div className="h-10 bg-gray-50 animate-pulse rounded-lg"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.map((b, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-xs text-gray-500">{b.bookingId || b._id?.slice(-8)}</td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-900">Booking by {b.userId?.name || 'Guest'}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                            BOOKING COMMISSION
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{b.hotelId?.name || 'Unknown Hotel'}</td>
                                    <td className="p-4 text-right font-bold text-emerald-600">
                                        +₹{Math.round((b.totalAmount || 0) * commissionRate).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-center text-gray-500 text-xs">
                                        {new Date(b.createdAt).toLocaleDateString()}
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
