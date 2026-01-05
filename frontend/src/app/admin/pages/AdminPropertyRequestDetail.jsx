import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, MapPin, CheckCircle, XCircle, FileText,
    ChevronLeft, Star, Bed, Calendar, ShieldCheck, AlertCircle,
    MoreVertical, Download, Search, Ban, Wifi, Phone, Mail, Tv, Coffee, Wind, Loader2, Clock, Camera, Image as ImageIcon, Info
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
                        <span className="text-gray-500 font-bold uppercase text-[10px]">Submitted Date</span>
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
                        <div className="mt-2 text-[10px] text-gray-400 font-mono bg-white inline-block px-2 py-1 rounded border">
                            Coords: {hotel.address?.coordinates?.lat}, {hotel.address?.coordinates?.lng}
                        </div>
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


const AdminPropertyRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
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
            }
        } catch (error) {
            console.error('Error fetching hotel details:', error);
            toast.error('Failed to load hotel information');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (action) => {
        setModalConfig({
            isOpen: true,
            title: action === 'approve' ? 'Approve Property?' : 'Reject Property?',
            message: action === 'approve'
                ? `Confirming will make "${hotel.name}" live for customers.`
                : `Rejecting "${hotel.name}" will notify the partner to make changes.`,
            type: action === 'approve' ? 'success' : 'danger',
            confirmText: action === 'approve' ? 'Approve & List' : 'Reject Request',
            onConfirm: async () => {
                try {
                    const status = action === 'approve' ? 'approved' : 'rejected';
                    const res = await adminService.updateHotelStatus(hotel._id, status);
                    if (res.success) {
                        toast.success(`Property ${status} successfully`);
                        navigate('/admin/property-requests');
                    }
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-gray-400" size={48} />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Loading request details...</p>
        </div>
    );

    if (!hotel) return (
        <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Request Not Found</h2>
            <Link to="/admin/property-requests" className="mt-6 inline-block text-black font-bold uppercase text-xs border-b-2 border-black pb-1">Back to Requests</Link>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'gallery', label: 'Full Gallery', icon: ImageIcon },
        { id: 'documents', label: 'Verified Docs', icon: ShieldCheck },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500 mb-2">
                <Link to="/admin/property-requests" className="hover:text-black transition-colors flex items-center gap-1">
                    <ChevronLeft size={10} /> Requests
                </Link>
                <span>/</span>
                <span className="text-black font-bold">{hotel.name}</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sticky top-4 z-20">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 shadow-inner flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                        {hotel.images && hotel.images[0] ? (
                            <img src={hotel.images[0].url || hotel.images[0]} alt="Hotel" className="w-full h-full object-cover" />
                        ) : (
                            <Building2 size={24} className="text-gray-300" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{hotel.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase flex items-center border border-amber-200">
                                <Clock size={10} className="mr-1" /> Pending Review
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                ID: {hotel._id.slice(-6)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => handleAction('reject')}
                        className="flex-1 md:flex-none px-6 py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold uppercase rounded-xl text-[10px] transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        className="flex-1 md:flex-none px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase rounded-xl text-[10px] transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={14} /> Approve & List
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-white sticky top-28 z-10 px-4 rounded-xl shadow-sm">
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
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminPropertyRequestDetail;
