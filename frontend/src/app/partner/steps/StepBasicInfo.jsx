import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepBasicInfo = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { name, shortDescription, description, propertyCategory } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836] mb-1">Basic Property Information</h2>
        <p className="text-sm text-gray-500">Tell us about your {propertyCategory.toLowerCase()}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Sunset Villa Goa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Title *</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="A brief tagline (e.g. 'Luxury beachfront villa')"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1 h-32"
            placeholder="Describe your property in detail - what makes it special, unique features, nearby attractions..."
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> A detailed description helps guests understand your property better and can increase bookings by up to 40%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepBasicInfo;
