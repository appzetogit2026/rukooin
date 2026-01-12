import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X, Upload, Image } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepResortRooms = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { inventory = [] } = formData;
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newRoom, setNewRoom] = useState({
    type: 'Deluxe Room',
    name: '',
    description: '',
    viewType: '',
    count: 1,
    roomSize: '',
    capacity: 2,
    maxChildren: 1,
    extraBedAllowed: false,
    bedType: 'King',
    price: '',
    weekendPrice: '',
    seasonalPrice: '',
    extraGuestCharge: '',
    childPolicy: 'Free under 5 years',
    amenities: [],
    images: []
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadData = new FormData();
    files.forEach(file => uploadData.append('images', file));

    try {
      const response = await hotelService.uploadImages(uploadData);
      if (response.urls) {
        setNewRoom({
          ...newRoom,
          images: [...newRoom.images, ...response.urls]
        });
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setNewRoom({
      ...newRoom,
      images: newRoom.images.filter((_, i) => i !== index)
    });
  };

  const handleAdd = () => {
    updateFormData({
      inventory: [...inventory, newRoom]
    });
    setShowForm(false);
    setNewRoom({
      type: 'Deluxe Room',
      name: '',
      description: '',
      viewType: '',
      count: 1,
      roomSize: '',
      capacity: 2,
      maxChildren: 1,
      extraBedAllowed: false,
      bedType: 'King',
      price: '',
      weekendPrice: '',
      seasonalPrice: '',
      extraGuestCharge: '',
      childPolicy: 'Free under 5 years',
      amenities: [],
      images: []
    });
  };

  const handleRemove = (index) => {
    updateFormData({
      inventory: inventory.filter((_, i) => i !== index)
    });
  };

  const roomAmenities = ['AC', 'TV', 'Balcony', 'Mini Fridge', 'Wardrobe', 'Safe Locker', 'Tea/Coffee Maker', 'Room Service', 'Attached Bathroom', 'Bathtub', 'Jacuzzi'];

  const toggleAmenity = (amenity) => {
    const updated = newRoom.amenities.includes(amenity)
      ? newRoom.amenities.filter(a => a !== amenity)
      : [...newRoom.amenities, amenity];
    setNewRoom({ ...newRoom, amenities: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">Room / Unit Configuration</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Room Type
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
          {/* Room Type Details */}
          <div>
            <h3 className="font-bold text-md text-gray-700 mb-3">Room Type Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Type Name *</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option>Deluxe Room</option>
                  <option>Premium Room</option>
                  <option>Cottage</option>
                  <option>Villa Suite</option>
                  <option>Pool View Room</option>
                  <option>Sea View Room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Custom Name (Optional)</label>
                <input
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g. Ocean Breeze Suite"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Room Description</label>
                <textarea
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="Describe the room features and ambiance..."
                  className="w-full p-3 border rounded-lg h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">View Type</label>
                <select
                  value={newRoom.viewType}
                  onChange={(e) => setNewRoom({ ...newRoom, viewType: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select View</option>
                  <option>Garden View</option>
                  <option>Pool View</option>
                  <option>Sea View</option>
                  <option>Mountain View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Rooms of this Type *</label>
                <input
                  type="number"
                  value={newRoom.count}
                  onChange={(e) => setNewRoom({ ...newRoom, count: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Room Size (sq.ft)</label>
                <input
                  type="number"
                  value={newRoom.roomSize}
                  onChange={(e) => setNewRoom({ ...newRoom, roomSize: e.target.value })}
                  placeholder="e.g. 300"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Adults *</label>
                <input
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Children</label>
                <input
                  type="number"
                  value={newRoom.maxChildren}
                  onChange={(e) => setNewRoom({ ...newRoom, maxChildren: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bed Type</label>
                <select
                  value={newRoom.bedType}
                  onChange={(e) => setNewRoom({ ...newRoom, bedType: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option>King</option>
                  <option>Queen</option>
                  <option>Twin</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={newRoom.extraBedAllowed}
                  onChange={(e) => setNewRoom({ ...newRoom, extraBedAllowed: e.target.checked })}
                  className="w-5 h-5 accent-[#004F4D]"
                />
                <label className="text-sm font-medium">Extra Bed Allowed</label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-bold text-md text-gray-700 mb-3">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Base Price / Night (₹) *</label>
                <input
                  type="number"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                  placeholder="3000"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Weekend Price (₹)</label>
                <input
                  type="number"
                  value={newRoom.weekendPrice}
                  onChange={(e) => setNewRoom({ ...newRoom, weekendPrice: e.target.value })}
                  placeholder="3500"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Seasonal Price (₹)</label>
                <input
                  type="number"
                  value={newRoom.seasonalPrice}
                  onChange={(e) => setNewRoom({ ...newRoom, seasonalPrice: e.target.value })}
                  placeholder="4000"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Extra Guest Charge (₹)</label>
                <input
                  type="number"
                  value={newRoom.extraGuestCharge}
                  onChange={(e) => setNewRoom({ ...newRoom, extraGuestCharge: e.target.value })}
                  placeholder="500"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Child Policy</label>
                <input
                  value={newRoom.childPolicy}
                  onChange={(e) => setNewRoom({ ...newRoom, childPolicy: e.target.value })}
                  placeholder="e.g. Free under 5 years, 50% for 5-12 years"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Room Amenities */}
          <div>
            <h3 className="font-bold text-md text-gray-700 mb-3">Room Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {roomAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-sm ${newRoom.amenities.includes(amenity)
                      ? 'border-[#004F4D] bg-[#004F4D]/5'
                      : 'border-gray-200'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={newRoom.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 accent-[#004F4D]"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Room Images */}
          <div>
            <h3 className="font-bold text-md text-gray-700 mb-3">Room Images * (Min 4-5 images)</h3>

            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#004F4D] hover:bg-[#004F4D]/5 transition-all">
              <Upload size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                {uploading ? 'Uploading...' : 'Click to upload room images'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {newRoom.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {newRoom.images.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Room ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {newRoom.images.length} image(s) uploaded. Minimum 4 required.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAdd}
              disabled={newRoom.images.length < 4}
              className={`flex-1 py-3 rounded-lg font-bold ${newRoom.images.length >= 4
                  ? 'bg-[#004F4D] text-white hover:bg-[#003836]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              Add Room Type
            </button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Room List */}
      <div className="space-y-4">
        {inventory.map((room, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{room.name || room.type}</h3>
                <p className="text-gray-500 text-sm">
                  {room.count} rooms • {room.roomSize} sq.ft • {room.capacity} adults, {room.maxChildren} children
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">{room.viewType}</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">₹{room.price}/night</span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700 flex items-center gap-1">
                    <Image size={12} /> {room.images?.length || 0} photos
                  </span>
                </div>

                {room.images && room.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {room.images.slice(0, 5).map((url, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={url}
                        alt={`${room.type} ${imgIdx + 1}`}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {room.images.length > 5 && (
                      <div className="w-20 h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{room.images.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => handleRemove(idx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}

        {inventory.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No room types added yet. Click "Add Room Type" to start.
          </div>
        )}
      </div>

      {inventory.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Total Inventory:</strong> {inventory.reduce((sum, room) => sum + room.count, 0)} rooms across {inventory.length} room types
          </p>
        </div>
      )}
    </div>
  );
};

export default StepResortRooms;
