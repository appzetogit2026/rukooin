import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService, hotelService } from '../../../services/apiService';
import { compressImage } from '../../../utils/imageUtils';
import {
  CheckCircle, FileText, Home, Image, Plus, Trash2, MapPin, Search,
  BedDouble, Wifi, Tv, Snowflake, Coffee, ShowerHead, Umbrella, Waves, Mountain, Trees, Sun, ArrowLeft, ArrowRight, Clock, Loader2
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
  const [uploading, setUploading] = useState(null);
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

  // --- Persistence Logic ---
  const STORAGE_KEY = `rukko_resort_wizard_draft_${existingProperty?._id || 'new'}`;

  // 1. Load from localStorage
  useEffect(() => {
    if (isEditMode) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { step: savedStep, propertyForm: savedForm, roomTypes: savedRooms, createdProperty: savedProp } = JSON.parse(saved);
        setStep(savedStep);
        setPropertyForm(savedForm);
        setRoomTypes(savedRooms);
        if (savedProp) setCreatedProperty(savedProp);
      } catch (e) {
        console.error("Failed to load resort draft", e);
      }
    }
  }, []);

  // 2. Save to localStorage
  useEffect(() => {
    if (isEditMode) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, propertyForm, roomTypes, createdProperty }));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [step, propertyForm, roomTypes, createdProperty]);

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
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }

    try {
      // 1. Get Coordinates
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000
        });
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // 2. Call Backend API
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
    } catch (err) {
      console.error("Location Error:", err);
      if (err.code === 1) { // PERMISSION_DENIED
        setError('Location permission denied. Please enable it in browser settings.');
      } else if (err.code === 2) { // POSITION_UNAVAILABLE
        setError('Location unavailable. Check your GPS/network.');
      } else if (err.code === 3) { // TIMEOUT
        setError('Location request timed out.');
      } else {
        setError(err.message || 'Failed to fetch address from coordinates');
      }
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

  const uploadImages = async (files, type, onDone) => {
    try {
      setUploading(type);
      const fd = new FormData();

      const fileArray = Array.from(files);
      console.log(`Processing ${fileArray.length} images...`);

      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        console.log(`original: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        const compressed = await compressImage(file);

        console.log(`compressed: ${file.name} -> (${(compressed.size / 1024 / 1024).toFixed(2)}MB)`);

        if (compressed.size > 10 * 1024 * 1024) throw new Error(`${file.name} too large`);

        fd.append('images', compressed, file.name);
      }

      const res = await hotelService.uploadImages(fd);
      const urls = Array.isArray(res?.urls) ? res.urls : [];
      console.log('Upload done, urls:', urls);
      onDone(urls);
    } catch (err) {
      console.error("Upload failed", err);
      setError('Upload failed');
    } finally {
      setUploading(null);
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
    // Optional
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
      localStorage.removeItem(STORAGE_KEY);
      navigate('/hotel/dashboard');
    } catch (e) {
      setError(e?.message || 'Failed to submit resort');
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

  const clearCurrentStep = () => {
    if (!window.confirm("Clear all fields in this step?")) return;
    if (step === 1) {
      setPropertyForm(prev => ({ ...prev, propertyName: '', description: '', shortDescription: '', resortType: 'beach', activities: [] }));
    } else if (step === 2) {
      updatePropertyForm('address', { country: '', state: '', city: '', area: '', fullAddress: '', pincode: '' });
      updatePropertyForm(['location', 'coordinates'], ['', '']);
    } else if (step === 3) {
      updatePropertyForm('amenities', []);
    } else if (step === 4) {
      updatePropertyForm('nearbyPlaces', []);
    } else if (step === 5) {
      setPropertyForm(prev => ({ ...prev, coverImage: '', propertyImages: [] }));
    } else if (step === 6) {
      setRoomTypes([]);
    } else if (step === 7) {
      setPropertyForm(prev => ({ ...prev, checkInTime: '', checkOutTime: '', cancellationPolicy: '', houseRules: [] }));
    } else if (step === 8) {
      updatePropertyForm('documents', REQUIRED_DOCS_RESORT.map(d => ({ type: d.type, name: d.name, fileUrl: '' })));
    }
  };

  const handleNext = () => {
    if (loading) return;
    switch (step) {
      case 1:
        nextFromBasic();
        break;
      case 2:
        setStep(3);
        break;
      case 3:
        setStep(4);
        break;
      case 4:
        nextFromNearbyPlaces();
        break;
      case 5:
        nextFromImages();
        break;
      case 6:
        nextFromRoomTypes();
        break;
      case 7:
        setStep(8);
        break;
      case 8:
        setStep(9);
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
      case 3: return 'Amenities';
      case 4: return 'Nearby Places';
      case 5: return 'Resort Images';
      case 6: return 'Cottages & Rooms';
      case 7: return 'Resort Rules';
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
                  <label className="text-xs font-semibold text-gray-500">Resort Name</label>
                  <input className="input w-full" placeholder="e.g. Blue Lagoon Resort" value={propertyForm.propertyName} onChange={e => updatePropertyForm('propertyName', e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Resort Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {RESORT_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updatePropertyForm('resortType', type.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${propertyForm.resortType === type.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-gray-600'
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${propertyForm.resortType === type.value ? 'bg-white text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          <type.icon size={20} />
                        </div>
                        <span className="text-sm font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Activities</label>
                  <div className="flex flex-wrap gap-2">
                    {RESORT_ACTIVITIES.map(act => (
                      <button
                        key={act} type="button"
                        onClick={() => {
                          const has = propertyForm.activities.includes(act);
                          updatePropertyForm('activities', has ? propertyForm.activities.filter(a => a !== act) : [...propertyForm.activities, act]);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${propertyForm.activities.includes(act)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Short Description</label>
                  <textarea className="input w-full" placeholder="Brief summary for listings..." value={propertyForm.shortDescription} onChange={e => updatePropertyForm('shortDescription', e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Detailed Description</label>
                  <textarea className="input w-full min-h-[100px]" placeholder="Tell guests what makes your resort unique..." value={propertyForm.description} onChange={e => updatePropertyForm('description', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Search Address</label>
                <div className="flex gap-2">
                  <input
                    className="input w-full"
                    placeholder="Search location..."
                    value={locationSearchQuery}
                    onChange={e => setLocationSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={searchLocationForAddress}
                    className="px-4 py-2 bg-[#004F4D] text-white rounded-xl font-bold text-sm hover:bg-[#003d3b] transition-colors"
                  >
                    Search
                  </button>
                </div>
                {locationResults.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mt-1 shadow-lg bg-white max-h-48 overflow-y-auto z-10 relative">
                    {locationResults.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectLocationResult(p)}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 border-b border-gray-50 text-sm transition-colors"
                      >
                        <div className="font-medium text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.formatted_address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or Enter Manually</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input className="input col-span-2" placeholder="Full Address" value={propertyForm.address.fullAddress} onChange={e => updatePropertyForm(['address', 'fullAddress'], e.target.value)} />
                <input className="input" placeholder="City" value={propertyForm.address.city} onChange={e => updatePropertyForm(['address', 'city'], e.target.value)} />
                <input className="input" placeholder="State" value={propertyForm.address.state} onChange={e => updatePropertyForm(['address', 'state'], e.target.value)} />
                <input className="input" placeholder="Country" value={propertyForm.address.country} onChange={e => updatePropertyForm(['address', 'country'], e.target.value)} />
                <input className="input" placeholder="Pincode" value={propertyForm.address.pincode} onChange={e => updatePropertyForm(['address', 'pincode'], e.target.value)} />
                <input className="input" placeholder="Area" value={propertyForm.address.area} onChange={e => updatePropertyForm(['address', 'area'], e.target.value)} />
              </div>

              <button type="button" onClick={useCurrentLocation} className="w-full py-3 rounded-xl border border-dashed border-[#004F4D] text-[#004F4D] bg-[#004F4D]/5 font-bold flex items-center justify-center gap-2 hover:bg-[#004F4D]/10 transition-colors">
                <MapPin size={18} /> Use Current Location
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RESORT_AMENITIES.map(am => {
                  const isSelected = propertyForm.amenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => {
                        const has = propertyForm.amenities.includes(am);
                        updatePropertyForm('amenities', has ? propertyForm.amenities.filter(x => x !== am) : [...propertyForm.amenities, am]);
                      }}
                      className={`
                          relative p-4 rounded-2xl border text-left transition-all duration-200
                          ${isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.02]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                        }
                        `}
                    >
                      <span className="font-semibold text-sm">{am}</span>
                      {isSelected && <div className="absolute top-2 right-2 text-white/80"><CheckCircle size={14} /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {!editingNearbyIndex && editingNearbyIndex !== 0 ? (
                <div className="space-y-4">
                  {/* Add New Place Form Inline or via Button */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          className="input w-full pl-9 bg-white"
                          placeholder="Search nearby places (e.g. Beaches, Airports)"
                          value={nearbySearchQuery}
                          onChange={e => handleNearbySearch(e.target.value)}
                        />
                        {nearbyResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-10">
                            {nearbyResults.map((place, i) => (
                              <button key={i} type="button" onClick={() => selectNearbyPlace(place)} className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm border-b border-gray-50 last:border-0">
                                <div className="font-medium text-gray-800">{place.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{place.types?.[0]?.replace('_', ' ') || 'Place'}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* List of Added Places */}
                  <div className="space-y-3">
                    {propertyForm.nearbyPlaces.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                        No nearby places added yet.
                      </div>
                    ) : (
                      propertyForm.nearbyPlaces.map((place, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                          <div>
                            <div className="font-bold text-gray-900">{place.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-600">{place.type}</span>
                              <span>•</span>
                              <span>{place.distanceKm} km away</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEditNearby(index)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><div className="text-xs font-bold">Edit</div></button>
                            <button type="button" onClick={() => removeNearbyPlace(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTempNearbyPlace({ name: '', type: 'tourist', distanceKm: '' });
                      setEditingNearbyIndex('new');
                    }}
                    className="w-full py-3 rounded-xl border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50 font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                  >
                    <Plus size={18} /> Add Place Manually
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">{editingNearbyIndex === 'new' ? 'Add New Place' : 'Edit Place'}</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Place Name</label>
                      <input className="input w-full" placeholder="e.g. Baga Beach" value={tempNearbyPlace.name} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Type</label>
                        <select className="input w-full" value={tempNearbyPlace.type} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, type: e.target.value })}>
                          <option value="transport">Transport</option>
                          <option value="tourist">Tourist Spot</option>
                          <option value="hospital">Hospital</option>
                          <option value="market">Market</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Distance (km)</label>
                        <input className="input w-full" type="number" placeholder="0.5" value={tempNearbyPlace.distanceKm} onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, distanceKm: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setEditingNearbyIndex(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                      <button type="button" onClick={saveNearbyPlace} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md">Save Place</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900">Cover Image</label>
                  <div
                    onClick={() => !uploading && coverImageFileInputRef.current?.click()}
                    className="relative w-full h-48 sm:h-64 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
                  >
                    {propertyForm.coverImage ? (
                      <img src={propertyForm.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <Image size={40} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold">Upload Cover Photo</span>
                      </div>
                    )}
                    {uploading === 'cover' && <div className="absolute inset-0 bg-white/80 flex flex-col gap-2 items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /><span className="text-sm font-bold text-emerald-700">Uploading...</span></div>}
                  </div>
                  <input ref={coverImageFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'cover')} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-900">Property Gallery</label>
                    <span className="text-xs text-gray-500">{propertyForm.propertyImages.length} images</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {propertyForm.propertyImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => updatePropertyForm('propertyImages', propertyForm.propertyImages.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => propertyImagesFileInputRef.current?.click()}
                      disabled={!!uploading}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all"
                    >
                      {uploading === 'gallery' ? <Loader2 className="animate-spin text-emerald-600" size={24} /> : <Plus size={24} />}
                    </button>
                  </div>
                  <input ref={propertyImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'gallery')} />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              {!editingRoomType && (
                <div className="space-y-4">
                  {roomTypes.length === 0 ? (
                    <div className="text-center py-10 px-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BedDouble size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">No cottages or rooms added yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add details for atleast one category.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {roomTypes.map((rt, index) => (
                        <div key={rt.id || index} className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{rt.name}</h3>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">
                                Inventory: <span className="text-gray-900">{rt.totalInventory}</span> · Capacity: <span className="text-gray-900">{rt.maxAdults}A, {rt.maxChildren}C</span>
                              </div>
                            </div>
                            <div className="text-lg font-bold text-emerald-600">₹{rt.pricePerNight}</div>
                          </div>

                          {rt.amenities && rt.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {rt.amenities.slice(0, 3).map(a => (
                                <span key={a} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">{a}</span>
                              ))}
                              {rt.amenities.length > 3 && <span className="px-2 py-0.5 text-[10px] text-gray-400">+{rt.amenities.length - 3} more</span>}
                            </div>
                          )}

                          <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                            <button onClick={() => startEditRoomType(index)} className="flex-1 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => deleteRoomType(index)} className="px-3 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startAddRoomType}
                    className="w-full py-4 border border-emerald-200 text-emerald-700 bg-emerald-50/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                  >
                    <Plus size={20} />
                    Add Cottage / Room
                  </button>
                </div>
              )}

              {editingRoomType && (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                    <span className="font-bold text-emerald-800 text-sm">
                      {editingRoomTypeIndex === -1 || editingRoomTypeIndex == null ? 'Add Cottage/Room' : 'Edit Cottage/Room'}
                    </span>
                    <button onClick={cancelEditRoomType} className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-md">
                      <span className="text-xs font-bold">Close</span>
                    </button>
                  </div>

                  <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Name</label>
                      <input
                        className="input w-full"
                        placeholder="e.g. Deluxe Beach Cottage"
                        value={editingRoomType.name}
                        onChange={e => setEditingRoomType({ ...editingRoomType, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Price / Night (₹)</label>
                        <input className="input w-full" type="number" value={editingRoomType.pricePerNight} onChange={e => setEditingRoomType({ ...editingRoomType, pricePerNight: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Total Units</label>
                        <input className="input w-full" type="number" value={editingRoomType.totalInventory} onChange={e => setEditingRoomType({ ...editingRoomType, totalInventory: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Max Adults</label>
                        <input className="input w-full" type="number" value={editingRoomType.maxAdults} onChange={e => setEditingRoomType({ ...editingRoomType, maxAdults: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Max Children</label>
                        <input className="input w-full" type="number" value={editingRoomType.maxChildren} onChange={e => setEditingRoomType({ ...editingRoomType, maxChildren: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Extra Adult Price (₹)</label>
                        <input className="input w-full" type="number" value={editingRoomType.extraAdultPrice} onChange={e => setEditingRoomType({ ...editingRoomType, extraAdultPrice: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Extra Child Price (₹)</label>
                        <input className="input w-full" type="number" value={editingRoomType.extraChildPrice} onChange={e => setEditingRoomType({ ...editingRoomType, extraChildPrice: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-500">Photos</label>
                        <span className="text-[10px] text-gray-400">{(editingRoomType.images || []).filter(Boolean).length} / 3 min</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(editingRoomType.images || []).filter(Boolean).map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setEditingRoomType({ ...editingRoomType, images: editingRoomType.images.filter((_, x) => x !== i) })} className="absolute top-0.5 right-0.5 bg-white/90 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => roomImagesFileInputRef.current?.click()} disabled={!!uploading} className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                          {uploading === 'room' ? <Loader2 size={20} className="animate-spin text-emerald-600" /> : <Plus size={20} />}
                        </button>
                        <input ref={roomImagesFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(e.target.files, 'room', u => setEditingRoomType({ ...editingRoomType, images: [...editingRoomType.images, ...u] }))} />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-500">Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {ROOM_AMENITIES_OPTIONS.map(opt => {
                          const selected = editingRoomType.amenities.includes(opt.label);
                          const Icon = opt.icon;
                          return (
                            <button key={opt.key} type="button" onClick={() => toggleRoomAmenity(opt.label)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                              <Icon size={14} /> {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={cancelEditRoomType} className="flex-1 py-3 text-gray-600 font-semibold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                      <button type="button" onClick={saveRoomType} className="flex-1 py-3 text-white font-bold bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all transform active:scale-95">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Check-in Time</label>
                    <div className="relative">
                      <input className="input w-full pl-9" placeholder="3:00 PM" value={propertyForm.checkInTime} onChange={e => updatePropertyForm('checkInTime', e.target.value)} />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span className="text-xs">🕒</span></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Check-out Time</label>
                    <div className="relative">
                      <input className="input w-full pl-9" placeholder="11:00 AM" value={propertyForm.checkOutTime} onChange={e => updatePropertyForm('checkOutTime', e.target.value)} />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span className="text-xs">🕒</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Cancellation Policy</label>
                  <textarea
                    className="input w-full min-h-[100px]"
                    placeholder="e.g., Free cancellation before 10 days..."
                    value={propertyForm.cancellationPolicy}
                    onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-500">Resort Rules</label>
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
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50'}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-700">Please provide the following documents</div>
                <div className="grid gap-3">
                  {propertyForm.documents.map((doc, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-2xl bg-white hover:border-emerald-200 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-900">{doc.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">Optional document</div>
                        </div>
                        {doc.fileUrl ? (
                          <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-full"><CheckCircle size={18} /></div>
                        ) : (
                          <div className="bg-gray-100 text-gray-400 p-1.5 rounded-full"><FileText size={18} /></div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`doc-file-${idx}`}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-bold transition-all cursor-pointer ${doc.fileUrl
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-white hover:border-emerald-400 hover:text-emerald-600'
                            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {uploading === `doc_${idx}` ? (
                            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                          ) : doc.fileUrl ? (
                            <>Change File</>
                          ) : (
                            <><Plus size={16} /> Upload</>
                          )}
                        </label>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-200 hover:border-emerald-200 bg-white">
                            <Search size={18} />
                          </a>
                        )}
                      </div>

                      <input
                        id={`doc-file-${idx}`}
                        type="file"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          uploadImages([file], `doc_${idx}`, urls => {
                            if (urls[0]) {
                              const updated = [...propertyForm.documents];
                              updated[idx] = { ...updated[idx], fileUrl: urls[0] };
                              updatePropertyForm('documents', updated);
                            }
                          });
                          e.target.value = '';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full h-fit"><CheckCircle size={20} /></div>
                <div>
                  <h3 className="font-bold text-gray-900">Review Compliance</h3>
                  <p className="text-xs text-gray-600 mt-1">Please review the details below carefully before submitting.</p>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Property Details</h3>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-emerald-900">{propertyForm.propertyName || 'No Name'}</div>
                    <div className="text-sm font-semibold text-emerald-600">{propertyForm.resortType} Resort</div>
                    <div className="text-sm text-gray-600 flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 shrink-0" /> {propertyForm.address.fullAddress || 'No Address'}
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Cottages & Rooms ({roomTypes.length})</h3>
                  {roomTypes.length > 0 ? (
                    <div className="space-y-2">
                      {roomTypes.map((rt, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{rt.name}</span>
                          <span className="font-bold text-gray-900">₹{rt.pricePerNight}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">No room types added!</div>}
                </div>

                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">Documents ({propertyForm.documents.filter(d => d.fileUrl).length}/{propertyForm.documents.length})</h3>
                  <div className="space-y-2">
                    {propertyForm.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {doc.fileUrl ? <CheckCircle size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-gray-50"></div>}
                          <span className={doc.fileUrl ? 'text-gray-700' : 'text-gray-500'}>{doc.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{doc.fileUrl ? 'Attached' : 'Optional'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:px-6 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Back
          </button>
          {step < 9 && (
            <button
              onClick={clearCurrentStep}
              disabled={loading}
              className="px-4 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 disabled:opacity-50 transition-all text-sm"
            >
              Clear Step
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading || (step === 8 && roomTypes.length === 0)}
            className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {step === 9 ? (loading ? 'Submitting...' : 'Submit Property') : 'Continue'}
          </button>
        </div>
      </footer>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AddResortWizard;
