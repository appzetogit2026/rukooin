import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService } from '../../../services/apiService';
import { CheckCircle, FileText, Home, Image, Plus, Trash2 } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_HOTEL = ["Trade License", "GST Certificate", "FSSAI License", "Fire Safety Certificate"];

const AddHotelWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingProperty = location.state?.property || null;
  const isEditMode = !!existingProperty;
  const initialStep = location.state?.initialStep || 1;
  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProperty, setCreatedProperty] = useState(null);

  const [propertyForm, setPropertyForm] = useState({
    propertyName: '',
    description: '',
    shortDescription: '',
    coverImage: '',
    propertyImages: [],
    address: { country: '', state: '', city: '', area: '', fullAddress: '', pincode: '' },
    location: { type: 'Point', coordinates: ['', ''] },
    nearbyPlaces: [
      { name: '', type: 'tourist', distanceKm: '' },
      { name: '', type: 'airport', distanceKm: '' },
      { name: '', type: 'market', distanceKm: '' },
    ],
    amenities: [],
    checkInTime: '',
    checkOutTime: '',
    cancellationPolicy: '',
    houseRules: [],
    documents: REQUIRED_DOCS_HOTEL.map(name => ({ name, fileUrl: '' }))
  });

  const [roomTypes, setRoomTypes] = useState([
    {
      id: Date.now().toString(),
      name: 'Standard Room',
      inventoryType: 'room',
      roomCategory: 'private',
      maxAdults: 2,
      maxChildren: 1,
      totalInventory: 1,
      pricePerNight: '',
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: ['', '', '', ''],
      amenities: [],
      isActive: true
    }
  ]);

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

  const updateRoomType = (id, path, value) => {
    setRoomTypes(prev =>
      prev.map(rt => {
        if (rt.id !== id) return rt;
        const clone = JSON.parse(JSON.stringify(rt));
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let ref = clone;
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
        ref[keys[keys.length - 1]] = value;
        return clone;
      })
    );
  };

  const addRoomTypeRow = () => {
    setRoomTypes(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: 'New Room Type',
        inventoryType: 'room',
        roomCategory: 'private',
        maxAdults: 2,
        maxChildren: 0,
        totalInventory: 1,
        pricePerNight: '',
        extraAdultPrice: 0,
        extraChildPrice: 0,
        images: ['', '', '', ''],
        amenities: [],
        isActive: true
      }
    ]);
  };

  const removeRoomTypeRow = (id) => {
    setRoomTypes(prev => prev.filter(rt => rt.id !== id));
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
            : [
              { name: '', type: 'tourist', distanceKm: '' },
              { name: '', type: 'airport', distanceKm: '' },
              { name: '', type: 'market', distanceKm: '' }
            ],
          amenities: prop.amenities || [],
          checkInTime: prop.checkInTime || '',
          checkOutTime: prop.checkOutTime || '',
          cancellationPolicy: prop.cancellationPolicy || '',
          houseRules: prop.houseRules || [],
          documents: docs.length
            ? docs.map(d => ({ name: d.name, fileUrl: d.fileUrl || '' }))
            : REQUIRED_DOCS_HOTEL.map(name => ({ name, fileUrl: '' }))
        });
        if (rts.length) {
          setRoomTypes(
            rts.map(rt => ({
              id: rt._id,
              backendId: rt._id,
              name: rt.name || '',
              inventoryType: rt.inventoryType || 'room',
              roomCategory: rt.roomCategory || 'private',
              maxAdults: rt.maxAdults ?? '',
              maxChildren: rt.maxChildren ?? '',
              totalInventory: rt.totalInventory ?? '',
              pricePerNight: rt.pricePerNight ?? '',
              extraAdultPrice: rt.extraAdultPrice ?? '',
              extraChildPrice: rt.extraChildPrice ?? '',
              images: rt.images || ['', '', '', ''],
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

  const onSubmitProperty = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        propertyType: 'hotel',
        propertyName: propertyForm.propertyName,
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
        houseRules: propertyForm.houseRules,
        documents: propertyForm.documents.map(d => ({ name: d.name, fileUrl: d.fileUrl }))
      };
      if (isEditMode && (createdProperty?._id || existingProperty?._id)) {
        const id = createdProperty?._id || existingProperty._id;
        const { documents, ...propertyPayload } = payload;
        const updated = await propertyService.update(id, propertyPayload);
        if (documents && documents.length) {
          await propertyService.upsertDocuments(id, documents);
        }
        setCreatedProperty(updated.property || updated);
      } else {
        const res = await propertyService.create(payload);
        setCreatedProperty(res.property);
      }
      setStep(2);
    } catch (e) {
      setError(e?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRoomTypes = async () => {
    if (!createdProperty?._id) {
      setError('Property not created yet');
      return;
    }
    if (!roomTypes.length) {
      setError('At least one RoomType required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const existingIds = new Set(originalRoomTypeIds);
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
          await propertyService.updateRoomType(createdProperty._id, rt.backendId, payload);
          persistedIds.push(rt.backendId);
        } else {
          const created = await propertyService.addRoomType(createdProperty._id, payload);
          if (created.roomType?._id) {
            persistedIds.push(created.roomType._id);
          }
        }
      }
      for (const id of existingIds) {
        if (!persistedIds.includes(id)) {
          await propertyService.deleteRoomType(createdProperty._id, id);
        }
      }
      setStep(3);
    } catch (e) {
      setError(e?.message || 'Failed to save room types');
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
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Hotel — Property Details + Documents</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input
                  className="input"
                  placeholder="Hotel Name"
                  value={propertyForm.propertyName}
                  onChange={e => updatePropertyForm('propertyName', e.target.value)}
                />
                <textarea
                  className="input"
                  placeholder="Short Description"
                  value={propertyForm.shortDescription}
                  onChange={e => updatePropertyForm('shortDescription', e.target.value)}
                />
                <textarea
                  className="input"
                  placeholder="Description"
                  value={propertyForm.description}
                  onChange={e => updatePropertyForm('description', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Cover Image URL"
                  value={propertyForm.coverImage}
                  onChange={e => updatePropertyForm('coverImage', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <input
                      key={i}
                      className="input"
                      placeholder={`Property Image ${i + 1} URL`}
                      value={propertyForm.propertyImages[i] || ''}
                      onChange={e => {
                        const arr = [...propertyForm.propertyImages];
                        arr[i] = e.target.value;
                        updatePropertyForm('propertyImages', arr);
                      }}
                    />
                  ))}
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
                    className="input"
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
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input"
                    placeholder="Longitude"
                    value={propertyForm.location.coordinates[0]}
                    onChange={e => {
                      const coords = [...propertyForm.location.coordinates];
                      coords[0] = e.target.value;
                      updatePropertyForm(['location', 'coordinates'], coords);
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Latitude"
                    value={propertyForm.location.coordinates[1]}
                    onChange={e => {
                      const coords = [...propertyForm.location.coordinates];
                      coords[1] = e.target.value;
                      updatePropertyForm(['location', 'coordinates'], coords);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {propertyForm.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm w-40">{d.name}</span>
                      <input
                        className="input flex-1"
                        placeholder="File URL"
                        value={d.fileUrl}
                        onChange={e => {
                          const arr = [...propertyForm.documents];
                          arr[i] = { ...arr[i], fileUrl: e.target.value };
                          updatePropertyForm('documents', arr);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input"
                    placeholder="Check-in Time"
                    value={propertyForm.checkInTime}
                    onChange={e => updatePropertyForm('checkInTime', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Check-out Time"
                    value={propertyForm.checkOutTime}
                    onChange={e => updatePropertyForm('checkOutTime', e.target.value)}
                  />
                </div>
                <textarea
                  className="input"
                  placeholder="Cancellation Policy"
                  value={propertyForm.cancellationPolicy}
                  onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="House Rules (comma separated)"
                  value={propertyForm.houseRules.join(', ')}
                  onChange={e =>
                    updatePropertyForm(
                      'houseRules',
                      e.target.value.split(',').map(s => s.trim())
                    )
                  }
                />
              </div>
              <button
                disabled={loading}
                onClick={onSubmitProperty}
                className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95"
              >
                {loading ? 'Creating...' : 'Create Hotel Property'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Image size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Hotel — Room Types (inventoryType = room)</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="space-y-4">
                {roomTypes.map(rt => (
                  <div key={rt.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        className="input flex-1 mr-2"
                        placeholder="Room Type Name (e.g., Deluxe Room)"
                        value={rt.name}
                        onChange={e => updateRoomType(rt.id, 'name', e.target.value)}
                      />
                      <button
                        type="button"
                        className="p-2 rounded-full bg-red-50 text-red-500"
                        onClick={() => removeRoomTypeRow(rt.id)}
                        disabled={roomTypes.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        placeholder="Price Per Night (₹)"
                        value={rt.pricePerNight}
                        onChange={e => updateRoomType(rt.id, 'pricePerNight', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Total Inventory (rooms)"
                        value={rt.totalInventory}
                        onChange={e => updateRoomType(rt.id, 'totalInventory', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        placeholder="Extra Adult Price (₹)"
                        value={rt.extraAdultPrice}
                        onChange={e => updateRoomType(rt.id, 'extraAdultPrice', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Extra Child Price (₹)"
                        value={rt.extraChildPrice}
                        onChange={e => updateRoomType(rt.id, 'extraChildPrice', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="input"
                        placeholder="Max Adults"
                        value={rt.maxAdults}
                        onChange={e => updateRoomType(rt.id, 'maxAdults', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Max Children"
                        value={rt.maxChildren}
                        onChange={e => updateRoomType(rt.id, 'maxChildren', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map(i => (
                        <input
                          key={i}
                          className="input"
                          placeholder={`Image ${i + 1} URL`}
                          value={rt.images[i] || ''}
                          onChange={e => {
                            const imgs = [...rt.images];
                            imgs[i] = e.target.value;
                            updateRoomType(rt.id, 'images', imgs);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRoomTypeRow}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-700"
                >
                  <Plus size={16} />
                  Add Another Room Type
                </button>
              </div>
              <button
                disabled={loading}
                onClick={onSubmitRoomTypes}
                className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95"
              >
                {loading ? 'Saving...' : 'Save Room Types'}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle size={48} className="text-green-600 mb-3" />
              <h3 className="text-xl font-bold mb-1">Hotel setup complete</h3>
              <p className="text-gray-500 text-sm">Admin verification ke baad property live ho jayegi.</p>
              <button
                onClick={() => navigate('/hotel/dashboard')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .input { border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 12px; font-size: 14px; background: #fafafa; }
        .input:focus { outline: none; border-color: #004F4D; background: #fff; }
      `}</style>
    </div>
  );
};

export default AddHotelWizard;
