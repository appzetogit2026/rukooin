import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Search, Filter, CheckCircle, XCircle, Clock,
    Eye, MapPin, Star, Bed, Image as ImageIcon, FileText, Loader2, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const PropertyRequestCard = ({ request, onApprove, onReject }) => {
    const [showDetails, setShowDetails] = useState(false);

    // Get main image
    const mainImage = request.images?.[0]?.url || request.images?.[0];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                        {mainImage ? (
                            <img src={mainImage} alt={request.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 size={28} className="text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{request.name || 'Unnamed Property'}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span>{request.address?.city || 'Location not specified'}, {request.address?.state || ''}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400 font-bold uppercase">
                            <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span>Partner: {request.ownerId?.name || 'Guest'}</span>
                        </div>
                    </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase">
                    <Clock size={12} />
                    PENDING
                </span>
            </div>

            <div className="px-6 py-4 bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Categories</p>
                    <p className="font-bold text-gray-900">{request.rooms?.length || 0}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Facilities</p>
                    <p className="font-bold text-gray-900">{request.facilities?.length || 0} Added</p>
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Images</p>
                    <p className="font-bold text-gray-900">{request.images?.length || 0} Photos</p>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
                <Link
                    to={`/admin/property-requests/${request._id}`}
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1 uppercase"
                >
                    <Eye size={14} />
                    View Full Details
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={() => onReject(request)}
                        className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-100 transition-colors"
                    >
                        Reject
                    </button>
                    <button
                        onClick={() => onApprove(request)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Approve & List
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AdminPropertyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: () => { } });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPropertyRequests();
            if (data.success) {
                setRequests(data.hotels || []);
            }
        } catch (error) {
            console.error('Error fetching property requests:', error);
            toast.error('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = useMemo(() => {
        console.log('Current Requests state:', requests);
        if (!requests || !Array.isArray(requests)) return [];
        return requests.filter(r => {
            if (!r) return false;
            const search = (searchQuery || '').toLowerCase();
            return (
                (r.name || '').toLowerCase().includes(search) ||
                (r.address?.city || '').toLowerCase().includes(search) ||
                (r.ownerId?.name || '').toLowerCase().includes(search)
            );
        });
    }, [requests, searchQuery]);

    const handleApprove = (request) => {
        setModalConfig({
            isOpen: true,
            title: 'Approve Property Listing?',
            message: `This will make "${request.name}" live on the platform for bookings.`,
            type: 'success',
            confirmText: 'Approve',
            onConfirm: async () => {
                try {
                    const res = await adminService.updateHotelStatus(request._id, 'approved');
                    if (res.success) {
                        toast.success(`Property "${request.name}" approved successfully`);
                        fetchRequests();
                    }
                } catch (err) {
                    toast.error('Failed to approve property');
                }
            }
        });
    };

    const handleReject = (request) => {
        setModalConfig({
            isOpen: true,
            title: 'Reject Property Listing?',
            message: `Rejecting "${request.name}" will notify the partner.`,
            type: 'danger',
            confirmText: 'Reject',
            onConfirm: async () => {
                try {
                    const res = await adminService.updateHotelStatus(request._id, 'rejected');
                    if (res.success) {
                        toast.success(`Property "${request.name}" rejected`);
                        fetchRequests();
                    }
                } catch (err) {
                    toast.error('Failed to reject property');
                }
            }
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Property Approval Requests</h2>
                    <p className="text-gray-500 text-sm">Review and approve new hotel listings from partners.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Clock size={18} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 uppercase">{(requests || []).length} Pending</span>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by property name, city, or partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm"
                />
            </div>

            <div className="space-y-4 min-h-[400px]">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-2xl"></div>)
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <PropertyRequestCard
                            key={request._id}
                            request={request}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))
                ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Pending Requests</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery
                                ? `No requests found matching "${searchQuery}"`
                                : 'All property listing requests have been processed.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPropertyRequests;
