import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService, hotelService } from '../../../services/apiService';
import {
  CheckCircle, FileText, Home, Image, Plus, Trash2, MapPin, Search,
  BedDouble, Wifi, Coffee, Car, Users, CheckSquare, Snowflake, Tv, ShowerHead, ArrowLeft, ArrowRight
} from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_HOMESTAY = [
  { type: "ownership_proof", name: "Ownership Proof (Sale Deed)" },
  { type: "local_registration", name: "Local Registration (Panchayat)" },
  { type: "govt_id", name: "Govt ID (Aadhar)" }
];

const HOMESTAY_AMENITIES = [
  "WiFi",
  "Breakfast",
  "Local Assistance",
  "Parking",
  "Kitchen",
  "Garden",
  "Pet Friendly",
  "Power Backup"
];

// Room Amenities with Icons (Match Hotel Wizard Step 6 style)
const ROOM_AMENITIES = [
  { label: "AC", icon: Snowflake },
  { label: "WiFi", icon: Wifi },
  { label: "TV", icon: Tv },
  { label: "Geyser", icon: ShowerHead },
  { label: "Balcony", icon: BedDouble },
  { label: "Tea/Coffee", icon: Coffee },
  { label: "Attached Washroom", icon: CheckSquare }
];

const HOUSE_RULES_OPTIONS = ["No smoking", "No pets", "No loud music", "ID required at check-in"];

const AddHomestayWizard = () => {
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

  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const coverImageFileInputRef = useRef(null);
  const propertyImagesFileInputRef = useRef(null);
  const roomImagesFileInputRef = useRef(null);

  // Form State
  const [propertyForm, setPropertyForm] = useState({
    propertyName: '',
    description: '',
    shortDescription: '',
    hostLivesOnProperty: true,
    familyFriendly: true,
    coverImage: '',
    propertyImages: [],
    address: { country: 'India', state: 'Goa', city: '', area: '', fullAddress: '', pincode: '' },
    location: { type: 'Point', coordinates: ['', ''] },
    nearbyPlaces: [],
    amenities: [],
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: '',
    houseRules: [],
    documents: REQUIRED_DOCS_HOMESTAY.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
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

  // --- Room Type / Inventory ---
  const startAddRoomType = () => {
    setError('');
    setEditingRoomTypeIndex(-1);
    setEditingRoomType({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: 'Deluxe Private Room',
      inventoryType: 'room', // 'room' or 'entire'
      roomCategory: 'private', // 'private' or 'entire'
      maxAdults: 2,
      maxChildren: 1,
      totalInventory: 1,
      pricePerNight: '',
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: [],
      amenities: [],
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
      setError('Name and Price are required');
      return;
    }
    if ((editingRoomType.images || []).filter(Boolean).length < 3) {
      setError('Please upload at least 3 images for this inventory');
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

  const changeInventoryType = (type) => { // type: 'room' or 'entire'
    if (!editingRoomType) return;
    setEditingRoomType(prev => ({
      ...prev,
      inventoryType: type,
      roomCategory: type === 'entire' ? 'entire' : 'private',
      name: type === 'entire' ? 'Entire Homestay' : 'Deluxe Private Room',
      maxAdults: type === 'entire' ? 6 : 2,
      maxChildren: type === 'entire' ? 3 : 1,
      totalInventory: type === 'entire' ? 1 : 3,
      pricePerNight: type === 'entire' ? 12000 : 3500,
      amenities: [] // reset amenities on type switch
    }));
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
          hostLivesOnProperty: prop.hostLivesOnProperty ?? true,
          familyFriendly: prop.familyFriendly ?? true,
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
            : REQUIRED_DOCS_HOMESTAY.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
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
    if (propertyForm.amenities.length === 0) {
      setError('Please select at least one amenity');
      return;
    }
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
      setError('Cover image is required');
      return;
    }
    if (propertyForm.propertyImages.length < 4) {
      setError('Please upload at least 4 property images');
      return;
    }
    setStep(6);
  };
  const nextFromRoomTypes = () => {
    setError('');
    if (!roomTypes.length) {
      setError('Please add at least one inventory type (Room or Entire Place)');
      return;
    }
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
        propertyType: 'homestay',
        propertyName: propertyForm.propertyName,
        description: propertyForm.description,
        shortDescription: propertyForm.shortDescription,
        hostLivesOnProperty: propertyForm.hostLivesOnProperty,
        familyFriendly: propertyForm.familyFriendly,
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
          inventoryType: rt.inventoryType,
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
      setError(e?.message || 'Failed to submit homestay');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (loading) return;
    switch (step) {
      case 1:
        nextFromBasic();
        break;
      case 2:
        nextFromLocation();
        break;
      case 3:
        nextFromAmenities();
        break;
      case 4:
        nextFromNearby();
        break;
      case 5:
        nextFromImages();
        break;
      case 6:
        nextFromRoomTypes();
        break;
      case 7:
        nextFromRules();
        break;
      case 8:
        nextFromDocs();
        break;
      case 9:
        submitAll();
        break;
      default:
        break;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Basic Info';
      case 2: return 'Location';
      case 3: return 'Homestay Amenities';
      case 4: return 'Nearby Places';
      case 5: return 'Property Images';
      case 6: return 'Inventory Setup';
      case 7: return 'House Rules';
      case 8: return 'Documents';
      case 9: return 'Review & Submit';
      default: return '';
    }
  };

  const isEditingSubItem = (step === 4 && editingNearbyIndex !== null) || (step === 6 && editingRoomType !== null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
        <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-sm font-bold text-gray-900">
          Step {step} of 9
        </div>
        <div className="w-8" />
      </header>

      <div className="w-full h-1 bg-gray-200 sticky top-16 z-20">
        <div className="h-full bg-emerald-600 transition-all duration-500 ease-out" style={{ width: `${(step / 9) * 100}%` }} />
      </div>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{getStepTitle()}</h1>
        </div>

        <div className="bg-white md:p-6 md:rounded-2xl md:shadow-sm md:border md:border-gray-100 space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Homestay Name</label>
                  <input className="input w-full" placeholder="e.g. Grandma's Heritage Home" value={propertyForm.propertyName} onChange={e => updatePropertyForm('propertyName', e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Short Description</label>
                  <textarea className="input w-full" placeholder="Brief summary (e.g. Private rooms in a heritage house)..." value={propertyForm.shortDescription} onChange={e => updatePropertyForm('shortDescription', e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Detailed Description</label>
                  <textarea className="input w-full min-h-[100px]" placeholder="Tell guests about your home, the neighborhood, and what to expect..." value={propertyForm.description} onChange={e => updatePropertyForm('description', e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${propertyForm.hostLivesOnProperty ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${propertyForm.hostLivesOnProperty ? 'bg-emerald-600 border-transparent text-white' : 'bg-white border-gray-300'}`}>
                      {propertyForm.hostLivesOnProperty && <CheckCircle size={14} />}
                    </div>
                    <input type="checkbox" checked={propertyForm.hostLivesOnProperty} onChange={e => updatePropertyForm('hostLivesOnProperty', e.target.checked)} className="hidden" />
                    <span className={`text-sm font-bold ${propertyForm.hostLivesOnProperty ? 'text-emerald-900' : 'text-gray-700'}`}>Host Lives on Property</span>
                  </label>

                  <label className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all ${propertyForm.familyFriendly ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${propertyForm.familyFriendly ? 'bg-emerald-600 border-transparent text-white' : 'bg-white border-gray-300'}`}>
                      {propertyForm.familyFriendly && <CheckCircle size={14} />}
                    </div>
                    <input type="checkbox" checked={propertyForm.familyFriendly} onChange={e => updatePropertyForm('familyFriendly', e.target.checked)} className="hidden" />
                    <span className={`text-sm font-bold ${propertyForm.familyFriendly ? 'text-emerald-900' : 'text-gray-700'}`}>Family Friendly</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    className="input pl-11"
                    placeholder="Search for your address..."
                    value={locationSearchQuery}
                    onChange={e => {
                      setLocationSearchQuery(e.target.value);
                      if (e.target.value.length > 2) searchLocationForAddress();
                    }}
                  />
                  {locationResults.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                      {locationResults.map((r, i) => (
                        <button key={i} type="button" onClick={() => selectLocationResult(r)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-sm transition-colors last:border-0">
                          <div className="font-bold text-gray-800">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.formatted_address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or Enter Manually</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input className="input" placeholder="Country" value={propertyForm.address.country} onChange={e => updatePropertyForm(['address', 'country'], e.target.value)} />
                  <input className="input" placeholder="State/Province" value={propertyForm.address.state} onChange={e => updatePropertyForm(['address', 'state'], e.target.value)} />
                  <input className="input" placeholder="City" value={propertyForm.address.city} onChange={e => updatePropertyForm(['address', 'city'], e.target.value)} />
                  <input className="input" placeholder="Area / Sector" value={propertyForm.address.area} onChange={e => updatePropertyForm(['address', 'area'], e.target.value)} />
                  <input className="input col-span-2" placeholder="Full Street Address" value={propertyForm.address.fullAddress} onChange={e => updatePropertyForm(['address', 'fullAddress'], e.target.value)} />
                  <input className="input" placeholder="Pincode / Zip" value={propertyForm.address.pincode} onChange={e => updatePropertyForm(['address', 'pincode'], e.target.value)} />
                </div>

                <button type="button" onClick={useCurrentLocation} className="w-full py-3 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                  <MapPin size={18} /> Use Current Location
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="grid grid-cols-2 gap-3">
                {HOMESTAY_AMENITIES.map(am => {
                  const isSelected = propertyForm.amenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => {
                        const has = propertyForm.amenities.includes(am);
                        updatePropertyForm('amenities', has ? propertyForm.amenities.filter(x => x !== am) : [...propertyForm.amenities, am]);
                      }}
                      className={`p-4 rounded-xl border transition-all flex items-center gap-3 text-left ${isSelected ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'bg-emerald-600 border-transparent text-white' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <CheckCircle size={12} />}
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>{am}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              {!isEditingSubItem && (
                <div className="space-y-4">
                  {propertyForm.nearbyPlaces.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">No nearby places added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add tourist spots, transport, etc.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {propertyForm.nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-white flex items-center justify-between group hover:border-emerald-200 transition-all shadow-sm">
                          <div>
                            <div className="font-bold text-gray-900">{place.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5 capitalize">{place.type.replace('_', ' ')} • <span className="font-medium text-emerald-600">{place.distanceKm} km away</span></div>
                          </div>
                          <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditNearbyPlace(idx)} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100">
                              <FileText size={16} />
                            </button>
                            <button onClick={() => deleteNearbyPlace(idx)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startAddNearbyPlace}
                    disabled={propertyForm.nearbyPlaces.length >= 5}
                    className="w-full py-4 border border-emerald-200 text-emerald-700 bg-emerald-50/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={20} /> Add New Place
                  </button>
                </div>
              )}

              {editingNearbyIndex !== null && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-sm">
                      {editingNearbyIndex === -1 ? 'Add Nearby Place' : 'Edit Place'}
                    </span>
                    <button onClick={cancelEditNearbyPlace} className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-md">
                      <span className="text-xs font-bold">Close</span>
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Search Place (Google Maps)</label>
                      <div className="relative">
                        <input
                          className="input pl-9"
                          placeholder="Search for a place..."
                          value={nearbySearchQuery}
                          onChange={e => {
                            setNearbySearchQuery(e.target.value);
                            if (e.target.value.length > 2) searchNearbyPlaces();
                          }}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={16} /></div>
                        {nearbyResults.length > 0 && (
                          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                            {nearbyResults.map((p, i) => (
                              <button key={i} type="button" onClick={() => selectNearbyPlace(p)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 text-sm transition-colors last:border-0">
                                <div className="font-bold text-gray-800">{p.name}</div>
                                <div className="text-xs text-gray-500 truncate">{p.formatted_address}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex items-center gap-4 py-2">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Or Enter Manually</span>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Place Name</label>
                        <input className="input" placeholder="e.g. Calangute Beach" value={tempNearbyPlace.name} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, name: e.target.value })} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Place Type</label>
                          <select className="input" value={tempNearbyPlace.type} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, type: e.target.value })}>
                            <option value="tourist">Tourist Spot</option>
                            <option value="airport">Airport</option>
                            <option value="railway">Railway Stn</option>
                            <option value="market">Market</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="hospital">Hospital</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Distance (km)</label>
                          <div className="relative">
                            <input className="input pr-8" type="number" placeholder="0.0" value={tempNearbyPlace.distanceKm} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, distanceKm: e.target.value })} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">km</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={cancelEditNearbyPlace} className="flex-1 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                      <button type="button" onClick={saveNearbyPlace} className="flex-1 py-3 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all transform active:scale-95">
                        {editingNearbyIndex === -1 ? 'Add Place' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Cover Image</label>
                  <div
                    onClick={() => coverImageFileInputRef.current?.click()}
                    className={`relative w-full aspect-video sm:aspect-[21/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${propertyForm.coverImage ? 'border-transparent' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/10'}`}
                  >
                    {propertyForm.coverImage ? (
                      <>
                        <img src={propertyForm.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">Change Cover</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); updatePropertyForm('coverImage', ''); }} className="absolute top-3 right-3 p-1.5 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"><Trash2 size={16} /></button>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Image size={24} />
                        </div>
                        <p className="font-semibold text-gray-700">Click to upload cover</p>
                        <p className="text-xs text-gray-400 mt-1">Recommended 1920x1080</p>
                      </div>
                    )}
                    <input ref={coverImageFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => u[0] && updatePropertyForm('coverImage', u[0]))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Gallery</label>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">{propertyForm.propertyImages.length} / 4 minimum</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {propertyForm.propertyImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                        <button
                          type="button"
                          onClick={() => { const arr = [...propertyForm.propertyImages]; arr.splice(i, 1); updatePropertyForm('propertyImages', arr); }}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => propertyImagesFileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                  <input ref={propertyImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => updatePropertyForm('propertyImages', [...propertyForm.propertyImages, ...u]))} />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              {!isEditingSubItem && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Define your homestay inventory (Entire place or rooms).</p>
                  </div>

                  <div className="grid gap-3">
                    {roomTypes.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BedDouble size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">No inventory added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add rooms or entire house options</p>
                      </div>
                    ) : (
                      roomTypes.map((rt, index) => (
                        <div key={rt.id} className="p-4 border border-gray-200 rounded-2xl bg-white group hover:border-emerald-200 transition-all shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-gray-900 text-lg">{rt.name}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{rt.inventoryType === 'entire' ? 'Entire Place' : 'Private Room'}</span>
                                <span>•</span>
                                <span className="font-semibold text-gray-900">₹{rt.pricePerNight}</span>
                                <span className="text-xs">/ night</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"><Users size={12} /> Max {rt.maxAdults} Adults</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"><Users size={12} /> Max {rt.maxChildren} Kids</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1">Inventory: {rt.totalInventory}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => startEditRoomType(index)} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                <FileText size={16} />
                              </button>
                              <button onClick={() => deleteRoomType(index)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={startAddRoomType}
                    className="w-full py-4 border border-emerald-200 text-emerald-700 bg-emerald-50/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                  >
                    <Plus size={20} /> Add Inventory
                  </button>
                </div>
              )}

              {editingRoomType && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-sm">
                      {editingRoomTypeIndex === -1 ? 'Add Inventory' : 'Edit Inventory'}
                    </span>
                    <button onClick={cancelEditRoomType} className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-md">
                      <span className="text-xs font-bold">Close</span>
                    </button>
                  </div>

                  <div className="p-4 space-y-5">
                    <div className="p-1 bg-gray-100 rounded-xl flex">
                      <button onClick={() => changeInventoryType('room')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editingRoomType.inventoryType === 'room' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Private Room</button>
                      <button onClick={() => changeInventoryType('entire')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editingRoomType.inventoryType === 'entire' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Entire Homestay</button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Name</label>
                      <input className="input" placeholder="e.g. Deluxe Room or Entire 3BHK Villa" value={editingRoomType.name} onChange={e => setEditingRoomType({ ...editingRoomType, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Price per Night (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                          <input className="input pl-7" type="number" placeholder="0" value={editingRoomType.pricePerNight} onChange={e => setEditingRoomType({ ...editingRoomType, pricePerNight: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Inventory Count</label>
                        <input className="input" type="number" placeholder="1" value={editingRoomType.totalInventory} onChange={e => setEditingRoomType({ ...editingRoomType, totalInventory: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Max Adults</label>
                        <input className="input" type="number" placeholder="2" value={editingRoomType.maxAdults} onChange={e => setEditingRoomType({ ...editingRoomType, maxAdults: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Max Children</label>
                        <input className="input" type="number" placeholder="1" value={editingRoomType.maxChildren} onChange={e => setEditingRoomType({ ...editingRoomType, maxChildren: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500">Images (Max 3)</label>
                        <span className="text-[10px] text-gray-400">{(editingRoomType.images || []).length}/3</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {(editingRoomType.images || []).map((img, i) => (
                          <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-xl border border-gray-200 overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button onClick={() => setEditingRoomType({ ...editingRoomType, images: editingRoomType.images.filter((_, x) => x !== i) })} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white text-red-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                          </div>
                        ))}
                        {(editingRoomType.images || []).length < 3 && (
                          <button onClick={() => roomImagesFileInputRef.current?.click()} className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/20 transition-all">
                            <Plus size={20} />
                          </button>
                        )}
                        <input ref={roomImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, u => setEditingRoomType({ ...editingRoomType, images: [...(editingRoomType.images || []), ...u].slice(0, 3) }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500">Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {ROOM_AMENITIES.map(opt => {
                          const isSelected = editingRoomType.amenities.includes(opt.label);
                          return (
                            <button
                              key={opt.label}
                              type="button" // Prevent form sub
                              onClick={() => toggleRoomAmenity(opt.label)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                              <opt.icon size={12} />
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button onClick={cancelEditRoomType} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                      <button onClick={saveRoomType} className="flex-1 py-3 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200">{editRoomTypeMode === 'add' ? 'Add Inventory' : 'Save Changes'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Check-In Time</label>
                  <input className="input" placeholder="e.g. 12:00 PM" value={propertyForm.checkInTime} onChange={e => updatePropertyForm('checkInTime', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Check-Out Time</label>
                  <input className="input" placeholder="e.g. 11:00 AM" value={propertyForm.checkOutTime} onChange={e => updatePropertyForm('checkOutTime', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Cancellation Policy</label>
                <textarea className="input min-h-[80px]" placeholder="e.g. Free cancellation up to 48 hours before check-in..." value={propertyForm.cancellationPolicy} onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500">House Rules</label>
                <div className="flex flex-wrap gap-2">
                  {HOUSE_RULES_OPTIONS.map(r => {
                    const isSelected = propertyForm.houseRules.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          const has = propertyForm.houseRules.includes(r);
                          updatePropertyForm('houseRules', has ? propertyForm.houseRules.filter(x => x !== r) : [...propertyForm.houseRules, r]);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {isSelected && <CheckCircle size={12} />}
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              <div className="space-y-3">
                {propertyForm.documents.map((d, i) => (
                  <div key={i} className={`p-4 rounded-xl border transition-all ${d.fileUrl ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${d.fileUrl ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">{d.name}</div>
                          <div className={`text-xs ${d.fileUrl ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                            {d.fileUrl ? 'Document Uploaded' : 'Required'}
                          </div>
                        </div>
                      </div>
                      {d.fileUrl && <CheckCircle size={20} className="text-emerald-500" />}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => document.getElementById(`doc-upload-${i}`).click()}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 border-dashed flex items-center justify-center gap-2 transition-all ${d.fileUrl ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}
                      >
                        {d.fileUrl ? 'Change Document' : 'Upload Document'}
                      </button>
                      {d.fileUrl && (
                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm">View</a>
                      )}
                    </div>
                    <input id={`doc-upload-${i}`} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => uploadImages(e.target.files, u => { const arr = [...propertyForm.documents]; arr[i].fileUrl = u[0] || ''; updatePropertyForm('documents', arr); })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-600">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">Ready to Submit!</h3>
                <p className="text-emerald-700 text-sm mt-1">Review your homestay details below.</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-4 space-y-3">
                  <div className="flex gap-4">
                    <img src={propertyForm.coverImage} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <div className="font-bold text-gray-900">{propertyForm.propertyName}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">{propertyForm.address.fullAddress}</div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Homestay</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded uppercase">{roomTypes.length} Inv. Types</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Host Status</div>
                    <div className="font-semibold text-sm">{propertyForm.hostLivesOnProperty ? 'Lives on Property' : 'Does Not Live'}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Target</div>
                    <div className="font-semibold text-sm">{propertyForm.familyFriendly ? 'Family Friendly' : 'All Guests'}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                  <div className="font-bold text-gray-900 text-sm mb-3">Submission Checklist</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Inventory Setup</span>
                      <span className={roomTypes.length > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{roomTypes.length > 0 ? "Complete" : "Missing"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Documents</span>
                      <span className={propertyForm.documents.every(d => d.fileUrl) ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{propertyForm.documents.every(d => d.fileUrl) ? "Complete" : "Incomplete"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Photos</span>
                      <span className={propertyForm.propertyImages.length >= 4 ? "text-emerald-600 font-bold" : "text-orange-500 font-bold"}>{propertyForm.propertyImages.length}/4</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center font-medium">{error}</div>}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1 || loading || isEditingSubItem}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>

          <button
            onClick={step === 9 ? submitAll : handleNext}
            disabled={
              loading ||
              isEditingSubItem ||
              (step === 6 && roomTypes.length === 0) ||
              (step === 8 && !propertyForm.documents.every(d => d.fileUrl))
            }
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              step === 9 ? 'Submit Homestay' : 'Next Step'
            )}
          </button>
        </div>
      </div>

      <style>{`
        .input { border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 12px; font-size: 14px; background: #f8fafc; transition: all 0.2s; width: 100%; }
        .input:focus { outline: none; border-color: #059669; background: #fff; box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1); }
      `}</style>
    </div>
  );
};

export default AddHomestayWizard;
