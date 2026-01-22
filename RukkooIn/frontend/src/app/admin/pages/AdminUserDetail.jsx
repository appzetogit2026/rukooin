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

const UserActivityTab = ({ user, bookings }) => {
    const activities = [
        {
            action: "Account Registered",
            time: new Date(user.createdAt).toLocaleDateString() + ' ' + new Date(user.createdAt).toLocaleTimeString(),
            ip: "System Generated",
            icon: Lock
        },
        ...(bookings || []).map(b => ({
            action: `Made a booking at ${b.propertyId?.propertyName || 'Property'}`,
            time: new Date(b.createdAt).toLocaleDateString() + ' ' + new Date(b.createdAt).toLocaleTimeString(),
            ip: "Verified Booking",
            icon: Calendar
        }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    return (
        <div className="space-y-4">
            {activities.map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-500">
                        <log.icon size={14} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">{log.action}</p>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mt-1">{log.ip} • {log.time}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UserWalletTab = ({ wallet, transactions }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Balance</p>
                <p className="text-2xl font-black text-green-600">₹{wallet?.balance?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Earnings</p>
                <p className="text-2xl font-black text-gray-900">₹{wallet?.totalEarnings?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Settled Payouts</p>
                <p className="text-2xl font-black text-blue-600">₹{wallet?.totalWithdrawals?.toLocaleString() || 0}</p>
            </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Transaction History</h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">Showing Last {transactions?.length || 0}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Transaction Details</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions && transactions.length > 0 ? (
                            transactions.map((tx, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">{tx.description}</p>
                                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">REF: {tx.reference || tx._id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {tx.category?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            tx.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-10 text-center text-gray-300 font-bold uppercase text-[10px] tracking-widest">No transaction history found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const AdminUserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
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
                setWallet(data.wallet);
                setTransactions(data.transactions);
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
                    const res = await adminService.updateUserStatus(user._id, { isBlocked: !isBlocked });
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

    const handleSuspiciousToggle = async () => {
        const isSuspicious = user.isSuspicious;
        try {
            const res = await adminService.updateUserStatus(user._id, { isSuspicious: !isSuspicious });
            if (res.success) {
                toast.success(`User marked as ${!isSuspicious ? 'suspicious' : 'normal'}`);
                fetchUserDetails();
            }
        } catch {
            toast.error('Failed to update user flag');
        }
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

            <div className={`rounded-3xl p-8 border shadow-sm flex flex-col md:flex-row gap-8 transition-all ${user.isBlocked ? 'bg-red-50 border-red-200' : user.isSuspicious ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                <div className="flex flex-col items-center md:items-start gap-4 min-w-[200px]">
                    <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl relative uppercase">
                        {user.name.charAt(0)}
                        {user.isSuspicious && (
                            <div className="absolute -top-1 -left-1 bg-orange-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Suspicious Flag">
                                <AlertTriangle size={14} />
                            </div>
                        )}
                        {user.isBlocked && (
                            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                                <Ban size={16} />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-widest mt-1">UUID: {user._id}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {user.isBlocked && <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full uppercase">Account Blocked</span>}
                            {user.isSuspicious && <span className="text-[10px] font-bold text-white bg-orange-600 px-2 py-0.5 rounded-full uppercase">Suspicious Flag</span>}
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                <Mail size={14} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Email Address</p>
                                <span className="text-gray-900 font-bold text-xs">{user.email || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                                <Phone size={14} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Mobile Number</p>
                                <span className="text-gray-900 font-bold text-xs">{user.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm pt-2">
                            <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-lg ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'partner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {user.role} Account Status
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Total Spend</span>
                            <span className="text-lg font-black text-gray-900 leading-none">₹{bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Wallet Bal</span>
                            <span className="text-lg font-black text-green-600 leading-none">₹{wallet?.balance?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[180px]">
                    <button
                        onClick={handleBlockToggle}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${user.isBlocked
                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                            }`}
                    >
                        {user.isBlocked ? <Unlock size={14} /> : <Ban size={14} />}
                        {user.isBlocked ? 'Unlock Guest' : 'Block Access'}
                    </button>

                    <button
                        onClick={handleSuspiciousToggle}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${user.isSuspicious
                            ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                            }`}
                    >
                        <AlertTriangle size={14} />
                        {user.isSuspicious ? 'Mark Normal' : 'Flag Suspicious'}
                    </button>

                    <button className="w-full px-4 py-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase transition-colors shadow-sm">
                        View Audit Log
                    </button>
                </div>
            </div>

            <div>
                <div className="flex border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase transition-all relative whitespace-nowrap tracking-wider ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabBadgeUserDetail"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === 'bookings' && <UserBookingsTab bookings={bookings} />}
                        {activeTab === 'activity' && <UserActivityTab user={user} bookings={bookings} />}
                        {activeTab === 'wallet' && <UserWalletTab wallet={wallet} transactions={transactions} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUserDetail;
