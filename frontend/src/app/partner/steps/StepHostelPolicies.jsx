import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHostelPolicies = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {}, config = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      policies: {
        ...policies,
        [name]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">House Rules & Policies</h2>
        <p className="text-sm text-gray-500">Set clear policies for your hostel</p>
      </div>

      {/* Check-in/Check-out */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Check-in & Check-out</h3>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Mandatory *</label>
          <select
            name="idRequirement"
            value={policies.idRequirement || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
          >
            <option value="">Select...</option>
            <option value="Govt ID Required">Government ID Required (Aadhaar/Passport/DL)</option>
            <option value="Passport Only">Passport Only</option>
            <option value="Student ID Allowed">Student ID Allowed</option>
          </select>
        </div>
      </div>

      {/* Gender Restriction Rule */}
      {config.hostelType && (
        <div>
          <h3 className="font-bold text-lg text-gray-700 mb-3">Gender Restriction</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Auto-configured based on hostel type:</strong> {config.hostelType}
              {config.hostelType === 'Girls' && ' - Male bookings will be automatically blocked'}
              {config.hostelType === 'Boys' && ' - Female bookings will be automatically blocked'}
              {config.hostelType === 'Mixed' && ' - All genders allowed'}
            </p>
          </div>
        </div>
      )}

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
            <option value="Moderate">Moderate (Full refund up to 3 days before)</option>
            <option value="Strict">Strict (Full refund up to 7 days before)</option>
            <option value="Non-refundable">Non-refundable</option>
          </select>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Note:</strong> Clear house rules help maintain hostel culture and reduce conflicts.
        </p>
      </div>
    </div>
  );
};

export default StepHostelPolicies;
