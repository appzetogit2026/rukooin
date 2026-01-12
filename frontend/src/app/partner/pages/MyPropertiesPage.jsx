import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Image, MapPin, Star, Edit, Trash2, Eye, Building2, Home, Hotel, BedDouble, Tent, Users } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import { hotelService } from '../../../services/apiService';
import PartnerHeader from '../components/PartnerHeader';

const MyPropertiesPage = () => {
  const navigate = useNavigate();
  const { resetForm } = usePartnerStore();
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
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
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

  const getPropertyIcon = (type) => {
    switch (type) {
      case 'Hotel': return <Hotel size={14} />;
      case 'Villa': return <Home size={14} />;
      case 'Resort': return <Tent size={14} />;
      case 'Homestay': return <Building2 size={14} />; // Or specific icon
      case 'Hostel': return <BedDouble size={14} />;
      case 'PG': return <Users size={14} />;
      default: return <Building2 size={14} />;
    }
  };

  // Helper to extract type-specific tags
  const getPropertyTags = (prop) => {
    const details = prop.details || {};
    const config = details.config || {};
    const structure = details.structure || {};

    switch (prop.propertyType) {
      case 'Hotel':
        return [
          { label: config.starRating ? `${config.starRating} Star` : 'Hotel', icon: <Star size={10} /> },
          { label: config.hotelCategory || 'Standard', icon: null }
        ];
      case 'Villa':
        return [
          { label: structure.bedrooms ? `${structure.bedrooms} BHK` : 'Villa', icon: <Home size={10} /> },
          { label: structure.entirePlace ? 'Entire Place' : 'Rooms', icon: null }
        ];
      case 'Resort':
        return [
          { label: config.resortTheme || 'Resort', icon: <Tent size={10} /> },
          { label: config.resortCategory || 'Standard', icon: null }
        ];
      case 'Hostel':
        return [
          { label: config.hostelType ? `${config.hostelType} Hostel` : 'Hostel', icon: <Users size={10} /> },
          { label: config.curfewTime ? `Curfew: ${config.curfewTime}` : 'No Curfew', icon: null }
        ];
      case 'PG':
        return [
          { label: config.pgType ? `${config.pgType} PG` : 'PG', icon: <Users size={10} /> },
          { label: config.foodAvailable ? 'Food Included' : 'No Food', icon: null }
        ];
      case 'Homestay':
        return [
          { label: config.hostLivesOnProperty === 'Yes' ? 'Live-in Host' : 'Entire Unit', icon: <Users size={10} /> },
          { label: config.mealsAvailable === 'Yes' ? 'Meals Avail' : 'Self Catering', icon: null }
        ];
      default:
        return [];
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
      <PartnerHeader title="My Properties" subtitle="Manage your listed properties" />

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#003836]">Listed Properties</h2>
            <p className="text-sm text-gray-400">Manage and update your listings</p>
          </div>
          <button onClick={handleAddNew} className="bg-[#004F4D] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-[#004F4D]/10 flex items-center gap-2 hover:bg-[#003836] transition-all transform hover:scale-105">
            <Plus size={18} /> Add New Property
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.length > 0 ? properties.map((prop) => {
            const tags = getPropertyTags(prop);

            return (
              <div
                key={prop._id}
                onClick={() => handleCardClick(prop._id)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full ring-1 ring-gray-50"
              >
                {/* Image Section */}
                <div className="h-48 w-full relative bg-gray-100 overflow-hidden">
                  {prop.images?.cover || (prop.images?.gallery?.[0]) || (prop.images?.[0]?.url) ? (
                    <img
                      src={prop.images?.cover || prop.images?.gallery?.[0] || prop.images?.[0]?.url}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={prop.name}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                      <Image size={32} />
                      <span className="text-[10px] uppercase font-bold mt-2 tracking-wider">No Image</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-sm border border-white/20 ${prop.status === 'approved' ? 'bg-green-500/90 text-white' :
                      prop.status === 'rejected' ? 'bg-red-500/90 text-white' :
                        'bg-orange-500/90 text-white'
                    }`}>
                    {prop.status || 'Draft'}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 border border-white/10">
                    {getPropertyIcon(prop.propertyType)}
                    {prop.propertyType}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-[#003836] line-clamp-1 flex-1 pr-2" title={prop.name}>
                      {prop.name || 'Untitled Property'}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 font-bold text-[10px]">
                      {prop.rating || 'New'} <Star size={8} fill="currentColor" />
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500 text-xs mb-4 gap-1">
                    <MapPin size={12} className="text-[#004F4D]" />
                    <span className="truncate">{prop.address?.city || 'Location N/A'}, {prop.address?.state}</span>
                  </div>

                  {/* Dynamic Tags Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {tags.map((tag, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center text-center border border-gray-100">
                        <span className="text-[10px] font-bold text-[#004F4D] flex items-center gap-1">
                          {tag.icon} {tag.label}
                        </span>
                      </div>
                    ))}
                    {tags.length === 0 && (
                      <div className="col-span-2 bg-gray-50 rounded-lg p-2 text-center text-xs text-gray-400 font-medium">
                        Detailed info pending
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-auto flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleEdit(e, prop)}
                      className="flex-1 py-2 rounded-lg bg-[#004F4D]/5 text-[#004F4D] font-bold text-xs hover:bg-[#004F4D]/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit size={12} /> Edit Property
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, prop._id)}
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Delete Property"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <Building2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-[#003836] mb-2">No Properties Listed Yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm">Start your journey by adding your first property to our platform.</p>
              <button onClick={handleAddNew} className="bg-[#004F4D] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-[#004F4D]/10 flex items-center gap-2 hover:bg-[#003836] transition-all">
                <Plus size={18} /> Add Property Now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPropertiesPage;
