import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Image, MapPin, Star, Edit, Trash2, Menu, Wallet, Building2, Home, Hotel, BedDouble, Tent, Users } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import { hotelService } from '../../../services/apiService';
import PartnerSidebar from '../components/PartnerSidebar';
import logo from '../../../assets/rokologin-removebg-preview.png';

const MyPropertiesPage = () => {
  const navigate = useNavigate();
  const { resetForm } = usePartnerStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchMyHotels();
  }, []);

  const fetchMyHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getMyHotels();
      if (response.success && Array.isArray(response.hotels)) {
        setProperties(response.hotels);
      } else if (Array.isArray(response)) {
        setProperties(response);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    resetForm();
    navigate('/hotel/join');
  };

  const handleEdit = (e, prop) => {
    e.stopPropagation();
    navigate(`/hotel/edit/${prop._id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this property?')) {
      try {
        await hotelService.deleteHotel(id);
        setProperties(prev => prev.filter(p => p._id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const handleCardClick = (id) => {
    navigate(`/hotel/properties/${id}`);
  };

  const getCoverImage = (prop) => {
    if (!prop.images) return null;
    if (prop.images.cover) return prop.images.cover;
    if (Array.isArray(prop.images.gallery) && prop.images.gallery.length > 0) return prop.images.gallery[0];
    if (Array.isArray(prop.images) && prop.images.length > 0) return prop.images[0].url || prop.images[0];
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004F4D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Custom Header */}
      <div className="flex items-center justify-between relative h-14 px-4 pt-2 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100/50">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 rounded-full bg-white hover:bg-gray-100 transition shadow-sm border border-gray-100"
        >
          <Menu size={18} className="text-[#003836]" />
        </button>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
          <img src={logo} alt="Rukko" className="h-7 object-contain drop-shadow-sm" />
        </div>

        <button
          onClick={() => navigate('/hotel/wallet')}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
        >
          <div className="w-5 h-5 bg-[#004F4D] rounded-full flex items-center justify-center">
            <Wallet size={10} className="text-white" />
          </div>
          <div className="flex flex-col items-start leading-none mr-0.5">
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Wallet</span>
            <span className="text-[10px] font-bold text-[#003836]">₹0</span>
          </div>
        </button>
      </div>

      <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6">

        {/* Title Row */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-lg font-black text-[#003836]">My Properties</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage Listings</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-[#004F4D] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1"
          >
            <Plus size={14} /> Add New
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.length > 0 ? properties.map((prop) => {
            const coverImg = getCoverImage(prop);
            return (
              <div
                key={prop._id}
                onClick={() => handleCardClick(prop._id)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.99] transition-all cursor-pointer group"
              >
                <div className="h-32 w-full relative bg-gray-100 overflow-hidden">
                  {coverImg ? (
                    <img
                      src={coverImg}
                      className="w-full h-full object-cover"
                      alt={prop.name}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <Image size={24} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[9px] font-bold border border-white/10 uppercase tracking-wide">
                    {prop.status || 'Draft'}
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-bold text-[#003836] line-clamp-1 flex-1 pr-2">
                      {prop.name || 'Untitled'}
                    </h3>
                    {prop.rating && (
                      <div className="flex items-center gap-0.5 text-[9px] font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                        {prop.rating} <Star size={8} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-400 text-[10px] mb-3 gap-1">
                    <MapPin size={10} />
                    <span className="truncate max-w-[150px]">{prop.address?.city + ', ' + prop.address?.state || 'Location N/A'}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={(e) => handleEdit(e, prop)}
                      className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 font-bold text-[10px] hover:bg-gray-100 flex items-center justify-center gap-1"
                    >
                      <Edit size={10} /> Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, prop._id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-300 rotate-3">
                <Building2 size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No Properties Found</h3>
              <button onClick={handleAddNew} className="text-xs font-bold text-[#004F4D] hover:underline">
                + Add your first property
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPropertiesPage;
