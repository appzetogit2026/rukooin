import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHouseRules = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {} } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('houseRules.')) {
      const ruleName = name.split('.')[1];
      updateFormData({
        policies: {
          ...policies,
          houseRules: {
            ...(policies.houseRules || {}),
            [ruleName]: type === 'checkbox' ? checked : value
          }
        }
      });
    } else {
      updateFormData({
        policies: {
          ...policies,
          [name]: value
        }
      });
    }
  };

  const renderCheckbox = (name, label) => (
    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#004F4D]/30 transition-all">
      <input
        type="checkbox"
        name={`houseRules.${name}`}
        checked={policies.houseRules?.[name] || false}
        onChange={handleChange}
        className="w-5 h-5 accent-[#004F4D]"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">House Rules & Policies</h2>
        <p className="text-sm text-gray-500">Set clear rules and policies for your villa</p>
      </div>

      {/* Check-in/Check-out */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Check-in & Check-out Times</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Time *</label>
            <input
              type="time"
              name="checkInTime"
              value={policies.checkInTime || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Time *</label>
            <input
              type="time"
              name="checkOutTime"
              value={policies.checkOutTime || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            />
          </div>
        </div>
      </div>

      {/* ID Requirement */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">ID Verification</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Required at Check-in *</label>
          <select
            name="idRequirement"
            value={policies.idRequirement || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
          >
            <option value="">Select...</option>
            <option value="Govt ID Required">Government ID Required (Aadhaar/Passport/DL)</option>
            <option value="Passport Required">Passport Required (International Guests)</option>
            <option value="Local ID Allowed">Local ID Allowed</option>
          </select>
        </div>
      </div>

      {/* House Rules */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">House Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderCheckbox('partiesAllowed', '🎉 Parties / Events Allowed')}
          {renderCheckbox('petsAllowed', '🐕 Pets Allowed')}
          {renderCheckbox('smokingAllowed', '🚬 Smoking Allowed')}
          {renderCheckbox('alcoholAllowed', '🍺 Alcohol Allowed')}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Cancellation Policy</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type *</label>
          <select
            name="cancellationPolicy"
            value={policies.cancellationPolicy || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
          >
            <option value="">Select...</option>
            <option value="Flexible">Flexible (Full refund up to 24 hours before)</option>
            <option value="Moderate">Moderate (Full refund up to 5 days before)</option>
            <option value="Strict">Strict (Full refund up to 7 days before)</option>
            <option value="Non-refundable">Non-refundable</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Clear house rules help set expectations and reduce conflicts with guests.
        </p>
      </div>
    </div>
  );
};

export default StepHouseRules;
