import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService, hotelService } from '../../../services/apiService';
import { CheckCircle, FileText, Home, Image, Bed, MapPin, Search, Plus, Trash2, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_PG = [
  { type: 'rent_agreement', name: 'Rent Agreement' },
  { type: 'owner_id_proof', name: 'Owner ID Proof' }
];

const PG_AMENITIES = [
  { name: 'WiFi', icon: 'wifi' },
  { name: 'Laundry', icon: 'washing-machine' },
  { name: 'Housekeeping', icon: 'broom' },
  { name: 'CCTV', icon: 'camera' },
  { name: 'Security', icon: 'shield' }
];

const ROOM_AMENITIES = [
  { key: 'bunk_bed', label: 'Bunk Bed', icon: Bed },
  { key: 'personal_locker', label: 'Personal Locker', icon: FileText },
  { key: 'fan', label: 'Fan', icon: CheckCircle },
  { key: 'common_washroom', label: 'Common Washroom', icon: MapPin }
];

const AddPGWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingProperty = location.state?.property || null;
  const isEditMode = !!existingProperty;
  const initialStep = location.state?.initialStep || 1;
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProperty, setCreatedProperty] = useState(null);

  const [nearbySearchQuery, setNearbySearchQuery] = useState('');
  const [nearbyResults, setNearbyResults] = useState([]);
  const [editingNearbyIndex, setEditingNearbyIndex] = useState(null);
  const [tempNearbyPlace, setTempNearbyPlace] = useState({ name: '', type: 'tourist', distanceKm: '' });
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const coverImageFileInputRef = useRef(null);
  const propertyImagesFileInputRef = useRef(null);

  const [propertyForm, setPropertyForm] = useState({
    propertyName: '',
    propertyType: 'pg',
    pgType: 'boys',
    description: '',
    shortDescription: '',
    coverImage: '',
    propertyImages: [],
    address: { country: 'India', state: '', city: '', area: '', fullAddress: '', pincode: '' },
    location: { type: 'Point', coordinates: ['', ''] },
    nearbyPlaces: [],
    amenities: [],
    checkInTime: '12:00 PM',
    checkOutTime: '10:00 AM',
    cancellationPolicy: 'No refund after check-in',
    houseRules: [],
    documents: REQUIRED_DOCS_PG.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [editingRoomTypeIndex, setEditingRoomTypeIndex] = useState(null);
  const [originalRoomTypeIds, setOriginalRoomTypeIds] = useState([]);

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
          propertyType: 'pg',
          pgType: prop.pgType || 'boys',
          description: prop.description || '',
          shortDescription: prop.shortDescription || '',
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
              typeof prop.location?.coordinates?.[0] === 'number'
                ? String(prop.location.coordinates[0])
                : '',
              typeof prop.location?.coordinates?.[1] === 'number'
                ? String(prop.location.coordinates[1])
                : ''
            ]
          },
          nearbyPlaces: Array.isArray(prop.nearbyPlaces) && prop.nearbyPlaces.length
            ? prop.nearbyPlaces.map(p => ({
              name: p.name || '',
              type: p.type || 'tourist',
              distanceKm: typeof p.distanceKm === 'number' ? String(p.distanceKm) : ''
            }))
            : [],
          amenities: prop.amenities || [],
          checkInTime: prop.checkInTime || '12:00 PM',
          checkOutTime: prop.checkOutTime || '10:00 AM',
          cancellationPolicy: prop.cancellationPolicy || 'No refund after check-in',
          houseRules: prop.houseRules || [],
          documents: docs.length
            ? docs.map(d => ({ type: d.type || d.name, name: d.name, fileUrl: d.fileUrl || '' }))
            : REQUIRED_DOCS_PG.map(d => ({ type: d.type, name: d.name, fileUrl: '' }))
        });
        if (rts.length) {
          setRoomTypes(
            rts.map(rt => ({
              id: rt._id,
              backendId: rt._id,
              name: rt.name || '',
              inventoryType: rt.inventoryType || 'bed',
              roomCategory: rt.roomCategory || 'shared',
              maxAdults: rt.maxAdults ?? 1,
              maxChildren: rt.maxChildren ?? 0,
              bedsPerRoom: rt.bedsPerRoom ?? 4,
              totalInventory: rt.totalInventory ?? 20,
              pricePerNight: rt.pricePerNight ?? '',
              extraAdultPrice: rt.extraAdultPrice ?? 0,
              extraChildPrice: rt.extraChildPrice ?? 0,
              images: rt.images || [],
              amenities: rt.amenities || [],
              isActive: typeof rt.isActive === 'boolean' ? rt.isActive : true
            }))
          );
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

      setTempNearbyPlace(prev => ({
        ...prev,
        name: place.name || '',
        distanceKm: km
      }));
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

  const deleteNearbyPlace = (index) => {
    const arr = propertyForm.nearbyPlaces.filter((_, i) => i !== index);
    updatePropertyForm('nearbyPlaces', arr);
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

  const cancelEditNearbyPlace = () => {
    setEditingNearbyIndex(null);
    setError('');
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

  const startAddRoomType = () => {
    setError('');
    setEditingRoomTypeIndex(-1);
    setEditingRoomType({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: '4 Sharing Room',
      inventoryType: 'bed',
      roomCategory: 'shared',
      maxAdults: 1,
      maxChildren: 0,
      bedsPerRoom: 4,
      totalInventory: 20,
      pricePerNight: '',
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: [],
      amenities: ['Bunk Bed', 'Personal Locker', 'Fan', 'Common Washroom'],
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

  const cancelEditRoomType = () => {
    setEditingRoomTypeIndex(null);
    setEditingRoomType(null);
    setError('');
  };

  const saveRoomType = () => {
    if (!editingRoomType) return;
    if (!editingRoomType.name || !editingRoomType.pricePerNight) {
      setError('Room type name and price required');
      return;
    }
    const imageCount = (editingRoomType.images || []).filter(Boolean).length;
    if (imageCount < 3) {
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

  const deleteRoomType = (index) => {
    setRoomTypes(prev => prev.filter((_, i) => i !== index));
  };

  const nextFromBasic = () => {
    setError('');
    if (!propertyForm.propertyName || !propertyForm.shortDescription) {
      setError('Name and short description required');
      return;
    }
    setStep(2);
  };

  const nextFromLocation = () => {
    setError('');
    const { country, state, city, area, fullAddress, pincode } = propertyForm.address;
    if (!country || !state || !city || !area || !fullAddress || !pincode) {
      setError('All address fields are required');
      return;
    }
    if (!propertyForm.location.coordinates[0] || !propertyForm.location.coordinates[1]) {
      setError('Location coordinates are required');
      return;
    }
    setStep(3);
  };

  const nextFromAmenities = () => {
    setError('');
    setStep(4);
  };

  const nextFromNearbyPlaces = () => {
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
    if (propertyForm.propertyImages.filter(Boolean).length < 4) {
      setError('Please upload at least 4 property images');
      return;
    }
    setStep(6);
  };

  const nextFromRoomTypes = () => {
    setError('');
    if (!roomTypes.length) {
      setError('At least one RoomType required');
      return;
    }
    for (const rt of roomTypes) {
      if (!rt.name || !rt.pricePerNight) {
        setError('Room type name and price required');
        return;
      }
      if (!rt.images || rt.images.filter(Boolean).length < 3) {
        setError('Each room type must have at least 3 images');
        return;
      }
    }
    setStep(7);
  };

  const nextFromRules = () => {
    setError('');
    if (!propertyForm.checkInTime || !propertyForm.checkOutTime) {
      setError('Check-in and Check-out times are required');
      return;
    }
    if (!propertyForm.cancellationPolicy) {
      setError('Cancellation policy is required');
      return;
    }
    setStep(8);
  };

  const nextFromDocuments = () => {
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
        propertyType: 'pg',
        propertyName: propertyForm.propertyName,
        pgType: propertyForm.pgType,
        description: propertyForm.description,
        shortDescription: propertyForm.shortDescription,
        coverImage: propertyForm.coverImage,
        propertyImages: propertyForm.propertyImages.filter(Boolean),
        address: propertyForm.address,
        location: {
          type: 'Point',
          coordinates: [
            Number(propertyForm.location.coordinates[0]),
            Number(propertyForm.location.coordinates[1])
          ]
        },
        nearbyPlaces: propertyForm.nearbyPlaces.map(p => ({
          name: p.name,
          type: p.type,
          distanceKm: Number(p.distanceKm || 0)
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
          inventoryType: 'bed',
          roomCategory: rt.roomCategory,
          maxAdults: Number(rt.maxAdults),
          maxChildren: Number(rt.maxChildren || 0),
          bedsPerRoom: Number(rt.bedsPerRoom),
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
          if (created.roomType?._id) {
            persistedIds.push(created.roomType._id);
          }
        }
      }
      for (const id of existingIds) {
        if (!persistedIds.includes(id)) {
          await propertyService.deleteRoomType(propId, id);
        }
      }
      setStep(10);
    } catch (e) {
      setError(e?.message || 'Failed to submit property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white/60 border-b border-gray-100 backdrop-blur-sm flex items-center justify-center sticky top-0">
        <img src={logo} alt="Rukkoin" className="h-6" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#004F4D] transition-all duration-300"
                style={{ width: `${(Math.min(step, 9) / 9) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
              <span>Step {Math.min(step, 9)} of 9</span>
              <span>
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Location'}
                {step === 3 && 'Amenities'}
                {step === 4 && 'Nearby Places'}
                {step === 5 && 'Property Images'}
                {step === 6 && 'Bed Inventory'}
                {step === 7 && 'House Rules'}
                {step === 8 && 'Documents'}
                {step === 9 && 'Review & Submit'}
                {step >= 10 && 'Done'}
              </span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 1 — Basic Info</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">PG Name</div>
                  <input
                    className="input"
                    placeholder="UrbanStay PG"
                    value={propertyForm.propertyName}
                    onChange={e => updatePropertyForm('propertyName', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Property Type</div>
                    <input
                      className="input bg-gray-100 text-gray-600"
                      value="PG / Co-living"
                      readOnly
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">PG For</div>
                    <select
                      className="input"
                      value={propertyForm.pgType}
                      onChange={e => updatePropertyForm('pgType', e.target.value)}
                    >
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Short Description</div>
                  <textarea
                    className="input"
                    placeholder="Premium PG for working professionals..."
                    value={propertyForm.shortDescription}
                    onChange={e => updatePropertyForm('shortDescription', e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Full Description</div>
                  <textarea
                    className="input h-24"
                    placeholder="Describe your PG, facilities, rules, and nearby landmarks..."
                    value={propertyForm.description}
                    onChange={e => updatePropertyForm('description', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromBasic}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 2 — Location</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Search location (area, landmark)"
                    value={locationSearchQuery}
                    onChange={e => setLocationSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchLocationForAddress()}
                  />
                  <button
                    type="button"
                    onClick={searchLocationForAddress}
                    className="btn-primary px-4 py-2"
                    disabled={loading}
                  >
                    <Search size={16} />
                    Search
                  </button>
                </div>
                {locationResults.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-auto">
                    <div className="text-xs font-semibold mb-2 text-gray-500">Select from results</div>
                    <div className="space-y-1">
                      {locationResults.slice(0, 6).map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectLocationResult(p)}
                          className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                        >
                          {p.name || p.display_name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input"
                  placeholder="Country"
                  value={propertyForm.address.country}
                  onChange={e => updatePropertyForm(['address', 'country'], e.target.value)}
                />
                <input
                  className="input"
                  placeholder="State"
                  value={propertyForm.address.state}
                  onChange={e => updatePropertyForm(['address', 'state'], e.target.value)}
                />
                <input
                  className="input"
                  placeholder="City"
                  value={propertyForm.address.city}
                  onChange={e => updatePropertyForm(['address', 'city'], e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Area"
                  value={propertyForm.address.area}
                  onChange={e => updatePropertyForm(['address', 'area'], e.target.value)}
                />
                <input
                  className="input col-span-2"
                  placeholder="Full Address"
                  value={propertyForm.address.fullAddress}
                  onChange={e => updatePropertyForm(['address', 'fullAddress'], e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Pincode"
                  value={propertyForm.address.pincode}
                  onChange={e => updatePropertyForm(['address', 'pincode'], e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Longitude"
                  value={propertyForm.location.coordinates[0]}
                  readOnly
                />
                <input
                  className="input"
                  placeholder="Latitude"
                  value={propertyForm.location.coordinates[1]}
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold inline-flex items-center gap-2"
                  disabled={loading}
                >
                  <MapPin size={16} />
                  Use Current Location
                </button>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromLocation}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Bed size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 3 — Amenities</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PG_AMENITIES.map(item => {
                  const isSelected = propertyForm.amenities.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? propertyForm.amenities.filter(a => a !== item.name)
                          : [...propertyForm.amenities, item.name];
                        updatePropertyForm('amenities', updated);
                      }}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${isSelected
                        ? 'border-[#004F4D] bg-teal-50 text-[#004F4D]'
                        : 'border-gray-200 hover:border-teal-200 text-gray-600'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#004F4D] text-white' : 'bg-gray-100'
                        }`}
                      >
                        <CheckCircle size={16} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromAmenities}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Search size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 4 — Nearby Places</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 mb-3">
                {propertyForm.nearbyPlaces.map((place, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white"
                  >
                    <div>
                      <div className="font-semibold text-sm">{place.name}</div>
                      <div className="text-xs text-gray-500">
                        {place.type} {place.distanceKm ? `• ${place.distanceKm} km` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditNearbyPlace(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full disabled:opacity-50"
                        disabled={editingNearbyIndex !== null}
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNearbyPlace(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
                        disabled={editingNearbyIndex !== null}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {propertyForm.nearbyPlaces.length === 0 && editingNearbyIndex === null && (
                  <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl">
                    No nearby places added. Add at least 3.
                  </div>
                )}
              </div>

              {editingNearbyIndex !== null ? (
                <div className="border border-[#004F4D] bg-[#004F4D]/5 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-sm text-[#004F4D]">
                    {editingNearbyIndex === -1 ? 'Add Nearby Place' : 'Edit Nearby Place'}
                  </div>

                  <div className="relative space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="input flex-1"
                        placeholder="Search places"
                        value={nearbySearchQuery}
                        onChange={e => setNearbySearchQuery(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={searchNearbyPlaces}
                        className="px-3 py-2 rounded-xl bg-[#004F4D] text-white font-bold text-sm active:scale-95"
                      >
                        Search
                      </button>
                    </div>
                    {nearbyResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-auto">
                        {nearbyResults.slice(0, 6).map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectNearbyPlace(p)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {p.address || p.formatted_address || p.display_name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      className="input w-full"
                      placeholder="Place Name"
                      value={tempNearbyPlace.name}
                      onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="input w-full"
                        value={tempNearbyPlace.type}
                        onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, type: e.target.value })}
                      >
                        <option value="tourist">Tourist Attraction</option>
                        <option value="airport">Airport</option>
                        <option value="market">Market</option>
                        <option value="railway">Railway Station</option>
                        <option value="bus_stop">Bus Stop</option>
                        <option value="hospital">Hospital</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        className="input w-full"
                        type="number"
                        placeholder="Distance (km)"
                        value={tempNearbyPlace.distanceKm}
                        onChange={e => setTempNearbyPlace({ ...tempNearbyPlace, distanceKm: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveNearbyPlace}
                      className="flex-1 py-2 bg-[#004F4D] text-white rounded-xl font-bold text-sm"
                    >
                      {editingNearbyIndex === -1 ? 'Save Place' : 'Update Place'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditNearbyPlace}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startAddNearbyPlace}
                  disabled={propertyForm.nearbyPlaces.length >= 5}
                  className="w-full py-3 border-2 border-dashed border-[#004F4D]/40 text-[#004F4D] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004F4D]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Add Nearby Place ({propertyForm.nearbyPlaces.length}/5)
                </button>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromNearbyPlaces}
                  className="btn-primary"
                  disabled={loading || editingNearbyIndex !== null}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Image size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 5 — Property Images</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2">Cover Image</div>
                <div className="flex gap-3 items-start">
                  <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    {propertyForm.coverImage ? (
                      <img src={propertyForm.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Image size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => coverImageFileInputRef.current && coverImageFileInputRef.current.click()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2"
                        disabled={uploading}
                      >
                        <Upload size={14} />
                        Upload Cover
                      </button>
                      {propertyForm.coverImage && (
                        <button
                          type="button"
                          onClick={() => updatePropertyForm('coverImage', '')}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600"
                        >
                          Remove
                        </button>
                      )}
                      <input
                        type="file"
                        ref={coverImageFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e =>
                          uploadImages(e.target.files, urls => updatePropertyForm('coverImage', urls[0]))
                        }
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Main image shown on search and listing cards.</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                  <Plus size={16} className="text-[#004F4D]" />
                  <span>Gallery Images (minimum 4)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {propertyForm.propertyImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group"
                    >
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = propertyForm.propertyImages.filter((_, idx) => idx !== i);
                          updatePropertyForm('propertyImages', newImages);
                        }}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => propertyImagesFileInputRef.current && propertyImagesFileInputRef.current.click()}
                    className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#004F4D] hover:text-[#004F4D] transition-colors"
                    disabled={uploading}
                  >
                    <Plus size={24} />
                    <span className="text-xs font-bold mt-1">Add Image</span>
                  </button>
                </div>
                <input
                  type="file"
                  multiple
                  ref={propertyImagesFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={e =>
                    uploadImages(e.target.files, urls =>
                      updatePropertyForm('propertyImages', [...propertyForm.propertyImages, ...urls])
                    )
                  }
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromImages}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <Bed size={18} className="text-[#004F4D]" />
                  <h2 className="text-lg font-bold text-gray-800">Step 6 — Bed Inventory</h2>
                </div>
                <button
                  type="button"
                  onClick={startAddRoomType}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 flex items-center gap-2"
                >
                  <Plus size={14} />
                  Add Inventory
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}

              {editingRoomType ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="input"
                      placeholder="Name (e.g. 4 Sharing Room)"
                      value={editingRoomType.name}
                      onChange={e => setEditingRoomType({ ...editingRoomType, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="input"
                        value={editingRoomType.roomCategory}
                        onChange={e => setEditingRoomType({ ...editingRoomType, roomCategory: e.target.value })}
                      >
                        <option value="shared">Shared</option>
                        <option value="private">Private</option>
                      </select>
                      <input
                        className="input"
                        type="number"
                        placeholder="Price/Night"
                        value={editingRoomType.pricePerNight}
                        onChange={e => setEditingRoomType({ ...editingRoomType, pricePerNight: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        type="number"
                        placeholder="Beds Per Room"
                        value={editingRoomType.bedsPerRoom}
                        onChange={e => setEditingRoomType({ ...editingRoomType, bedsPerRoom: e.target.value })}
                      />
                      <input
                        className="input"
                        type="number"
                        placeholder="Total Inventory"
                        value={editingRoomType.totalInventory}
                        onChange={e => setEditingRoomType({ ...editingRoomType, totalInventory: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        type="number"
                        placeholder="Max Adults"
                        value={editingRoomType.maxAdults}
                        onChange={e => setEditingRoomType({ ...editingRoomType, maxAdults: e.target.value })}
                      />
                      <input
                        className="input"
                        type="number"
                        placeholder="Max Children"
                        value={editingRoomType.maxChildren}
                        onChange={e => setEditingRoomType({ ...editingRoomType, maxChildren: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Room Amenities</div>
                    <div className="flex flex-wrap gap-2">
                      {ROOM_AMENITIES.map(amenity => {
                        const isSelected = editingRoomType.amenities.includes(amenity.label);
                        return (
                          <button
                            key={amenity.key}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? editingRoomType.amenities.filter(a => a !== amenity.label)
                                : [...editingRoomType.amenities, amenity.label];
                              setEditingRoomType({ ...editingRoomType, amenities: updated });
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-sm flex items-center gap-2 ${isSelected
                              ? 'bg-[#004F4D] text-white border-[#004F4D]'
                              : 'bg-white border-gray-200 text-gray-600'
                              }`}
                          >
                            <amenity.icon size={14} />
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Room Images (minimum 3)</div>
                    <div className="grid grid-cols-4 gap-2">
                      {(editingRoomType.images || []).map((img, i) => (
                        <div key={i} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = editingRoomType.images.filter((_, idx) => idx !== i);
                              setEditingRoomType({ ...editingRoomType, images: newImgs });
                            }}
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#004F4D]">
                        <Plus size={20} className="text-gray-400" />
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          accept="image/*"
                          onChange={e =>
                            uploadImages(e.target.files, urls =>
                              setEditingRoomType({
                                ...editingRoomType,
                                images: [...(editingRoomType.images || []), ...urls]
                              })
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditRoomType}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveRoomType}
                      className="btn-primary"
                    >
                      Save Inventory
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomTypes.map((rt, i) => (
                    <div
                      key={rt.id}
                      className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-teal-200 transition-colors"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          {rt.images?.[0] && (
                            <img src={rt.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{rt.name}</h4>
                          <p className="text-sm text-gray-500">
                            {rt.roomCategory} • ₹{rt.pricePerNight}/night
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {rt.bedsPerRoom} Beds
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              {rt.totalInventory} Total
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditRoomType(i)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRoomType(i)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {roomTypes.length === 0 && (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      No inventory added. Click "Add Inventory" to start.
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromRoomTypes}
                  className="btn-primary"
                  disabled={loading || !!editingRoomType}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 7 — House Rules</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Check-in Time</div>
                  <input
                    className="input"
                    value={propertyForm.checkInTime}
                    onChange={e => updatePropertyForm('checkInTime', e.target.value)}
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Check-out Time</div>
                  <input
                    className="input"
                    value={propertyForm.checkOutTime}
                    onChange={e => updatePropertyForm('checkOutTime', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">Cancellation Policy</div>
                <select
                  className="input"
                  value={propertyForm.cancellationPolicy}
                  onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)}
                >
                  <option value="No refund after check-in">No refund after check-in</option>
                  <option value="Free cancellation up to 24hrs">Free cancellation up to 24hrs</option>
                  <option value="Strict">Strict</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-1">House Rules</div>
                <textarea
                  className="input h-24"
                  placeholder="No alcohol, No guests after 9 PM..."
                  value={propertyForm.houseRules.join(', ')}
                  onChange={e =>
                    updatePropertyForm(
                      'houseRules',
                      e.target.value.split(',').map(s => s.trim())
                    )
                  }
                />
                <p className="text-xs text-gray-400 mt-1">Separate rules with commas.</p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromRules}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <FileText size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold text-gray-800">Step 8 — Documents</h2>
              </div>
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Upload clear images or PDFs of the required documents for verification.
              </p>
              <div className="space-y-3">
                {propertyForm.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl"
                  >
                    <div className="p-3 bg-white rounded-lg border border-gray-200 text-[#004F4D]">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-800">{doc.name}</div>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          View Uploaded Document
                        </a>
                      ) : (
                        <span className="text-xs text-red-500">Pending Upload</span>
                      )}
                    </div>
                    <label className="btn-secondary text-xs py-2 px-3 cursor-pointer">
                      {doc.fileUrl ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={e =>
                          uploadImages(e.target.files, urls => {
                            const arr = [...propertyForm.documents];
                            arr[i].fileUrl = urls[0];
                            updatePropertyForm('documents', arr);
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextFromDocuments}
                  className="btn-primary"
                  disabled={loading}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Review & Submit</h2>
                <p className="text-gray-500 text-sm">
                  Check all PG details once before final submission.
                </p>
              </div>
              {error && (
                <div className="mx-auto max-w-md mb-1 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                  <CheckCircle size={16} className="rotate-45" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Property Name</span>
                  <span className="font-bold">{propertyForm.propertyName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">PG For</span>
                  <span className="font-bold">
                    {propertyForm.pgType === 'boys' && 'Boys'}
                    {propertyForm.pgType === 'girls' && 'Girls'}
                    {propertyForm.pgType === 'unisex' && 'Unisex'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-bold">
                    {propertyForm.address.city}, {propertyForm.address.state}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Inventory Types</span>
                  <span className="font-bold">{roomTypes.length} added</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Nearby Places</span>
                  <span className="font-bold">{propertyForm.nearbyPlaces.length}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Documents</span>
                  <span className="font-bold text-green-600">All Uploaded</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitAll}
                  disabled={loading}
                  className="btn-primary w-40"
                >
                  {loading ? 'Submitting...' : 'Submit Property'}
                </button>
              </div>
            </div>
          )}

          {step >= 10 && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-800">PG Submitted Successfully</h3>
              <p className="text-gray-500 text-center max-w-xs mb-6">
                PG property and bed inventories have been submitted. The listing will go live after
                admin verification.
              </p>
              <button
                type="button"
                onClick={() => navigate('/hotel/dashboard')}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .input { border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 12px; font-size: 14px; background: #fafafa; width: 100%; transition: all 0.2s; }
        .input:focus { outline: none; border-color: #004F4D; background: #fff; box-shadow: 0 0 0 3px rgba(0, 79, 77, 0.1); }
        .btn-primary { background: #004F4D; color: white; font-weight: 700; padding: 10px 16px; border-radius: 12px; transition: transform 0.1s, background 0.1s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-primary:active { transform: scale(0.97); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-secondary { background: white; color: #374151; font-weight: 600; padding: 10px 16px; border-radius: 12px; border: 1px solid #e5e7eb; transition: all 0.1s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-secondary:hover { background: #f9fafb; border-color: #d1d5db; }
      `}</style>
    </div>
  );
};

export default AddPGWizard;
