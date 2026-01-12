import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHomestayStyle = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { config = {} } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      config: {
        ...config,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Homestay Style Details</h2>
        <p className="text-sm text-gray-500">Tell us about the hosting style</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host lives on property? *</label>
            <select
              name="hostLivesOnProperty"
              value={config.hostLivesOnProperty || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shared with host? *</label>
            <select
              name="sharedWithHost"
              value={config.sharedWithHost || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Size (sq ft)</label>
            <input
              type="number"
              name="propertySize"
              value={config.propertySize || ''}
              onChange={handleChange}
              placeholder="e.g. 2000"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type *</label>
            <select
              name="entryType"
              value={config.entryType || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Shared entrance">Shared entrance</option>
              <option value="Separate guest entrance">Separate guest entrance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stay Experience *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Cultural stay', 'Family stay', 'Nature stay', 'City stay'].map((exp) => (
              <label
                key={exp}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${config.stayExperience === exp
                    ? 'border-[#004F4D] bg-[#004F4D]/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="stayExperience"
                  value={exp}
                  checked={config.stayExperience === exp}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#004F4D]"
                />
                <span className="text-sm font-medium">{exp}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>These details help guests understand your hosting style</strong> and set proper expectations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepHomestayStyle;
