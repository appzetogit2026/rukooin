import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService } from '../../../services/apiService';
import {
  ArrowLeft, MapPin, Star, Edit, Clock, Calendar,
  Wifi, Car, Coffee, Shield, Info, Building2,
  Home, Users, BedDouble, Tent, Utensils, Music,
  FileText, Phone, CheckCircle, XCircle, User, ChevronRight, X, Maximize2
} from 'lucide-react';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInventory, setSelectedInventory] = useState(null);

  useEffect(() => {
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

    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (selectedInventory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedInventory]);

  const handleEdit = () => {
    navigate(`/hotel/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004F4D]"></div>
      </div>
    );
  }

  if (!property) return <div className="p-8 text-center text-xs text-gray-500">Property not found</div>;

  const {
    propertyType,
    config = {},
    policies = {},
    structure = {},
    inventory = [],
    amenities = [],
    nearbyPlaces = [],
    documents = {},
    contacts = {},
    mealPlans = [],
    activities = [],
    pricing = {},
  } = property;

  const InfoCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
      <h3 className="font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2 text-gray-400">
        {Icon && <Icon size={14} className="text-[#004F4D]" />}
        {title}
      </h3>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );

  const KeyValueRow = ({ label, value }) => {
    if (!value || value === 'undefined' || value === 'null') return null;
    return (
      <div className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0 text-xs">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-bold text-gray-800 text-right max-w-[60%]">{value.toString()}</span>
      </div>
    );
  };

  const BooleanRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0 text-xs">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className={`font-bold ${value ? 'text-emerald-600' : 'text-red-500'}`}>
        {value ? 'Yes' : 'No'}
      </span>
    </div>
  );

  const renderQuickStats = () => {
    const stats = [];
    const pushStat = (label, value, icon) => value && stats.push({ label, value, icon });

    pushStat('Type', propertyType, <Building2 size={14} />);

    // Type Specific Stats
    if (propertyType === 'Hotel') {
      pushStat('Rating', config.starRating ? `${config.starRating}` : null, <Star size={14} />);
      pushStat('Cat', config.hotelCategory, <Building2 size={14} />);
    } else if (propertyType === 'Villa') {
      pushStat('BHK', structure.bedrooms ? `${structure.bedrooms} BHK` : null, <Home size={14} />);
      pushStat('Guests', structure.maxGuests, <Users size={14} />);
    }

    pushStat('In', policies.checkInTime, <Clock size={14} />);
    pushStat('Out', policies.checkOutTime, <Clock size={14} />);

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white px-3 py-2.5 rounded-lg border border-gray-100 shadow-sm flex items-center gap-2.5">
            <div className="p-1.5 bg-[#004F4D]/5 text-[#004F4D] rounded-full flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-0.5">{stat.label}</p>
              <p className="text-xs font-black text-gray-800 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConfiguration = () => (
    <InfoCard title="Configuration" icon={Building2}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
        {propertyType === 'Hotel' && (
          <>
            <KeyValueRow label="Category" value={config.hotelCategory} />
            <KeyValueRow label="Rating" value={config.starRating} />
          </>
        )}
        {propertyType === 'Villa' && (
          <>
            <KeyValueRow label="Bedrooms" value={structure.bedrooms} />
            <KeyValueRow label="Bathrooms" value={structure.bathrooms} />
            <KeyValueRow label="Max Guests" value={structure.maxGuests} />
            <BooleanRow label="Kitchen" value={structure.kitchenAvailable} />
            {pricing && <KeyValueRow label="Base Price" value={`₹${pricing.basePrice}`} />}
          </>
        )}
        {propertyType === 'PG' && (
          <>
            <KeyValueRow label="Type" value={config.pgType} />
            <KeyValueRow label="Curfew" value={config.curfewTime} />
            <KeyValueRow label="Notice" value={config.noticePeriod} />
          </>
        )}
        {/* Add other specific configurations similarly if needed */}
      </div>
    </InfoCard>
  );

  const renderPolicies = () => (
    <InfoCard title="Policies" icon={Shield}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
        <KeyValueRow label="Check-in" value={policies.checkInTime} />
        <KeyValueRow label="Check-out" value={policies.checkOutTime} />
        <KeyValueRow label="Cancellation" value={policies.cancellationPolicy} />
        <BooleanRow label="ID Proof Required" value={policies.idProofMandatory || policies.idRequirement} />
        {'petsAllowed' in policies && <BooleanRow label="Pets Allowed" value={policies.petsAllowed} />}
        {'coupleFriendly' in policies && <BooleanRow label="Couple Friendly" value={policies.coupleFriendly === 'Yes'} />}
      </div>
    </InfoCard>
  );

  const renderInventory = () => (
    <div className="space-y-3">
      {inventory.map((item, idx) => {
        // Safe extraction
        const price = item.pricing?.basePrice || item.price || 0;
        const images = item.images || [];
        const thumbnail = images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : null;

        // Construct meta string
        const metaParts = [];
        if (item.capacity) metaParts.push(`${item.capacity} Guests`);
        if (item.roomSize) metaParts.push(`${item.roomSize} sqft`);
        if (item.roomView) metaParts.push(item.roomView);

        return (
          <div
            key={idx}
            onClick={() => setSelectedInventory(item)}
            className="group bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-center hover:shadow-md transition-all cursor-pointer relative overflow-hidden active:scale-[0.99]"
          >
            {/* Image Section */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden relative">
              {thumbnail ? (
                <img src={thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
              ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><BedDouble size={20} /></div>}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 size={16} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-gray-900 truncate pr-2">{item.type || item.name}</h4>
                <div className="text-right flex-shrink-0 leading-none">
                  <span className="font-black text-[#004F4D] text-base">₹{price}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                {metaParts.join(' • ')}
              </div>

              {item.pricing?.weekendPrice && (
                <span className="text-[9px] text-gray-400 line-through">₹{item.pricing.weekendPrice} (Weekend)</span>
              )}
            </div>

            {/* Arrow */}
            <div className="self-center">
              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#004F4D] transition-colors" />
            </div>
          </div>
        );
      })}
      {inventory.length === 0 && <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">No rooms added yet.</div>}
    </div>
  );

  const renderInventorySheet = () => {
    return (
      <AnimatePresence>
        {selectedInventory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInventory(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              {/* Header Image */}
              <div className="relative h-48 bg-gray-200">
                {selectedInventory.images && selectedInventory.images.length > 0 ? (
                  <div className="flex overflow-x-auto snap-x h-full scrollbar-hide">
                    {selectedInventory.images.map((img, i) => {
                      const url = typeof img === 'string' ? img : img.url;
                      return (
                        <img key={i} src={url} className="w-full h-full object-cover flex-shrink-0 snap-center" alt={`Room ${i}`} />
                      )
                    })}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                    <BedDouble size={32} />
                    <span className="text-[10px]">No Images</span>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedInventory(null)}
                  className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur text-white p-2 rounded-full shadow-lg hover:bg-black/70 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>

                {/* Photo Badge */}
                {selectedInventory.images?.length > 0 && (
                  <div className="absolute bottom-3 left-4">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold uppercase rounded-md tracking-wider flex items-center gap-1">
                      <Maximize2 size={8} /> {selectedInventory.images.length} Photos
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 pb-32">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] text-[#004F4D] font-extrabold uppercase tracking-widest mb-0.5 block">Room Details</span>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedInventory.type || selectedInventory.name}</h2>
                    {selectedInventory.roomView && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                        <MapPin className="text-gray-400" size={10} /> {selectedInventory.roomView}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#004F4D]">₹{selectedInventory.pricing?.basePrice || selectedInventory.price}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">Per Night</div>
                  </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-5">
                  <div className="bg-gray-50/80 p-2.5 rounded-xl text-center border border-gray-100/50">
                    <Users size={14} className="mx-auto text-[#004F4D] mb-1 opacity-80" />
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Capacity</p>
                    <p className="text-xs font-black text-gray-800">{selectedInventory.capacity || selectedInventory.maxAdults} Adults</p>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl text-center border border-gray-100/50">
                    <Building2 size={14} className="mx-auto text-[#004F4D] mb-1 opacity-80" />
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Size</p>
                    <p className="text-xs font-black text-gray-800">{selectedInventory.roomSize || 'N/A'} <span className="text-[9px] font-normal">sqft</span></p>
                  </div>
                  <div className="bg-gray-50/80 p-2.5 rounded-xl text-center border border-gray-100/50">
                    <BedDouble size={14} className="mx-auto text-[#004F4D] mb-1 opacity-80" />
                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">Count</p>
                    <p className="text-xs font-black text-gray-800">{selectedInventory.count} Units</p>
                  </div>
                </div>

                {/* Pricing Breakdown - Compact */}
                {selectedInventory.pricing && (
                  <div className="mb-5">
                    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                      <div className="flex justify-between px-3 py-2 border-b border-gray-50 text-xs">
                        <span className="text-gray-500 font-medium">Base Price</span>
                        <span className="font-bold text-gray-900">₹{selectedInventory.pricing.basePrice}</span>
                      </div>
                      {selectedInventory.pricing.weekendPrice && (
                        <div className="flex justify-between px-3 py-2 border-b border-gray-50 text-xs bg-gray-50/50">
                          <span className="text-gray-500 font-medium">Weekend</span>
                          <span className="font-bold text-gray-900">₹{selectedInventory.pricing.weekendPrice}</span>
                        </div>
                      )}
                      <div className="flex justify-between px-3 py-2 text-xs">
                        <span className="text-gray-500 font-medium">Extra Person</span>
                        <span className="font-bold text-orange-600">+ ₹{selectedInventory.pricing.extraAdultPrice}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities - Tiny Pills */}
                {selectedInventory.amenities && selectedInventory.amenities.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInventory.amenities.map((am, i) => (
                        <span key={i} className="flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-1 rounded-md border border-gray-100 text-[10px] font-bold">
                          <CheckCircle size={10} className="text-[#004F4D]" /> {am}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };


  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col font-sans">
      {/* --- FIXED HEADER SECTION --- */}
      <div className="flex-shrink-0 relative z-20">
        <div className="relative h-56 w-full bg-slate-900">
          {property.images?.cover || property.images?.gallery?.[0] ? (
            <img
              src={property.images.cover || property.images.gallery[0]}
              className="w-full h-full object-cover opacity-60"
              alt="Property Cover"
            />
          ) : null}

          {/* Top Actions */}
          <div className="absolute top-4 left-4 z-10">
            <button onClick={() => navigate('/hotel/properties')} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors">
              <ArrowLeft size={18} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
            <div className="max-w-4xl mx-auto flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-1.5 py-0.5 bg-white/20 backdrop-blur rounded-[4px] text-[9px] font-bold uppercase border border-white/10 tracking-wider">
                    {propertyType}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${property.status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {property.status}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black leading-tight mb-1">{property.name}</h1>
                <div className="flex items-center gap-1 text-xs text-gray-300 font-medium opacity-90">
                  <MapPin size={12} />
                  {property.address?.city}, {property.address?.state}
                </div>
              </div>
              <button
                onClick={handleEdit}
                className="bg-white text-gray-900 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Edit size={12} /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* --- FIXED TABS --- */}
        <div className="px-4 -mt-6 relative z-30">
          <div className="flex bg-white p-1 rounded-xl shadow-lg border border-gray-100 w-full overflow-x-auto no-scrollbar">
            {['Overview', 'Inventory', 'Photos', 'Documents', 'Nearby'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap px-3 ${activeTab === tab.toLowerCase()
                  ? 'bg-[#004F4D] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        <div className="animate-fadeIn max-w-4xl mx-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Quick Stats Grid */}
                {renderQuickStats()}

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-2 text-gray-400">About</h3>
                  <p className="text-xs text-gray-600 leading-relaxed text-justify">
                    {property.description || 'No description available for this property.'}
                  </p>
                </div>

                {renderConfiguration()}
                {renderPolicies()}

                {/* Amenities Compact */}
                {amenities.length > 0 && (
                  <InfoCard title="Amenities" icon={CheckCircle}>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((am, i) => (
                        <span key={i} className="text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-600 font-medium">
                          {am}
                        </span>
                      ))}
                    </div>
                  </InfoCard>
                )}
              </div>

              {/* Sidebar: Location & Docs */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400 flex items-center gap-1">
                    <MapPin size={12} /> Location
                  </h3>
                  <p className="text-xs font-bold text-gray-800 leading-snug mb-0.5">{property.address?.addressLine}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-3 text-gray-400 flex items-center gap-1">
                    <Phone size={12} /> Contact Info
                  </h3>
                  <div className="space-y-2">
                    {contacts.managerPhone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Manager</span>
                        <a href={`tel:${contacts.managerPhone}`} className="font-bold text-[#004F4D] bg-emerald-50 px-2 py-0.5 rounded">{contacts.managerPhone}</a>
                      </div>
                    )}
                    {contacts.receptionPhone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Reception</span>
                        <a href={`tel:${contacts.receptionPhone}`} className="font-bold text-gray-800">{contacts.receptionPhone}</a>
                      </div>
                    )}
                    {contacts.emergencyContact && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Emergency</span>
                        <a href={`tel:${contacts.emergencyContact}`} className="font-bold text-gray-800">{contacts.emergencyContact}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && renderInventory()}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-3 gap-2">
              {property.images?.gallery?.map((img, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                  <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                </div>
              ))}
              {(!property.images?.gallery || property.images.gallery.length === 0) && (
                <div className="col-span-full py-12 text-center text-gray-400 text-xs">No photos available</div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(documents).map(([key, url]) => {
                  if (key === '_id' || key === 'id') return null;

                  // Check if file is likely an image
                  const isImage = url && (url.match(/\.(jpeg|jpg|gif|png)$/) != null || url.includes('cloudinary') || url.includes('images'));
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                  return (
                    <div key={key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-xs uppercase tracking-wide text-gray-700">{label}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${url ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {url ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>

                      {url ? (
                        <div className="flex-1 mt-1">
                          {isImage ? (
                            <div className="aspect-video w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group cursor-pointer" onClick={() => window.open(url, '_blank')}>
                              <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm">
                                  View Full
                                </div>
                              </div>
                            </div>
                          ) : (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors group"
                            >
                              <FileText size={24} className="mb-2 text-gray-400 group-hover:text-[#004F4D]" />
                              <span className="text-xs font-medium">View Document</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 h-32 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                          <XCircle size={20} className="mb-2 opacity-50" />
                          <span className="text-[10px]">No document available</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {Object.keys(documents).length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 text-xs">No documents required or uploaded.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="space-y-3">
              {nearbyPlaces.map((place, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{place.name}</h4>
                    <p className="text-[10px] text-gray-500">{place.category}</p>
                  </div>
                  <div className="text-right text-[10px] font-medium text-gray-600">
                    <div>{place.distance}</div>
                    <div>{place.time}</div>
                  </div>
                </div>
              ))}
              {nearbyPlaces.length === 0 && <div className="text-center py-10 text-gray-400 text-xs">No nearby info.</div>}
            </div>
          )}
        </div>
      </div>
      {renderInventorySheet()}
    </div>
  );
};

export default PropertyDetailsPage;
