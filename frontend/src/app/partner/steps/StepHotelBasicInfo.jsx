import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHotelBasicInfo = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { name, shortDescription, description, config = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      config: { ...config, [name]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Hotel Basic Information</h2>
        <p className="text-sm text-gray-500">Provide basic details about your hotel</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Grand Royal Hotel"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Category *</label>
            <select
              name="hotelCategory"
              value={config.hotelCategory || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select Category</option>
              <option value="Budget">Budget</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating (Optional)</label>
            <select
              name="starRating"
              value={config.starRating || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select Rating</option>
              <option value="1 Star">1 Star</option>
              <option value="2 Star">2 Star</option>
              <option value="3 Star">3 Star</option>
              <option value="4 Star">4 Star</option>
              <option value="5 Star">5 Star</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="A brief tagline (e.g. Luxury stay in the heart of the city)"
            maxLength={150}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1 h-32"
            placeholder="Describe your hotel, facilities, and unique features..."
          />
        </div>
      </div>
    </div>
  );
};

export default StepHotelBasicInfo;
