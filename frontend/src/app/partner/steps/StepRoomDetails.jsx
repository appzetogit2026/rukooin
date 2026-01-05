import React, { useRef, useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Plus, Trash2, BedDouble, Users, IndianRupee, Minus, Check, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepRoomDetails = () => {
  const { formData, addRoom, deleteRoom } = usePartnerStore();
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);

  // New Room State
  const [newRoom, setNewRoom] = useState({
    title: '',
    price: '',
    occupancy: 2,
    qty: 1,
    amenities: [],
    images: []
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.anim-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [formData.rooms, isAdding]);

  const handleRoomImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadData = new FormData();
      files.forEach(file => uploadData.append('images', file));

      const res = await hotelService.uploadImages(uploadData);
      if (res.success && res.urls) {
        const newImages = res.urls.map(url => ({
          id: Math.random().toString(36).substr(2, 9),
          url: url
        }));
        setNewRoom(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      }
    } catch (error) {
      alert('Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeRoomImage = (id) => {
    setNewRoom(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
  };

  const handleAddRoom = () => {
    if (!newRoom.title || !newRoom.price) return;
    if (newRoom.images.length === 0) return alert('Please upload at least one image for this room type');

    addRoom({
      ...newRoom,
      price: Number(newRoom.price)
    });
    setNewRoom({ title: '', price: '', occupancy: 2, qty: 1, amenities: [], images: [] });
    setIsAdding(false);
  };

  const ROOM_AMENITIES = ['AC', 'TV', 'Mini Fridge', 'Balcony', 'Geyser', 'WiFi', 'Attached Bathroom'];

  const toggleAmenity = (amenity) => {
    setNewRoom(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div ref={containerRef} className="pb-10 pt-2 px-1">

      {/* Header */}
      <div className="mb-6 flex justify-between items-end px-1">
        <div>
          <h3 className="text-xl font-black text-[#003836]">Rooms & Rates</h3>
          <p className="text-xs text-gray-400 font-medium">Define your room categories and their pricing</p>
        </div>
        {!isAdding && formData.rooms?.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#004F4D] text-white p-2 rounded-full shadow-lg active:scale-95 transition-all text-[10px] uppercase font-bold px-4"
          >
            Add More
          </button>
        )}
      </div>

      {/* Room List */}
      <div className="space-y-4 mb-6">
        {(formData.rooms || []).map((room, index) => (
          <div key={room.id || index} className="anim-item bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="flex gap-4 p-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                {room.images?.[0]?.url ? (
                  <img src={room.images[0].url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#003836] text-lg leading-tight">{room.title}</h4>
                    <button onClick={() => deleteRoom(room.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 font-bold uppercase text-[9px] text-gray-400 tracking-wider">
                    <span className="flex items-center gap-1"><Users size={12} /> Guests: {room.occupancy}</span>
                    <span className="flex items-center gap-1"><BedDouble size={12} /> Total {room.qty}</span>
                  </div>
                </div>
                <p className="text-xl font-black text-[#004F4D]">₹{room.price}<span className="text-[10px] font-bold text-gray-400">/night</span></p>
              </div>
            </div>
            {room.amenities?.length > 0 && (
              <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                {room.amenities.map(a => (
                  <span key={a} className="text-[9px] font-bold uppercase tracking-tighter bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded-full">{a}</span>
                ))}
                {room.images?.length > 1 && (
                  <span className="text-[9px] font-bold uppercase bg-[#004F4D]/5 text-[#004F4D] px-2 py-0.5 rounded-full">+{room.images.length - 1} More Photos</span>
                )}
              </div>
            )}
          </div>
        ))}

        {(!formData.rooms || formData.rooms.length === 0) && !isAdding && (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 anim-item">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
              <BedDouble size={32} />
            </div>
            <h4 className="font-bold text-gray-600 mb-1">No rooms added</h4>
            <p className="text-xs text-gray-400">You need to add at least one room category to list your hotel.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 bg-[#004F4D] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              Add My First Room Type
            </button>
          </div>
        )}
      </div>

      {/* Add Room Modal/Form Overlay */}
      {isAdding && (
        <div className="anim-item bg-white border-2 border-[#004F4D] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-[#004F4D] text-lg uppercase">Room Category Info</h4>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {/* Images Section */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Room Photos (Required)</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  type="button"
                  onClick={() => !uploading && fileInputRef.current.click()}
                  className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:border-[#004F4D] hover:text-[#004F4D] transition-colors"
                >
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  <span className="text-[8px] font-bold mt-1 uppercase">{uploading ? 'Adding...' : 'Add'}</span>
                </button>
                {newRoom.images.map(img => (
                  <div key={img.id} className="shrink-0 w-20 h-20 rounded-xl relative overflow-hidden border border-gray-100">
                    <img src={img.url} className="w-full h-full object-cover" />
                    <button onClick={() => removeRoomImage(img.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 shadow-md"><X size={10} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Room Title / Category Name</label>
              <input
                type="text"
                placeholder="e.g. Deluxe Double Room"
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold outline-none focus:border-[#004F4D] focus:bg-white transition-all shadow-inner"
                value={newRoom.title}
                onChange={e => setNewRoom({ ...newRoom, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full p-3 pl-9 rounded-xl bg-gray-50 border border-gray-100 text-sm font-black outline-none focus:border-[#004F4D] focus:bg-white transition-all shadow-inner"
                    value={newRoom.price}
                    onChange={e => setNewRoom({ ...newRoom, price: e.target.value })}
                  />
                </div>
              </div>
              {/* Quantity */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Total Units</label>
                <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1 shadow-inner">
                  <button onClick={() => setNewRoom({ ...newRoom, qty: Math.max(1, newRoom.qty - 1) })} className="p-2 text-gray-500"><Minus size={14} /></button>
                  <span className="flex-1 text-center text-sm font-black">{newRoom.qty}</span>
                  <button onClick={() => setNewRoom({ ...newRoom, qty: newRoom.qty + 1 })} className="p-2 text-[#004F4D]"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            {/* Occupancy & Features */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Max Occupancy</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setNewRoom({ ...newRoom, occupancy: num })}
                      className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${newRoom.occupancy === num ? 'bg-[#004F4D] text-white border-[#004F4D]' : 'bg-white text-gray-400 border-gray-100'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Room Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_AMENITIES.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-full border transition-all ${newRoom.amenities.includes(amenity) ? 'bg-[#004F4D] text-white border-[#004F4D]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                    >
                      <Check size={10} className={`inline mr-1 ${newRoom.amenities.includes(amenity) ? 'opacity-100' : 'opacity-0'}`} />
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddRoom}
              disabled={!newRoom.title || !newRoom.price || newRoom.images.length === 0}
              className="w-full py-4 rounded-xl bg-[#004F4D] text-white text-sm font-black uppercase tracking-widest shadow-lg disabled:opacity-50 mt-4 active:scale-95 transition-all"
            >
              Save Category
            </button>
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleRoomImageUpload} />
        </div>
      )}

    </div>
  );
};

export default StepRoomDetails;
