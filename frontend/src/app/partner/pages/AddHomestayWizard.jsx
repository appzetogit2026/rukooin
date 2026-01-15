import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService } from '../../../services/apiService';
import { CheckCircle, FileText, Home, Image, Bed } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS_HOMESTAY = ["Ownership Proof", "Local Body Registration", "Government ID"];
const OPTIONAL_DOCS_HOMESTAY = [];

const HOMESTAY_AMENITIES = ["Kitchen", "WiFi", "Parking", "Power Backup", "Washing Machine", "TV", "AC"];

const AddHomestayWizard = () => {
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
      { name: '', type: 'market', distanceKm: '' },
      { name: '', type: 'bus_station', distanceKm: '' },
      { name: '', type: 'hospital', distanceKm: '' }
    ],
    amenities: [],
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation up to 24h before check-in',
    houseRules: [],
    documents: [...REQUIRED_DOCS_HOMESTAY, ...OPTIONAL_DOCS_HOMESTAY].map(name => ({ name, fileUrl: '' })),

    // Homestay specific
    hostLivesOnProperty: false,
    familyFriendly: true
  });

  const [roomTypes, setRoomTypes] = useState([
    {
      id: Date.now().toString(),
      name: 'Standard Room',
      inventoryType: 'room', // 'room' or 'entire'
      roomCategory: 'private',
      maxAdults: 2,
      maxChildren: 1,
      bedsPerRoom: 1,
      totalInventory: 1,
      pricePerNight: '',
      extraAdultPrice: 0,
      extraChildPrice: 0,
      images: ['', '', '', ''],
      amenities: ['AC', 'WiFi', 'Attached Bathroom'],
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
        bedsPerRoom: 1,
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
              type: p.type || 'market',
              distanceKm: typeof p.distanceKm === 'number' ? String(p.distanceKm) : ''
            }))
            : [
              { name: '', type: 'market', distanceKm: '' },
              { name: '', type: 'bus_station', distanceKm: '' },
              { name: '', type: 'hospital', distanceKm: '' }
            ],
          amenities: prop.amenities || [],
          checkInTime: prop.checkInTime || '12:00 PM',
          checkOutTime: prop.checkOutTime || '11:00 AM',
          cancellationPolicy: prop.cancellationPolicy || 'Free cancellation up to 24h before check-in',
          houseRules: prop.houseRules || [],
          documents: docs.length
            ? docs.map(d => ({ name: d.name, fileUrl: d.fileUrl || '' }))
            : [...REQUIRED_DOCS_HOMESTAY, ...OPTIONAL_DOCS_HOMESTAY].map(name => ({ name, fileUrl: '' })),
          hostLivesOnProperty: typeof prop.hostLivesOnProperty === 'boolean' ? prop.hostLivesOnProperty : false,
          familyFriendly: typeof prop.familyFriendly === 'boolean' ? prop.familyFriendly : true
        });
        if (rts.length) {
          setRoomTypes(
            rts.map(rt => ({
              id: rt._id,
              backendId: rt._id,
              name: rt.name || '',
              inventoryType: rt.inventoryType || 'room',
              roomCategory: rt.roomCategory || 'private',
              maxAdults: rt.maxAdults ?? 2,
              maxChildren: rt.maxChildren ?? 1,
              bedsPerRoom: rt.bedsPerRoom ?? 1,
              totalInventory: rt.totalInventory ?? 1,
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
        propertyType: 'homestay',
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
        documents: propertyForm.documents.map(d => ({ name: d.name, fileUrl: d.fileUrl })),
        hostLivesOnProperty: propertyForm.hostLivesOnProperty,
        familyFriendly: propertyForm.familyFriendly
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
          inventoryType: rt.inventoryType,
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
                <h2 className="text-lg font-bold">Homestay — Property Details + Documents</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input
                  className="input"
                  placeholder="Homestay Name"
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

                {/* Homestay Specific Fields */}
                <div className="flex gap-6 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#004F4D]"
                      checked={propertyForm.hostLivesOnProperty}
                      onChange={e => updatePropertyForm('hostLivesOnProperty', e.target.checked)}
                    />
                    <span className="text-sm font-medium">Host Lives on Property?</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#004F4D]"
                      checked={propertyForm.familyFriendly}
                      onChange={e => updatePropertyForm('familyFriendly', e.target.checked)}
                    />
                    <span className="text-sm font-medium">Family Friendly?</span>
                  </label>
                </div>

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

                {/* Nearby Places */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Nearby Places</h3>
                  {propertyForm.nearbyPlaces.map((place, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        className="input flex-1"
                        placeholder="Place Name"
                        value={place.name}
                        onChange={e => {
                          const arr = [...propertyForm.nearbyPlaces];
                          arr[idx].name = e.target.value;
                          updatePropertyForm('nearbyPlaces', arr);
                        }}
                      />
                      <select
                        className="input w-32"
                        value={place.type}
                        onChange={e => {
                          const arr = [...propertyForm.nearbyPlaces];
                          arr[idx].type = e.target.value;
                          updatePropertyForm('nearbyPlaces', arr);
                        }}
                      >
                        <option value="market">Market</option>
                        <option value="bus_station">Bus Stn</option>
                        <option value="hospital">Hospital</option>
                        <option value="tourist_spot">Tourist Spot</option>
                      </select>
                      <input
                        className="input w-24"
                        placeholder="Km"
                        type="number"
                        value={place.distanceKm}
                        onChange={e => {
                          const arr = [...propertyForm.nearbyPlaces];
                          arr[idx].distanceKm = e.target.value;
                          updatePropertyForm('nearbyPlaces', arr);
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {HOMESTAY_AMENITIES.map(am => (
                      <button
                        key={am}
                        type="button"
                        onClick={() => {
                          const has = propertyForm.amenities.includes(am);
                          updatePropertyForm('amenities', has ? propertyForm.amenities.filter(x => x !== am) : [...propertyForm.amenities, am]);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${propertyForm.amenities.includes(am)
                            ? 'bg-[#004F4D] text-white border-[#004F4D]'
                            : 'bg-white text-gray-600 border-gray-200'
                          }`}
                      >
                        {am}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText size={16} /> Required Documents
                  </h3>
                  {propertyForm.documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        {doc.name} <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="input"
                        placeholder={`${doc.name} URL`}
                        value={doc.fileUrl}
                        onChange={e => {
                          const arr = [...propertyForm.documents];
                          arr[idx].fileUrl = e.target.value;
                          updatePropertyForm('documents', arr);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={onSubmitProperty}
                  disabled={loading}
                  className="w-full bg-[#004F4D] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#003836] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Next: Add Inventory'}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Bed size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Inventory & Pricing</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

              <div className="space-y-6">
                {roomTypes.map((rt, idx) => (
                  <div key={rt.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-700">Inventory Unit #{idx + 1}</h3>
                      {roomTypes.length > 1 && (
                        <button onClick={() => removeRoomTypeRow(rt.id)} className="text-red-500 text-xs font-medium">
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder="Unit Name (e.g. Deluxe Room or Entire Villa)"
                        value={rt.name}
                        onChange={e => updateRoomType(rt.id, 'name', e.target.value)}
                      />

                      {/* Inventory Type Selector */}
                      <select
                        className="input"
                        value={rt.inventoryType}
                        onChange={e => updateRoomType(rt.id, 'inventoryType', e.target.value)}
                      >
                        <option value="room">Private Room</option>
                        <option value="entire">Entire Place</option>
                      </select>

                      <select
                        className="input"
                        value={rt.roomCategory}
                        onChange={e => updateRoomType(rt.id, 'roomCategory', e.target.value)}
                        disabled={rt.inventoryType === 'entire'} // Entire place is usually private
                      >
                        <option value="private">Private</option>
                        <option value="shared">Shared</option>
                      </select>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Max Adults</label>
                          <input
                            type="number"
                            className="input"
                            value={rt.maxAdults}
                            onChange={e => updateRoomType(rt.id, 'maxAdults', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Max Children</label>
                          <input
                            type="number"
                            className="input"
                            value={rt.maxChildren}
                            onChange={e => updateRoomType(rt.id, 'maxChildren', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">{rt.inventoryType === 'entire' ? 'Total Beds' : 'Beds/Room'}</label>
                          <input
                            type="number"
                            className="input"
                            value={rt.bedsPerRoom}
                            onChange={e => updateRoomType(rt.id, 'bedsPerRoom', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Total Units</label>
                          <input
                            type="number"
                            className="input"
                            value={rt.totalInventory}
                            onChange={e => updateRoomType(rt.id, 'totalInventory', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Price/Night</label>
                          <input
                            type="number"
                            className="input"
                            placeholder="Price"
                            value={rt.pricePerNight}
                            onChange={e => updateRoomType(rt.id, 'pricePerNight', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500">Extra Adult Price</label>
                          <input
                            type="number"
                            className="input"
                            value={rt.extraAdultPrice}
                            onChange={e => updateRoomType(rt.id, 'extraAdultPrice', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="col-span-2 grid grid-cols-4 gap-2 mt-2">
                        {[0, 1, 2, 3].map(i => (
                          <input
                            key={i}
                            className="input text-xs"
                            placeholder={`Img ${i + 1}`}
                            value={rt.images[i] || ''}
                            onChange={e => {
                              const arr = [...rt.images];
                              arr[i] = e.target.value;
                              updateRoomType(rt.id, 'images', arr);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addRoomTypeRow}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-[#004F4D] hover:text-[#004F4D] transition-colors"
                >
                  + Add Another Unit Type
                </button>

                <button
                  onClick={onSubmitRoomTypes}
                  disabled={loading}
                  className="w-full bg-[#004F4D] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#003836] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Finish & Go Live'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Homestay Listed Successfully!</h2>
              <p className="text-gray-500 mb-6">Your homestay is now live and ready to receive bookings.</p>
              <button
                onClick={() => navigate('/partner/dashboard')}
                className="bg-[#004F4D] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003836] transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AddHomestayWizard;
