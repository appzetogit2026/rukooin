import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X, Upload } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepHotelRooms = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { inventory = [] } = formData;
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newItem, setNewItem] = useState({
    type: 'Deluxe Room',
    name: '',
    roomView: 'City View',
    roomSize: '',
    maxAdults: 2,
    maxChildren: 1,
    count: 1, // Number of rooms
    pricing: {
      basePrice: '',
      extraAdultPrice: '',
      extraChildPrice: '',
      weekendPrice: '',
    },
    amenities: [],
    images: [] // Min 4
  });

  const amenitiesList = ['AC', 'Non-AC', 'Wi-Fi', 'TV', 'Wardrobe', 'Room Service', 'Mini Fridge', 'Balcony', 'Safe Locker', 'Geyser', 'Bathtub'];

  const handleAdd = () => {
    // Validation
    if (!newItem.pricing.basePrice || !newItem.count) {
      alert('Please fill price and number of rooms');
      return;
    }
    if (newItem.images.length < 4) {
      alert('Please upload minimum 4 images for this room type');
      return;
    }

    updateFormData({
      inventory: [...inventory, newItem]
    });
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewItem({
      type: 'Deluxe Room',
      name: '',
      roomView: 'City View',
      roomSize: '',
      maxAdults: 2,
      maxChildren: 1,
      count: 1,
      pricing: {
        basePrice: '',
        extraAdultPrice: '',
        extraChildPrice: '',
        weekendPrice: '',
      },
      amenities: [],
      images: []
    });
  };

  const handleRemove = (index) => {
    updateFormData({
      inventory: inventory.filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (newItem.images.length + files.length > 6) {
      alert('Maximum 6 images allowed per room type');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    files.forEach(file => uploadData.append('images', file));

    try {
      const response = await hotelService.uploadImages(uploadData);
      if (response.urls) {
        setNewItem(prev => ({ ...prev, images: [...prev.images, ...response.urls] }));
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setNewItem(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const toggleAmenity = (am) => {
    const current = newItem.amenities || [];
    if (current.includes(am)) {
      setNewItem({ ...newItem, amenities: current.filter(x => x !== am) });
    } else {
      setNewItem({ ...newItem, amenities: [...current, am] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#003836]">Room Types & Inventory</h2>
          <p className="text-sm text-gray-500">Configure rooms, pricing and amenities</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Room Type
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Category</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Deluxe Room</option>
                <option>Executive Room</option>
                <option>Suite</option>
                <option>Family Room</option>
                <option>Standard Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Name (Optional)</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Ocean View Suite"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room View</label>
              <select
                value={newItem.roomView}
                onChange={(e) => setNewItem({ ...newItem, roomView: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>City View</option>
                <option>Garden View</option>
                <option>Sea View</option>
                <option>Pool View</option>
                <option>No View</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Size (sq ft)</label>
              <input
                type="number"
                value={newItem.roomSize}
                onChange={(e) => setNewItem({ ...newItem, roomSize: e.target.value })}
                placeholder="e.g. 250"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Rooms</label>
              <input
                type="number"
                value={newItem.count}
                onChange={(e) => setNewItem({ ...newItem, count: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max Adults</label>
              <input
                type="number"
                value={newItem.maxAdults}
                onChange={(e) => setNewItem({ ...newItem, maxAdults: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Children</label>
              <input
                type="number"
                value={newItem.maxChildren}
                onChange={(e) => setNewItem({ ...newItem, maxChildren: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-700 mb-3">Pricing (Per Night)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price (₹) *</label>
                <input
                  type="number"
                  value={newItem.pricing.basePrice}
                  onChange={(e) => setNewItem({ ...newItem, pricing: { ...newItem.pricing, basePrice: e.target.value } })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weekend Price (Optional)</label>
                <input
                  type="number"
                  value={newItem.pricing.weekendPrice}
                  onChange={(e) => setNewItem({ ...newItem, pricing: { ...newItem.pricing, weekendPrice: e.target.value } })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Extra Adult Price</label>
                <input
                  type="number"
                  value={newItem.pricing.extraAdultPrice}
                  onChange={(e) => setNewItem({ ...newItem, pricing: { ...newItem.pricing, extraAdultPrice: e.target.value } })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Extra Child Price</label>
                <input
                  type="number"
                  value={newItem.pricing.extraChildPrice}
                  onChange={(e) => setNewItem({ ...newItem, pricing: { ...newItem.pricing, extraChildPrice: e.target.value } })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-2">Room Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenitiesList.map(am => (
                <label key={am} className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-xs ${newItem.amenities.includes(am) ? 'bg-[#004F4D]/10 border-[#004F4D]' : 'bg-white'}`}>
                  <input type="checkbox" checked={newItem.amenities.includes(am)} onChange={() => toggleAmenity(am)} className="accent-[#004F4D]" />
                  {am}
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Room Images (Min 4, Max 6) *</label>
            <div className="grid grid-cols-6 gap-3">
              {newItem.images.map((url, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                </div>
              ))}
              {newItem.images.length < 6 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-center text-gray-500 mt-1">{uploading ? '...' : 'Upload'}</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
            <p className={`text-xs mt-1 ${newItem.images.length >= 4 ? 'text-green-600' : 'text-red-500'}`}>
              {newItem.images.length} / 4 minimum images uploaded
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add Room Type</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {inventory.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 relative group">
            <img src={item.images[0]} className="w-32 h-32 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{item.name ? `${item.name} (${item.type})` : item.type} <span className="text-sm font-normal text-gray-500">({item.roomView})</span></h3>
              <div className="text-sm text-gray-500 space-y-1 mt-1">
                <p>🛏️ {item.roomSize} sq ft • {item.count} Rooms • Max {item.maxAdults}Ad/{item.maxChildren}Ch</p>
                <p className="font-medium text-[#004F4D]">₹{item.pricing.basePrice} / night</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.amenities.slice(0, 5).map((am, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{am}</span>
                  ))}
                  {item.amenities.length > 5 && <span className="text-xs text-gray-400">+{item.amenities.length - 5}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => handleRemove(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full"><X size={20} /></button>
          </div>
        ))}
        {!inventory.length && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No rooms added yet. Click "Add Room Type" to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default StepHotelRooms;
