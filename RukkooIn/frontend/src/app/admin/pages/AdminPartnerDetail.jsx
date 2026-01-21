import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Calendar, MapPin, Shield, CreditCard,
    History, AlertTriangle, Ban, CheckCircle, Lock, Unlock, Loader2,
    Building2, FileText, Image as ImageIcon, ExternalLink, Percent,
    Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Eye
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const DocumentViewer = ({ label, imageUrl }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!imageUrl) return (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">No {label} Uploaded</p>
        </div>
    );

    return (
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
            <div className="relative group overflow-hidden rounded-xl border border-gray-200 bg-white aspect-[3/2]">
                <img src={imageUrl} alt={label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                    >
                        <Eye size={16} />
                    </button>
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-xl"
                    >
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative z-10 max-w-5xl w-full h-full flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={imageUrl} alt={label} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="mt-6 px-8 py-3 bg-white text-black font-black uppercase text-xs rounded-full shadow-2xl hover:bg-gray-100 transition-colors"
                            >
                                Close Preview
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PartnerKycTab = ({ partner }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
                <Shield size={16} className="text-blue-600" />
                Identity Verification
            </h3>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Aadhaar Number</p>
                    <p className="text-sm font-black text-gray-900 mt-1 uppercase tracking-widest">{partner.aadhaarNumber || 'Not Provided'}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-black uppercase ${partner.aadhaarNumber ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {partner.aadhaarNumber ? 'Provided' : 'Missing'}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocumentViewer label="Aadhaar Front" imageUrl={partner.aadhaarFront} />
                <DocumentViewer label="Aadhaar Back" imageUrl={partner.aadhaarBack} />
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
                <FileText size={16} className="text-orange-600" />
                Tax Documentation
            </h3>

            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex justify-between items-center">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">PAN Number</p>
                    <p className="text-sm font-black text-gray-900 mt-1 uppercase tracking-widest">{partner.panNumber || 'Not Provided'}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[9px] font-black uppercase ${partner.panNumber ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {partner.panNumber ? 'Provided' : 'Missing'}
                </div>
            </div>

            <DocumentViewer label="PAN Card Image" imageUrl={partner.panCardImage} />
        </div>
    </div>
);

const PartnerPropertiesTab = ({ properties }) => (
    <div className="space-y-4">
        {properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop, i) => (
                    <Link
                        to={`/admin/properties/${prop._id}`}
                        key={i}
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                    >
                        <div className="aspect-[16/10] relative overflow-hidden">
                            <img src={prop.coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={prop.propertyName} />
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 shadow-sm ${prop.status === 'approved' ? 'bg-green-500 text-white border-white' :
                                        prop.status === 'pending' ? 'bg-orange-500 text-white border-white' : 'bg-red-500 text-white border-white'
                                    }`}>
                                    {prop.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1">{prop.propertyName}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 flex items-center gap-1">
                                <MapPin size={10} /> {prop.address?.city}, {prop.address?.state}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-gray-500">{prop.propertyType}</span>
                                <div className="flex items-center gap-1 text-black font-black">
                                    <span className="text-xs uppercase">View</span>
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="py-20 bg-gray-50 border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center">
                <Building2 size={48} className="text-gray-300 mb-4" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No properties listed yet</p>
            </div>
        )}
    </div>
);

const AdminPartnerDetail = () => {
    const { id } = useParams();
    const [partner, setPartner] = useState(null);
    const [properties, setProperties] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('kyc');
    const [isUpdating, setIsUpdating] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    const fetchPartnerDetails = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPartnerDetails(id);
            if (data.success) {
                setPartner(data.partner);
                setProperties(data.properties);
                setWallet(data.wallet);
                setTransactions(data.transactions);
            }
        } catch (error) {
            toast.error('Failed to load partner information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnerDetails();
    }, [id]);

    const handleApprovalStatus = async (status) => {
        setModalConfig({
            isOpen: true,
            title: status === 'approved' ? 'Approve Partner?' : 'Reject Partner?',
            message: status === 'approved'
                ? `This will grant ${partner.name} access to listing properties and the partner dashboard.`
                : `This will prevent ${partner.name} from listing new properties.`,
            type: status === 'approved' ? 'success' : 'danger',
            confirmText: status === 'approved' ? 'Approve' : 'Reject',
            onConfirm: async () => {
                try {
                    const res = await adminService.updatePartnerApproval(partner._id, status);
                    if (res.success) {
                        toast.success(`Partner status: ${status}`);
                        fetchPartnerDetails();
                    }
                } catch {
                    toast.error('Failed to update status');
                }
            }
        });
    };

    const handleUpdateSettings = async (data) => {
        try {
            setIsUpdating(true);
            const res = await adminService.updatePartnerSettings(partner._id, data);
            if (res.success) {
                toast.success('Settings updated');
                fetchPartnerDetails();
            }
        } catch {
            toast.error('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-gray-400" size={48} />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Verifying provider profile...</p>
        </div>
    );

    if (!partner) return <div className="text-center py-20 font-black uppercase text-gray-400">Partner Not Found</div>;

    const tabs = [
        { id: 'kyc', label: 'KYC Documents', icon: Shield },
        { id: 'properties', label: 'Property Portfolio', icon: Building2 },
        { id: 'finance', label: 'Financials', icon: Wallet },
        { id: 'settings', label: 'Moderation', icon: AlertTriangle },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500">
                <Link to="/admin/partners" className="hover:text-black transition-colors">Partners</Link>
                <span>/</span>
                <span className="text-black">{partner.name}</span>
            </div>

            {/* Header Card */}
            <div className={`rounded-[2.5rem] p-8 border shadow-sm flex flex-col md:flex-row gap-8 transition-all relative overflow-hidden ${partner.isBlocked ? 'bg-red-50 border-red-200' : partner.isSuspicious ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                {partner.partnerApprovalStatus === 'pending' && (
                    <div className="absolute top-4 right-8 px-4 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase rounded-full shadow-lg animate-bounce">
                        New Provider Approval Pending
                    </div>
                )}

                <div className="flex flex-col items-center md:items-start gap-4 min-w-[220px]">
                    <div className="w-28 h-28 rounded-[2rem] bg-black text-white flex items-center justify-center text-4xl font-black border-4 border-white shadow-2xl relative uppercase rotate-3">
                        {partner.name.charAt(0)}
                        {partner.isBlocked && <div className="absolute -bottom-2 -right-2 bg-red-600 p-2 rounded-full border-4 border-white"><Ban size={18} /></div>}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{partner.name}</h1>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${partner.partnerApprovalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                        partner.partnerApprovalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    Status: {partner.partnerApprovalStatus}
                                </span>
                                {partner.isBlocked && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white">Blocked</span>}
                                {partner.payoutOnHold && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black text-white">Payouts On Hold</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400"><Mail size={14} /></div>
                                <div><p className="text-[9px] text-gray-400 font-bold uppercase">Email</p><p className="text-xs font-black text-gray-900">{partner.email}</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400"><Phone size={14} /></div>
                                <div><p className="text-[9px] text-gray-400 font-bold uppercase">Phone</p><p className="text-xs font-black text-gray-900">{partner.phone}</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/50 rounded-3xl border border-gray-100 flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400 uppercase font-black mb-1">Total Properties</span>
                            <span className="text-3xl font-black text-gray-900 leading-none">{properties.length}</span>
                        </div>
                        <div className="p-5 bg-white/50 rounded-3xl border border-gray-100 flex flex-col justify-center">
                            <span className="text-[10px] text-gray-400 uppercase font-black mb-1 flex items-center gap-1">Wallet <RefreshCw size={10} className="animate-spin" /></span>
                            <span className="text-2xl font-black text-green-600 leading-none">₹{wallet?.balance?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                    {partner.partnerApprovalStatus !== 'approved' && (
                        <button
                            onClick={() => handleApprovalStatus('approved')}
                            className="w-full py-3.5 bg-black text-white rounded-2xl text-[10px] font-black uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={14} /> Approve Provider
                        </button>
                    )}
                    {partner.partnerApprovalStatus === 'approved' && (
                        <button
                            onClick={() => handleApprovalStatus('rejected')}
                            className="w-full py-3.5 bg-white text-red-600 border-2 border-red-50 rounded-2xl text-[10px] font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Ban size={14} /> Reject Provider
                        </button>
                    )}
                    <button className="w-full py-3.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-2xl text-[10px] font-black uppercase font-black">
                        Issue Payout Entry
                    </button>
                </div>
            </div>

            {/* Content Tabs */}
            <div>
                <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar scroll-smooth">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-8 py-5 text-[10px] font-black uppercase transition-all relative whitespace-nowrap tracking-widest ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activePartnerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="bg-white rounded-3xl p-8 border border-gray-50 shadow-sm min-h-[400px]"
                    >
                        {activeTab === 'kyc' && <PartnerKycTab partner={partner} />}
                        {activeTab === 'properties' && <PartnerPropertiesTab properties={properties} />}
                        {activeTab === 'finance' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Gross Earnings</p>
                                            <p className="text-2xl font-black text-gray-900 mt-1">₹{wallet?.totalEarnings?.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 border border-gray-100"><ArrowUpRight size={24} /></div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Settled Payouts</p>
                                            <p className="text-2xl font-black text-gray-900 mt-1">₹{wallet?.totalWithdrawals?.toLocaleString()}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100"><ArrowDownRight size={24} /></div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Transaction Details</th>
                                                <th className="px-6 py-4">Category</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {transactions.length > 0 ? transactions.map((tx, i) => (
                                                <tr key={i}>
                                                    <td className="px-6 py-4 text-xs font-black text-gray-900 uppercase">{tx.description}</td>
                                                    <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">{tx.category}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-green-100 text-green-700">{tx.status}</span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="p-10 text-center text-[10px] font-black uppercase text-gray-300">No transactions recorded</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div className="max-w-xl space-y-10 py-4">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase flex items-center gap-2 text-gray-900">
                                        <Percent size={18} className="text-purple-600" />
                                        Platform Commission
                                    </h3>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase">Adjust the percentage platform takes from each booking made with this provider.</p>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            defaultValue={partner.commissionPercentage || 15}
                                            className="w-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-900 focus:outline-none focus:border-black"
                                            onChange={(e) => setPartner({ ...partner, commissionPercentage: Number(e.target.value) })}
                                        />
                                        <button
                                            onClick={() => handleUpdateSettings({ commissionPercentage: partner.commissionPercentage })}
                                            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-black transition-colors"
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? <RefreshCw className="animate-spin" size={12} /> : 'Update Rate'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-black uppercase flex items-center gap-2 text-gray-900">
                                        <CreditCard size={18} className="text-black" />
                                        Payout Controls
                                    </h3>
                                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem]">
                                        <div>
                                            <p className="text-xs font-black text-gray-900 uppercase">Hold All Payouts</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Temporarily pause all automated financial settlements.</p>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateSettings({ payoutOnHold: !partner.payoutOnHold })}
                                            className={`relative w-14 h-7 rounded-full transition-colors duration-500 ${partner.payoutOnHold ? 'bg-red-600' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-500 ${partner.payoutOnHold ? 'translate-x-7' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-black uppercase flex items-center gap-2 text-red-600">
                                        <Ban size={18} />
                                        Danger Zone
                                    </h3>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdateSettings({ isBlocked: !partner.isBlocked })}
                                            className={`px-6 py-3 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${partner.isBlocked ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                                        >
                                            {partner.isBlocked ? 'Unlock Partner Access' : 'Suspend Partner Access'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPartnerDetail;
