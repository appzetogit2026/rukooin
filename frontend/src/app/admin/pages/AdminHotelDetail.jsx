import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, CheckCircle, XCircle, FileText,
    ChevronLeft, Star, Bed, Calendar, ShieldCheck, AlertCircle,
    MoreVertical, Download, Search, Ban, Wifi, Phone, Mail, Tv, Coffee, Wind, Loader2, Clock, Camera, Image as ImageIcon, Users
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

// --- Tab Components ---

const OverviewTab = ({ hotel }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                    <Building2 size={14} /> Property Information
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Property Type</span>
                        <span className="font-bold text-gray-900 capitalize">{hotel.propertyType || 'Hotel'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Joined Date</span>
                        <span className="font-bold text-gray-900">{new Date(hotel.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Total Rooms</span>
                        <span className="font-bold text-gray-900">{hotel.rooms?.length || 0} Categories</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Price Starts</span>
                        <span className="font-bold text-gray-900">₹{hotel.price || 0}</span>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Contact & Location
                </h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Email</span>
                        <span className="font-bold text-gray-900">{hotel.ownerId?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Phone</span>
                        <span className="font-bold text-gray-900">{hotel.phone || hotel.ownerId?.phone || 'N/A'}</span>
                    </div>
                    <div className="pt-2">
                        <span className="text-gray-500 font-bold uppercase text-[10px] block mb-1">Full Address</span>
                        <span className="font-bold block text-gray-800 leading-relaxed">
                            {hotel.address?.street || 'N/A'}, {hotel.address?.landmark && `near ${hotel.address.landmark},`}
                            <br />
                            {hotel.address?.city}, {hotel.address?.state} - {hotel.address?.zipCode}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-3">About Property</h3>
            <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                {hotel.description || 'No description provided for this property.'}
            </p>
        </div>

        {/* Policies Grid */}
        <div>
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-3">Property Policies</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { key: 'coupleFriendly', label: 'Couples Allowed' },
                    { key: 'petsAllowed', label: 'Pets Allowed' },
                    { key: 'smokingAllowed', label: 'Smoking Allowed' },
                    { key: 'localIdsAllowed', label: 'Local ID Allowed' },
                    { key: 'alcoholAllowed', label: 'Alcohol Allowed' },
                    { key: 'forEvents', label: 'Events Allowed' },
                    { key: 'outsideFoodAllowed', label: 'Outside Food Allowed' },
                ].map((policy) => (
                    <div key={policy.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[9px] font-bold uppercase ${hotel.policies?.[policy.key] ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                        {hotel.policies?.[policy.key] ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {policy.label}
                    </div>
                ))}
            </div>
        </div>

        {/* Amenities Grid */}
        <div>
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-3">Amenities & Facilities</h3>
            <div className="flex flex-wrap gap-3">
                {hotel.facilities && hotel.facilities.length > 0 ? (
                    hotel.facilities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase text-gray-700">
                            <CheckCircle size={12} className="text-green-500" />
                            {amenity.replace(/_/g, ' ')}
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 font-bold uppercase">No amenities listed</p>
                )}
            </div>
        </div>
    </div>
);

const GalleryTab = ({ hotel }) => (
    <div className="space-y-10">
        {/* Section 1: Property Wide Images */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900 uppercase">General Property Photos</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {hotel.images && hotel.images.length > 0 ? (
                    hotel.images.map((img, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group shadow-sm transition-all hover:shadow-md">
                            <img src={img.url || img} alt={`Property ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {img.category && (
                                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border border-white/20">
                                    {img.category}
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold uppercase text-xs">No General Photos</p>
                    </div>
                )}
            </div>
        </div>

        {/* Section 2: Room Specific Images grouped by Room */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Bed size={20} className="text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900 uppercase">Room Category Photos</h3>
            </div>

            <div className="space-y-6">
                {hotel.rooms && hotel.rooms.length > 0 ? (
                    hotel.rooms.map((room, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm uppercase">{room.title}</h4>
                                    <p className="text-xs text-gray-400">Price: ₹{room.price} | Qty: {room.qty}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">
                                    {room.images?.length || 0} Photos
                                </span>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                {room.images && room.images.length > 0 ? (
                                    room.images.map((img, i) => (
                                        <div key={i} className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative group">
                                            <img src={img.url || img} alt={`Room ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-4 text-center">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold italic">No photos for this room</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold uppercase text-xs">No Rooms Added</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const DocumentsTab = ({ hotel }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotel.kyc ? (
            <>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
                        <FileText size={16} /> Identity Information
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Document Type</p>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase border border-blue-100">
                                    {hotel.kyc.docType || 'Not Provided'}
                                </span>
                                {hotel.kyc.verified && (
                                    <span className="text-green-600 flex items-center gap-1 text-[10px] font-bold uppercase">
                                        <ShieldCheck size={12} /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">ID Number</p>
                            <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                                {hotel.kyc.idNumber || 'Not Provided'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
                        <Camera size={16} /> Document Proofs
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Front Side', url: hotel.kyc.docFront },
                            { label: 'Back Side', url: hotel.kyc.docBack }
                        ].map((doc, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">{doc.label}</p>
                                <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative group">
                                    {doc.url ? (
                                        <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            <FileText size={24} className="mb-2 opacity-50" />
                                            <span className="text-[9px] font-bold uppercase">Missing</span>
                                        </div>
                                    )}
                                    {doc.url && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-lg transform scale-95 group-hover:scale-100 transition-all">
                                                View Original
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            <div className="col-span-full py-20 text-center">
                <ShieldCheck size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-gray-900 font-bold uppercase text-sm">No KYC Information</h3>
                <p className="text-gray-400 text-xs mt-1">This property has not submitted identity documents yet.</p>
            </div>
        )}
    </div>
);

const RoomsTab = ({ rooms }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 uppercase">Room Inventory</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {rooms && rooms.length > 0 ? (
                rooms.map((room, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 relative overflow-hidden">
                            {room.images && room.images[0] ? (
                                <img src={room.images[0].url || room.images[0]} alt={room.title} className="w-full h-full object-cover" />
                            ) : (
                                <Bed size={32} />
                            )}
                        </div>
                        <div className="flex-1 w-full text-center md:text-left">
                            <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{room.title}</h4>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-[10px] font-bold uppercase text-gray-400">
                                <span className="flex items-center gap-1"><Users size={12} /> Max {room.occupancy} People</span>
                                <span className="flex items-center gap-1"><Building2 size={12} /> {room.qty} Rooms Total</span>
                                <span className="flex items-center gap-1 text-green-600"><ShieldCheck size={12} /> Verified Category</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Quantity</p>
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-bold rounded-full">{room.qty}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Price / Night</p>
                                <p className="text-xl font-bold text-gray-900">₹{room.price}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-10 text-center text-gray-400 font-bold uppercase text-xs">No room data available</div>
            )}
        </div>
    </div>
);

const BookingsTab = ({ bookings }) => (
    <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Guest Name..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-black"
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold uppercase text-gray-500">
                    Total: <span className="font-bold text-gray-900">{bookings?.length || 0} Bookings</span>
                </div>
            </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                    <tr>
                        <th className="p-4 font-bold text-gray-600">Booking ID</th>
                        <th className="p-4 font-bold text-gray-600">Guest</th>
                        <th className="p-4 font-bold text-gray-600">Check-In</th>
                        <th className="p-4 font-bold text-gray-600">Status</th>
                        <th className="p-4 font-bold text-gray-600 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {bookings && bookings.length > 0 ? (
                        bookings.map((b, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="p-4 font-mono text-xs text-gray-500">#{b.bookingId || b._id.slice(-6)}</td>
                                <td className="p-4 font-bold text-gray-900 uppercase text-xs">{b.userId?.name || 'Guest'}</td>
                                <td className="p-4 text-[10px] font-bold uppercase text-gray-400">{new Date(b.checkIn).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-bold">₹{b.totalAmount?.toLocaleString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-400 font-bold uppercase text-xs">No bookings found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Main Page Component ---

const AdminHotelDetail = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    useEffect(() => {
        fetchHotelDetails();
    }, [id]);

    const fetchHotelDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getHotelDetails(id);
            if (data.success) {
                setHotel(data.hotel);
                setBookings(data.bookings);
            }
        } catch (error) {
            console.error('Error fetching hotel details:', error);
            toast.error('Failed to load hotel information');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async () => {
        const isSuspended = hotel.status === 'suspended';
        const newStatus = isSuspended ? 'approved' : 'suspended';
        setModalConfig({
            isOpen: true,
            title: isSuspended ? 'Activate Hotel?' : 'Suspend Hotel?',
            message: isSuspended
                ? `Hotel "${hotel.name}" will be able to receive bookings again.`
                : `Suspending "${hotel.name}" will prevent it from receiving new bookings.`,
            type: isSuspended ? 'success' : 'danger',
            confirmText: isSuspended ? 'Activate' : 'Suspend',
            onConfirm: async () => {
                try {
                    const res = await adminService.updateHotelStatus(hotel._id, newStatus);
                    if (res.success) {
                        toast.success(`Hotel ${isSuspended ? 'activated' : 'suspended'} successfully`);
                        fetchHotelDetails();
                    }
                } catch (error) {
                    toast.error('Failed to update hotel status');
                }
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-gray-400" size={48} />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Loading property details...</p>
        </div>
    );

    if (!hotel) return (
        <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Hotel Not Found</h2>
            <Link to="/admin/hotels" className="mt-6 inline-block text-black font-bold uppercase text-xs border-b-2 border-black pb-1">Back to Hotels</Link>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'gallery', label: 'Full Gallery', icon: ImageIcon },
        { id: 'documents', label: 'KYC Documents', icon: ShieldCheck },
        { id: 'rooms', label: 'Rooms & Pricing', icon: Bed },
        { id: 'bookings', label: 'Booking History', icon: Calendar },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 mb-2">
                <Link to="/admin/hotels" className="hover:text-black transition-colors">Hotels</Link>
                <span>/</span>
                <span className="text-black font-bold">{hotel.name}</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl bg-gray-100 shadow-inner flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                        {hotel.images && hotel.images[0] ? (
                            <img src={hotel.images[0].url || hotel.images[0]} alt="Hotel" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 size={32} className="text-gray-300" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{hotel.name}</h1>
                            {hotel.status === 'suspended' ? (
                                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold rounded-full flex items-center uppercase">
                                    <Ban size={10} className="mr-1" /> SUSPENDED
                                </span>
                            ) : (
                                <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full flex items-center uppercase ${hotel.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    {hotel.status === 'approved' ? <CheckCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                                    {hotel.status}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase mt-1 flex items-center">
                            <MapPin size={12} className="mr-1 text-gray-400" /> {hotel.address?.city}, {hotel.address?.state}
                            <span className="mx-2 text-gray-300">|</span>
                            Owner: {hotel.ownerId?.name || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleStatusToggle}
                        className={`flex-1 md:flex-none px-4 py-2 border rounded-lg text-[10px] font-bold uppercase transition-colors ${hotel.status === 'suspended'
                            ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                            : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                            }`}
                    >
                        {hotel.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                    <button className="flex-1 md:flex-none px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold uppercase rounded-lg text-[10px] transition-colors shadow-lg">
                        Edit Details
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'
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

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && <OverviewTab hotel={hotel} />}
                    {activeTab === 'gallery' && <GalleryTab hotel={hotel} />}
                    {activeTab === 'documents' && <DocumentsTab hotel={hotel} />}
                    {activeTab === 'rooms' && <RoomsTab rooms={hotel.rooms} />}
                    {activeTab === 'bookings' && <BookingsTab bookings={bookings} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminHotelDetail;
