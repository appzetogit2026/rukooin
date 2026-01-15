import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyService } from '../../../services/apiService';
import { CheckCircle, FileText, Home, Image } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const REQUIRED_DOCS = ["Ownership Proof", "Government ID", "Electricity Bill"];

const AddVillaWizard = () => {
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
      { name: '', type: 'tourist', distanceKm: '' },
      { name: '', type: 'airport', distanceKm: '' },
      { name: '', type: 'market', distanceKm: '' },
    ],
    amenities: [],
    checkInTime: '',
    checkOutTime: '',
    cancellationPolicy: '',
    houseRules: [],
    documents: REQUIRED_DOCS.map(name => ({ name, fileUrl: '' }))
  });

  const [roomTypeForm, setRoomTypeForm] = useState({
    name: 'Entire Villa',
    inventoryType: 'entire',
    roomCategory: 'entire',
    maxAdults: 6,
    maxChildren: 3,
    totalInventory: 1,
    pricePerNight: '',
    extraAdultPrice: 0,
    extraChildPrice: 0,
    images: ['', '', '', ''],
    amenities: ['Private Pool', 'Kitchen', 'WiFi'],
    isActive: true
  });

  const [roomTypeBackendId, setRoomTypeBackendId] = useState(null);

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
            : REQUIRED_DOCS.map(name => ({ name, fileUrl: '' }))
        });
        if (rts.length) {
          const rt = rts[0];
          setRoomTypeBackendId(rt._id);
          setRoomTypeForm({
            name: rt.name || 'Entire Villa',
            inventoryType: 'entire',
            roomCategory: 'entire',
            maxAdults: rt.maxAdults ?? 6,
            maxChildren: rt.maxChildren ?? 3,
            totalInventory: 1,
            pricePerNight: rt.pricePerNight ?? '',
            extraAdultPrice: rt.extraAdultPrice ?? 0,
            extraChildPrice: rt.extraChildPrice ?? 0,
            images: rt.images || ['', '', '', ''],
            amenities: rt.amenities || ['Private Pool', 'Kitchen', 'WiFi'],
            isActive: typeof rt.isActive === 'boolean' ? rt.isActive : true
          });
        } else {
          setRoomTypeBackendId(null);
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
    setLoading(true); setError('');
    try {
      const payload = {
        propertyType: 'villa',
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
          name: p.name, type: p.type, distanceKm: Number(p.distanceKm || 0)
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

  const onSubmitRoomType = async () => {
    if (!createdProperty?._id) {
      setError('Property not created yet'); return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        name: roomTypeForm.name,
        inventoryType: 'entire',
        roomCategory: 'entire',
        maxAdults: Number(roomTypeForm.maxAdults),
        maxChildren: Number(roomTypeForm.maxChildren),
        totalInventory: 1,
        pricePerNight: Number(roomTypeForm.pricePerNight),
        extraAdultPrice: Number(roomTypeForm.extraAdultPrice || 0),
        extraChildPrice: Number(roomTypeForm.extraChildPrice || 0),
        images: roomTypeForm.images.filter(Boolean),
        amenities: roomTypeForm.amenities,
      };
      if (roomTypeBackendId) {
        await propertyService.updateRoomType(createdProperty._id, roomTypeBackendId, payload);
      } else {
        const res = await propertyService.addRoomType(createdProperty._id, payload);
        if (res.roomType?._id) {
          setRoomTypeBackendId(res.roomType._id);
        }
      }
      setStep(3);
    } catch (e) {
      setError(e?.message || 'Failed to create room type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 bg-white/60 border-b border-gray-100 backdrop-blur-sm flex items-center justify-center sticky top-0">
        <img src={logo} alt="Rukkoin" className="h-6" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Home size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Villa — Property Details + Documents</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input className="input" placeholder="Property Name" value={propertyForm.propertyName} onChange={e => updatePropertyForm('propertyName', e.target.value)} />
                <textarea className="input" placeholder="Short Description" value={propertyForm.shortDescription} onChange={e => updatePropertyForm('shortDescription', e.target.value)} />
                <textarea className="input" placeholder="Description" value={propertyForm.description} onChange={e => updatePropertyForm('description', e.target.value)} />
                <input className="input" placeholder="Cover Image URL" value={propertyForm.coverImage} onChange={e => updatePropertyForm('coverImage', e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  {[0,1,2,3].map(i => (
                    <input key={i} className="input" placeholder={`Property Image ${i+1} URL`} value={propertyForm.propertyImages[i] || ''} onChange={e => {
                      const arr = [...propertyForm.propertyImages]; arr[i] = e.target.value; updatePropertyForm('propertyImages', arr);
                    }} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Country" value={propertyForm.address.country} onChange={e => updatePropertyForm(['address','country'], e.target.value)} />
                  <input className="input" placeholder="State" value={propertyForm.address.state} onChange={e => updatePropertyForm(['address','state'], e.target.value)} />
                  <input className="input" placeholder="City" value={propertyForm.address.city} onChange={e => updatePropertyForm(['address','city'], e.target.value)} />
                  <input className="input" placeholder="Area" value={propertyForm.address.area} onChange={e => updatePropertyForm(['address','area'], e.target.value)} />
                  <input className="input" placeholder="Full Address" value={propertyForm.address.fullAddress} onChange={e => updatePropertyForm(['address','fullAddress'], e.target.value)} />
                  <input className="input" placeholder="Pincode" value={propertyForm.address.pincode} onChange={e => updatePropertyForm(['address','pincode'], e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Longitude" value={propertyForm.location.coordinates[0]} onChange={e => {
                    const coords = [...propertyForm.location.coordinates]; coords[0] = e.target.value; updatePropertyForm(['location','coordinates'], coords);
                  }} />
                  <input className="input" placeholder="Latitude" value={propertyForm.location.coordinates[1]} onChange={e => {
                    const coords = [...propertyForm.location.coordinates]; coords[1] = e.target.value; updatePropertyForm(['location','coordinates'], coords);
                  }} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {propertyForm.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm w-40">{d.name}</span>
                      <input className="input flex-1" placeholder="File URL" value={d.fileUrl} onChange={e => {
                        const arr = [...propertyForm.documents]; arr[i] = { ...arr[i], fileUrl: e.target.value }; updatePropertyForm('documents', arr);
                      }} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Check-in Time" value={propertyForm.checkInTime} onChange={e => updatePropertyForm('checkInTime', e.target.value)} />
                  <input className="input" placeholder="Check-out Time" value={propertyForm.checkOutTime} onChange={e => updatePropertyForm('checkOutTime', e.target.value)} />
                </div>
                <textarea className="input" placeholder="Cancellation Policy" value={propertyForm.cancellationPolicy} onChange={e => updatePropertyForm('cancellationPolicy', e.target.value)} />
                <input className="input" placeholder="House Rules (comma separated)" value={propertyForm.houseRules.join(', ')} onChange={e => updatePropertyForm('houseRules', e.target.value.split(',').map(s => s.trim()))} />
              </div>
              <button disabled={loading} onClick={onSubmitProperty} className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Image size={18} className="text-[#004F4D]" />
                <h2 className="text-lg font-bold">Villa — RoomType (Entire)</h2>
              </div>
              {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
              <div className="grid grid-cols-1 gap-4">
                <input className="input" placeholder="Price Per Night (₹)" value={roomTypeForm.pricePerNight} onChange={e => setRoomTypeForm(prev => ({ ...prev, pricePerNight: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Extra Adult Price (₹)" value={roomTypeForm.extraAdultPrice} onChange={e => setRoomTypeForm(prev => ({ ...prev, extraAdultPrice: e.target.value }))} />
                  <input className="input" placeholder="Extra Child Price (₹)" value={roomTypeForm.extraChildPrice} onChange={e => setRoomTypeForm(prev => ({ ...prev, extraChildPrice: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Max Adults" value={roomTypeForm.maxAdults} onChange={e => setRoomTypeForm(prev => ({ ...prev, maxAdults: e.target.value }))} />
                  <input className="input" placeholder="Max Children" value={roomTypeForm.maxChildren} onChange={e => setRoomTypeForm(prev => ({ ...prev, maxChildren: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0,1,2,3].map(i => (
                    <input key={i} className="input" placeholder={`Image ${i+1} URL`} value={roomTypeForm.images[i]} onChange={e => {
                      const imgs = [...roomTypeForm.images]; imgs[i] = e.target.value; setRoomTypeForm(prev => ({ ...prev, images: imgs }));
                    }} />
                  ))}
                </div>
              </div>
              <button disabled={loading} onClick={onSubmitRoomType} className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">
                {loading ? 'Saving...' : 'Save RoomType'}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle size={48} className="text-green-600 mb-3" />
              <h3 className="text-xl font-bold mb-1">Villa setup complete</h3>
              <p className="text-gray-500 text-sm">Admin verification ke baad property live ho jayegi.</p>
              <button onClick={() => navigate('/hotel/dashboard')} className="mt-4 px-4 py-2 rounded-xl bg-[#004F4D] text-white font-bold active:scale-95">
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

export default AddVillaWizard;
