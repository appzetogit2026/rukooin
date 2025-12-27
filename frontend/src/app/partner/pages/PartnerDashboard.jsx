import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Image, MapPin, List, LayoutDashboard, Plus, Eye, Trash2, Edit, Star, CheckCircle } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import { useLenis } from '../../shared/hooks/useLenis';

import PartnerHeader from '../components/PartnerHeader';

const PartnerDashboard = () => {
    useLenis();
    const navigate = useNavigate();
    const { formData, resetForm, updateFormData } = usePartnerStore();

    // Simulate list of properties. If formData is populated, show it.
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        if (formData && formData.propertyName) {
            setProperties([{ ...formData, id: 1, status: 'Pending Review' }]);
        }
    }, []);

    const handleAddNew = () => {
        resetForm();
        navigate('/hotel/join');
    };

    const handleEdit = (prop) => {
        updateFormData(prop);
        navigate('/hotel/join');
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this property?')) {
            setProperties(properties.filter(p => p.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
            {/* Header */}
            <PartnerHeader title="Partner Panel" subtitle="Manage your listings" />

            <main className="max-w-3xl mx-auto px-4 pt-6">

                {/* Stats / Overview (Optional) */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-black text-white p-5 rounded-2xl shadow-lg">
                        <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Total Properties</span>
                        <h2 className="text-3xl font-black mt-1">{properties.length}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Review</span>
                        <h2 className="text-3xl font-black mt-1 text-orange-500">{properties.filter(p => p.status === 'Pending Review').length}</h2>
                    </div>
                </div>

                {/* Property List */}
                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-lg font-bold text-gray-900">My Properties</h2>
                    <button onClick={handleAddNew} className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <Plus size={12} /> Add New
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {properties.length > 0 ? properties.map((prop) => (
                        <div key={prop.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-100/50 relative group transition-all hover:shadow-2xl">

                            {/* 1. Card Header & Cover */}
                            <div className="h-56 w-full relative bg-gray-100">
                                {prop.images && prop.images[0] ? (
                                    <img src={prop.images[0].url} className="w-full h-full object-cover" alt="Property Cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Image size={32} />
                                    </div>
                                )}

                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                    {prop.status}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
                                    <h3 className="text-2xl font-black text-white leading-none mb-1">{prop.propertyName || 'Untitled Property'}</h3>
                                    <div className="flex items-center text-white/90 text-sm font-medium gap-1">
                                        <MapPin size={14} className="text-white" />
                                        <span className="truncate">{prop.address?.line1 || prop.address?.city}, {prop.address?.city}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Content Body */}
                            <div className="p-6">

                                {/* Quick Stats Row */}
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                    <div className="text-center px-2">
                                        <div className="text-xl font-black text-black flex items-center justify-center gap-0.5">
                                            {prop.propertyRating}<Star size={12} className="fill-black text-black mb-0.5" />
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rating</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="text-center px-2">
                                        <div className="text-xl font-black text-black">{prop.totalFloors || 1}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Floors</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="text-center px-2">
                                        <div className="text-xl font-black text-black">{prop.totalRooms || 1}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rooms</div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100"></div>
                                    <div className="text-center px-2">
                                        <div className="text-lg font-black text-black capitalize">{prop.propertyType || 'Hotel'}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Type</div>
                                    </div>
                                </div>

                                {/* About Section */}
                                {prop.propertyDescription && (
                                    <div className="mb-6">
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <List size={12} className="text-gray-400" /> About
                                        </h4>
                                        <p className="text-sm text-gray-500 leading-relaxed font-medium bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                            {prop.propertyDescription}
                                        </p>
                                    </div>
                                )}

                                {/* Amenities & Policies Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Amenities */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {prop.facilities?.map((f, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 capitalize flex items-center gap-1">
                                                    {/* Icon mapping could go here, simplifying for now */}
                                                    <div className="w-1 h-1 bg-black rounded-full"></div>
                                                    {f.replace('_', ' ')}
                                                </span>
                                            ))}
                                            {(!prop.facilities || prop.facilities.length === 0) && <span className="text-xs text-gray-300 italic">None selected</span>}
                                        </div>
                                    </div>

                                    {/* Policies */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Highlights</h4>
                                        <div className="flex flex-col gap-2">
                                            <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border ${prop.coupleFriendly ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'}`}>
                                                <span>Couple Friendly</span>
                                                {prop.coupleFriendly ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>}
                                            </div>
                                            <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border ${prop.petsAllowed ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'}`}>
                                                <span>Pets Allowed</span>
                                                {prop.petsAllowed ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>}
                                            </div>
                                            <div className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border ${prop.smokingAllowed ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-50 text-gray-400 border-gray-100 opacity-50'}`}>
                                                <span>Smoking Allowed</span>
                                                {prop.smokingAllowed ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Scroll */}
                                {prop.images && prop.images.length > 0 && (
                                    <div className="mb-8">
                                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Gallery ({prop.images.length})</h4>
                                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                            {prop.images.map((img, idx) => (
                                                <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm relative group/img cursor-pointer">
                                                    <img src={img.url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Gallery" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Footer */}
                                <div className="flex gap-3 pt-6 border-t border-dashed border-gray-200">
                                    <button onClick={() => handleEdit(prop)} className="flex-1 bg-black text-white h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-black/20 hover:shadow-xl hover:bg-gray-900">
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <button onClick={() => handleDelete(prop.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 hover:border-red-100 active:scale-95 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    )) : (
                        <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
                                <LayoutDashboard size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">No Properties Yet</h3>
                            <p className="text-gray-400 text-sm mb-6">List your first property to get started.</p>
                            <button onClick={handleAddNew} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                                List Your Property
                            </button>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default PartnerDashboard;
