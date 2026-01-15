import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService } from '../../../services/apiService';
import { CheckCircle, FileText, Home, Image, Bed } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_HOSTEL = [
  "Trade License",
  "Fire Safety Certificate",
  "Police Verification",
  "Owner ID Proof"
];

const HOSTEL_AMENITIES = ["WiFi", "Laundry", "Housekeeping", "CCTV", "Security"];

const AddHostelWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingProperty = location.state?.property || null;
  const isEditMode = !!existingProperty;
  const [step, setStep] = useState(1);
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
      { name: '', type: 'metro', distanceKm: '' },
      { name: '', type: 'college', distanceKm: '' },
      { name: '', type: 'hospital', distanceKm: '' }
    ],
    amenities: [],
    checkInTime: '12:00 PM',
    checkOutTime: '10:00 AM',
    cancellationPolicy: 'No refund after check-in',
    houseRules: [],
    documents: REQUIRED_DOCS_HOSTEL.map(name => ({ name, fileUrl: '' }))
  });

  const [roomTypes, setRoomTypes] = useState([
    {
      id: Date.now().toString(),
      name: '4 Sharing Dorm',
      inventoryType: 'bed',
      roomCategory: 'shared',
      maxAdults: 1,
      maxChildren: 0,
      bedsPerRoom: 4,
      totalInventory: 20,
      pricePerNight: '',
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: ['', '', '', ''],
      amenities: ['Bunk Bed', 'Personal Locker', 'Fan', 'Common Washroom'],
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
        name: 'New Dorm/Room',
        inventoryType: 'bed',
        roomCategory: 'shared',
        maxAdults: 1,
        maxChildren: 0,
        bedsPerRoom: 2,
        totalInventory: 10,
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
              type: p.type || 'metro',
              distanceKm: typeof p.distanceKm === 'number' ? String(p.distanceKm) : ''
            }))
            : [
              { name: '', type: 'metro', distanceKm: '' },
              { name: '', type: 'college', distanceKm: '' },
              { name: '', type: 'hospital', distanceKm: '' }
            ],
          amenities: prop.amenities || [],
          checkInTime: prop.checkInTime || '12:00 PM',
          checkOutTime: prop.checkOutTime || '10:00 AM',
          cancellationPolicy: prop.cancellationPolicy || 'No refund after check-in',
          houseRules: prop.houseRules || [],
          documents: docs.length
            ? docs.map(d => ({ name: d.name, fileUrl: d.fileUrl || '' }))
            : REQUIRED_DOCS_HOSTEL.map(name => ({ name, fileUrl: '' }))
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
        propertyType: 'hostel',
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
          inventoryType: 'bed',
          roomCategory: rt.roomCategory,
          maxAdults: Number(rt.maxAdults),
          maxChildren: Number(rt.maxChildren || 0),
          bedsPerRoom: Number(rt.bedsPerRoom),
          totalInventory: Number(rt.totalInventory),
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
      <header className="h-14 bg-white/60 border-b border-gray-100 backdrop-blur-sm flex items-center justify-center sticky top-0 z-10">
        <img src={logo} alt="Rukkoin" className="h-6" />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Hostel — Property Details + Documents</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input
                  className="input"
                  placeholder="Hostel Name"
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
                  placeholder="Full Description"
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
                      placeholder={`Hostel Image ${i + 1} URL`}
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

                <div className="flex flex-wrap gap-2">
                  {HOSTEL_AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => {
                        const current = propertyForm.amenities.includes(amenity);
                        const updated = current
                          ? propertyForm.amenities.filter(a => a !== amenity)
                          : [...propertyForm.amenities, amenity];
                        updatePropertyForm('amenities', updated);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${propertyForm.amenities.includes(amenity)
                          ? 'bg-[#004F4D] text-white border-[#004F4D]'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
                  <h4 className="text-sm font-bold text-gray-700 mb-1">Required Documents</h4>
                  {propertyForm.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm w-40 truncate" title={d.name}>{d.name}</span>
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
                className="mt-6 w-full py-3 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95 shadow-lg shadow-teal-900/20"
              >
                {loading ? 'Creating Property...' : 'Save & Continue'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bed size={18} className="text-[#004F4D]" />
                  <h2 className="text-lg font-bold">Hostel — Bed Inventory</h2>
                </div>
                <button
                  type="button"
                  onClick={addRoomTypeRow}
                  className="text-xs font-bold text-[#004F4D] bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-100"
                >
                  Add Dorm/Room
                </button>
              </div>

              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

              <div className="space-y-6">
                {roomTypes.map((rt, index) => (
                  <div key={rt.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 relative">
                    {roomTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoomTypeRow(rt.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs font-bold"
                      >
                        Remove
                      </button>
                    )}
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
                      Inventory Type {index + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder="Name"
                        value={rt.name}
                        onChange={e => updateRoomType(rt.id, 'name', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Price Per Night (Per Bed)"
                        type="number"
                        value={rt.pricePerNight}
                        onChange={e => updateRoomType(rt.id, 'pricePerNight', e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="input"
                          placeholder="Total Beds"
                          type="number"
                          value={rt.totalInventory}
                          onChange={e => updateRoomType(rt.id, 'totalInventory', e.target.value)}
                        />
                        <input
                          className="input"
                          placeholder="Beds Per Room"
                          type="number"
                          value={rt.bedsPerRoom}
                          onChange={e => updateRoomType(rt.id, 'bedsPerRoom', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="input"
                          value={rt.roomCategory}
                          onChange={e => updateRoomType(rt.id, 'roomCategory', e.target.value)}
                        >
                          <option value="shared">Shared</option>
                          <option value="private">Private</option>
                        </select>
                        <input
                          className="input"
                          placeholder="Max Adults"
                          type="number"
                          value={rt.maxAdults}
                          onChange={e => updateRoomType(rt.id, 'maxAdults', e.target.value)}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <input
                          className="input w-full"
                          placeholder="Amenities (comma separated)"
                          value={rt.amenities.join(', ')}
                          onChange={e =>
                            updateRoomType(
                              rt.id,
                              'amenities',
                              e.target.value.split(',').map(s => s.trim())
                            )
                          }
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(i => (
                          <input
                            key={i}
                            className="input text-xs"
                            placeholder={`Img ${i + 1}`}
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
                  </div>
                ))}
              </div>

              <button
                disabled={loading}
                onClick={onSubmitRoomTypes}
                className="mt-6 w-full py-3 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95 shadow-lg shadow-teal-900/20"
              >
                {loading ? 'Finalizing...' : 'Save All & Finish'}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-800">Hostel setup complete</h3>
              <p className="text-gray-500 text-center max-w-xs mb-6">
                Hostel property and bed inventories have been submitted. Admin verification ke baad property live ho jayegi.
              </p>
              <button
                onClick={() => navigate('/hotel/dashboard')}
                className="px-8 py-3 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95 shadow-lg"
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
      `}</style>
    </div>
  );
};

export default AddHostelWizard;
