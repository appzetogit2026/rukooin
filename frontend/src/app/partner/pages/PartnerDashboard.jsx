import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Image, MapPin, List, LayoutDashboard, Plus, Eye, Trash2, Edit, Star, CheckCircle, BedDouble } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import { useLenis } from '../../shared/hooks/useLenis';

import PartnerHeader from '../components/PartnerHeader';
import { hotelService } from '../../../services/apiService';

const PartnerDashboard = () => {
    useLenis();
    const navigate = useNavigate();
    const { formData, resetForm, updateFormData } = usePartnerStore();

    // State management
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyHotels();
    }, []);

    const fetchMyHotels = async () => {
        try {
            setLoading(true);
            const data = await hotelService.getMyHotels();
            setProperties(data);
        } catch (error) {
            console.error("Failed to fetch hotels:", error);
            // Optionally set error state here if UI needs to show it
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        resetForm();
        navigate('/hotel/join');
    };

    const handleEdit = (prop) => {
        updateFormData(prop);
        navigate('/hotel/join');
    };

    const handleManageRooms = (prop) => {
        updateFormData(prop);
        navigate('/hotel/rooms');
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            // TODO: Add delete API call here once available in frontend service
            // await hotelService.delete(id); 
            // fetchMyHotels();
            alert("Delete functionality coming soon.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004F4D]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
            {/* Header */}
            <PartnerHeader title="Partner Panel" subtitle="Manage your listings" />

            <main className="max-w-3xl mx-auto px-4 pt-6">

                {/* Stats / Overview (Optional) */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-[#004F4D] text-white p-5 rounded-2xl shadow-lg">
                        <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Total Properties</span>
                        <h2 className="text-3xl font-black mt-1">{properties.length}</h2>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Review</span>
                        <h2 className="text-3xl font-black mt-1 text-orange-500">{properties.filter(p => p.status === 'pending').length}</h2>
                    </div>
                </div>

                {/* Welcome / Quick Actions */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
                    <div className="w-16 h-16 bg-[#004F4D]/10 text-[#004F4D] rounded-full flex items-center justify-center mx-auto mb-4">
                        <LayoutDashboard size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-[#003836] mb-2">Welcome to Partner Dashboard</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Manage your properties, reservations, and performance from here. Navigate to "My Properties" to manage your listings.</p>

                    <div className="flex justify-center gap-4">
                        <button onClick={() => navigate('/hotel/properties')} className="px-6 py-3 bg-[#004F4D] text-white rounded-xl font-bold shadow-lg hover:bg-[#003836] transition-colors">
                            View My Properties
                        </button>
                        <button onClick={handleAddNew} className="px-6 py-3 bg-white border-2 border-[#004F4D] text-[#004F4D] rounded-xl font-bold hover:bg-gray-50 transition-colors">
                            Add New Property
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default PartnerDashboard;
