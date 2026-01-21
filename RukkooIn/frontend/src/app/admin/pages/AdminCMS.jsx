import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon, HelpCircle, FileText, Plus, Trash2, Edit2,
    Save, Globe, User, Hotel, ChevronRight, ChevronDown,
    Layers, ExternalLink, Eye, EyeOff, Loader2, Search
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import AdminLegalPages from './AdminLegalPages';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminCMS = () => {
    const [activeTab, setActiveTab] = useState('banners');
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState([]);
    const [faqs, setFaqs] = useState([]);

    // Modal states
    const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getBanners();
            if (res.success) setBanners(res.banners);
        } catch {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFaqs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getFaqs();
            if (res.success) setFaqs(res.faqs);
        } catch {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'banners') fetchBanners();
        if (activeTab === 'faqs') fetchFaqs();
    }, [activeTab, fetchBanners, fetchFaqs]);

    const handleToggleBanner = async (banner) => {
        try {
            const res = await adminService.updateBanner(banner._id, { active: !banner.active });
            if (res.success) {
                toast.success(`Banner ${!banner.active ? 'activated' : 'deactivated'}`);
                fetchBanners();
            }
        } catch {
            toast.error('Update failed');
        }
    };

    const handleDeleteBanner = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Banner?',
            message: 'This campaign asset will be permanently removed from the platform.',
            onConfirm: async () => {
                try {
                    await adminService.deleteBanner(id);
                    toast.success('Banner deleted');
                    fetchBanners();
                } catch {
                    toast.error('Delete failed');
                }
            }
        });
    };

    const handleDeleteFaq = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete FAQ?',
            message: 'This will remove the entry from the knowledge base.',
            onConfirm: async () => {
                try {
                    await adminService.deleteFaq(id);
                    toast.success('FAQ removed');
                    fetchFaqs();
                } catch {
                    toast.error('Delete failed');
                }
            }
        });
    };

    return (
        <div className="space-y-6 pb-20 uppercase tracking-tighter">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                {...confirmModal}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                        <Layers size={32} /> Content & Assets
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                        Control platform appearance, knowledge base, and legal compliance.
                    </p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                    {[
                        { id: 'banners', label: 'Banners', icon: ImageIcon },
                        { id: 'faqs', label: 'FAQs', icon: HelpCircle },
                        { id: 'legal', label: 'Legal Pages', icon: FileText }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'banners' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest">Active Marketing Banners</h3>
                            <button className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                <Plus size={16} /> New Banner
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {banners.map(banner => (
                                <div key={banner._id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
                                    <div className="relative h-40 bg-gray-100">
                                        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button onClick={() => handleToggleBanner(banner)} className={`p-2 rounded-full shadow-lg backdrop-blur-md transition-all ${banner.active ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-white/50'}`}>
                                                {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-full">
                                                {banner.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-xs font-black text-gray-900 uppercase mb-1">{banner.title}</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-4">
                                            <Globe size={10} /> Target: {banner.audience}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="flex gap-2">
                                                <button className="p-2.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-xl transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteBanner(banner._id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <span className="text-[9px] font-black text-gray-300">ORDER: {banner.order}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-12 text-gray-300 hover:border-black hover:text-black transition-all group">
                                <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white mb-4 transition-all">
                                    <Plus size={32} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Deploy New Asset</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'faqs' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest">Platform Help Center</h3>
                            <button className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase rounded-xl shadow-lg flex items-center gap-2">
                                <Plus size={16} /> Create Article
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex gap-4">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input placeholder="Search knowledge base..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-black transition-all" />
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {faqs.map(faq => (
                                    <div key={faq._id} className="p-8 hover:bg-gray-50/50 transition-all flex items-start justify-between group">
                                        <div className="max-w-3xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${faq.audience === 'user' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                    {faq.audience}
                                                </span>
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{faq.category}</span>
                                            </div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase mb-3">{faq.question}</h4>
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">{faq.answer}</p>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-black hover:text-white transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteFaq(faq._id)} className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'legal' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <AdminLegalPages />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCMS;
