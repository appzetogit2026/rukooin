import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, CheckCircle, XCircle, Clock, Eye, AlertCircle,
    User, Building2, FileText, ChevronRight, Loader2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const VerificationBadge = ({ status }) => {
    const configs = {
        pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock size={10} /> },
        approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={10} /> },
        verified: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={10} /> },
        rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={10} /> },
    };

    const config = configs[status] || configs.pending;

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${config.color}`}>
            {config.icon}
            {status}
        </span>
    );
};

const AdminKYC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ partners: [], properties: [], documents: [] });
    const [activeTab, setActiveTab] = useState('partners');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getPendingVerifications();
            if (res.success) {
                setData({
                    partners: res.partners || [],
                    properties: res.properties || [],
                    documents: res.documents || []
                });
            }
        } catch (error) {
            console.error('Error fetching verifications:', error);
            toast.error('Failed to load pending verifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = (type, item, action) => {
        const isApprove = action === 'approve';
        const name = type === 'partner' ? item.name : item.propertyName || item.propertyId?.propertyName;

        setModalConfig({
            isOpen: true,
            title: `${isApprove ? 'Approve' : 'Reject'} Verification?`,
            message: `Are you sure you want to ${isApprove ? 'approve' : 'reject'} verification for "${name}"?`,
            type: isApprove ? 'success' : 'danger',
            confirmText: isApprove ? 'Approve' : 'Reject',
            onConfirm: async () => {
                try {
                    let res;
                    if (type === 'partner') {
                        res = await adminService.updatePartnerApproval(item._id, isApprove ? 'approved' : 'rejected');
                    } else if (type === 'document') {
                        res = await adminService.verifyPropertyDocuments(item.propertyId?._id || item._id, action, '');
                    }

                    if (res.success) {
                        toast.success('Status updated successfully');
                        fetchData();
                    }
                } catch (error) {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="text-black" size={28} />
                        Verification Center
                    </h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Review and verify partner identities and property documents.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {[
                        { id: 'partners', label: 'Partner Identity', count: data.partners.length },
                        { id: 'properties', label: 'Property Listings', count: data.properties.length },
                        { id: 'documents', label: 'Legal Docs', count: data.documents.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-white text-black' : 'bg-gray-100 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[2rem]">
                        <Loader2 className="animate-spin text-gray-300 mb-4" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading requests...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {activeTab === 'partners' && (
                                data.partners.length > 0 ? (
                                    data.partners.map(partner => (
                                        <div key={partner._id} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl hover:border-black/10 transition-all group">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                                                        <User size={32} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg uppercase tracking-tight text-gray-900">{partner.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{partner.email}</p>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {partner.aadhaarNumber && (
                                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100">Aadhaar: {partner.aadhaarNumber}</span>
                                                            )}
                                                            {partner.panNumber && (
                                                                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-lg border border-purple-100">PAN: {partner.panNumber}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction('partner', partner, 'reject')}
                                                            className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('partner', partner, 'approve')}
                                                            className="flex-1 md:flex-none px-6 py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
                                                        >
                                                            Verify Now
                                                        </button>
                                                    </div>
                                                    <Link
                                                        to={`/admin/partners/${partner._id}`}
                                                        className="text-center text-[9px] font-black uppercase text-gray-400 hover:text-black transition-colors"
                                                    >
                                                        View Full Proof Profile
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="All partner IDs are verified" />
                                )
                            )}

                            {activeTab === 'properties' && (
                                data.properties.length > 0 ? (
                                    data.properties.map(property => (
                                        <div key={property._id} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all group">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        <Building2 size={32} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg uppercase tracking-tight text-gray-900">{property.propertyName}</h3>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                                            <span className="text-gray-900 font-black">{property.propertyType}</span>
                                                            <span>•</span>
                                                            {property.address?.city}, {property.address?.state}
                                                        </div>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase text-gray-500">Ownership:</span>
                                                            <span className="text-[10px] font-black uppercase text-gray-900">{property.partnerId?.name || 'Loading...'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-end gap-3">
                                                    <div className="flex gap-2 w-full">
                                                        <Link
                                                            to={`/admin/properties/${property._id}`}
                                                            className="flex-1 md:flex-none px-8 py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:shadow-2xl transition-all flex items-center gap-2 justify-center"
                                                        >
                                                            Review Listing <ArrowRight size={14} />
                                                        </Link>
                                                    </div>
                                                    <p className="text-[9px] font-black uppercase text-amber-600">Property Listing Approval Required</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="All property listings are live or archived" />
                                )
                            )}

                            {activeTab === 'documents' && (
                                data.documents.length > 0 ? (
                                    data.documents.map(doc => (
                                        <div key={doc._id} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-xl transition-all group">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        <FileText size={32} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-lg uppercase tracking-tight text-gray-900">{doc.propertyId?.propertyName || 'Property Deleted'}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Document Bundle • {doc.documents.length} Files</p>
                                                        <div className="mt-3 flex gap-2">
                                                            {doc.documents.slice(0, 3).map((d, i) => (
                                                                <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[8px] font-black uppercase text-gray-500">
                                                                    {d.name || d.type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-center items-end gap-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAction('document', doc, 'reject')}
                                                            className="px-6 py-3 border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl text-[10px] font-black uppercase transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                        <Link
                                                            to={`/admin/properties/${doc.propertyId?._id}?tab=documents`}
                                                            className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-700 shadow-lg transition-all flex items-center gap-2"
                                                        >
                                                            Review Documents <Eye size={14} />
                                                        </Link>
                                                    </div>
                                                    <p className="text-[9px] font-black uppercase text-indigo-500">Legal Documentation Audit Pending</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No pending document verifications" />
                                )
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-[2rem] border-dashed">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4">
            <CheckCircle size={40} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Queue is Clear!</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">{message}</p>
    </div>
);

export default AdminKYC;
