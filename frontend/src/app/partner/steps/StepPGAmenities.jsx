import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { Wifi, Zap, Video, Lock, Tv, Coffee } from 'lucide-react';

const StepPGAmenities = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { amenities = [] } = formData;

  const pgAmenities = [
    'Wi-Fi (High Speed)', 'Power Backup', 'CCTV Security', 'Biometric / Smart Lock',
    'Security Guard', '24x7 Water Supply', 'RO Water Purifier', 'Hot Water (Geyser)',
    'Elevator', 'Parking (2-Wheeler)', 'Parking (4-Wheeler)',
    'Washing Machine', 'Refrigerator (Common)', 'Microwave', 'Common Kitchen',
    'TV / Lounge Area', 'Study Room / Library', 'Terrace Access', 'Housekeeping', 'Laundry Service'
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
        <h2 className="text-2xl font-bold text-[#003836]">PG Amenities & Facilities</h2>
        <p className="text-sm text-gray-500">Select facilities available for all residents</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pgAmenities.map(amenity => (
          <label
            key={amenity}
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm
              ${amenities.includes(amenity) ? 'bg-[#004F4D]/5 border-[#004F4D]' : 'bg-white border-gray-200'}
            `}
          >
            <input
              type="checkbox"
              checked={amenities.includes(amenity)}
              onChange={() => toggleAmenity(amenity)}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <span className="font-medium text-gray-700 text-sm">{amenity}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StepPGAmenities;
