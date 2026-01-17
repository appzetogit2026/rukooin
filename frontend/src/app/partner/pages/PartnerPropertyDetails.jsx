import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, IndianRupee, Users, BedDouble, ArrowLeft, CheckCircle,
  X, ChevronRight, Info, FileText, Image as ImageIcon, Shield, List,
  Clock, Map, Building2, Calendar
} from 'lucide-react';
import { propertyService } from '../../../services/apiService';

const PartnerPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPricing, setShowPricing] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await propertyService.getDetails(id);

        // Merge documents into property if they exist separately
        const propData = res.property || {};
        if (res.documents && res.documents.documents) {
          propData.documents = res.documents.documents;
        }

        setProperty(propData);
        setRoomTypes(res.roomTypes || []);
      } catch (e) {
        setError(e?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const totalImages = (property?.coverImage ? 1 : 0) + (property?.propertyImages?.length || 0);

  const sections = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: Info,
      desc: property?.propertyType || 'Property Details'
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      desc: property?.address?.city || 'Address Info'
    },
    {
      id: 'images',
      label: 'Photos',
      icon: ImageIcon,
      desc: `${totalImages} Items`
    },
    {
      id: 'amenities',
      label: 'Amenities',
      icon: List,
      desc: `${property?.amenities?.length || 0} Items`
    },
    {
      id: 'rooms',
      label: 'Rooms & Price',
      icon: BedDouble,
      desc: `${roomTypes.length} Types`
    },
    {
      id: 'nearby',
      label: 'Nearby',
      icon: Map,
      desc: `${property?.nearbyPlaces?.length || 0} Places`
    },
    {
      id: 'rules',
      label: 'Rules',
      icon: Clock,
      desc: 'Policies'
    },
    {
      id: 'documents',
      label: 'Docs',
      icon: FileText,
      desc: `${property?.documents?.length || 0} Files`
    },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4 text-center">{error || 'Property not found'}</p>
        <button onClick={() => navigate(-1)} className="text-gray-600 underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-50 overflow-y-auto pb-20 scrollbar-hide">

      {/* ... Custom Header & Hero Banner ... */}
      <div className="fixed top-0 left-0 right-0 z-[60] p-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-gray-700 pointer-events-auto active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="px-3 py-1 bg-white/90 backdrop-blur-md shadow-sm rounded-full pointer-events-auto">
          <span className={`text-xs font-bold uppercase tracking-wide ${property.isLive ? 'text-emerald-600' : 'text-orange-500'}`}>
            {property.isLive ? 'Live' : property.status || 'Pending'}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[35vh] bg-gray-200 rounded-b-[2rem] overflow-hidden shadow-sm">
        {property.coverImage ? (
          <img src={property.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 mb-1">
            <ImageIcon size={48} opacity={0.2} />
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest">
              {property.propertyType}
            </span>
            {totalImages > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-[10px] font-medium flex items-center gap-1">
                <ImageIcon size={10} /> 1 / {totalImages}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1 shadow-black/10 drop-shadow-md">{property.propertyName}</h1>
          <div className="flex items-center gap-1.5 text-xs text-gray-100 font-medium opacity-90">
            <MapPin size={12} />
            <span className="truncate">{property.address?.fullAddress}</span>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="px-4 py-6 space-y-3 pb-24">
        {/* Inventory Management Button */}
        <button
          onClick={() => navigate(`/hotel/inventory/${id}`)}
          className="w-full bg-[#004F4D] text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-900/10 active:scale-[0.99] transition-all mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Calendar size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-base">Manage Inventory</h3>
              <p className="text-emerald-100 text-xs mt-0.5">Availability & Manual Blocks</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-emerald-100" />
        </button>

        <div className="grid grid-cols-2 gap-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-start gap-3 active:scale-[0.98] transition-all hover:border-emerald-100 group relative overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <section.icon size={16} />
              </div>
              <div className="text-left w-full">
                <h3 className="font-bold text-gray-900 text-xs mb-0.5">{section.label}</h3>
                <p className="text-[10px] text-gray-400 font-medium truncate">{section.desc}</p>
              </div>
              <div className="absolute top-3 right-3 text-gray-200 group-hover:text-emerald-200 transition-colors">
                <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Sections Bottom Sheet */}
      {activeSection && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm transition-opacity"
            onClick={() => setActiveSection(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 bg-white z-[80] rounded-t-[2rem] shadow-[0_-4px_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out transform h-[85vh] flex flex-col animate-in slide-in-from-bottom-full"
          >
            <div className="flex-none p-4 pb-2 text-center relative border-b border-gray-50 bg-white rounded-t-[2rem]">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <h2 className="text-base font-bold text-gray-800">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              <button
                onClick={() => setActiveSection(null)}
                className="absolute top-4 right-4 p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {activeSection === 'basic' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase">Property Name</h3>
                  <p className="text-lg font-medium text-gray-900">{property.propertyName}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
                </div>
              </div>
            )}

            {activeSection === 'location' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-emerald-600 mt-1" size={20} />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Address</h3>
                      <p className="text-sm text-gray-600 mt-1">{property.address?.fullAddress}</p>
                      <p className="text-xs text-gray-400 mt-2">{property.address?.city}, {property.address?.state} - {property.address?.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'images' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Property Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.coverImage && (
                    <div className="aspect-square rounded-xl overflow-hidden shadow-sm relative col-span-2">
                      <img src={property.coverImage} className="w-full h-full object-cover" alt="Cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded">Cover</span>
                    </div>
                  )}
                  {property.propertyImages?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-sm bg-white">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'amenities' && (
              <div className="flex flex-wrap gap-2">
                {property.amenities?.map((am, i) => (
                  <span key={i} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-500" />
                    {am}
                  </span>
                ))}
              </div>
            )}

            {activeSection === 'nearby' && (
              <div className="space-y-3">
                {property.nearbyPlaces?.map((place, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                      {place.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{place.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{place.type?.replace('_', ' ')} • {place.distanceKm}km</p>
                    </div>
                  </div>
                ))}
                {(!property.nearbyPlaces || property.nearbyPlaces.length === 0) && (
                  <p className="text-center text-sm text-gray-400 py-4">No nearby places added.</p>
                )}
              </div>
            )}

            {activeSection === 'rules' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Check-in</p>
                    <p className="text-sm font-bold text-gray-900">{property.checkInTime || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Check-out</p>
                    <p className="text-sm font-bold text-gray-900">{property.checkOutTime || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">Cancellation Policy</h4>
                  <p className="text-sm text-gray-600">{property.cancellationPolicy || 'No policy specified.'}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-gray-900">House Rules</h4>
                  {property.houseRules && property.houseRules.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {property.houseRules.map((rule, i) => (
                        <li key={i} className="text-sm text-gray-600">{rule}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No specific house rules.</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'documents' && (
              <div className="space-y-3">
                {property.documents?.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${doc.fileUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-900">{doc.name}</p>
                        <p className={`text-[10px] font-bold uppercase ${doc.fileUrl ? 'text-emerald-600' : 'text-red-500'}`}>
                          {doc.fileUrl ? 'Uploaded' : 'Missing'}
                        </p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100">
                        <ChevronRight size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Room Details Bottom Sheet */}
      {selectedRoom && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRoom(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 bg-white z-[100] rounded-t-[2rem] shadow-[0_-4px_30px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-out transform h-[90vh] flex flex-col animate-in slide-in-from-bottom-full"
          >
            {/* Image Carousel */}
            <div className="relative h-64 w-full bg-gray-100 rounded-t-[2rem] overflow-hidden flex-shrink-0">
              {selectedRoom.images && selectedRoom.images.length > 0 ? (
                <img src={selectedRoom.images[0]} className="w-full h-full object-cover" alt={selectedRoom.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400"><BedDouble size={48} opacity={0.3} /></div>
              )}
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-full text-gray-800 hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>
              {selectedRoom.images?.length > 1 && (
                <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-medium">
                  1 / {selectedRoom.images.length}
                </span>
              )}
            </div>

            {/* Room Details Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
              <div className="space-y-6">
                {/* Header Info */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedRoom.name}</h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                          {selectedRoom.roomCategory}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                          {selectedRoom.inventoryType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-700">₹{selectedRoom.pricePerNight}</div>
                      <div className="text-xs text-gray-400 font-medium">/ night</div>
                    </div>
                  </div>
                </div>

                {/* Capacity Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Room Capacity</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1">
                      <Users size={20} className="text-gray-400 mb-1" />
                      <span className="text-lg font-bold text-gray-900">{selectedRoom.maxAdults}</span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Adults</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1">
                      <Users size={20} className="text-gray-400 mb-1" />
                      <span className="text-lg font-bold text-gray-900">{selectedRoom.maxChildren}</span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Children</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1">
                      <BedDouble size={20} className="text-gray-400 mb-1" />
                      <span className="text-lg font-bold text-gray-900">{selectedRoom.totalInventory}</span>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Units</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown (Expandable) */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowPricing(!showPricing)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <IndianRupee size={16} className="text-emerald-600" />
                      Pricing Details
                    </span>
                    <ChevronRight size={16} className={`text-gray-400 transition-transform ${showPricing ? 'rotate-90' : ''}`} />
                  </button>
                  {showPricing && (
                    <div className="p-4 bg-white border-t border-gray-100 space-y-3 animate-in slide-in-from-top-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Base Price (Per Night)</span>
                        <span className="font-medium text-gray-900">₹{selectedRoom.pricePerNight}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Extra Adult Price</span>
                        <span className="font-medium text-gray-900">₹{selectedRoom.extraAdultPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Extra Child Price</span>
                        <span className="font-medium text-gray-900">₹{selectedRoom.extraChildPrice}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Room Amenities</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRoom.amenities.map((am, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 bg-white border border-gray-100 rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={12} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate">{am}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerPropertyDetails;
