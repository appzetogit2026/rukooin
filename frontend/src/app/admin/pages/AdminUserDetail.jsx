import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Calendar, MapPin, Shield, CreditCard,
    History, AlertTriangle, Ban, CheckCircle, Lock, Unlock
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const UserBookingsTab = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 font-semibold text-gray-600">Booking ID</th>
                    <th className="p-4 font-semibold text-gray-600">Hotel</th>
                    <th className="p-4 font-semibold text-gray-600">Date</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {[
                    { id: "BK-9012", hotel: "Grand Palace Hotel", date: "15 Oct 2024", status: "COMPLETED", amount: "12,400" },
                    { id: "BK-8821", hotel: "Ocean View Resort", date: "12 Sep 2024", status: "CANCELLED", amount: "5,200" },
                    { id: "BK-7743", hotel: "Mountain Retreat", date: "05 Aug 2024", status: "COMPLETED", amount: "8,900" },
                ].map((booking, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-xs text-gray-500">{booking.id}</td>
                        <td className="p-4 font-medium text-gray-900">{booking.hotel}</td>
                        <td className="p-4 text-gray-500">{booking.date}</td>
                        <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {booking.status}
                            </span>
                        </td>
                        <td className="p-4 text-right font-medium">₹{booking.amount}</td>
                    </tr>
                ))}
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
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">IP: {log.ip} • {log.time}</p>
                </div>
            </div>
        ))}
    </div>
);

const AdminUserDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('bookings');
    const [isBlocked, setIsBlocked] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    const tabs = [
        { id: 'bookings', label: 'Booking History', icon: Calendar },
        { id: 'activity', label: 'Activity Logs', icon: History },
        { id: 'wallet', label: 'Wallet & Refund', icon: CreditCard },
    ];

    const handleBlockToggle = () => {
        setModalConfig({
            isOpen: true,
            title: isBlocked ? 'Unblock User?' : 'Block User?',
            message: isBlocked
                ? 'User will regain access to booking and account features.'
                : 'Blocking this user will prevent them from logging in or making new bookings.',
            type: isBlocked ? 'success' : 'danger',
            confirmText: isBlocked ? 'Unblock' : 'Block',
            onConfirm: () => setIsBlocked(!isBlocked)
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header / Nav */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link to="/admin/users" className="hover:text-black transition-colors">Users</Link>
                <span>/</span>
                <span>User Details</span>
            </div>

            {/* Profile Header */}
            <div className={`rounded-2xl p-8 border shadow-sm flex flex-col md:flex-row gap-8 transition-colors ${isBlocked ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col items-center md:items-start gap-4 min-w-[200px]">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 border-4 border-white shadow-lg relative">
                        R
                        {isBlocked && (
                            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-4 border-white">
                                <Ban size={16} />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl font-bold text-gray-900">Rahul Sharma</h1>
                        <p className="text-sm text-gray-500">User ID: #USER-10234</p>
                        {isBlocked && <span className="text-xs font-bold text-red-600 mt-1 block">ACCOUNT BLOCKED</span>}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail size={16} className="text-gray-400" />
                            <span className="text-gray-900 font-medium">rahul.sharma@gmail.com</span>
                            <CheckCircle size={14} className="text-green-500" />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-900 font-medium">+91 98765 43210</span>
                            <CheckCircle size={14} className="text-green-500" />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={16} className="text-gray-400" />
                            <span className="text-gray-600">New Delhi, India</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="p-3 bg-white/50 rounded-lg border border-gray-200/50 flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Total Spend</span>
                            <span className="text-lg font-bold text-gray-900">₹45,200</span>
                        </div>
                        <div className="p-3 bg-white/50 rounded-lg border border-gray-200/50 flex justify-between items-center">
                            <span className="text-xs text-gray-500 uppercase font-semibold">Wallet Bal</span>
                            <span className="text-lg font-bold text-green-600">₹1,200</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[160px]">
                    <button
                        onClick={handleBlockToggle}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isBlocked
                                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                            }`}
                    >
                        {isBlocked ? <Unlock size={16} /> : <Ban size={16} />}
                        {isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                    <button className="w-full px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                        Reset Password
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div>
                <div className="flex border-b border-gray-200 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
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
                        {activeTab === 'bookings' && <UserBookingsTab />}
                        {activeTab === 'activity' && <UserActivityTab />}
                        {activeTab === 'wallet' && <div className="text-gray-400 py-10 text-center">Wallet Transaction History (Coming Soon)</div>}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminUserDetail;
