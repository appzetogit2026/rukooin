import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Calendar, MapPin, Shield, CreditCard,
    History, AlertTriangle, Ban, CheckCircle, Lock, Unlock, Loader2
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const UserBookingsTab = ({ bookings }) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                <tr>
                    <th className="p-4 font-bold text-gray-600">Booking ID</th>
                    <th className="p-4 font-bold text-gray-600">Hotel</th>
                    <th className="p-4 font-bold text-gray-600">Date</th>
                    <th className="p-4 font-bold text-gray-600">Status</th>
                    <th className="p-4 font-bold text-gray-600 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {bookings && bookings.length > 0 ? (
                    bookings.map((booking, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-xs text-gray-500">#{booking.bookingId || booking._id.slice(-6)}</td>
                            <td className="p-4 font-bold text-gray-900">{booking.hotelId?.name || 'Deleted Hotel'}</td>
                            <td className="p-4 text-[10px] items-center font-bold text-gray-400 uppercase">{new Date(booking.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {booking.status}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold">₹{booking.totalAmount?.toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400 text-xs font-bold uppercase">No bookings found</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const UserActivityTab = () => (
    <div className="space-y-4">
        {[
            { action: "Login detected from New Delhi", time: "2 hours ago", ip: "192.168.1.1", icon: Lock },
            { action: "Updated profile phone number", time: "2 days ago", ip: "192.168.1.1", icon: User },
            { action: "Failed payment attempt", time: "5 days ago", ip: "192.168.1.1", icon: AlertTriangle },
        ].map((log, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-500">
                    <log.icon size={14} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{log.action}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mt-1">IP: {log.ip} • {log.time}</p>
                </div>
            </div>
        ))}
    </div>
);

const AdminUserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUserDetails(id);
            if (data.success) {
                setUser(data.user);
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [id]);

    const handleBlockToggle = async () => {
        const isBlocked = user.isBlocked;
        setModalConfig({
            isOpen: true,
            title: isBlocked ? 'Unblock User?' : 'Block User?',
            message: isBlocked
                ? `User ${user.name} will regain access to booking and account features.`
                : `Blocking ${user.name} will prevent them from logging in or making new bookings.`,
            type: isBlocked ? 'success' : 'danger',
            confirmText: isBlocked ? 'Unblock' : 'Block',
            onConfirm: async () => {
                try {
                    const res = await adminService.updateUserStatus(user._id, !isBlocked);
                    if (res.success) {
                        toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`);
                        fetchUserDetails();
                    }
                } catch {
                    toast.error('Failed to update user status');
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-gray-400" size={48} />
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Loading user profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">User Not Found</h2>
                <p className="text-gray-500 mt-2">The user you're looking for doesn't exist or has been deleted.</p>
                <Link to="/admin/users" className="mt-6 inline-block text-black font-bold uppercase text-xs border-b-2 border-black pb-1">Back to Users</Link>
            </div>
        );
    }

    const tabs = [
        { id: 'bookings', label: 'Booking History', icon: Calendar },
        { id: 'activity', label: 'Activity Logs', icon: History },
        { id: 'wallet', label: 'Wallet & Refund', icon: CreditCard },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 mb-2">
                <Link to="/admin/users" className="hover:text-black transition-colors">Users</Link>
                <span>/</span>
                <span className="text-black">{user.name}</span>
            </div>

            <div className={`rounded-2xl p-8 border shadow-sm flex flex-col md:flex-row gap-8 transition-colors ${user.isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col items-center md:items-start gap-4 min-w-[200px]">
                    <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg relative uppercase">
                        {user.name.charAt(0)}
                        {user.isBlocked && (
                            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-4 border-white">
                                <Ban size={16} />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">User ID: #{user._id.slice(-6)}</p>
                        {user.isBlocked && <span className="text-xs font-bold text-red-600 mt-1 block uppercase">ACCOUNT BLOCKED</span>}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-gray-900 font-bold">{user.email || 'N/A'}</span>
                            {user.isVerified && <CheckCircle size={14} className="text-green-500" />}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-900 font-bold">{user.phone}</span>
                            <CheckCircle size={14} className="text-green-500" />
                        </div>
                        <div className="flex items-center gap-3 text-sm pt-2">
                            <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-md ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'partner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {user.role} Account
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="p-3 bg-white/50 rounded-lg border border-gray-200/50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Total Spend</span>
                            <span className="text-lg font-bold text-gray-900">₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-gray-200/50 flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Wallet Bal</span>
                            <span className="text-lg font-bold text-green-600">₹0</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[160px]">
                    <button
                        onClick={handleBlockToggle}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold uppercase transition-colors ${user.isBlocked
                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                            }`}
                    >
                        {user.isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                        {user.isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <button className="w-full px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase transition-colors">
                        Reset Password
                    </button>
                </div>
            </div>

            <div>
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBadgeUser"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === 'bookings' && <UserBookingsTab bookings={bookings} />}
                        {activeTab === 'activity' && <UserActivityTab />}
                        {activeTab === 'wallet' && <div className="text-gray-400 py-10 text-center font-bold uppercase text-xs">Wallet Transaction History (Coming Soon)</div>}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUserDetail;
