import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepConfigHotelResort = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { config = {}, propertyCategory } = formData;

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
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
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
      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100 flex items-center gap-2">
        <span>ℹ️</span> Configuring details for your <strong>{propertyCategory}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderField('checkInTime', 'Check-in Time', 'time')}
        {renderField('checkOutTime', 'Check-out Time', 'time')}
        {renderField('receptionAvailable', '24/7 Reception', 'checkbox')}
        {renderField('floors', 'Number of Floors', 'number')}
        {propertyCategory === 'Resort' && renderField('resortType', 'Resort Type', 'select', ['Beach', 'Hill', 'Jungle', 'Luxury', 'Wellness'])}
        {propertyCategory === 'Hotel' && renderField('starRating', 'Star Rating', 'select', ['1', '2', '3', '4', '5'])}
      </div>
    </div>
  );
};

export default StepConfigHotelResort;
