import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../../../services/apiService';
import {
  ArrowLeft, MapPin, Star, Edit, Clock, Calendar,
  Wifi, Car, Coffee, Shield, Info, Building2,
  Home, Users, BedDouble, Tent, Utensils
} from 'lucide-react';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const data = await hotelService.getById(id);
      setProperty(data);
    } catch (error) {
      console.error("Failed to fetch property details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/hotel/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004F4D]"></div>
      </div>
    );
  }

  if (!property) return <div className="p-8 text-center text-gray-500">Property not found</div>;

  // Extract type-specific config/policies safely
  const config = property.config || {};
  const policies = property.policies || {};
  const structure = property.structure || {};
  const food = property.food || {}; // PG specific? Or config.foodAvailable
  const houseRules = policies.houseRules || []; // Array for Homestay/Villa

  // Helper to render Type Specific Overview Stats
  const renderKeyStats = () => {
    const stats = [];

    switch (property.propertyType) {
      case 'Hotel':
        if (config.starRating) stats.push({ label: 'Rating', value: `${config.starRating} Star`, icon: <Star size={16} /> });
        if (config.hotelCategory) stats.push({ label: 'Category', value: config.hotelCategory, icon: <Building2 size={16} /> });
        break;
      case 'Homestay':
        stats.push({ label: 'Host', value: config.hostLivesOnProperty === 'Yes' ? 'On-site' : 'Off-site', icon: <Users size={16} /> });
        stats.push({ label: 'Food', value: config.mealsAvailable === 'Yes' ? 'Available' : 'Self-Catering', icon: <Utensils size={16} /> });
        if (config.sharedWithHost) stats.push({ label: 'Shared', value: config.sharedWithHost === 'Yes' ? 'Yes' : 'Private', icon: <Home size={16} /> });
        break;
      case 'PG':
        if (config.pgType) stats.push({ label: 'PG Type', value: `${config.pgType}`, icon: <Users size={16} /> });
        stats.push({ label: 'Food', value: config.foodAvailable ? 'Included' : 'Not Included', icon: <Utensils size={16} /> });
        break;
      case 'Villa':
        if (structure.bedrooms) stats.push({ label: 'Bedrooms', value: `${structure.bedrooms} BHK`, icon: <Home size={16} /> });
        stats.push({ label: 'Type', value: structure.entirePlace ? 'Entire Place' : 'Rooms', icon: <Building2 size={16} /> });
        break;
      case 'Resort':
        if (config.resortTheme) stats.push({ label: 'Theme', value: config.resortTheme, icon: <Tent size={16} /> });
        if (config.resortCategory) stats.push({ label: 'Category', value: config.resortCategory, icon: <Star size={16} /> });
        break;
      case 'Hostel':
        if (config.hostelType) stats.push({ label: 'Type', value: config.hostelType, icon: <Users size={16} /> });
        if (config.curfewTime) stats.push({ label: 'Curfew', value: config.curfewTime, icon: <Clock size={16} /> });
        break;
      default:
        break;
    }

    // Common Stats
    if (policies.checkInTime) stats.push({ label: 'Check-in', value: policies.checkInTime, icon: <Clock size={16} /> });
    if (policies.checkOutTime) stats.push({ label: 'Check-out', value: policies.checkOutTime, icon: <Clock size={16} /> });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-[#004F4D]/5 text-[#004F4D] rounded-lg">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">{stat.label}</p>
              <p className="text-sm font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to render Structured Info based on Type
  const renderAdditionalInfo = () => {
    switch (property.propertyType) {
      case 'Homestay':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield size={20} className="text-[#004F4D]" /> House Rules & Policies
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Alcohol</span>
                  <span className="font-medium">{policies.alcoholAllowed || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Smoking</span>
                  <span className="font-medium">{policies.smokingAllowed || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Pets</span>
                  <span className="font-medium">{policies.petsAllowed || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Loud Music</span>
                  <span className="font-medium">{policies.loudMusicAllowed || 'N/A'}</span>
                </div>
              </div>

              {/* Custom House Rules List */}
              {Array.isArray(houseRules) && houseRules.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-sm mb-2 text-gray-700">Additional Rules:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {houseRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case 'Villa': // Villa specific view could go here
      case 'Hotel': // Hotel specific view
      default:
        // Default Policy View
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-lg mb-4">Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="block text-gray-500 text-xs uppercase mb-1">Cancellation</span>
                <span className="font-medium">{policies.cancellationPolicy || 'Standard'}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="block text-gray-500 text-xs uppercase mb-1">ID Requirement</span>
                <span className="font-medium">{policies.idProofMandatory || policies.idRequirement || policies.idProofRequired ? 'Government ID Required' : 'Standard'}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200">
        {property.images?.cover || property.images?.gallery?.[0] ? (
          <img
            src={property.images.cover || property.images.gallery[0]}
            className="w-full h-full object-cover"
            alt="Property Cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <button onClick={() => navigate('/hotel/properties')} className="bg-white/90 p-2 rounded-full shadow hover:bg-white transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24 text-white">
          <div className="max-w-6xl mx-auto flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[10px] font-bold uppercase border border-white/30">
                  {property.propertyType}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${property.status === 'approved' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                  {property.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-1">{property.name}</h1>
              <div className="flex items-center gap-1 text-sm text-gray-200">
                <MapPin size={14} />
                {property.address?.city}, {property.address?.state}
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Edit size={16} /> Edit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs (Simple) */}
        <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
          {['Overview', 'Rooms / Inventory', 'Photos', 'Nearby'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
              className={`pb-3 font-medium text-sm whitespace-nowrap px-1 transition-colors relative ${activeTab === tab.toLowerCase().split(' ')[0]
                  ? 'text-[#004F4D] font-bold'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
              {activeTab === tab.toLowerCase().split(' ')[0] && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004F4D] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            {renderKeyStats()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Description */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                  <h3 className="font-bold text-lg mb-3">About this property</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {property.description || 'No description provided.'}
                  </p>
                </div>

                {/* Structured Info (Type Specific) */}
                {renderAdditionalInfo()}

                {/* Amenities */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                  <h3 className="font-bold text-lg mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(property.amenities || []).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <div className="w-1.5 h-1.5 bg-[#004F4D] rounded-full" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                {/* Sidebar Info - Address Map */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                  <h3 className="font-bold text-lg mb-4">Location</h3>
                  <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center mb-4 text-gray-400 text-xs">
                    Map Preview
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {property.address?.addressLine}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {property.address?.city}, {property.address?.state} - {property.address?.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <h3 className="font-bold text-xl mb-4 text-[#003836]">Inventory & Rooms</h3>
            {(property.inventory || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.inventory.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                    {/* Room Image */}
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.images && item.images[0] ? (
                        <img src={item.images[0]} className="w-full h-full object-cover" alt={item.type} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-start w-full">
                        <h4 className="font-bold text-lg">{item.type}</h4>
                        <span className="bg-[#004F4D]/10 text-[#004F4D] px-2 py-0.5 rounded textxs font-bold">Qty: {item.count}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{item.capacity ? `Capacity: ${item.capacity} Guests` : ''}</p>
                      <p className="font-bold text-[#004F4D]">₹{item.price} <span className="text-xs font-normal text-gray-400">/ night</span></p>
                      {/* Homestay specific pricing */}
                      {property.propertyType === 'Homestay' && item.pricing && (
                        <div className="text-xs text-gray-500 mt-1">
                          <p>Base: ₹{item.pricing.basePrice}</p>
                          <p>Extra Guest: ₹{item.pricing.extraAdultPrice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">No inventory added yet.</div>
            )}
          </div>
        )}

        {/* Photos Tab & Nearby Tab Placeholders */}
        {activeTab === 'photos' && <div className="text-center py-10 text-gray-500">Photo Gallery Component</div>}
        {activeTab === 'nearby' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(property.nearbyPlaces || []).map((place, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="font-bold">{place.name}</h4>
                <span className="text-xs bg-gray-100 px-2 rounded">{place.category}</span>
                <div className="mt-2 text-sm text-gray-500 flex gap-2">
                  <span>{place.distance}</span>
                  <span>{place.time}</span>
                </div>
              </div>
            ))}
            {(property.nearbyPlaces || []).length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">No nearby places added.</div>}
          </div>
        )}

      </div>
    </div>
  );
};

export default PropertyDetailsPage;
