import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHomestayBasicInfo = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { name, shortDescription, description, config = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
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
        <h2 className="text-2xl font-bold text-[#003836] mb-1">Property Basic Info</h2>
        <p className="text-sm text-gray-500">Tell us about your homestay</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Sharma Family Homestay"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description * (100-150 chars)</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="A brief tagline about your homestay"
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
            placeholder="Describe the experience, hospitality style, unique features..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ideal For (Optional)</label>
          <div className="grid grid-cols-2 gap-3">
            {['Families', 'Solo travelers', 'Couples', 'Long stays'].map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${config.idealFor?.includes(option)
                  ? 'border-[#004F4D] bg-[#004F4D]/5'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={config.idealFor?.includes(option) || false}
                  onChange={() => toggleIdealFor(option)}
                  className="w-5 h-5 accent-[#004F4D]"
                />
                <span className="text-sm font-medium text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Emphasize the personal touch and local experience your homestay offers!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepHomestayBasicInfo;
