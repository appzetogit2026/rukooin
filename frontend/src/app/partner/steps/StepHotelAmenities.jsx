import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHotelAmenities = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { amenities = [] } = formData;

  const commonAmenities = [
    'Restaurant', 'Bar', 'Swimming Pool', 'Gym', 'Spa',
    'Conference Room', 'Elevator', 'Parking', 'Power Backup',
    'Wi-Fi (Common Areas)', 'Room Service (24x7)', 'Travel Desk'
  ];

  const toggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      updateFormData({ amenities: amenities.filter(a => a !== amenity) });
    } else {
      updateFormData({ amenities: [...amenities, amenity] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Hotel Amenities</h2>
        <p className="text-sm text-gray-500">Select the common facilities available at your hotel</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {commonAmenities.map(amenity => (
          <label
            key={amenity}
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all
              ${amenities.includes(amenity) ? 'bg-[#004F4D]/5 border-[#004F4D]' : 'bg-white border-gray-200 hover:border-gray-300'}
            `}
          >
            <input
              type="checkbox"
              checked={amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <span className="font-medium text-gray-700">{amenity}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StepHotelAmenities;
