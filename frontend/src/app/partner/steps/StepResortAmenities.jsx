import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepResortAmenities = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { amenities = [] } = formData;

  const toggleAmenity = (amenity) => {
    const updated = amenities.includes(amenity)
      ? amenities.filter(a => a !== amenity)
      : [...amenities, amenity];
    updateFormData({ amenities: updated });
  };

  const amenityCategories = {
    'Water & Recreation': ['Swimming Pool', 'Spa & Wellness', 'Private Beach Access', 'Jacuzzi', 'Water Sports'],
    'Dining & Bar': ['Restaurant', 'Bar / Lounge', 'In-Room Dining', 'BBQ Area', 'Poolside Cafe'],
    'Fitness & Wellness': ['Gym', 'Yoga Center', 'Spa & Massage', 'Meditation Room', 'Doctor on Call'],
    'Family & Kids': ['Kids Play Area', 'Baby Sitting', 'Kids Menu', 'Kids Pool', 'Games Room'],
    'Outdoor & Nature': ['Garden / Lawn', 'Terrace', 'Trekking Trails', 'Bird Watching', 'Nature Walks'],
    'Indoor Activities': ['Indoor Games', 'Library', 'Conference Hall', 'Banquet Hall', 'Business Center'],
    'Essential Services': ['WiFi', 'Parking', 'Power Backup', 'Room Service', 'Laundry', '24x7 Security', 'CCTV', 'Airport Transfer']
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Resort Amenities</h2>
        <p className="text-sm text-gray-500">Select all amenities available at your resort property</p>
      </div>

      <div className="space-y-6">
        {Object.entries(amenityCategories).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-bold text-lg text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-[#004F4D]">◆</span> {category}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((amenity) => (
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
        ))}
      </div>

      <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>{amenities.length}</strong> amenities selected. Premium resorts with more amenities get higher visibility!
        </p>
      </div>
    </div>
  );
};

export default StepResortAmenities;
