import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService, hotelService } from '../../../services/apiService';
import {
  CheckCircle, FileText, Home, Image, Plus, Trash2, MapPin, Search,
  BedDouble, Wifi, Tv, Snowflake, Coffee, ShowerHead, Umbrella, Waves, Mountain, Trees, Sun
} from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_RESORT = [
  { type: "trade_license", name: "Trade License" },
  { type: "gst_certificate", name: "GST Certificate" },
  { type: "fssai_license", name: "FSSAI License" },
  { type: "fire_safety", name: "Fire Safety Certificate" }
];

const RESORT_AMENITIES = ["Swimming Pool", "Restaurant", "Bar", "Parking"];
const RESORT_ACTIVITIES = ["Water Sports", "Spa", "Bonfire", "Indoor Games"];
const RESORT_TYPES = [
  { value: 'beach', label: 'Beach Resort', icon: Waves },
  { value: 'hill', label: 'Hill Resort', icon: Mountain },
  { value: 'jungle', label: 'Jungle Resort', icon: Trees },
  { value: 'desert', label: 'Desert Resort', icon: Sun }
];
const ROOM_AMENITIES_OPTIONS = [
  { key: 'seaview', label: 'Sea View', icon: Waves },
  { key: 'ac', label: 'AC', icon: Snowflake },
  { key: 'minibar', label: 'Mini Bar', icon: Coffee },
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'geyser', label: 'Geyser', icon: ShowerHead }
];
const HOUSE_RULES_OPTIONS = ["No smoking", "No pets", "No loud music", "ID required at check-in"];

const AddResortWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingProperty = location.state?.property || null;
  const isEditMode = !!existingProperty;
  const initialStep = location.state?.initialStep || 1;
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProperty, setCreatedProperty] = useState(null);

  // Maps / Location State
  const [nearbySearchQuery, setNearbySearchQuery] = useState('');
  const [nearbyResults, setNearbyResults] = useState([]);
  const [editingNearbyIndex, setEditingNearbyIndex] = useState(null);
  const [tempNearbyPlace, setTempNearbyPlace] = useState({ name: '', type: 'tourist', distanceKm: '' });
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);

  // Image Upload State (Ref matching Hotel wizard)
  const [uploading, setUploading] = useState(false);
  const coverImageFileInputRef = useRef(null);
  const propertyImagesFileInputRef = useRef(null);
  const roomImagesFileInputRef = useRef(null);

  // Form State
  const [propertyForm, setPropertyForm] = useState({
    propertyName: 'Blue Lagoon Beach Resort',
    description: 'Beachside resort with private cottages and activities',
    shortDescription: 'Luxury beach resort with water sports',
    resortType: 'beach',
    activities: ['Water Sports', 'Spa'],
    coverImage: '',
    propertyImages: [],
    address: { country: 'India', state: 'Goa', city: 'South Goa', area: 'Benaulim', fullAddress: '', pincode: '403716' },
    location: { type: 'Point', coordinates: ['', ''] },
    nearbyPlaces: [],
    amenities: [],
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation before 10 days',
    houseRules: ['No loud music after 10 PM'],
    documents: REQUIRED_DOCS_RESORT.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [editingRoomTypeIndex, setEditingRoomTypeIndex] = useState(null);
  const [originalRoomTypeIds, setOriginalRoomTypeIds] = useState([]);

  // Helper Functions
  const updatePropertyForm = (path, value) => {
    setPropertyForm(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = Array.isArray(path) ? path : String(path).split('.');
      let ref = clone;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const updateRoomType = (path, value) => {
    if (!editingRoomType) return;
    setEditingRoomType(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = Array.isArray(path) ? path : String(path).split('.');
      let ref = clone;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
      ref[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  // --- API / Maps Logic ---
  const useCurrentLocation = async () => {
    try {
      setError('');
      if (!navigator.geolocation) {
        setError('Geolocation not supported');
        return;
      }
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      }).then(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const res = await hotelService.getAddressFromCoordinates(lat, lng);
        updatePropertyForm(['location', 'coordinates'], [String(lng), String(lat)]);
        updatePropertyForm('address', {
          country: res.country || '',
          state: res.state || '',
          city: res.city || '',
          area: res.area || '',
          fullAddress: res.fullAddress || '',
          pincode: res.pincode || ''
        });
      }).catch(() => {
        setError('Failed to get current location');
      });
    } catch {
      setError('Failed to fetch address');
    }
  };

  const searchLocationForAddress = async () => {
    try {
      setError('');
      if (!locationSearchQuery.trim()) return;
      const res = await hotelService.searchLocation(locationSearchQuery.trim());
      setLocationResults(Array.isArray(res?.results) ? res.results : []);
    } catch {
      setError('Failed to search location');
    }
  };

  const selectLocationResult = async (place) => {
    try {
      setError('');
      const lat = place.lat;
      const lng = place.lng;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      const res = await hotelService.getAddressFromCoordinates(lat, lng);
      updatePropertyForm(['location', 'coordinates'], [String(lng), String(lat)]);
      updatePropertyForm('address', {
        country: res.country || '',
        state: res.state || '',
        city: res.city || '',
        area: res.area || '',
        fullAddress: res.fullAddress || '',
        pincode: res.pincode || ''
      });
      setLocationResults([]);
    } catch {
      setError('Failed to use selected location');
    }
  };

  const searchNearbyPlaces = async () => {
    try {
      setError('');
      if (!nearbySearchQuery.trim()) return;
      const res = await hotelService.searchLocation(nearbySearchQuery.trim());
      setNearbyResults(Array.isArray(res?.results) ? res.results : []);
    } catch {
      setError('Failed to search places');
    }
  };

  const selectNearbyPlace = async (place) => {
    try {
      const originLat = Number(propertyForm.location.coordinates[1] || 0);
      const originLng = Number(propertyForm.location.coordinates[0] || 0);
      const destLat = place.lat;
      const destLng = place.lng;
      let km = '';
      if (originLat && originLng && destLat && destLng) {
        const distRes = await hotelService.calculateDistance(originLat, originLng, destLat, destLng);
        km = distRes?.distanceKm ? String(distRes.distanceKm) : '';
      }
      setTempNearbyPlace(prev => ({ ...prev, name: place.name || '', distanceKm: km }));
      setNearbyResults([]);
      setNearbySearchQuery('');
    } catch {
      setTempNearbyPlace(prev => ({ ...prev, name: place.name || '' }));
    }
  };

  const startAddNearbyPlace = () => {
    if (propertyForm.nearbyPlaces.length >= 5) {
      setError('Maximum 5 nearby places allowed');
      return;
    }
    setError('');
    setEditingNearbyIndex(-1);
    setTempNearbyPlace({ name: '', type: 'tourist', distanceKm: '' });
    setNearbySearchQuery('');
    setNearbyResults([]);
  };

  const startEditNearbyPlace = (index) => {
    setError('');
    setEditingNearbyIndex(index);
    setTempNearbyPlace({ ...propertyForm.nearbyPlaces[index] });
    setNearbySearchQuery('');
    setNearbyResults([]);
  };

  const saveNearbyPlace = () => {
    if (!tempNearbyPlace.name || !tempNearbyPlace.distanceKm) {
      setError('Name and Distance are required');
      return;
    }
    const arr = [...propertyForm.nearbyPlaces];
    if (editingNearbyIndex === -1) {
      arr.push(tempNearbyPlace);
    } else {
      arr[editingNearbyIndex] = tempNearbyPlace;
    }
    updatePropertyForm('nearbyPlaces', arr);
    setEditingNearbyIndex(null);
    setError('');
  };

  const deleteNearbyPlace = (index) => {
    const arr = propertyForm.nearbyPlaces.filter((_, i) => i !== index);
    updatePropertyForm('nearbyPlaces', arr);
  };

  const cancelEditNearbyPlace = () => {
    setEditingNearbyIndex(null);
    setError('');
  };

  // --- Room Type ---
  const startAddRoomType = () => {
    setError('');
    setEditingRoomTypeIndex(-1);
    setEditingRoomType({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: 'Deluxe Beach Cottage',
      inventoryType: 'room',
      roomCategory: 'private',
      maxAdults: 2,
      maxChildren: 1,
      totalInventory: 20,
      pricePerNight: 9500,
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: [],
      amenities: ['Sea View', 'AC', 'Mini Bar'],
      isActive: true
    });
  };

  const startEditRoomType = (index) => {
    setError('');
    setEditingRoomTypeIndex(index);
    const rt = roomTypes[index];
    setEditingRoomType({
      ...rt,
      images: Array.isArray(rt.images) ? rt.images : [],
      amenities: Array.isArray(rt.amenities) ? rt.amenities : []
    });
  };

  const deleteRoomType = (index) => {
    setRoomTypes(prev => prev.filter((_, i) => i !== index));
    if (editingRoomTypeIndex === index) {
      setEditingRoomType(null);
      setEditingRoomTypeIndex(null);
    }
  };

  const cancelEditRoomType = () => {
    setEditingRoomType(null);
    setEditingRoomTypeIndex(null);
    setError('');
  };

  const saveRoomType = () => {
    if (!editingRoomType) return;
    if (!editingRoomType.name || !editingRoomType.pricePerNight) {
      setError('Room type name and price required');
      return;
    }
    if ((editingRoomType.images || []).filter(Boolean).length < 3) {
      setError('Please upload at least 3 room images');
      return;
    }
    const next = [...roomTypes];
    if (editingRoomTypeIndex === -1 || editingRoomTypeIndex == null) {
      next.push(editingRoomType);
    } else {
      next[editingRoomTypeIndex] = editingRoomType;
    }
    setRoomTypes(next);
    setEditingRoomType(null);
    setEditingRoomTypeIndex(null);
    setError('');
  };

  const toggleRoomAmenity = (label) => {
    setEditingRoomType(prev => {
      if (!prev) return prev;
      const has = prev.amenities.includes(label);
      return {
        ...prev,
        amenities: has ? prev.amenities.filter(a => a !== label) : [...prev.amenities, label]
      };
    });
  };

  const uploadImages = async (files, onDone) => {
    try {
      setUploading(true);
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append('images', f));
      const res = await hotelService.uploadImages(fd);
      const urls = Array.isArray(res?.urls) ? res.urls : [];
      onDone(urls);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // --- Load Edit ---
  useEffect(() => {
    const loadForEdit = async () => {
      if (!isEditMode || !existingProperty?._id) return;
      setLoading(true);
      setError('');
      try {
        const res = await propertyService.getDetails(existingProperty._id);
        const prop = res.property || existingProperty;
        const docs = res.documents?.documents || [];
        const rts = res.roomTypes || [];
        setCreatedProperty(prop);
        setPropertyForm({
          propertyName: prop.propertyName || '',
          description: prop.description || '',
          shortDescription: prop.shortDescription || '',
          resortType: prop.resortType || 'beach',
          activities: prop.activities || [],
          coverImage: prop.coverImage || '',
          propertyImages: prop.propertyImages || [],
          address: {
            country: prop.address?.country || '',
            state: prop.address?.state || '',
            city: prop.address?.city || '',
            area: prop.address?.area || '',
            fullAddress: prop.address?.fullAddress || '',
            pincode: prop.address?.pincode || ''
          },
          location: {
            type: 'Point',
            coordinates: [
              typeof prop.location?.coordinates?.[0] === 'number' ? String(prop.location.coordinates[0]) : '',
              typeof prop.location?.coordinates?.[1] === 'number' ? String(prop.location.coordinates[1]) : ''
            ]
          },
          nearbyPlaces: Array.isArray(prop.nearbyPlaces) && prop.nearbyPlaces.length
            ? prop.nearbyPlaces.map(p => ({
              name: p.name || '',
              type: p.type || 'tourist',
              distanceKm: typeof p.distanceKm === 'number' ? String(p.distanceKm) : ''
            })) : [],
          amenities: prop.amenities || [],
          checkInTime: prop.checkInTime || '',
          checkOutTime: prop.checkOutTime || '',
          cancellationPolicy: prop.cancellationPolicy || '',
          houseRules: prop.houseRules || [],
          documents: docs.length
            ? docs.map(d => ({ type: d.type || d.name, name: d.name, fileUrl: d.fileUrl || '' }))
            : REQUIRED_DOCS_RESORT.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
        });

        if (rts.length) {
          setRoomTypes(rts.map(rt => ({
            id: rt._id, backendId: rt._id,
            name: rt.name,
            inventoryType: rt.inventoryType || 'room',
            roomCategory: rt.roomCategory || 'private',
            maxAdults: rt.maxAdults ?? 1, maxChildren: rt.maxChildren ?? 0,
            totalInventory: rt.totalInventory ?? 1,
            pricePerNight: rt.pricePerNight ?? '',
            extraAdultPrice: rt.extraAdultPrice ?? 0, extraChildPrice: rt.extraChildPrice ?? 0,
            images: rt.images || [], amenities: rt.amenities || [], isActive: rt.isActive ?? true
          })));
          setOriginalRoomTypeIds(rts.map(rt => rt._id));
        } else {
          setOriginalRoomTypeIds([]);
        }
      } catch (e) {
        setError(e?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    loadForEdit();
  }, [isEditMode, existingProperty]);

  // --- Strict Validation ---
  const nextFromBasic = () => {
    setError('');
    if (!propertyForm.propertyName || !propertyForm.shortDescription) {
      setError('Property Name and Short Description required');
      return;
    }
    if (!propertyForm.resortType) {
      setError('Please select a Resort Type');
      return;
    }
    setStep(2);
  };
  const nextFromLocation = () => {
    setError('');
    if (!propertyForm.address.fullAddress || !propertyForm.address.city || !propertyForm.location.coordinates[0]) {
      setError('Full Address and Map Location are required');
      return;
    }
    setStep(3);
  };
  const nextFromAmenities = () => {
    setError('');
    // Resort might not strictly require amenities, but usually good to have.
    setStep(4);
  };
  const nextFromNearby = () => {
    setError('');
    if (propertyForm.nearbyPlaces.length < 3) {
      setError('Please add at least 3 nearby places');
      return;
    }
    setStep(5);
  };
  const nextFromImages = () => {
    setError('');
    if (!propertyForm.coverImage) {
      setError('Cover Image is required');
      return;
    }
    if (propertyForm.propertyImages.length < 4) {
      setError('At least 4 Property Images required');
      return;
    }
    setStep(6);
  };
  const nextFromRoomTypes = () => {
    setError('');
    if (!roomTypes.length) {
      setError('At least one Room/Cottage Type required');
      return;
    }
    // Validate each room if needed, but basic checks on add/edit are usually enough.
    setStep(7);
  };
  const nextFromRules = () => {
    setError('');
    if (!propertyForm.checkInTime || !propertyForm.checkOutTime) {
      setError('Check-in and Check-out times required');
      return;
    }
    if (!propertyForm.cancellationPolicy) {
      setError('Cancellation Policy required');
      return;
    }
    setStep(8);
  };
  const nextFromDocs = () => {
    setError('');
    const missing = propertyForm.documents.some(d => !d.fileUrl);
    if (missing) {
      setError('Please upload all required documents');
      return;
    }
    setStep(9);
  };

  const submitAll = async () => {
    setLoading(true);
    setError('');
    try {
      const propertyPayload = {
        propertyType: 'resort',
        propertyName: propertyForm.propertyName,
        description: propertyForm.description,
        shortDescription: propertyForm.shortDescription,
        resortType: propertyForm.resortType,
        activities: propertyForm.activities,
        coverImage: propertyForm.coverImage,
        propertyImages: propertyForm.propertyImages.filter(Boolean),
        address: propertyForm.address,
        location: {
          type: 'Point',
          coordinates: [Number(propertyForm.location.coordinates[0]), Number(propertyForm.location.coordinates[1])]
        },
        nearbyPlaces: propertyForm.nearbyPlaces.map(p => ({
          name: p.name, type: p.type, distanceKm: Number(p.distanceKm || 0)
        })),
        amenities: propertyForm.amenities,
        checkInTime: propertyForm.checkInTime,
        checkOutTime: propertyForm.checkOutTime,
        cancellationPolicy: propertyForm.cancellationPolicy,
        houseRules: propertyForm.houseRules
      };

      let propId = createdProperty?._id;
      if (isEditMode && propId) {
        const updated = await propertyService.update(propId, propertyPayload);
        propId = updated.property?._id || propId;
      } else {
        const res = await propertyService.create(propertyPayload);
        propId = res.property?._id;
        setCreatedProperty(res.property);
      }

      const documentsPayload = propertyForm.documents.map(d => ({ type: d.type, name: d.name, fileUrl: d.fileUrl }));
      if (documentsPayload.length) {
        await propertyService.upsertDocuments(propId, documentsPayload);
      }

      const existingIds = new Set(isEditMode ? originalRoomTypeIds : []);
      const persistedIds = [];
      for (const rt of roomTypes) {
        const payload = {
          name: rt.name,
          inventoryType: 'room',
          roomCategory: rt.roomCategory,
          maxAdults: Number(rt.maxAdults),
          maxChildren: Number(rt.maxChildren || 0),
          totalInventory: Number(rt.totalInventory || 0),
          pricePerNight: Number(rt.pricePerNight),
          extraAdultPrice: Number(rt.extraAdultPrice || 0),
          extraChildPrice: Number(rt.extraChildPrice || 0),
          images: rt.images.filter(Boolean),
          amenities: rt.amenities
        };
        if (rt.backendId) {
          await propertyService.updateRoomType(propId, rt.backendId, payload);
          persistedIds.push(rt.backendId);
        } else {
          const created = await propertyService.addRoomType(propId, payload);
          if (created.roomType?._id) persistedIds.push(created.roomType._id);
        }
      }
      for (const id of existingIds) {
        if (!persistedIds.includes(id)) await propertyService.deleteRoomType(propId, id);
      }
      navigate('/hotel/dashboard');
    } catch (e) {
      setError(e?.message || 'Failed to submit resort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white/60 border-b border-gray-100 backdrop-blur-sm flex items-center justify-center sticky top-0 z-50">
        <img src={logo} alt="Rukkoin" className="h-6" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#004F4D] transition-all duration-300" style={{ width: `${(Math.min(step, 9) / 9) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
              <span>Step {Math.min(step, 9)} of 9</span>
              <span>
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Location'}
                {step === 3 && 'Amenities'}
                {step === 4 && 'Nearby'}
                {step === 5 && 'Images'}
                {step === 6 && 'Cottages/Rooms'}
                {step === 7 && 'Rules'}
                {step === 8 && 'Docs'}
                {step >= 9 && 'Review'}
              </span>
            </div>
          </div>

          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 1 — Basic Info</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input className="input" placeholder="Resort Name" value={propertyForm.propertyName} onChange={e => updatePropertyForm('propertyName', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  {RESORT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updatePropertyForm('resortType', type.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${propertyForm.resortType === type.value
                          ? 'border-[#004F4D] bg-[#004F4D]/5 text-[#004F4D]'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                      <type.icon size={18} />
                      <span className="text-sm font-semibold">{type.label}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Activities</label>
                  <div className="flex flex-wrap gap-2">
                    {RESORT_ACTIVITIES.map(act => (
                      <button
                        key={act} type="button"
                        onClick={() => {
                          const has = propertyForm.activities.includes(act);
                          updatePropertyForm('activities', has ? propertyForm.activities.filter(a => a !== act) : [...propertyForm.activities, act]);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${propertyForm.activities.includes(act)
                            ? 'bg-[#004F4D] text-white border-[#004F4D]'
                            : 'bg-white text-gray-600 border-gray-200'
                          }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea className="input" placeholder="Short Description" value={propertyForm.shortDescription} onChange={e => updatePropertyForm('shortDescription', e.target.value)} />
                <textarea className="input h-24" placeholder="Full Description" value={propertyForm.description} onChange={e => updatePropertyForm('description', e.target.value)} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => navigate(-1)}>Back</button>
                <button disabled={loading} onClick={nextFromBasic} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 2 — Location</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="mb-3 space-y-2">
                <div className="flex gap-2 relative">
                  <input className="input flex-1" placeholder="Search location" value={locationSearchQuery} onChange={e => setLocationSearchQuery(e.target.value)} />
                  <button type="button" onClick={searchLocationForAddress} className="px-3 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Search</button>
                  {locationResults.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-56 overflow-auto">
                      {locationResults.map((r, i) => (
                        <button key={i} type="button" onClick={() => selectLocationResult(r)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-sm">
                          <div className="font-medium">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.formatted_address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Country" value={propertyForm.address.country} onChange={e => updatePropertyForm(['address', 'country'], e.target.value)} />
                <input className="input" placeholder="State" value={propertyForm.address.state} onChange={e => updatePropertyForm(['address', 'state'], e.target.value)} />
                <input className="input" placeholder="City" value={propertyForm.address.city} onChange={e => updatePropertyForm(['address', 'city'], e.target.value)} />
                <input className="input" placeholder="Area" value={propertyForm.address.area} onChange={e => updatePropertyForm(['address', 'area'], e.target.value)} />
                <input className="input col-span-2" placeholder="Full Address" value={propertyForm.address.fullAddress} onChange={e => updatePropertyForm(['address', 'fullAddress'], e.target.value)} />
                <input className="input" placeholder="Pincode" value={propertyForm.address.pincode} onChange={e => updatePropertyForm(['address', 'pincode'], e.target.value)} />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={useCurrentLocation} className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold inline-flex items-center gap-2">
                  <MapPin size={16} /> Use Current Location
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(1)}>Back</button>
                <button disabled={loading} onClick={nextFromLocation} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Umbrella size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 3 — Amenities</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {RESORT_AMENITIES.map(am => (
                  <button key={am} type="button" onClick={() => {
                    const has = propertyForm.amenities.includes(am);
                    updatePropertyForm('amenities', has ? propertyForm.amenities.filter(x => x !== am) : [...propertyForm.amenities, am]);
                  }} className={`px-3 py-1 rounded-full text-xs font-medium border ${propertyForm.amenities.includes(am) ? 'bg-[#004F4D] text-white border-[#004F4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
                    {am}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(2)}>Back</button>
                <button disabled={loading} onClick={nextFromAmenities} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Search size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 4 — Nearby Places</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="space-y-2 mb-4">
                {propertyForm.nearbyPlaces.map((place, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white">
                    <div>
                      <div className="font-semibold text-sm">{place.name}</div>
                      <div className="text-xs text-gray-500">{place.type} • {place.distanceKm} km</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditNearbyPlace(idx)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" disabled={editingNearbyIndex !== null}><FileText size={16} /></button>
                      <button type="button" onClick={() => deleteNearbyPlace(idx)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" disabled={editingNearbyIndex !== null}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {propertyForm.nearbyPlaces.length === 0 && editingNearbyIndex === null && (
                  <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl">No nearby places added. Add at least 3.</div>
                )}
              </div>

              {editingNearbyIndex !== null ? (
                <div className="border border-[#004F4D] bg-[#004F4D]/5 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-sm text-[#004F4D]">{editingNearbyIndex === -1 ? 'Add Nearby Place' : 'Edit Nearby Place'}</div>
                  <div className="relative space-y-2">
                    <div className="flex gap-2">
                      <input className="input flex-1" placeholder="Search places" value={nearbySearchQuery} onChange={e => setNearbySearchQuery(e.target.value)} />
                      <button type="button" onClick={searchNearbyPlaces} className="px-3 py-2 rounded-xl bg-[#004F4D] text-white font-bold text-sm active:scale-95">Search</button>
                    </div>
                    {nearbyResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto">
                        {nearbyResults.slice(0, 6).map((p, i) => (
                          <button key={i} type="button" onClick={() => selectNearbyPlace(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500 truncate">{p.address || p.formatted_address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input className="input w-full" placeholder="Place Name" value={tempNearbyPlace.name} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <select className="input w-full" value={tempNearbyPlace.type} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, type: e.target.value })}>
                        <option value="tourist">Tourist Attraction</option>
                        <option value="airport">Airport</option>
                        <option value="market">Market</option>
                        <option value="railway">Railway Station</option>
                        <option value="bus_stop">Bus Stop</option>
                        <option value="hospital">Hospital</option>
                      </select>
                      <input className="input w-full" type="number" placeholder="Distance (km)" value={tempNearbyPlace.distanceKm} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, distanceKm: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={saveNearbyPlace} className="flex-1 py-2 bg-[#004F4D] text-white rounded-xl font-bold text-sm">Save</button>
                    <button type="button" onClick={cancelEditNearbyPlace} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={startAddNearbyPlace} disabled={propertyForm.nearbyPlaces.length >= 5} className="w-full py-3 border-2 border-dashed border-[#004F4D]/40 text-[#004F4D] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004F4D]/5 disabled:opacity-50">
                  <Plus size={18} /> Add Nearby Place ({propertyForm.nearbyPlaces.length}/5)
                </button>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(3)}>Back</button>
                <button type="button" disabled={loading || editingNearbyIndex !== null} onClick={nextFromNearby} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95 disabled:opacity-50">Next</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Image size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 5 — Property Images</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-6">
                {/* Cover */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-600">Cover Image</div>
                  <div className="flex justify-center">
                    <button type="button" onClick={() => coverImageFileInputRef.current?.click()} className="relative w-40 h-28 sm:w-48 sm:h-32 border-2 border-dashed border-[#004F4D]/40 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden group">
                      {propertyForm.coverImage ? (
                        <>
                          <img src={propertyForm.coverImage} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button type="button" onClick={e => { e.stopPropagation(); updatePropertyForm('coverImage', ''); }} className="absolute top-2 right-2 bg-white/90 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">×</button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-500 text-xs text-center"><Plus size={20} className="text-[#004F4D]" /><span>Upload Cover</span></div>
                      )}
                    </button>
                    <input ref={coverImageFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => u[0] && updatePropertyForm('coverImage', u[0]))} />
                  </div>
                </div>
                {/* Gallery */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-600">Property Images</div>
                    <div className="text-[10px] text-gray-500">{propertyForm.propertyImages.length}/4 minimum</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {propertyForm.propertyImages.map((img, i) => (
                      <div key={i} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { const arr = [...propertyForm.propertyImages]; arr.splice(i, 1); updatePropertyForm('propertyImages', arr); }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-gray-700 text-[10px] flex items-center justify-center shadow">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => propertyImagesFileInputRef.current?.click()} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-[#004F4D]/40 flex items-center justify-center bg-white text-[#004F4D]"><Plus size={18} /></button>
                    <input ref={propertyImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => updatePropertyForm('propertyImages', [...propertyForm.propertyImages, ...u]))} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(4)}>Back</button>
                <button disabled={loading} onClick={nextFromImages} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <BedDouble size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 6 — Room Types</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Add different room categories/cottages.</p>
                  <button type="button" onClick={startAddRoomType} className="text-xs font-bold text-[#004F4D] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100">Add Room Type</button>
                </div>
                <div className="space-y-3">
                  {roomTypes.map((rt, index) => (
                    <div key={rt.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50/60 flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-800">{rt.name}</div>
                        <div className="text-[11px] text-gray-500">₹{rt.pricePerNight} / night · {rt.totalInventory} units</div>
                        {rt.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rt.amenities.slice(0, 4).map(a => <span key={a} className="px-2 py-0.5 rounded-full bg-white text-[10px] text-gray-600 border border-gray-200">{a}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button type="button" onClick={() => startEditRoomType(index)} className="text-[11px] font-semibold text-[#004F4D] px-2 py-1 rounded-lg bg-white border border-[#004F4D]/20">Edit</button>
                        <button type="button" onClick={() => deleteRoomType(index)} className="text-[11px] font-semibold text-red-500 px-2 py-1 rounded-lg bg-white border border-red-100">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {editingRoomType && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                    <h3 className="text-sm font-bold text-gray-800">{editingRoomTypeIndex === -1 ? 'Add Room Type' : 'Edit Room Type'}</h3>
                    <input className="input w-full" placeholder="Room Name (e.g. Deluxe Cottage)" value={editingRoomType.name} onChange={e => setEditingRoomType({ ...editingRoomType, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="input" type="number" placeholder="Price (₹)" value={editingRoomType.pricePerNight} onChange={e => setEditingRoomType({ ...editingRoomType, pricePerNight: e.target.value })} />
                      <input className="input" type="number" placeholder="Inventory" value={editingRoomType.totalInventory} onChange={e => setEditingRoomType({ ...editingRoomType, totalInventory: e.target.value })} />
                      <input className="input" type="number" placeholder="Max Adults" value={editingRoomType.maxAdults} onChange={e => setEditingRoomType({ ...editingRoomType, maxAdults: e.target.value })} />
                      <input className="input" type="number" placeholder="Max Children" value={editingRoomType.maxChildren} onChange={e => setEditingRoomType({ ...editingRoomType, maxChildren: e.target.value })} />
                      <input className="input" type="number" placeholder="Extra Adult (₹)" value={editingRoomType.extraAdultPrice} onChange={e => setEditingRoomType({ ...editingRoomType, extraAdultPrice: e.target.value })} />
                      <input className="input" type="number" placeholder="Extra Child (₹)" value={editingRoomType.extraChildPrice} onChange={e => setEditingRoomType({ ...editingRoomType, extraChildPrice: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-600">Room Images</div>
                        <div className="text-[10px] text-gray-500">{(editingRoomType.images || []).filter(Boolean).length}/3 minimum</div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(editingRoomType.images || []).filter(Boolean).map((img, i) => (
                          <div key={i} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => setEditingRoomType({ ...editingRoomType, images: editingRoomType.images.filter((_, x) => x !== i) })} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-gray-700 text-[10px] flex items-center justify-center shadow">×</button>
                          </div>
                        ))}
                        <button onClick={() => roomImagesFileInputRef.current?.click()} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-[#004F4D]/40 flex items-center justify-center bg-white text-[#004F4D]"><Plus size={18} /></button>
                        <input ref={roomImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => setEditingRoomType({ ...editingRoomType, images: [...editingRoomType.images, ...u] }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-600">Room Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {ROOM_AMENITIES_OPTIONS.map(opt => (
                          <button key={opt.key} type="button" onClick={() => toggleRoomAmenity(opt.label)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${editingRoomType.amenities.includes(opt.label) ? 'bg-[#004F4D] text-white border-[#004F4D]' : 'bg-white text-gray-600 border-gray-200'}`}>
                            <opt.icon size={14} /> <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={cancelEditRoomType} className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">Cancel</button>
                      <button onClick={saveRoomType} className="px-4 py-1.5 rounded-xl bg-[#004F4D] text-white text-xs font-bold active:scale-95">Save Room Type</button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(5)}>Back</button>
                  <button disabled={loading} onClick={nextFromRoomTypes} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
                </div>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <FileText size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 7 — Property Rules</h2>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Check-in Time" value={propertyForm.checkInTime} onChange={e => updatePropertyForm('checkInTime', e.target.value)} />
                  <input className="input" placeholder="Check-out Time" value={propertyForm.checkOutTime} onChange={e => updatePropertyForm('checkOutTime', e.target.value)} />
                </div>
                <textarea className="input" placeholder="Cancellation Policy" value={propertyForm.cancellationPolicy} onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)} />
                <div className="flex flex-wrap gap-2">
                  {HOUSE_RULES_OPTIONS.map(r => (
                    <button key={r} type="button" onClick={() => {
                      const has = propertyForm.houseRules.includes(r);
                      updatePropertyForm('houseRules', has ? propertyForm.houseRules.filter(x => x !== r) : [...propertyForm.houseRules, r]);
                    }} className={`px-3 py-1 rounded-full text-xs font-medium border ${propertyForm.houseRules.includes(r) ? 'bg-[#004F4D] text-white border-[#004F4D]' : 'bg-white text-gray-600 border-gray-200'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(6)}>Back</button>
                <button disabled={loading} onClick={() => setStep(8)} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <FileText size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Step 8 — Documents</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {propertyForm.documents.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm w-40">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input id={`doc-file-${i}`} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => uploadImages(e.target.files, u => { const arr = [...propertyForm.documents]; arr[i].fileUrl = u[0] || ''; updatePropertyForm('documents', arr); })} />
                      <label htmlFor={`doc-file-${i}`} className="px-3 py-2 rounded-xl bg-[#004F4D] text-white text-xs font-bold cursor-pointer">{d.fileUrl ? 'Re-upload' : 'Upload'}</label>
                      <span className={`text-xs font-semibold ${d.fileUrl ? 'text-green-600' : 'text-gray-500'}`}>{d.fileUrl ? 'Uploaded' : 'Not Uploaded'}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(7)}>Back</button>
                <button disabled={loading} onClick={nextFromDocs} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">Next</button>
              </div>
            </>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={18} className="text-green-600" />
                <h2 className="text-lg font-bold">Step 9 — Review & Submit</h2>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold mb-2">Property</div>
                <div className="text-sm text-gray-700">{propertyForm.propertyName} ({propertyForm.resortType} Resort)</div>
                <div className="text-xs text-gray-500">{propertyForm.address.fullAddress}</div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold mb-2">Documents</div>
                <ul className="text-sm text-gray-700">
                  {propertyForm.documents.map((d, i) => <li key={i}>{d.name}: {d.fileUrl ? 'Provided' : 'Missing'}</li>)}
                </ul>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold mb-2">Room Types</div>
                <ul className="text-sm text-gray-700">
                  {roomTypes.map(rt => <li key={rt.id}>{rt.name} — ₹{rt.pricePerNight}</li>)}
                </ul>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="mt-4 flex items-center justify-between">
                <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold" onClick={() => setStep(8)}>Back</button>
                <button disabled={loading} onClick={submitAll} className="px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">{loading ? 'Submitting...' : 'Submit Property'}</button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .input { border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 12px; font-size: 14px; background: #fafafa; width: 100%; }
        .input:focus { outline: none; border-color: #004F4D; background: #fff; }
      `}</style>
    </div>
  );
};

export default AddResortWizard;
