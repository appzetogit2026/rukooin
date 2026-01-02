import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Search, Filter, MoreVertical,
    CheckCircle, XCircle, Clock, ArrowRight, X, AlertTriangle, Eye,
    FileText, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

// --- MOCK DATA ---
const INITIAL_BOOKINGS = [
    { id: "BK-90123", hotel: "Grand Palace Hotel", guest: "Rahul Sharma", checkIn: "15 Oct 2024", checkOut: "18 Oct 2024", amount: "₹12,400", status: "CONFIRMED", bookedOn: "12 Oct 2024" },
    { id: "BK-90124", hotel: "Ocean View Resort", guest: "Anita Roy", checkIn: "20 Oct 2024", checkOut: "22 Oct 2024", amount: "₹8,500", status: "PENDING", bookedOn: "18 Oct 2024" },
    { id: "BK-90125", hotel: "Grand Palace Hotel", guest: "Vikram Singh", checkIn: "10 Nov 2024", checkOut: "12 Nov 2024", amount: "₹4,200", status: "CANCELLED", bookedOn: "01 Nov 2024" },
    { id: "BK-90126", hotel: "Mountain Retreat", guest: "Suresh Patil", checkIn: "05 Dec 2024", checkOut: "10 Dec 2024", amount: "₹15,000", status: "COMPLETED", bookedOn: "25 Nov 2024" },
    { id: "BK-90127", hotel: "City Center Inn", guest: "Meera Reddy", checkIn: "01 Jan 2025", checkOut: "05 Jan 2025", amount: "₹10,000", status: "CONFIRMED", bookedOn: "15 Dec 2024" },
    { id: "BK-90128", hotel: "Lakeside Villa", guest: "Arjun K.", checkIn: "12 Feb 2025", checkOut: "14 Feb 2025", amount: "₹6,500", status: "CONFIRMED", bookedOn: "10 Jan 2025" },
    { id: "BK-90129", hotel: "Grand Palace Hotel", guest: "Priya S.", checkIn: "20 Feb 2025", checkOut: "25 Feb 2025", amount: "₹22,000", status: "PENDING", bookedOn: "18 Feb 2025" },
];

const BookingStatusBadge = ({ status }) => {
    const styles = {
        CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
        CANCELLED: 'bg-red-100 text-red-700 border-red-200',
        COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
        REFUNDED: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const icons = {
        CONFIRMED: <CheckCircle size={10} className="mr-1" />,
        PENDING: <Clock size={10} className="mr-1" />,
        CANCELLED: <XCircle size={10} className="mr-1" />,
        COMPLETED: <CheckCircle size={10} className="mr-1" />,
        REFUNDED: <ArrowRight size={10} className="mr-1" />,
    };

    return (
        <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.PENDING}`}>
            {icons[status] || icons.PENDING}
            {status}
        </span>
    );
};

const MetricCard = ({ label, value, subLabel }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
        </div>
    </div>
);

const AdminBookings = () => {
    const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    // Filter Logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesSearch =
                b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.guest.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchQuery, statusFilter]);

    // Stats Calculation
    const stats = useMemo(() => {
        return {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length,
            cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
            pending: bookings.filter(b => b.status === 'PENDING').length
        };
    }, [bookings]);

    // Handlers
    const handleAction = (action, booking) => {
        setActiveDropdown(null);
        if (action === 'cancel') {
            setModalConfig({
                isOpen: true,
                title: 'Cancel Booking?',
                message: `Are you sure you want to cancel booking #${booking.id}? This will trigger a refund process if applicable.`,
                type: 'danger',
                confirmText: 'Yes, Cancel',
                onConfirm: () => {
                    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'CANCELLED' } : b));
                }
            });
        }
    };

    return (
        <div className="space-y-6 relative pb-10" onClick={() => setActiveDropdown(null)}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
                <p className="text-gray-500 text-sm">Monitor all reservations and their current statuses.</p>
            </div>

            {/* Metrics Overview */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <MetricCard label="Total Bookings" value={stats.total} subLabel="All time" />
                <MetricCard label="Confirmed / Completed" value={stats.confirmed} subLabel={`${Math.round((stats.confirmed / stats.total) * 100)}% rate`} />
                <MetricCard label="Pending Approval" value={stats.pending} subLabel="Needs attention" />
                <MetricCard label="Cancelled" value={stats.cancelled} subLabel="Lost revenue" />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3 flex-1">
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search via ID, Guest or Hotel Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm"
                        />
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
                            <Filter size={16} />
                            {statusFilter === 'ALL' ? 'All Status' : statusFilter}
                        </button>
                        <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-20">
                            {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                                >
                                    {status.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Booking ID</th>
                                <th className="p-4">Hotel Name</th>
                                <th className="p-4">Guest Info</th>
                                <th className="p-4">Dates</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking, index) => (
                                        <motion.tr
                                            key={booking.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors group relative"
                                        >
                                            <td className="p-4">
                                                <Link to={`/admin/bookings/${booking.id}`} className="font-mono text-sm font-medium text-gray-900 hover:underline">
                                                    #{booking.id}
                                                </Link>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Booked: {booking.bookedOn}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-medium text-gray-900">{booking.hotel}</span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {booking.guest}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs text-gray-600 flex flex-col gap-1">
                                                    <span className="flex items-center gap-1"><ArrowRight size={10} className="text-green-500" /> In: {booking.checkIn}</span>
                                                    <span className="flex items-center gap-1"><ArrowRight size={10} className="text-red-500" /> Out: {booking.checkOut}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <BookingStatusBadge status={booking.status} />
                                            </td>
                                            <td className="p-4 text-right font-semibold text-gray-900">
                                                {booking.amount}
                                            </td>
                                            <td className="p-4 text-center relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === booking.id ? null : booking.id); }}
                                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown */}
                                                {activeDropdown === booking.id && (
                                                    <div className="absolute right-8 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 text-left">
                                                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase">Manage Booking</p>
                                                        </div>
                                                        <Link to={`/admin/bookings/${booking.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                                                            <Eye size={14} /> View Details
                                                        </Link>
                                                        <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                                                            <FileText size={14} /> Download Invoice
                                                        </button>
                                                        {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                                                            <button onClick={() => handleAction('cancel', booking)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600">
                                                                <XCircle size={14} /> Cancel Booking
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
                                            No bookings found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Showing {filteredBookings.length} of {bookings.length} results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>1</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">2</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">3</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
