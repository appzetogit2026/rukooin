import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, User, MapPin, CreditCard, Clock,
    CheckCircle, XCircle, AlertTriangle, FileText,
    Download, ShieldCheck, Phone, Mail
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminBookingDetail = () => {
    const { id } = useParams();
    const [status, setStatus] = useState("CONFIRMED");
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    // Status Colors
    const getStatusColor = (s) => {
        if (s === 'CONFIRMED') return 'text-green-600 bg-green-50 border-green-200';
        if (s === 'CANCELLED') return 'text-red-600 bg-red-50 border-red-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const handleCancel = () => {
        setModalConfig({
            isOpen: true,
            title: 'Cancel Booking?',
            message: `Are you sure you want to cancel booking #${id}? This will trigger a refund process if applicable.`,
            type: 'danger',
            confirmText: 'Yes, Cancel Booking',
            onConfirm: () => setStatus('CANCELLED')
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Nav */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link to="/admin/bookings" className="hover:text-black transition-colors">Bookings</Link>
                <span>/</span>
                <span>#{id || 'BK-90123'}</span>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">Booking #{id || 'BK-90123'}</h1>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(status)} flex items-center gap-1`}>
                            {status === 'CONFIRMED' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Booked on 12 Oct 2024 • via Mobile App</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download size={16} /> Invoice
                    </button>
                    {status !== 'CANCELLED' && (
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Main Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stay Details */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <Calendar size={16} /> Stay Details
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Check-in</p>
                                <p className="text-lg font-bold text-gray-900">15 Oct 2024</p>
                                <p className="text-sm text-gray-500">12:00 PM</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Check-out</p>
                                <p className="text-lg font-bold text-gray-900">18 Oct 2024</p>
                                <p className="text-sm text-gray-500">11:00 AM</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-900 mb-1">Hotel: Grand Palace Hotel</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin size={12} /> New Delhi, Connaught Place
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Guest Details */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <User size={16} /> Guest Information
                        </div>
                        <div className="p-6 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                RS
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Rahul Sharma</h4>
                                <div className="flex flex-col gap-1 mt-1">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Mail size={12} /> rahul.sharma@gmail.com
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Phone size={12} /> +91 98765 43210
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Payment */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-semibold text-gray-800 text-sm flex items-center gap-2">
                            <CreditCard size={16} /> Payment Summary
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Room Rate (3 Nights)</span>
                                <span className="font-medium">₹10,500</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Taxes & Fees</span>
                                <span className="font-medium">₹1,900</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium text-emerald-600">Platform Fee (12%)</span>
                                <span className="font-bold text-emerald-600">₹1,260</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Discount</span>
                                <span className="font-medium text-green-600">-₹500</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total Paid</span>
                                <span className="text-xl font-bold text-gray-900">₹11,900</span>
                            </div>
                            <div className="pt-2">
                                <span className="flex items-center justify-center w-full py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100">
                                    <ShieldCheck size={12} className="mr-1" /> Payment Verified via UPI
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1">
                            <AlertTriangle size={14} /> Admin Note
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            This booking was flagged for high value verification. Customer called support to confirm early check-in.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingDetail;
