import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHomestayAmenities = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { amenities = [], config = {} } = formData;

  const toggleAmenity = (amenity) => {
    const updated = amenities.includes(amenity)
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    updateFormData({ amenities: updated });
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      config: { ...config, [name]: value }
    });
  };

  const commonAmenities = ['Wi-Fi', 'Parking', 'Power backup', 'Hot water', 'RO drinking water'];
  const roomAmenities = ['Fan', 'AC', 'Heater', 'Wardrobe', 'TV'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Amenities</h2>
        <p className="text-sm text-gray-500">Select available amenities</p>
      </div>

      {/* Common Amenities */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Common Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonAmenities.map((amenity) => (
            <label
              key={amenity}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${amenities.includes(amenity)
                ? 'border-[#004F4D] bg-[#004F4D]/5'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <input
                type="checkbox"
                checked={amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="w-5 h-5 accent-[#004F4D]"
              />
              <span className="text-sm font-medium text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Room Amenities section removed - now handled in Rooms step */}

      {/* Food Options */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Food</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast included? *</label>
            <select
              name="breakfastIncluded"
              value={config.breakfastIncluded || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Yes">Yes (Free)</option>
              <option value="Paid">Paid</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lunch / Dinner available?</label>
            <select
              name="mealsAvailable"
              value={config.mealsAvailable || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
            <select
              name="foodType"
              value={config.foodType || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Veg only">Veg only</option>
              <option value="Veg + Non-veg">Veg + Non-veg</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>{amenities.length}</strong> amenities selected. More amenities = Better visibility!
        </p>
      </div>
    </div>
  );
};

export default StepHomestayAmenities;
