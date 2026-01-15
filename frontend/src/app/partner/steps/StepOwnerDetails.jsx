import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepOwnerDetails = () => {
  const { formData, updateFormData } = usePartnerStore();

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleAddressChange = (field, value) => {
    updateFormData({
      owner_address: {
        ...(formData.owner_address || {}),
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Name</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Registered owner full name"
          value={formData.owner_name}
          onChange={e => handleChange('owner_name', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Aadhaar Number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="12-digit Aadhaar number"
            value={formData.aadhaar_number}
            onChange={e => handleChange('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Aadhaar Front Image URL</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
              placeholder="Front image URL"
              value={formData.aadhaar_front}
              onChange={e => handleChange('aadhaar_front', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Aadhaar Back Image URL</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
              placeholder="Back image URL"
              value={formData.aadhaar_back}
              onChange={e => handleChange('aadhaar_back', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">PAN Number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="10-digit PAN number"
            value={formData.pan_number}
            onChange={e => handleChange('pan_number', e.target.value.toUpperCase().slice(0, 10))}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">PAN Card Image URL</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="PAN image URL"
            value={formData.pan_card_image}
            onChange={e => handleChange('pan_card_image', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Address</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Street address"
          value={formData.owner_address?.street || ''}
          onChange={e => handleAddressChange('street', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="City"
            value={formData.owner_address?.city || ''}
            onChange={e => handleAddressChange('city', e.target.value)}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="State"
            value={formData.owner_address?.state || ''}
            onChange={e => handleAddressChange('state', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Pincode"
            value={formData.owner_address?.zipCode || ''}
            onChange={e => handleAddressChange('zipCode', e.target.value)}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Country"
            value={formData.owner_address?.country || ''}
            onChange={e => handleAddressChange('country', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOwnerDetails;

