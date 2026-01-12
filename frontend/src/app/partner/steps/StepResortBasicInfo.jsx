import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepResortBasicInfo = () => {
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
        <h2 className="text-2xl font-bold text-[#003836] mb-1">Resort Basic Details</h2>
        <p className="text-sm text-gray-500">Tell us about your resort property</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resort Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Paradise Beach Resort"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resort Category *</label>
          <select
            name="resortCategory"
            value={config.resortCategory || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
          >
            <option value="">Select Category</option>
            <option value="Budget">Budget</option>
            <option value="Premium">Premium</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Star Rating (Optional)</label>
            <select
              name="starRating"
              value={config.starRating || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select Rating</option>
              <option value="3">3 Star</option>
              <option value="4">4 Star</option>
              <option value="5">5 Star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resort Theme (Optional)</label>
            <select
              name="resortTheme"
              value={config.resortTheme || ''}
              onChange={handleConfigChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select Theme</option>
              <option value="Beach">Beach</option>
              <option value="Jungle">Jungle</option>
              <option value="Hill">Hill</option>
              <option value="Wellness">Wellness</option>
              <option value="Adventure">Adventure</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resort Size (in acres or sq.ft)</label>
          <input
            name="resortSize"
            value={config.resortSize || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. 5 acres or 50000 sq.ft"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="A brief tagline about your resort"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resort Description (Experience Focused) *</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1 h-32"
            placeholder="Describe the complete resort experience - ambiance, facilities, unique features..."
          />
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Focus on the experience and emotions - what makes your resort special and memorable.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepResortBasicInfo;
