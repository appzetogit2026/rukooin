import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Building2, Search, Filter, MoreVertical, MapPin,
    CheckCircle, XCircle, Clock, Star, ShieldAlert, Trash2, Edit, Eye
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

// --- MOCK DATA ---
const INITIAL_HOTELS = [
    { id: 1, name: "Grand Palace Hotel", location: "New Delhi", owner: "Rajesh Kumar", rooms: 45, status: "ACTIVE", rating: 4.5, earnings: "₹1,20,000" },
    { id: 2, name: "Ocean View Resort", location: "Goa", owner: "Anita Roy", rooms: 20, status: "PENDING", rating: 0, earnings: "₹0" },
    { id: 3, name: "Mountain Retreat", location: "Manali", owner: "Vikram Singh", rooms: 12, status: "REJECTED", rating: 0, earnings: "₹0" },
    { id: 4, name: "City Center Inn", location: "Mumbai", owner: "Suresh Patil", rooms: 60, status: "ACTIVE", rating: 3.8, earnings: "₹5,40,000" },
    { id: 5, name: "Lakeside Villa", location: "Udaipur", owner: "Meera Reddy", rooms: 8, status: "PENDING", rating: 0, earnings: "₹0" },
];

const HotelStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
        REJECTED: 'bg-red-100 text-red-700 border-red-200',
        BLOCKED: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const icons = {
        ACTIVE: <CheckCircle size={12} className="mr-1" />,
        PENDING: <Clock size={12} className="mr-1" />,
        REJECTED: <XCircle size={12} className="mr-1" />,
        BLOCKED: <ShieldAlert size={12} className="mr-1" />,
    };

    return (
        <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
            {icons[status] || icons.PENDING}
            {status}
        </span>
    );
};

const AdminHotels = () => {
    const [hotels, setHotels] = useState(INITIAL_HOTELS);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null); // ID of row with open menu

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    // Filter Logic
    const filteredHotels = useMemo(() => {
        return hotels.filter(h =>
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.owner.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [hotels, searchQuery]);

    // Handlers
    const handleAction = (action, hotel) => {
        setActiveDropdown(null);
        if (action === 'delete') {
            setModalConfig({
                isOpen: true,
                title: 'Delete Hotel?',
                message: `Are you sure you want to permanently delete "${hotel.name}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                onConfirm: () => {
                    setHotels(prev => prev.filter(h => h.id !== hotel.id));
                }
            });
        } else if (action === 'approve') {
            setModalConfig({
                isOpen: true,
                title: 'Approve Hotel?',
                message: `This will make "${hotel.name}" live on the platform for bookings.`,
                type: 'success',
                confirmText: 'Approve',
                onConfirm: () => {
                    setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, status: 'ACTIVE' } : h));
                }
            });
        } else if (action === 'reject') {
            setModalConfig({
                isOpen: true,
                title: 'Reject Hotel?',
                message: `Rejecting "${hotel.name}" will prevent it from going live. Owner will be notified.`,
                type: 'warning',
                confirmText: 'Reject',
                onConfirm: () => {
                    setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, status: 'REJECTED' } : h));
                }
            });
        }
    };

    return (
        <div className="space-y-6 relative" onClick={() => setActiveDropdown(null)}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hotel Partners</h2>
                    <p className="text-gray-500 text-sm">Manage listings, approvals, and quality control.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search hotels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">Hotel Name</th>
                                <th className="p-4">Owner</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Inventory</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4 text-right">Revenue</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredHotels.length > 0 ? (
                                    filteredHotels.map((hotel, index) => (
                                        <motion.tr
                                            key={hotel.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors group relative"
                                        >
                                            <td className="p-4">
                                                <Link to={`/admin/hotels/${hotel.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                        <Building2 size={18} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{hotel.name}</p>
                                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                            <MapPin size={10} className="mr-1" />
                                                            {hotel.location}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-700 font-medium">{hotel.owner}</p>
                                                <p className="text-xs text-gray-400">ID: #{9000 + hotel.id}</p>
                                            </td>
                                            <td className="p-4">
                                                <HotelStatusBadge status={hotel.status} />
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-700">{hotel.rooms} Rooms</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                    <span className="font-medium">{hotel.rating > 0 ? hotel.rating : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right text-sm font-medium text-gray-900">
                                                {hotel.earnings}
                                            </td>
                                            <td className="p-4 text-center relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === hotel.id ? null : hotel.id); }}
                                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === hotel.id && (
                                                    <div className="absolute right-8 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 text-left">
                                                        <Link to={`/admin/hotels/${hotel.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                                                            <Eye size={14} /> View Details
                                                        </Link>
                                                        {hotel.status === 'PENDING' && (
                                                            <>
                                                                <button onClick={() => handleAction('approve', hotel)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-sm text-green-700">
                                                                    <CheckCircle size={14} /> Approve
                                                                </button>
                                                                <button onClick={() => handleAction('reject', hotel)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-700">
                                                                    <XCircle size={14} /> Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {hotel.status === 'REJECTED' && (
                                                            <button onClick={() => handleAction('approve', hotel)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-sm text-green-700">
                                                                <CheckCircle size={14} /> Re-Approve
                                                            </button>
                                                        )}
                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button onClick={() => handleAction('delete', hotel)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-medium">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">
                                            No hotels found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Showing {filteredHotels.length} results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHotels;
