import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepVillaStructure = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { config = {} } = formData;

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      config: {
        ...config,
        entirePlace: true, // Always true for villas
        [name]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Villa Structure & Capacity</h2>
        <p className="text-sm text-gray-500">Define the layout and capacity of your entire villa</p>
      </div>

      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ <strong>Booking Mode:</strong> Entire Place (Guests book the whole villa)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Bedrooms *</label>
          <input
            type="number"
            name="bedrooms"
            value={config.bedrooms || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. 3"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Bathrooms *</label>
          <input
            type="number"
            name="bathrooms"
            value={config.bathrooms || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. 2"
            min="1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests Allowed *</label>
          <input
            type="number"
            name="maxGuests"
            value={config.maxGuests || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. 6"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">This will be the maximum booking limit for your villa</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Important:</strong> Max guests cannot exceed the realistic capacity of your villa. This ensures guest comfort and safety.
        </p>
      </div>
    </div>
  );
};

export default StepVillaStructure;
