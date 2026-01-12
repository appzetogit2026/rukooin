import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepPGBasicInfo = () => {
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

  const toggleIdealFor = (option) => {
    const idealFor = config.idealFor || [];
    const updated = idealFor.includes(option)
      ? idealFor.filter(i => i !== option)
      : [...idealFor, option];
    updateFormData({
      config: { ...config, idealFor: updated }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">PG Basic Information</h2>
        <p className="text-sm text-gray-500">Provide basic details about your PG</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PG Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Luxury Stays PG"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PG Category *</label>
          <div className="flex gap-4">
            {['Boys', 'Girls', 'Unisex'].map(cat => (
              <label key={cat} className={`flex-1 p-3 border rounded-lg text-center cursor-pointer transition-all ${config.pgType === cat ? 'bg-[#004F4D] text-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <input
                  type="radio"
                  name="pgType"
                  value={cat}
                  checked={config.pgType === cat}
                  onChange={handleConfigChange}
                  className="hidden"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description * (100-150 chars)</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="A brief tagline about your PG"
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">{shortDescription?.length || 0} / 150</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1 h-32"
            placeholder="Describe the facilities, environment, and why students/professionals should choose your PG..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ideal For (Select all that apply)</label>
          <div className="grid grid-cols-2 gap-3">
            {['Students', 'Working Professionals'].map(opt => (
              <label key={opt} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${config.idealFor?.includes(opt) ? 'bg-[#004F4D]/10 border-[#004F4D]' : 'bg-white'}`}>
                <input
                  type="checkbox"
                  checked={config.idealFor?.includes(opt) || false}
                  onChange={() => toggleIdealFor(opt)}
                  className="w-5 h-5 accent-[#004F4D]"
                />
                <span className="font-medium text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPGBasicInfo;
