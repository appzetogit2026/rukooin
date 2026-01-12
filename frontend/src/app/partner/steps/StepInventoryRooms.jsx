import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X, Upload, Image } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepInventoryRooms = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { inventory = [], propertyCategory } = formData;
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isPgOrHostel = propertyCategory === 'PG' || propertyCategory === 'Hostel';
  const isHomestay = propertyCategory === 'Homestay';

  const [newItem, setNewItem] = useState({
    type: isPgOrHostel ? 'Shared Room (2 Sharing)' : 'Standard Room',
    name: '',
    count: 1,
    capacity: 2,
    maxChildren: 0,
    price: '',
    extraGuestPrice: '',
    monthlyPrice: '',
    gender: 'Any',
    amenities: [],
    images: [] // Placeholder
  });

  const handleAdd = () => {
    const itemToAdd = {
      ...newItem,
      pricing: isHomestay ? {
        basePrice: parseFloat(newItem.price) || 0,
        extraAdultPrice: parseFloat(newItem.extraGuestPrice) || 0
      } : undefined
    };

    updateFormData({
      inventory: [...inventory, itemToAdd]
    });
    setShowForm(false);
    // Reset form
    setNewItem({
      type: isPgOrHostel ? 'Shared Room (2 Sharing)' : 'Standard Room',
      name: '',
      count: 1,
      capacity: 2,
      maxChildren: 0,
      price: '',
      extraGuestPrice: '',
      monthlyPrice: '',
      gender: 'Any',
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">
          {isPgOrHostel ? 'Manage Rooms & Beds' : 'Manage Rooms'}
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add New Type
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {isPgOrHostel ? 'Room/Dorm Type' : isHomestay ? 'Room Type' : 'Room Type'}
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                {isPgOrHostel ? (
                  <>
                    <option>Shared Room (2 Sharing)</option>
                    <option>Shared Room (3 Sharing)</option>
                    <option>Shared Room (4+ Sharing)</option>
                    <option>Private Room</option>
                    <option>Dormitory Bed</option>
                  </>
                ) : isHomestay ? (
                  <>
                    <option>Private Room</option>
                    <option>Shared Room</option>
                    <option>Family Room</option>
                    <option>Deluxe Room</option>
                  </>
                ) : (
                  <>
                    <option>Standard Room</option>
                    <option>Deluxe Room</option>
                    <option>Suite</option>
                    <option>Family Room</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Custom Name (Optional)</label>
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder={isPgOrHostel ? "e.g. 2-Seater AC" : isHomestay ? "e.g. Garden View" : "e.g. Sea View"}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Dynamic Pricing Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isPgOrHostel ? 'Monthly Rent per Person (₹)' : 'Price per Night (₹)'}
              </label>
              <input
                type="number"
                value={isPgOrHostel ? newItem.monthlyPrice : newItem.price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isPgOrHostel) {
                    setNewItem({ ...newItem, monthlyPrice: val, price: 0 });
                  } else {
                    setNewItem({ ...newItem, price: val, monthlyPrice: 0 });
                  }
                }}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {isHomestay && (
              <div>
                <label className="block text-sm font-medium mb-1">Extra Guest Price (₹)</label>
                <input
                  type="number"
                  value={newItem.extraGuestPrice}
                  onChange={(e) => setNewItem({ ...newItem, extraGuestPrice: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {/* Count */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isPgOrHostel ? 'Total Beds Available' : 'Total Rooms'}
              </label>
              <input
                type="number"
                value={newItem.count}
                onChange={(e) => setNewItem({ ...newItem, count: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Capacity / Sharing */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {isPgOrHostel ? 'Occupancy (Guests per Room)' : 'Max Adults'}
              </label>
              <input
                type="number"
                value={newItem.capacity}
                onChange={(e) => setNewItem({ ...newItem, capacity: parseInt(e.target.value) || 1 })}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Hotel Specific Children */}
            {!isPgOrHostel && (
              <div>
                <label className="block text-sm font-medium mb-1">Max Children</label>
                <input
                  type="number"
                  value={newItem.maxChildren || 0}
                  onChange={(e) => setNewItem({ ...newItem, maxChildren: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            {/* Hostel/PG Gender */}
            {isPgOrHostel && (
              <div>
                <label className="block text-sm font-medium mb-1">Allowed Gender</label>
                <select
                  value={newItem.gender || 'Any'}
                  onChange={(e) => setNewItem({ ...newItem, gender: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="Any">Mixed / Any</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Room Amenities</label>
              {isHomestay ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['AC', 'Fan', 'TV', 'Heater', 'Wardrobe', 'Balcony', 'Geyser', 'Towels', 'Toiletries', 'Kettle'].map(am => (
                    <label key={am} className={`flex items-center gap-2 p-2 border rounded cursor-pointer text-sm ${newItem.amenities?.includes(am) ? 'bg-[#004F4D]/10 border-[#004F4D]' : 'bg-white border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={newItem.amenities?.includes(am) || false}
                        onChange={(e) => {
                          const current = newItem.amenities || [];
                          if (e.target.checked) setNewItem({ ...newItem, amenities: [...current, am] });
                          else setNewItem({ ...newItem, amenities: current.filter(x => x !== am) });
                        }}
                        className="w-4 h-4 accent-[#004F4D]"
                      />
                      {am}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  value={newItem.amenities?.join(', ') || ''}
                  onChange={(e) => setNewItem({ ...newItem, amenities: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="WiFi, AC, Geyser"
                  className="w-full p-3 border rounded-lg"
                />
              )}
            </div>

            <div className="col-span-1 md:grid-cols-2">
              {isHomestay ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Room Images * (Min 3 images)</label>

                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#004F4D] hover:bg-gray-50 transition-all mb-3">
                    <Upload size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload images'}
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

                  {/* Image Preview Grid */}
                  {newItem.images && newItem.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {newItem.images.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Room ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className={`text-xs ${(newItem.images?.length || 0) >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                    {newItem.images?.length || 0} / 3 images uploaded
                    {(newItem.images?.length || 0) >= 3 && ' ✓'}
                  </p>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed rounded-lg text-center text-gray-500 bg-gray-50 text-sm">
                  📸 Image upload for specific rooms will be enabled in next phase. Only Property Gallery is required now.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add to Inventory</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* List of Added Items */}
      <div className="space-y-4">
        {inventory.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg">{item.name || item.type}</h3>
              <p className="text-gray-500 text-sm">
                {isPgOrHostel
                  ? `₹${item.monthlyPrice}/mo • ${item.count} beds • ${item.gender}`
                  : `₹${item.price}/night • ${item.count} rooms • ${item.capacity} Adult, ${item.maxChildren} Child`
                }
              </p>
              {item.amenities?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {item.amenities.map((am, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{am}</span>
                  ))}
                </div>
              )}
              {isHomestay && item.images?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {item.images.slice(0, 3).map((imgUrl, i) => (
                    <img key={i} src={imgUrl} alt={`Room preview ${i + 1}`} className="w-12 h-12 object-cover rounded border" />
                  ))}
                  {item.images.length > 3 && (
                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                      +{item.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => handleRemove(idx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>
        ))}

        {inventory.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No rooms added yet. Click "Add New Type" to start.
          </div>
        )}
      </div>
    </div>
  );
};

export default StepInventoryRooms;
