import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, User, Bed, CheckCircle2, ArrowRight, ArrowLeft, 
  Search, MapPin, Phone, Mail, Camera, Save, Rocket, Copy, Check, ClipboardCheck,
  Loader2, Plus, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../../services/adminService';
import { useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, Autocomplete, MarkerF } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '300px'
};

const STEPS = [
  { id: 'basics', title: 'Basics', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'media', title: 'Media & Facilities', icon: Camera },
  { id: 'rooms', title: 'Rooms & Pricing', icon: Bed },
  { id: 'owner', title: 'Owner Details', icon: User },
  { id: 'review', title: 'Review & Publish', icon: ClipboardCheck },
];

const COMMON_AMENITIES = [
  'Free WiFi', 'AC', 'TV', 'Geyser', 'CCTV', 'Power Backup', 
  'Parking', 'Restaurant', 'Room Service', 'Lift', 'Laundry'
];

const PROPERTY_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'resort', label: 'Resort' },
  { value: 'villa', label: 'Villa' },
  { value: 'homestay', label: 'Homestay' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'pg', label: 'PG' }
];

const AdminFastOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardResult, setOnboardResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // --- GOOGLE MAPS CONFIG ---
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        toast.error("No details available for input: '" + place.name + "'");
        return;
      }

      // Extract Address Components
      const addressComponents = place.address_components || [];
      let city = 'Indore';
      let state = 'Madhya Pradesh';
      let pincode = '';

      addressComponents.forEach(comp => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('postal_code')) pincode = comp.long_name;
      });

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setFormData(prev => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          propertyName: prev.propertyDetails.propertyName || place.name,
          address: {
            ...prev.propertyDetails.address,
            fullAddress: place.formatted_address || '',
            city,
            state,
            pincode
          },
          location: {
            ...prev.propertyDetails.location,
            coordinates: [lng, lat]
          }
        }
      }));

      // Center map on new location
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
      }
    }
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setFormData(prev => ({
      ...prev,
      propertyDetails: {
        ...prev.propertyDetails,
        location: {
          ...prev.propertyDetails.location,
          coordinates: [lng, lat]
        }
      }
    }));
  };

  const [formData, setFormData] = useState({
    propertyDetails: {
      propertyName: '',
      propertyType: 'hotel',
      hotelCategory: 'Budget',
      starRating: 3,
      suitability: 'Both',
      contactNumber: '',
      description: '',
      address: {
        fullAddress: '',
        area: '',
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: ''
      },
      location: {
        type: 'Point',
        coordinates: [78.0322, 30.3165] // Long, Lat (Dehradun Default)
      },
      nearbyPlaces: [], // { name, distanceKm, type }
      coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
      images: [], // Gallery
      amenities: ['Free WiFi', 'AC', 'TV', 'CCTV'],
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM'
    },
    roomTypes: [{
      name: 'Standard Room',
      inventoryType: 'room',
      totalInventory: 10,
      pricePerNight: 1200,
      maxAdults: 2,
      maxChildren: 1,
      amenities: ['AC', 'WiFi', 'TV'],
      images: []
    }],
    ownerDetails: {
      name: '',
      phone: '',
      email: '',
      whatsappNumber: ''
    }
  });

  const [tempNearby, setTempNearby] = useState({ name: '', distanceKm: '', type: 'other' });
  const [isUploading, setIsUploading] = useState(false);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const roomInputRefs = useRef([]);

  const handleFileUpload = async (files, type, roomIdx = null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const toastId = toast.loading('Uploading images...');
    
    try {
      const formDataUpload = new FormData();
      Array.from(files).forEach(file => {
        formDataUpload.append('images', file);
      });

      const response = await adminService.uploadImage(formDataUpload);
      
      if (response.success) {
        const uploadedUrls = response.urls || (response.url ? [response.url] : []);
        
        if (uploadedUrls.length > 0) {
          toast.success('Upload complete!', { id: toastId });
          
          if (type === 'cover') {
            setFormData(prev => ({
              ...prev,
              propertyDetails: { ...prev.propertyDetails, coverImage: uploadedUrls[0] }
            }));
          } else if (type === 'gallery') {
            setFormData(prev => ({
              ...prev,
              propertyDetails: { 
                ...prev.propertyDetails, 
                images: [...prev.propertyDetails.images, ...uploadedUrls] 
              }
            }));
          } else if (type === 'room') {
            setFormData(prev => {
              const newRooms = [...prev.roomTypes];
              newRooms[roomIdx].images = [...(newRooms[roomIdx].images || []), ...uploadedUrls];
              return { ...prev, roomTypes: newRooms };
            });
          }
        } else {
          toast.dismiss(toastId);
          toast.error('No image URL returned from server');
        }
      } else {
        toast.dismiss(toastId);
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try a smaller file.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleManualSubmit = async () => {
    // Validation
    if (!formData.propertyDetails.propertyName || !formData.ownerDetails.phone) {
      toast.error('Property Name and Owner Phone are mandatory!');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adminService.fastOnboard(formData);
      if (result.success) {
        toast.success('Registration successful!');
        setOnboardResult(result);
        setCurrentStep(STEPS.length); // Final success state
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Onboarding failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Fast Track Onboarding</h1>
        <p className="text-slate-500 mt-2">Directly register a partner and their property in 60 seconds.</p>
      </header>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentStep >= idx ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > idx ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${
                currentStep >= idx ? 'text-black' : 'text-slate-400'
              }`}>
                {step.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-100 mx-4 -mt-6">
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > idx ? '100%' : '0%' }}
                  className="h-full bg-black"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div 
              key="step-basics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 className="text-teal-600" /> Property Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Property Name*</label>
                  <input 
                    type="text" 
                    value={formData.propertyDetails.propertyName}
                    onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, propertyName: e.target.value}})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="e.g. Hotel Sunshine"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Property Type</label>
                  <select 
                     value={formData.propertyDetails.propertyType}
                     onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, propertyType: e.target.value}})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  >
                    {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                     value={formData.propertyDetails.hotelCategory}
                     onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, hotelCategory: e.target.value}})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="Budget">Budget</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Star Rating</label>
                  <select 
                     value={formData.propertyDetails.starRating}
                     onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, starRating: Number(e.target.value)}})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  >
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                  <textarea 
                    value={formData.propertyDetails.description}
                    onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, description: e.target.value}})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none h-24 resize-none"
                    placeholder="Briefly describe the property for guests..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
             <motion.div 
               key="step-location"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="p-8 flex-1"
             >
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <MapPin className="text-teal-600" /> Location & Landmarks
               </h2>
               <div className="space-y-6">
                  {/* Google Maps Search & Preview */}
                  {isLoaded ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Property / Area (Google Maps)</label>
                        <Autocomplete
                          onLoad={(auto) => setAutocomplete(auto)}
                          onPlaceChanged={onPlaceChanged}
                        >
                          <div className="relative">
                            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                              type="text"
                              placeholder="Search hotel name or location..."
                              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-black outline-none shadow-sm transition-all font-medium"
                            />
                          </div>
                        </Autocomplete>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">✨ Selecting a location will auto-fill the address and coordinates below.</p>
                      </div>

                      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                        <GoogleMap
                          mapContainerStyle={MAP_CONTAINER_STYLE}
                          zoom={15}
                          center={{ 
                            lat: formData.propertyDetails.location.coordinates[1], 
                            lng: formData.propertyDetails.location.coordinates[0] 
                          }}
                          onLoad={onMapLoad}
                          options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                          }}
                        >
                          <MarkerF 
                            position={{ 
                              lat: formData.propertyDetails.location.coordinates[1], 
                              lng: formData.propertyDetails.location.coordinates[0] 
                            }} 
                            draggable={true}
                            onDragEnd={onMarkerDragEnd}
                          />
                        </GoogleMap>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">Tip: Drag the pin to adjust exact location</p>
                    </div>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                      {loadError ? (
                        <span className="text-red-400 font-bold">Error loading Google Maps API</span>
                      ) : (
                        <>
                          <Loader2 className="animate-spin mb-2" size={24} />
                          <span className="text-xs font-bold">Loading Maps Interface...</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Address*</label>
                      <input 
                        type="text" 
                        value={formData.propertyDetails.address.fullAddress}
                        onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, address: {...formData.propertyDetails.address, fullAddress: e.target.value}}})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                        placeholder="House no, Street, Area..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                      <input 
                        type="text" 
                        value={formData.propertyDetails.address.city}
                        onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, address: {...formData.propertyDetails.address, city: e.target.value}}})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pincode</label>
                      <input 
                        type="text" 
                        value={formData.propertyDetails.address.pincode}
                        onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, address: {...formData.propertyDetails.address, pincode: e.target.value}}})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
                      <input 
                        type="number" 
                        value={formData.propertyDetails.location.coordinates[1]}
                        onChange={(e) => {
                          const newCoords = [...formData.propertyDetails.location.coordinates];
                          newCoords[1] = Number(e.target.value);
                          setFormData({...formData, propertyDetails: {...formData.propertyDetails, location: {...formData.propertyDetails.location, coordinates: newCoords}}});
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
                      <input 
                        type="number" 
                        value={formData.propertyDetails.location.coordinates[0]}
                        onChange={(e) => {
                          const newCoords = [...formData.propertyDetails.location.coordinates];
                          newCoords[0] = Number(e.target.value);
                          setFormData({...formData, propertyDetails: {...formData.propertyDetails, location: {...formData.propertyDetails.location, coordinates: newCoords}}});
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                 </div>

                 <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold mb-4 uppercase text-slate-400 tracking-wider">Nearby Places</h3>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="Place name (e.g. Railway Station)"
                        className="flex-1 px-4 py-2 text-sm rounded-lg border border-slate-200 outline-none"
                        value={tempNearby.name}
                        onChange={(e) => setTempNearby({...tempNearby, name: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Dist (km)"
                        className="w-24 px-4 py-2 text-sm rounded-lg border border-slate-200 outline-none"
                        value={tempNearby.distanceKm}
                        onChange={(e) => setTempNearby({...tempNearby, distanceKm: e.target.value})}
                      />
                      <button 
                        onClick={() => {
                          if (tempNearby.name && tempNearby.distanceKm) {
                            setFormData({...formData, propertyDetails: {...formData.propertyDetails, nearbyPlaces: [...formData.propertyDetails.nearbyPlaces, {...tempNearby, distanceKm: Number(tempNearby.distanceKm)}]}});
                            setTempNearby({name: '', distanceKm: '', type: 'other'});
                          }
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.propertyDetails.nearbyPlaces.map((p, i) => (
                         <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200 text-xs font-bold">
                           <span>{p.name} ({p.distanceKm}km)</span>
                           <button 
                            onClick={() => {
                              const newList = [...formData.propertyDetails.nearbyPlaces];
                              newList.splice(i, 1);
                              setFormData({...formData, propertyDetails: {...formData.propertyDetails, nearbyPlaces: newList}});
                            }}
                            className="text-red-500 hover:text-red-700"
                           >
                              ×
                           </button>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
               key="step-media"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="p-8 flex-1"
            >
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Camera className="text-teal-600" /> Media & Facilities
               </h2>
               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover Image*</label>
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all relative overflow-hidden group"
                      >
                        {formData.propertyDetails.coverImage ? (
                          <>
                            <img src={formData.propertyDetails.coverImage} className="w-full h-full object-cover" alt="Cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-bold px-3 py-1 bg-white/20 rounded-full backdrop-blur-md">Change Photo</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <Camera className="text-slate-300 mb-2" size={32} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Click to Upload Cover</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={coverInputRef}
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files, 'cover')}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Check-in/out Timing</label>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="text-[10px] text-slate-400 font-bold mb-1 block">Check-in</span>
                            <input 
                              type="text" 
                              value={formData.propertyDetails.checkInTime}
                              onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, checkInTime: e.target.value}})}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold"
                              placeholder="12:00 PM"
                            />
                         </div>
                         <div>
                            <span className="text-[10px] text-slate-400 font-bold mb-1 block">Check-out</span>
                            <input 
                              type="text" 
                              value={formData.propertyDetails.checkOutTime}
                              onChange={(e) => setFormData({...formData, propertyDetails: {...formData.propertyDetails, checkOutTime: e.target.value}})}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold"
                              placeholder="11:00 AM"
                            />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Property Gallery</label>
                       <span className="text-[10px] font-bold text-slate-300">{formData.propertyDetails.images.length} Photos</span>
                    </div>
                    
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                       <div 
                         onClick={() => galleryInputRef.current?.click()}
                         className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-all"
                       >
                         <Plus className="text-slate-300" size={24} />
                         <span className="text-[8px] font-bold text-slate-400">UPLOAD</span>
                         <input 
                           type="file" 
                           ref={galleryInputRef}
                           multiple
                           className="hidden" 
                           accept="image/*"
                           onChange={(e) => handleFileUpload(e.target.files, 'gallery')}
                         />
                       </div>

                       {formData.propertyDetails.images.map((img, i) => (
                         <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                           <img src={img} className="w-full h-full object-cover" alt="" />
                           <button 
                            onClick={() => {
                              const newList = [...formData.propertyDetails.images];
                              newList.splice(i, 1);
                              setFormData({...formData, propertyDetails: {...formData.propertyDetails, images: newList}});
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                           >
                            <X size={12} />
                           </button>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Property Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                       {COMMON_AMENITIES.map(amenity => (
                         <button 
                          key={amenity}
                          onClick={() => {
                            const current = formData.propertyDetails.amenities;
                            const newList = current.includes(amenity) 
                              ? current.filter(a => a !== amenity)
                              : [...current, amenity];
                            setFormData({...formData, propertyDetails: {...formData.propertyDetails, amenities: newList}});
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                            formData.propertyDetails.amenities.includes(amenity)
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                         >
                           <div className={`w-2 h-2 rounded-full ${formData.propertyDetails.amenities.includes(amenity) ? 'bg-teal-400 animate-pulse' : 'bg-slate-200'}`} />
                           <span className="text-[10px] font-bold uppercase">{amenity}</span>
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step-rooms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bed className="text-teal-600" /> Inventory & Pricing
              </h2>
              <div className="space-y-6">
                {formData.roomTypes.map((room, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Category Name</label>
                        <input 
                          type="text" 
                          value={room.name}
                          onChange={(e) => {
                            const newRooms = [...formData.roomTypes];
                            newRooms[idx].name = e.target.value;
                            setFormData({...formData, roomTypes: newRooms});
                          }}
                          className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-black outline-none font-bold"
                          placeholder="Standard Room"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price / Night</label>
                          <input 
                            type="number" 
                            value={room.pricePerNight}
                            onChange={(e) => {
                              const newRooms = [...formData.roomTypes];
                              newRooms[idx].pricePerNight = Number(e.target.value);
                              setFormData({...formData, roomTypes: newRooms});
                            }}
                            className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-black outline-none font-black text-teal-600"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Rooms</label>
                          <input 
                            type="number" 
                            value={room.totalInventory}
                            onChange={(e) => {
                              const newRooms = [...formData.roomTypes];
                              newRooms[idx].totalInventory = Number(e.target.value);
                              setFormData({...formData, roomTypes: newRooms});
                            }}
                            className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-black outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {['WiFi', 'AC', 'TV', 'Geyser', 'Balcony'].map(amenity => (
                          <button 
                            key={amenity}
                            onClick={() => {
                              const newRooms = [...formData.roomTypes];
                              const current = newRooms[idx].amenities || [];
                              newRooms[idx].amenities = current.includes(amenity)
                                ? current.filter(a => a !== amenity)
                                : [...current, amenity];
                              setFormData({...formData, roomTypes: newRooms});
                            }}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              (room.amenities || []).includes(amenity)
                              ? 'bg-black text-white'
                              : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                            }`}
                          >
                            {amenity}
                          </button>
                        ))}
                    </div>

                    <div className="mt-4">
                       <input 
                         type="file" 
                         multiple 
                         className="hidden" 
                         ref={el => roomInputRefs.current[idx] = el}
                         onChange={(e) => handleFileUpload(e.target.files, 'room', idx)}
                       />
                       <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => roomInputRefs.current[idx]?.click()}
                            className="p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-teal-400 transition-all"
                          >
                            <Camera size={14} className="text-slate-400" />
                          </button>
                          {room.images?.map((rimg, ri) => (
                            <div key={ri} className="relative group w-10 h-10 rounded-lg overflow-hidden shadow-sm">
                              <img src={rimg} className="w-full h-full object-cover" alt="" />
                              <button 
                                onClick={() => {
                                  const newRooms = [...formData.roomTypes];
                                  newRooms[idx].images.splice(ri, 1);
                                  setFormData({...formData, roomTypes: newRooms});
                                }}
                                className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                       </div>
                    </div>

                    <button 
                      onClick={() => {
                        const newRooms = formData.roomTypes.filter((_, i) => i !== idx);
                        setFormData({...formData, roomTypes: newRooms});
                      }}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={() => setFormData({...formData, roomTypes: [...formData.roomTypes, { name: '', inventoryType: 'room', totalInventory: 5, pricePerNight: 1000, maxAdults: 2, maxChildren: 1, amenities: [], images: [] }]})}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Another Room Category
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div 
              key="step-owner"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-teal-600" /> Partner Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Owner Full Name*</label>
                  <input 
                    type="text" 
                    value={formData.ownerDetails.name}
                    onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, name: e.target.value}})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Primary Phone Number*</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-slate-400 font-bold" size={18} />
                    <input 
                      type="tel" 
                      value={formData.ownerDetails.phone}
                      onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, phone: e.target.value}})}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      placeholder="Enter 10 digit number"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 font-bold" size={18} />
                    <input 
                      type="email" 
                      value={formData.ownerDetails.email}
                      onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, email: e.target.value}})}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      placeholder="owner@example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                <div className="text-amber-600 pt-0.5 font-bold"><Search size={18} /></div>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  If this phone number is already registered, the new property will be automatically linked to their existing account.
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div 
              key="step-review"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 flex-1"
            >
              <h2 className="text-xl font-bold mb-6">Final Review</h2>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-100">
                    <div className="flex gap-4">
                      <img src={formData.propertyDetails.coverImage} className="w-20 h-20 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{formData.propertyDetails.propertyName || 'Unnamed Property'}</h3>
                        <p className="text-sm text-slate-500">{formData.propertyDetails.address.city}, {formData.propertyDetails.address.state}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(formData.propertyDetails.starRating)].map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Owner</span>
                      <span className="font-bold text-sm block">{formData.ownerDetails.name || 'N/A'}</span>
                      <span className="text-xs text-slate-500">{formData.ownerDetails.phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Inventory</span>
                      <span className="font-bold text-sm block">{formData.roomTypes.length} Room Types</span>
                      <span className="text-xs text-slate-500">Total {formData.roomTypes.reduce((acc, curr) => acc + curr.totalInventory, 0)} Units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Starting Price</span>
                      <span className="font-black text-xl text-teal-600 block">₹{formData.roomTypes[0]?.pricePerNight}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Status Upon Publishing</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase inline-block">Instantly Live</span>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-2">
                     {formData.propertyDetails.amenities.slice(0, 8).map(a => (
                       <span key={a} className="px-2 py-1 bg-white border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase">{a}</span>
                     ))}
                     {formData.propertyDetails.amenities.length > 8 && <span className="text-[9px] font-bold text-slate-400 uppercase">+{formData.propertyDetails.amenities.length - 8} More</span>}
                  </div>
                </div>

                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 flex gap-3">
                  <CheckCircle2 className="text-teal-600 shrink-0" size={20} />
                  <p className="text-xs text-teal-800 font-medium leading-relaxed">
                    Property will be automatically tagged with <strong>Fast Tracked</strong> badge and pre-approved for immediate bookings.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === STEPS.length && (
            <motion.div 
               key="step-success"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-12 flex-1 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-12 h-12 text-teal-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Onboarding Complete!</h2>
              <p className="text-slate-500 mb-10 max-w-sm">
                The partner and property are now registered. Send this unique login link to the partner manually.
              </p>

              <div className="w-full max-w-md p-6 bg-slate-900 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <h3 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3 text-left">Partner Magic Link</h3>
                  <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5">
                    <span className="text-white text-sm truncate flex-1 block">
                      {onboardResult?.magicLink}
                    </span>
                    <button 
                      onClick={() => copyToClipboard(onboardResult?.magicLink)}
                      className="p-2.5 bg-white rounded-xl text-black hover:bg-teal-50 transition-colors"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 rounded-2xl font-bold bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all"
                >
                  Onboard Another
                </button>
                <button 
                  onClick={() => navigate('/admin/properties')}
                  className="px-8 py-3 rounded-2xl font-bold bg-black text-white hover:shadow-lg transition-all"
                >
                  Go to Properties
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentStep < STEPS.length && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 0 ? 'opacity-0' : 'text-slate-500 hover:text-black hover:bg-white'
              }`}
            >
              <ArrowLeft size={20} /> Back
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-10 py-4 bg-teal-600 text-white rounded-2xl font-black text-lg hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="animate-spin" /> Publishing...</>
                ) : (
                  <><Rocket size={24} /> Publish Property</>
                )}
              </button>
            ) : (
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-bold hover:shadow-lg hover:shadow-slate-200 transition-all"
              >
                Next <ArrowRight size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Safety Badge */}
      <div className="mt-12 flex justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
          <CheckCircle2 size={16} className="text-green-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Strict Isolation Mode Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default AdminFastOnboarding;
