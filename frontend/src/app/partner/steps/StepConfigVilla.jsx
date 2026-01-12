import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepConfigVilla = () => {
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

  const renderField = (name, label, type = 'text') => (
    <div key={name} className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'checkbox' ? (
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
      <h2 className="text-2xl font-bold text-[#003836]">Villa Structure</h2>
      <p className="text-gray-500 text-sm">Define the capacity and structure of your entire villa unit.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderField('maxGuests', 'Max Guests (Entire Villa)', 'number')}
        {renderField('bedrooms', 'Number of Bedrooms', 'number')}
        {renderField('bathrooms', 'Number of Bathrooms', 'number')}
        {renderField('kitchenAvailable', 'Kitchen Available', 'checkbox')}
        {renderField('parkingAvailable', 'Private Parking', 'checkbox')}
        {renderField('caretakerAvailable', 'Caretaker on-site', 'checkbox')}
      </div>
    </div>
  );
};

export default StepConfigVilla;
