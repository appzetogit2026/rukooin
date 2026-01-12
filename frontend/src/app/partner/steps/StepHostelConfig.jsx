import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHostelConfig = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { config = {} } = formData;

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      config: {
        ...config,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const renderField = (name, label, type = 'text', options = []) => (
    <div key={name} className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={config[name] || ''}
          onChange={handleConfigChange}
          className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={!!config[name]}
            onChange={handleConfigChange}
            className="w-5 h-5 accent-[#004F4D]"
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={config[name] || ''}
          onChange={handleConfigChange}
          className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Hostel Configuration</h2>
        <p className="text-sm text-gray-500">Define the type and rules for your hostel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderField('hostelType', 'Hostel Type *', 'select', ['Boys', 'Girls', 'Mixed'])}
        {renderField('curfewTime', 'Curfew Time *', 'time')}
        {renderField('ageRestriction', '18+ Age Restriction', 'checkbox')}
        {renderField('visitorsAllowed', 'Visitors Allowed', 'checkbox')}
        {renderField('alcoholAllowed', 'Alcohol Allowed', 'checkbox')}
        {renderField('dormitoryAvailable', 'Dormitory Rooms Available', 'checkbox')}
        {renderField('commonWashrooms', 'Common Washrooms', 'checkbox')}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Important:</strong> Hostel type will determine booking restrictions (e.g., Girls hostel blocks male bookings)
        </p>
      </div>
    </div>
  );
};

export default StepHostelConfig;
