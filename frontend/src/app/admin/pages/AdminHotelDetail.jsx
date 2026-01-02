import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, CheckCircle, XCircle, FileText,
    ChevronLeft, Star, Bed, Calendar, ShieldCheck, AlertCircle,
    MoreVertical, Download, Search, Ban, Wifi, Phone, Mail, Tv, Coffee, Wind
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

// --- Tab Components ---

const OverviewTab = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 size={18} /> Property Information
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Property Type</span>
                        <span className="font-medium">Luxury Hotel</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Founded</span>
                        <span className="font-medium">2018</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Floors</span>
                        <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Starting Price</span>
                        <span className="font-medium">₹4,500</span>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} /> Contact & Location
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium">contact@grandpalace.com</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">+91 98765 43210</span>
                    </div>
                    <div className="pt-2">
                        <span className="text-gray-500 block mb-1">Full Address</span>
                        <span className="font-medium block text-gray-800 leading-relaxed">
                            12, Mahatma Gandhi Road, Near Central Park,
                            Connaught Place, New Delhi - 110001
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">About Property</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
                The Grand Palace is a flagship property located in the heart of Delhi.
                Featuring 45 premium rooms, a rooftop pool, and world-class dining, it caters to both business and leisure travelers.
                Known for its exceptional hospitality and strategic location.
            </p>
        </div>

        {/* Amenities Grid */}
        <div>
            <h3 className="font-semibold text-gray-900 mb-3">Amenities & Facilities</h3>
            <div className="flex flex-wrap gap-3">
                {[
                    { name: 'Free Wi-Fi', icon: Wifi },
                    { name: 'Swimming Pool', icon: Wind },
                    { name: 'Restaurant', icon: Coffee },
                    { name: 'TV', icon: Tv },
                    { name: 'Parking', icon: MapPin },
                    { name: 'Spa', icon: Star },
                ].map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                        <amenity.icon size={14} className="text-gray-400" />
                        {amenity.name}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const DocumentsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['GST Registration', 'PAN Card', 'Hotel License', 'Fire Safety NOC', 'FSSAI License'].map((doc, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">VERIFIED</span>
                </div>
                <h4 className="font-medium text-gray-900">{doc}</h4>
                <p className="text-xs text-gray-500 mt-1">Uploaded on 12 Jan 2024</p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-100 group-hover:bg-blue-500 transition-colors"></div>
            </div>
        ))}
    </div>
);

const RoomsTab = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Room Inventory</h3>
            <button className="text-sm font-medium text-blue-600 hover:underline">Manage Inventory</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {[
                { type: "Deluxe King", price: "4,500", avail: 12, size: "350 sq.ft", bed: "King Bed", view: "City View" },
                { type: "Premium Twin", price: "5,200", avail: 8, size: "400 sq.ft", bed: "2 Twin Beds", view: "Pool View" },
                { type: "Executive Suite", price: "8,900", avail: 4, size: "650 sq.ft", bed: "King Bed", view: "Garden View" },
            ].map((room, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400">
                        <Bed size={32} />
                    </div>
                    <div className="flex-1 w-full text-center md:text-left">
                        <h4 className="font-bold text-gray-900 text-lg">{room.type}</h4>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {room.size}</span>
                            <span className="flex items-center gap-1"><Bed size={12} /> {room.bed}</span>
                            <span className="flex items-center gap-1"><Wind size={12} /> {room.view}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Available</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">{room.avail}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Price / Night</p>
                            <p className="text-xl font-bold text-gray-900">₹{room.price}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const BookingsTab = () => (
    <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Booking ID, Guest..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-black"
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                    Total: <span className="font-bold text-gray-900">142 Bookings</span>
                </div>
                <button className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Download size={14} /> Export
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="p-4 font-semibold text-gray-600">Booking ID</th>
                        <th className="p-4 font-semibold text-gray-600">Guest</th>
                        <th className="p-4 font-semibold text-gray-600">Check-In</th>
                        <th className="p-4 font-semibold text-gray-600">Duration</th>
                        <th className="p-4 font-semibold text-gray-600">Status</th>
                        <th className="p-4 font-semibold text-gray-600 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        { id: "BK-9012", guest: "Aravind K.", in: "15 Oct 2025", duration: "3 Nights", status: "CONFIRMED", amt: "12,400" },
                        { id: "BK-9013", guest: "Sarah J.", in: "18 Oct 2025", duration: "1 Night", status: "PENDING", amt: "4,500" },
                        { id: "BK-9014", guest: "Mike R.", in: "20 Oct 2025", duration: "2 Nights", status: "CANCELLED", amt: "8,900" },
                        { id: "BK-9015", guest: "Priya S.", in: "22 Oct 2025", duration: "4 Nights", status: "CONFIRMED", amt: "15,200" },
                        { id: "BK-9016", guest: "John D.", in: "25 Oct 2025", duration: "2 Nights", status: "COMPLETED", amt: "9,000" },
                    ].map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            <td className="p-4 font-mono text-xs text-gray-500">#{b.id}</td>
                            <td className="p-4 font-medium text-gray-900">{b.guest}</td>
                            <td className="p-4 text-gray-500">{b.in}</td>
                            <td className="p-4 text-gray-500 text-xs">{b.duration}</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                        b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                    }`}>
                                    {b.status}
                                </span>
                            </td>
                            <td className="p-4 text-right font-medium">₹{b.amt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Main Page Component ---

const AdminHotelDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSuspended, setIsSuspended] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'documents', label: 'KYC Documents', icon: ShieldCheck },
        { id: 'rooms', label: 'Rooms & Pricing', icon: Bed },
        { id: 'bookings', label: 'Booking History', icon: Calendar },
    ];

    const handleSuspend = () => {
        setModalConfig({
            isOpen: true,
            title: isSuspended ? 'Unsuspend Hotel?' : 'Suspend Hotel?',
            message: isSuspended
                ? 'This hotel will be able to receive bookings again.'
                : 'This action will prevent the hotel from receiving new bookings. Existing bookings will remain active.',
            type: isSuspended ? 'success' : 'danger',
            confirmText: isSuspended ? 'Unsuspend' : 'Suspend',
            onConfirm: () => setIsSuspended(!isSuspended)
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header / Nav */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link to="/admin/hotels" className="hover:text-black transition-colors">Hotels</Link>
                <span>/</span>
                <span>Grand Palace Hotel</span>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl bg-gray-200 shadow-inner flex items-center justify-center shrink-0 overflow-hidden">
                        <img src="https://placehold.co/100" alt="Hotel" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">Grand Palace Hotel</h1>
                            {isSuspended ? (
                                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-full flex items-center">
                                    <Ban size={10} className="mr-1" />
                                    SUSPENDED
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded-full flex items-center">
                                    <CheckCircle size={10} className="mr-1" />
                                    ACTIVE
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1 flex items-center">
                            <MapPin size={14} className="mr-1 text-gray-400" /> New Delhi, India
                            <span className="mx-2 text-gray-300">|</span>
                            Owner: Rajesh Kumar
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
                            <Star size={14} className="fill-gray-200 text-gray-200" />
                            <span className="text-xs text-gray-400 ml-1">(4.0 Rating)</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleSuspend}
                        className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isSuspended
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-white text-red-600 border-gray-200 hover:bg-red-50'
                            }`}
                    >
                        {isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                    <button className="flex-1 md:flex-none px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-colors shadow-lg">
                        Edit Details
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabBadge"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'documents' && <DocumentsTab />}
                    {activeTab === 'rooms' && <RoomsTab />}
                    {activeTab === 'bookings' && <BookingsTab />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminHotelDetail;
