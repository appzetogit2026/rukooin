import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Search, Filter, CheckCircle, XCircle, Clock,
    Eye, MapPin, Star, Bed, Image as ImageIcon, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

const PropertyRequestCard = ({ request, onApprove, onReject }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={28} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{request.propertyName || 'Unnamed Property'}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            <span>{request.address?.city || 'Location not specified'}, {request.address?.state || ''}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                            <span>Partner ID: {request.partnerId}</span>
                        </div>
                    </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    PENDING
                </span>
            </div>

            {/* Quick Info */}
            <div className="px-6 py-4 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 text-xs mb-1">Property Type</p>
                    <p className="font-bold text-gray-900">{request.propertyType || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Total Rooms</p>
                    <p className="font-bold text-gray-900">{request.totalRooms || 0}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Facilities</p>
                    <p className="font-bold text-gray-900">{request.facilities?.length || 0} Added</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Images</p>
                    <p className="font-bold text-gray-900">{request.images?.length || 0} Uploaded</p>
                </div>
            </div>

            {/* Expandable Details */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 space-y-6">
                            {/* Address */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <MapPin size={16} /> Full Address
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {request.address?.line1}, {request.address?.line2 && `${request.address.line2}, `}
                                    {request.address?.city}, {request.address?.state} - {request.address?.pincode}
                                </p>
                            </div>

                            {/* Description */}
                            {request.propertyDescription && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{request.propertyDescription}</p>
                                </div>
                            )}

                            {/* Facilities */}
                            {request.facilities && request.facilities.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">Facilities & Amenities</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {request.facilities.map((facility, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                                {facility}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* KYC Info */}
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText size={16} /> KYC Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Document Type</p>
                                        <p className="font-medium">{request.kycDocType || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">ID Number</p>
                                        <p className="font-medium">{request.kycIdNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Images Preview */}
                            {request.images && request.images.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        <ImageIcon size={16} /> Property Images ({request.images.length})
                                    </h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        {request.images.slice(0, 8).map((img, i) => (
                                            <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                <img src={img.url} alt={img.category} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                    <Eye size={14} />
                    {showDetails ? 'Hide Details' : 'View Full Details'}
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => onReject(request)}
                        className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        <XCircle size={16} className="inline mr-1" />
                        Reject
                    </button>
                    <button
                        onClick={() => onApprove(request)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-lg"
                    >
                        <CheckCircle size={16} className="inline mr-1" />
                        Approve & List
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AdminPropertyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: () => { } });

    // Load requests from localStorage
    useEffect(() => {
        const loadRequests = () => {
            let stored = JSON.parse(localStorage.getItem('propertyRequests') || '[]');

            // Add dummy data if empty (for testing)
            if (stored.length === 0) {
                const dummyRequests = [
                    {
                        propertyName: "Sunset Beach Resort",
                        propertyType: "Resort",
                        spaceType: "Entire Property",
                        totalRooms: 25,
                        totalFloors: 3,
                        propertyRating: 4,
                        propertyDescription: "A beautiful beachfront resort with stunning ocean views, perfect for family vacations and romantic getaways.",
                        address: {
                            line1: "Beach Road, Sector 12",
                            line2: "Near Lighthouse",
                            city: "Goa",
                            state: "Goa",
                            pincode: "403001"
                        },
                        facilities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Spa", "Beach Access", "Parking"],
                        images: [
                            { url: "https://placehold.co/400x300/0ea5e9/white?text=Facade+1", category: "facade" },
                            { url: "https://placehold.co/400x300/0ea5e9/white?text=Facade+2", category: "facade" },
                            { url: "https://placehold.co/400x300/0ea5e9/white?text=Facade+3", category: "facade" },
                            { url: "https://placehold.co/400x300/0ea5e9/white?text=Facade+4", category: "facade" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+1", category: "bedroom" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+2", category: "bedroom" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+3", category: "bedroom" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+4", category: "bedroom" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+5", category: "bedroom" },
                            { url: "https://placehold.co/400x300/10b981/white?text=Bedroom+6", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f59e0b/white?text=Bathroom+1", category: "bathroom" },
                            { url: "https://placehold.co/400x300/f59e0b/white?text=Bathroom+2", category: "bathroom" },
                            { url: "https://placehold.co/400x300/f59e0b/white?text=Bathroom+3", category: "bathroom" },
                        ],
                        kycDocType: "Aadhar Card",
                        kycIdNumber: "1234-5678-9012",
                        status: "PENDING_APPROVAL",
                        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        partnerId: "PARTNER-1001"
                    },
                    {
                        propertyName: "Mountain View Lodge",
                        propertyType: "Hotel",
                        spaceType: "Entire Property",
                        totalRooms: 15,
                        totalFloors: 2,
                        propertyRating: 5,
                        propertyDescription: "Cozy mountain lodge with breathtaking Himalayan views. Perfect for adventure seekers and nature lovers.",
                        address: {
                            line1: "Hill Station Road",
                            line2: "Near Mall Road",
                            city: "Manali",
                            state: "Himachal Pradesh",
                            pincode: "175131"
                        },
                        facilities: ["Free Wi-Fi", "Restaurant", "Gym", "Parking", "Bonfire Area", "Trekking Guide"],
                        images: [
                            { url: "https://placehold.co/400x300/8b5cf6/white?text=Mountain+View+1", category: "facade" },
                            { url: "https://placehold.co/400x300/8b5cf6/white?text=Mountain+View+2", category: "facade" },
                            { url: "https://placehold.co/400x300/8b5cf6/white?text=Mountain+View+3", category: "facade" },
                            { url: "https://placehold.co/400x300/8b5cf6/white?text=Mountain+View+4", category: "facade" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+1", category: "bedroom" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+2", category: "bedroom" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+3", category: "bedroom" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+4", category: "bedroom" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+5", category: "bedroom" },
                            { url: "https://placehold.co/400x300/ec4899/white?text=Cozy+Room+6", category: "bedroom" },
                            { url: "https://placehold.co/400x300/14b8a6/white?text=Bath+1", category: "bathroom" },
                            { url: "https://placehold.co/400x300/14b8a6/white?text=Bath+2", category: "bathroom" },
                            { url: "https://placehold.co/400x300/14b8a6/white?text=Bath+3", category: "bathroom" },
                        ],
                        kycDocType: "PAN Card",
                        kycIdNumber: "ABCDE1234F",
                        status: "PENDING_APPROVAL",
                        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                        partnerId: "PARTNER-1002"
                    },
                    {
                        propertyName: "Heritage Palace Hotel",
                        propertyType: "Heritage Hotel",
                        spaceType: "Entire Property",
                        totalRooms: 40,
                        totalFloors: 4,
                        propertyRating: 5,
                        propertyDescription: "A restored 18th-century palace offering royal hospitality with modern amenities. Experience the grandeur of Rajasthan.",
                        address: {
                            line1: "Palace Road, Old City",
                            line2: "Near City Palace",
                            city: "Jaipur",
                            state: "Rajasthan",
                            pincode: "302001"
                        },
                        facilities: ["Free Wi-Fi", "Swimming Pool", "Restaurant", "Spa", "Heritage Tours", "Cultural Shows", "Parking"],
                        images: [
                            { url: "https://placehold.co/400x300/ef4444/white?text=Palace+Facade+1", category: "facade" },
                            { url: "https://placehold.co/400x300/ef4444/white?text=Palace+Facade+2", category: "facade" },
                            { url: "https://placehold.co/400x300/ef4444/white?text=Palace+Facade+3", category: "facade" },
                            { url: "https://placehold.co/400x300/ef4444/white?text=Palace+Facade+4", category: "facade" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+1", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+2", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+3", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+4", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+5", category: "bedroom" },
                            { url: "https://placehold.co/400x300/f97316/white?text=Royal+Suite+6", category: "bedroom" },
                            { url: "https://placehold.co/400x300/06b6d4/white?text=Marble+Bath+1", category: "bathroom" },
                            { url: "https://placehold.co/400x300/06b6d4/white?text=Marble+Bath+2", category: "bathroom" },
                            { url: "https://placehold.co/400x300/06b6d4/white?text=Marble+Bath+3", category: "bathroom" },
                        ],
                        kycDocType: "Passport",
                        kycIdNumber: "J1234567",
                        status: "PENDING_APPROVAL",
                        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        partnerId: "PARTNER-1003"
                    }
                ];

                localStorage.setItem('propertyRequests', JSON.stringify(dummyRequests));
                stored = dummyRequests;
            }

            setRequests(stored.filter(r => r.status === 'PENDING_APPROVAL'));
        };
        loadRequests();

        // Poll for new requests every 5 seconds
        const interval = setInterval(loadRequests, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter(r =>
            r.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.partnerId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requests, searchQuery]);

    const handleApprove = (request) => {
        setModalConfig({
            isOpen: true,
            title: 'Approve Property Listing?',
            message: `This will make "${request.propertyName}" live on the platform for bookings.`,
            type: 'success',
            confirmText: 'Approve',
            onConfirm: () => {
                // Update status
                const allRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
                const updated = allRequests.map(r =>
                    r.partnerId === request.partnerId && r.submittedAt === request.submittedAt
                        ? { ...r, status: 'APPROVED', approvedAt: new Date().toISOString() }
                        : r
                );
                localStorage.setItem('propertyRequests', JSON.stringify(updated));

                // Remove from pending list
                setRequests(prev => prev.filter(r => r.partnerId !== request.partnerId || r.submittedAt !== request.submittedAt));

                alert(`✅ Property "${request.propertyName}" has been approved and is now live!`);
            }
        });
    };

    const handleReject = (request) => {
        setModalConfig({
            isOpen: true,
            title: 'Reject Property Listing?',
            message: `Rejecting "${request.propertyName}" will notify the partner. They can resubmit after making changes.`,
            type: 'danger',
            confirmText: 'Reject',
            onConfirm: () => {
                const allRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
                const updated = allRequests.map(r =>
                    r.partnerId === request.partnerId && r.submittedAt === request.submittedAt
                        ? { ...r, status: 'REJECTED', rejectedAt: new Date().toISOString() }
                        : r
                );
                localStorage.setItem('propertyRequests', JSON.stringify(updated));

                setRequests(prev => prev.filter(r => r.partnerId !== request.partnerId || r.submittedAt !== request.submittedAt));

                alert(`Property "${request.propertyName}" has been rejected.`);
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Property Approval Requests</h2>
                    <p className="text-gray-500 text-sm">Review and approve new hotel listings from partners.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <Clock size={18} className="text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">{requests.length} Pending</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by property name, city, or partner ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm"
                />
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request, i) => (
                        <PropertyRequestCard
                            key={i}
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
