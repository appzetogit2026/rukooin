import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Send, Trash2, Users, Hotel, Globe,
    Smartphone, Search, Clock, Info, CheckCircle,
    AlertCircle, Image as ImageIcon, ExternalLink,
    Filter, ChevronLeft, ChevronRight, Loader2, Megaphone
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showCompose, setShowCompose] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        audience: 'all',
        type: 'broadcast',
        actionUrl: '',
        image: ''
    });

    const fetchNotifications = useCallback(async (p = 1) => {
        try {
            setLoading(true);
            const res = await adminService.getNotifications({ page: p, limit: 10 });
            if (res.success) {
                setNotifications(res.notifications);
                setTotal(res.total);
                setPage(res.page);
                setTotalPages(res.totalPages);
            }
        } catch {
            toast.error('Failed to load notification history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handleSendBroadcast = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await adminService.sendBroadcast(formData);
            if (res.success) {
                toast.success('Broadcast sent successfully');
                setShowCompose(false);
                setFormData({
                    title: '', body: '', audience: 'all',
                    type: 'broadcast', actionUrl: '', image: ''
                });
                fetchNotifications(1);
            }
        } catch {
            toast.error('Failed to send broadcast');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm('Remove this record from history?')) return;
        try {
            const res = await adminService.deleteNotificationRecord(id);
            if (res.success) {
                toast.success('Record removed');
                fetchNotifications(page);
            }
        } catch {
            toast.error('Failed to delete record');
        }
    };

    const getAudienceIcon = (aud) => {
        if (aud === 'user') return <Users size={14} className="text-blue-500" />;
        if (aud === 'partner') return <Hotel size={14} className="text-orange-500" />;
        return <Globe size={14} className="text-emerald-500" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24 uppercase tracking-tighter">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                        <Bell size={32} /> Blast Center
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Send push notifications & broadcasts to users and partners.
                    </p>
                </div>

                <button
                    onClick={() => setShowCompose(true)}
                    className="px-8 py-3 bg-black text-white text-[11px] font-black uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Send size={18} /> New Broadcast
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Blasts', value: total, icon: Megaphone, color: 'blue' },
                        { label: 'Platform Reach', value: '1.2k+', icon: Globe, color: 'emerald' },
                        { label: 'Active Devices', value: 'FCM Ready', icon: Smartphone, color: 'indigo' },
                        { label: 'Success Rate', value: '98%', icon: CheckCircle, color: 'green' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className={`w-10 h-10 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Notification List */}
                <div className="lg:col-span-3 bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-sm font-black uppercase tracking-widest">Broadcast History</h3>
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input placeholder="Search logs..." className="pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase outline-none focus:border-black transition-all w-64" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/30 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-4">Title & Message</th>
                                    <th className="px-8 py-4">Target Audience</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Timestamp</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="5" className="px-8 py-8"><div className="h-12 bg-gray-50 rounded-2xl"></div></td>
                                        </tr>
                                    ))
                                ) : notifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <Bell size={48} className="mx-auto text-gray-100 mb-4" />
                                            <p className="text-[10px] font-black text-gray-300 uppercase">No notifications records found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    notifications.map(n => (
                                        <tr key={n._id} className="group hover:bg-gray-50/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {n.image && <img src={n.image} className="w-10 h-10 rounded-xl object-cover" alt="" />}
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 uppercase">{n.title}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase line-clamp-1 max-w-sm">{n.body}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 bg-gray-50 rounded-lg">{getAudienceIcon(n.recipientRole)}</span>
                                                    <span className="text-[10px] font-black uppercase text-gray-600">{n.recipientRole}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${n.type === 'broadcast' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                    {n.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-600 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => handleDeleteRecord(n._id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing log page {page} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button disabled={page === 1} onClick={() => fetchNotifications(page - 1)} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40"><ChevronLeft size={16} /></button>
                            <button disabled={page === totalPages} onClick={() => fetchNotifications(page + 1)} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            <AnimatePresence>
                {showCompose && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowCompose(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full relative z-10 overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase">Compose Broadcast</h3>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Target all devices via FCM</p>
                                </div>
                                <button onClick={() => setShowCompose(false)} className="p-2 hover:bg-white rounded-xl transition-all"><Trash2 size={20} className="text-gray-300" /></button>
                            </div>

                            <form onSubmit={handleSendBroadcast} className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Target Audience</label>
                                            <select
                                                value={formData.audience}
                                                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all"
                                            >
                                                <option value="all">Global (All Users)</option>
                                                <option value="user">Customers Only</option>
                                                <option value="partner">Partners Only</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Context Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all"
                                            >
                                                <option value="broadcast">Announcement</option>
                                                <option value="promotion">Marketing Deal</option>
                                                <option value="system">System Alert</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Notification Title</label>
                                        <input
                                            required placeholder="e.g. Major Update Available"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Push Body Content</label>
                                        <textarea
                                            required rows="3" placeholder="Write your message here..."
                                            value={formData.body}
                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Image URL (Optional)</label>
                                            <input
                                                placeholder="https://..."
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Deep Link / Action URL</label>
                                            <input
                                                placeholder="/offers/rukkoin-special"
                                                value={formData.actionUrl}
                                                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-2xl px-5 py-3 text-[11px] font-black uppercase outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Bell size={18} /> Send Push Notification</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminNotifications;
