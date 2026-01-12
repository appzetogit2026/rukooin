import React, { useState, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, Trash2, Edit2, Upload, X } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepInventory = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { inventory = [], propertyCategory, pricing = {}, availabilityRules = {} } = formData;
  const [editingIndex, setEditingIndex] = useState(-1);
  const [uploading, setUploading] = useState(false);

  // Determine Logic based on Property Category
  const isPG = propertyCategory === 'PG';
  const isHostel = propertyCategory === 'Hostel';
  const isVilla = propertyCategory === 'Villa'; // Homestay might act like Villa or Hotel depending on room based or not, treating Villa explicitly here.

  // --- VILLA PRICING MODE ---
  if (isVilla) {
    const handlePricingChange = (e) => {
      const { name, value } = e.target;
      updateFormData({
        pricing: { ...pricing, [name]: value }
      });
    };

    const handleRulesChange = (e) => {
      const { name, value } = e.target;
      updateFormData({
        availabilityRules: { ...availabilityRules, [name]: value }
      });
    };

    return (
      <div className="space-y-8">
        <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-800 text-sm">
          <p><strong>Note:</strong> Since this is a Villa (Entire Place), define the pricing for the whole property per night.</p>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#003836]">Pricing Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Base Price / Night *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                <input type="number" name="basePrice" value={pricing.basePrice || ''} onChange={handlePricingChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" placeholder="0" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Extra Guest Price / Night</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                <input type="number" name="extraGuestPrice" value={pricing.extraGuestPrice || ''} onChange={handlePricingChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" placeholder="0" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Cleaning Fee (One-time)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                <input type="number" name="cleaningFee" value={pricing.cleaningFee || ''} onChange={handlePricingChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#003836]">Availability Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Min Stay (Nights)</label>
              <input type="number" name="minStay" value={availabilityRules.minStay || 1} onChange={handleRulesChange} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" min="1" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Max Stay (Nights)</label>
              <input type="number" name="maxStay" value={availabilityRules.maxStay || 30} onChange={handleRulesChange} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" min="1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- HOTEL/PG/HOSTEL INVENTORY MODE ---

  // Labels & Defaults
  const getLabels = () => {
    if (isHostel) return {
      name: 'Room/Dorm Name (e.g. 6 Bed Mixed Dorm)',
      capacity: 'Beds per Room',
      count: 'Total Rooms',
      price: 'Price per Bed / Night',
      typeOptions: ['Dormitory', 'Private Room']
    };
    if (isPG) return {
      name: 'Room/Dorm Name (e.g. 4-Bed Dorm)',
      capacity: 'Beds in Room',
      count: 'Total Rooms of this type',
      price: 'Monthly Rent per Bed/Room',
      typeOptions: ['Dorm', 'Private']
    };
    return { // Hotel/Resort/Homestay(RoomMode)
      name: 'Room Category (e.g. Deluxe Room)',
      capacity: 'Max Guests',
      count: 'Total Rooms',
      price: 'Price per Night',
      typeOptions: ['Room']
    };
  };

  const labels = getLabels();

  // Determine Default Gender based on Hostel Type
  const getDefaultGender = () => {
    if (!isHostel) return 'Any';
    const hType = formData.config?.hostelType;
    if (hType === 'Boys') return 'Male';
    if (hType === 'Girls') return 'Female';
    return 'Mixed';
  }

  // Default item template
  const defaultItem = {
    name: '',
    type: labels.typeOptions[0],
    capacity: 4,
    count: 1,
    price: '',
    monthlyPrice: '',
    gender: getDefaultGender(), // New field
    images: [],
  };

  const [currentItem, setCurrentItem] = useState(defaultItem);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Effect to update gender if hostel type changes (though unlikely during step)
  useEffect(() => {
    if (isFormOpen && isHostel) {
      setCurrentItem(prev => ({ ...prev, gender: getDefaultGender() }));
    }
  }, [formData.config?.hostelType, isFormOpen]);


  const handleEdit = (index) => {
    setCurrentItem({ ...inventory[index], images: inventory[index].images || [] });
    setEditingIndex(index);
    setIsFormOpen(true);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      const newInventory = inventory.filter((_, i) => i !== index);
      updateFormData({ inventory: newInventory });
    }
  };

  const handleSave = () => {
    // Validation
    const effectivePrice = isPG ? currentItem.monthlyPrice : currentItem.price;

    if (!currentItem.name || !effectivePrice) {
      alert("Please fill in Name and Price");
      return;
    }

    // Normalizing data for Backend
    const itemToSave = {
      ...currentItem,
      price: effectivePrice, // Backend uses 'price' for all
      monthlyPrice: undefined // Clean up
    };

    let newInventory = [...inventory];
    if (editingIndex >= 0) {
      newInventory[editingIndex] = itemToSave;
    } else {
      newInventory.push(itemToSave);
    }
    updateFormData({ inventory: newInventory });
    handleCancel();
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingIndex(-1);
    setCurrentItem(defaultItem);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
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
        // Determine format based on Schema. Schema expects { url, caption }
        const newImages = response.urls.map(url => ({ url, caption: '' }));
        setCurrentItem(prev => ({
          ...prev,
          images: [...(prev.images || []), ...newImages]
        }));
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const AMENITIES_OPTIONS = [
    "AC", "Smart TV", "Free WiFi", "Attached Bathroom", "Western Toilet",
    "Geyser/Heater", "Balcony", "Work Desk", "Wardrobe", "Mini Fridge",
    "Kettle", "Sofa", "Toiletries", "Garden View", "City View"
  ];

  const removeImage = (indexToRemove) => {
    setCurrentItem(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">Define your {isVilla ? 'units' : 'rooms'} and their pricing.</p>

      {/* List */}
      <div className="space-y-4">
        {inventory.map((item, index) => (
          <div key={index} className="border border-gray-200 p-3 sm:p-4 rounded-lg flex gap-3 sm:gap-4 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* Thumb */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0].url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Upload size={16} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#003836] truncate pr-2">{item.name || 'Unnamed Unit'}</h3>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {item.type} • {item.count} Units
                  </p>
                </div>

                {/* Actions Desktop / or top right on mobile */}
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(index)} className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                  <button onClick={() => handleDelete(index)} className="p-1.5 sm:p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-x-3 gap-y-1 mt-1 items-center">
                <span>Capacity: {item.capacity}</span>
                <span className="font-bold text-[#004F4D]">
                  {isPG ? `₹${item.monthlyPrice}/mo` : `₹${item.price}/night`}
                </span>
              </div>
            </div>
          </div>
        ))}

        {inventory.length === 0 && !isFormOpen && (
          <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50/50">
            No rooms/units added yet. Click below to add one.
          </div>
        )}
      </div>

      {/* Add Button */}
      {!isFormOpen && (
        <button
          onClick={() => { setCurrentItem(defaultItem); setIsFormOpen(true); }}
          className="w-full py-4 border-2 border-dashed border-[#004F4D] text-[#004F4D] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004F4D]/5 transition-all active:scale-[0.99]"
        >
          <Plus size={20} /> Add New {isVilla ? 'Unit' : isPG ? 'Bed Type' : 'Room Category'}
        </button>
      )}

      {/* Full Page Overlay for Add/Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-600" />
              </button>
              <h3 className="font-bold text-xl text-[#003836]">{editingIndex >= 0 ? 'Edit' : 'Add'} {labels.typeOptions[0]}</h3>
            </div>
            <button onClick={handleSave} className="px-5 py-2 bg-[#004F4D] text-white rounded-lg font-bold shadow-lg text-sm">
              Save
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-24">
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Images */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase block">Room Photos (Max 5)</label>
                <div className="flex flex-wrap gap-3">
                  {currentItem.images?.map((img, i) => (
                    <div key={i} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-gray-200 group shrink-0 shadow-sm">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm active:scale-95 transition-transform"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {(!currentItem.images || currentItem.images.length < 5) && (
                    <label className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#004F4D] hover:bg-[#004F4D]/5 transition-all text-gray-400">
                      {uploading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#004F4D]"></div> : <Upload size={24} />}
                      <span className="text-[10px] mt-2 font-bold uppercase">Add Photo</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{labels.name}</label>
                <input name="name" value={currentItem.name} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004F4D] outline-none text-lg font-medium placeholder:text-gray-300" placeholder="e.g. Deluxe Suite" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                  <div className="relative">
                    <select name="type" value={currentItem.type} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl outline-none bg-white appearance-none focus:ring-2 focus:ring-[#004F4D] font-medium">
                      {labels.typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{labels.capacity}</label>
                  <input type="number" name="capacity" value={currentItem.capacity} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Count */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">{labels.count}</label>
                  <input type="number" name="count" value={currentItem.count} onChange={handleChange} className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" min="1" />
                </div>

                {/* Auto-calc Total Beds for Hostels/PG */}
                {(isHostel || isPG) && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Total Beds (Auto)</label>
                    <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">
                      {(currentItem.count || 0) * (currentItem.capacity || 0)} Beds
                    </div>
                  </div>
                )}

                {/* Gender (Hostel/PG) */}
                {(isHostel || isPG) && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Room Gender</label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={currentItem.gender || 'Any'}
                        onChange={handleChange}
                        disabled={formData.config?.hostelType === 'Boys' || formData.config?.hostelType === 'Girls'}
                        className={`w-full p-4 border border-gray-200 rounded-xl outline-none appearance-none font-medium ${formData.config?.hostelType === 'Boys' || formData.config?.hostelType === 'Girls' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-[#004F4D]'}`}
                      >
                        <option value="Male">Male Only</option>
                        <option value="Female">Female Only</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Any">Any</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing */}
                {isPG ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{labels.price}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                      <input type="number" name="monthlyPrice" value={currentItem.monthlyPrice} onChange={handleChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{labels.price}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                      <input type="number" name="price" value={currentItem.price} onChange={handleChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" />
                    </div>
                  </div>
                )}
              </div>

              {/* Extra Bed Price (Hotel/Resort) */}
              {!isPG && !isVilla && !isHostel && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Extra Bed Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                    <input type="number" name="extraBedPrice" value={currentItem.extraBedPrice} onChange={handleChange} className="w-full p-4 pl-8 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004F4D] font-medium" />
                  </div>
                </div>
              )}

              {/* Room Amenities Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Room Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        const currentAmenities = currentItem.amenities || [];
                        const newAmenities = currentAmenities.includes(opt)
                          ? currentAmenities.filter(a => a !== opt)
                          : [...currentAmenities, opt];
                        setCurrentItem(prev => ({ ...prev, amenities: newAmenities }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${(currentItem.amenities || []).includes(opt)
                        ? 'bg-[#004F4D] text-white border-[#004F4D] shadow-md transform scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepInventory;
