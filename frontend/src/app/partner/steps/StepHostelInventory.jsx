import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X, Upload, Image, Edit2 } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepHostelInventory = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { inventory = [], config = {} } = formData;
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [newItem, setNewItem] = useState({
    type: '4 Bed Dorm',
    name: '',
    category: 'Dormitory',
    count: 1,
    bedsPerRoom: 4,
    totalBeds: 4,
    price: '',
    gender: config.hostelType || 'Mixed',
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
        setNewItem({
          ...newItem,
          images: [...newItem.images, ...response.urls]
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
    setNewItem({
      ...newItem,
      images: newItem.images.filter((_, i) => i !== index)
    });
  };

  const handleAdd = () => {
    // Calculate total beds
    const item = {
      ...newItem,
      totalBeds: newItem.count * newItem.bedsPerRoom,
      gender: config.hostelType === 'Mixed' ? newItem.gender : config.hostelType
    };

    if (editingIndex !== null) {
      const updatedInventory = [...inventory];
      updatedInventory[editingIndex] = item;
      updateFormData({ inventory: updatedInventory });
      setEditingIndex(null);
    } else {
      updateFormData({
        inventory: [...inventory, item]
      });
    }

    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewItem({
      type: '4 Bed Dorm',
      name: '',
      category: 'Dormitory',
      count: 1,
      bedsPerRoom: 4,
      totalBeds: 4,
      price: '',
      gender: config.hostelType || 'Mixed',
      amenities: [],
      images: []
    });
    setEditingIndex(null);
  };

  const handleEdit = (index) => {
    setNewItem(inventory[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleRemove = (index) => {
    updateFormData({
      inventory: inventory.filter((_, i) => i !== index)
    });
  };

  const handleCountChange = (value) => {
    const count = parseInt(value) || 1;
    setNewItem({ ...newItem, count, totalBeds: count * newItem.bedsPerRoom });
  };

  const handleBedsPerRoomChange = (value) => {
    const bedsPerRoom = parseInt(value) || 1;
    setNewItem({ ...newItem, bedsPerRoom, totalBeds: newItem.count * bedsPerRoom });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">Room & Bed Inventory</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Room Type
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room Category *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Dormitory</option>
                <option>Private Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room Type Name *</label>
              <input
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                placeholder="e.g. 6 Bed Dorm"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Custom Name (Optional)</label>
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. AC Mixed Dorm"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Rooms *</label>
              <input
                type="number"
                value={newItem.count}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Beds per Room *</label>
              <input
                type="number"
                value={newItem.bedsPerRoom}
                onChange={(e) => handleBedsPerRoomChange(e.target.value)}
                className="w-full p-3 border rounded-lg"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Beds (Auto)</label>
              <input
                type="number"
                value={newItem.totalBeds}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price per Bed/Night (₹) *</label>
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="500"
              />
            </div>

            {config.hostelType === 'Mixed' && (
              <div>
                <label className="block text-sm font-medium mb-1">Room Gender</label>
                <select
                  value={newItem.gender}
                  onChange={(e) => setNewItem({ ...newItem, gender: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Mixed">Mixed</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Room Amenities (comma separated)</label>
              <input
                value={newItem.amenities?.join(', ') || ''}
                onChange={(e) => setNewItem({ ...newItem, amenities: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="WiFi, AC, Lockers"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Room Images Upload */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Room Images * (Min 2 images)</label>

              {/* Upload Button */}
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

              {/* Preview Uploaded Images */}
              {newItem.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {newItem.images.map((url, idx) => (
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
                {newItem.images.length} image(s) uploaded. Minimum 2 required.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAdd}
              disabled={newItem.images.length < 2}
              className={`flex-1 py-3 rounded-lg font-bold ${newItem.images.length >= 2
                ? 'bg-[#004F4D] text-white hover:bg-[#003836]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {editingIndex !== null ? 'Update Inventory' : 'Add to Inventory'}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* List of Added Items */}
      <div className="space-y-4">
        {inventory.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name || item.type}</h3>
                <p className="text-gray-500 text-sm">
                  {item.count} rooms • {item.bedsPerRoom} beds/room • {item.totalBeds} total beds • ₹{item.price}/bed/night
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">{item.category}</span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700">{item.gender}</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700 flex items-center gap-1">
                    <Image size={12} /> {item.images?.length || 0} photos
                  </span>
                </div>

                {/* Image Preview */}
                {item.images && item.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {item.images.slice(0, 4).map((url, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={url}
                        alt={`${item.type} ${imgIdx + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-200"
                      />
                    ))}
                    {item.images.length > 4 && (
                      <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 transition-opacity">
                <button onClick={() => handleEdit(idx)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-full">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleRemove(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {inventory.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No rooms added yet. Click "Add Room Type" to start.
          </div>
        )}
      </div>

      {inventory.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Total Inventory:</strong> {inventory.reduce((sum, item) => sum + item.totalBeds, 0)} beds across {inventory.length} room types
          </p>
        </div>
      )}
    </div>
  );
};

export default StepHostelInventory;
