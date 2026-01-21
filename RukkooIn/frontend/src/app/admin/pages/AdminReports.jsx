import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    TrendingUp, ArrowUpRight, ArrowDownRight, Download,
    Calendar, Users, Building2, MapPin, PieChart as PieChartIcon,
    Activity, DollarSign, Loader2, RotateCcw
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const COLORS = ['#000000', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminReports = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getAnalytics();
            if (res.success) {
                // Transform data for charts
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                const transformedMonthly = res.monthly.map(item => ({
                    name: `${months[item._id.month - 1]} ${item._id.year}`,
                    revenue: item.revenue,
                    bookings: item.bookings
                }));

                const transformedGrowth = [];
                const growthMap = {};
                res.growth.forEach(item => {
                    const key = `${months[item._id.month - 1]} ${item._id.year}`;
                    if (!growthMap[key]) growthMap[key] = { name: key, user: 0, partner: 0 };
                    growthMap[key][item._id.role] = item.count;
                });
                Object.keys(growthMap).forEach(key => transformedGrowth.push(growthMap[key]));

                setAnalytics({
                    ...res,
                    monthly: transformedMonthly,
                    growth: transformedGrowth
                });
            }
        } catch {
            toast.error('Failed to generate analytics report');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await adminService.exportBookings();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rukkoin-bookings-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report exported successfully');
        } catch {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="animate-spin text-black" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Compiling platform data & KPIs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 uppercase tracking-tighter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                        <TrendingUp size={32} /> Intelligence & BI
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Real-time revenue tracking, market penetration, and growth analytics.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={loadData} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-black">
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-8 py-3 bg-black text-white text-[11px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Export CSV Report
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Revenue', value: `₹${analytics?.monthly.reduce((a, b) => a + b.revenue, 0).toLocaleString()}`, delta: '+12.5%', icon: DollarSign, color: 'emerald' },
                    { label: 'Booking Lifetime', value: analytics?.distribution.reduce((a, b) => a + b.count, 0), delta: '+8.2%', icon: Calendar, color: 'blue' },
                    { label: 'Active Users', value: '1.2k', delta: '+22%', icon: Users, color: 'indigo' },
                    { label: 'Provider Growth', value: '450+', delta: '+5%', icon: Building2, color: 'orange' }
                ].map((stat, i) => (
                    <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-end gap-3 mt-1">
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                <span className="flex items-center text-[9px] font-black p-1 rounded-lg bg-emerald-50 text-emerald-600 mb-1">
                                    <ArrowUpRight size={10} /> {stat.delta}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. Revenue Trends */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Revenue Lifecycle</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Gross platform transaction value over 12 months</p>
                        </div>
                        <Activity size={20} className="text-gray-200" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.monthly}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. User/Partner Growth */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">User vs Partner Acquisition</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Monthly growth rate of ecosystem participants</p>
                        </div>
                        <Users size={20} className="text-gray-200" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics?.growth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', marginTop: '20px' }} />
                                <Line type="monotone" dataKey="user" stroke="#6366f1" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
                                <Line type="monotone" dataKey="partner" stroke="#f59e0b" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Booking Distribution (Pie) */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Triage Breakdown</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Distribution of bookings by lifecycle status</p>
                        </div>
                        <PieChartIcon size={20} className="text-gray-200" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.distribution}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="_id"
                                >
                                    {analytics?.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Top Cities (Geo-Analytics) */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Market Penetration</h3>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Top 10 performing cities by volume</p>
                        </div>
                        <MapPin size={20} className="text-gray-200" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics?.cities} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#000' }} width={80} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }} />
                                <Bar dataKey="totalBookings" fill="#000" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminReports;
