import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepResortPolicies = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {} } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      policies: {
        ...policies,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">House Rules & Policies</h2>
        <p className="text-sm text-gray-500">Set clear policies for your resort</p>
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

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="earlyCheckIn"
              checked={!!policies.earlyCheckIn}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">Early Check-in Available (Chargeable)</label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="lateCheckOut"
              checked={!!policies.lateCheckOut}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">Late Check-out Available (Chargeable)</label>
          </div>
        </div>
      </div>

      {/* Cancellation & Refund */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Cancellation & Refund Policy</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy *</label>
            <select
              name="cancellationPolicy"
              value={policies.cancellationPolicy || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select...</option>
              <option value="Flexible">Flexible (Full refund up to 24 hours before)</option>
              <option value="Moderate">Moderate (Full refund up to 7 days before)</option>
              <option value="Strict">Strict (Full refund up to 14 days before)</option>
              <option value="Non-refundable">Non-refundable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
            <textarea
              name="refundPolicy"
              value={policies.refundPolicy || ''}
              onChange={handleChange}
              placeholder="e.g. Refunds processed within 7-10 business days..."
              className="w-full p-3 border border-gray-200 rounded-lg h-20"
            />
          </div>
        </div>
      </div>

      {/* ID & Verification */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">ID & Verification</h3>
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
          <input
            type="checkbox"
            name="idProofMandatory"
            checked={true}
            disabled
            className="w-5 h-5 accent-[#004F4D]"
          />
          <label className="text-sm font-medium">Government ID Proof Mandatory ✓ (Required by Law)</label>
        </div>
      </div>

      {/* Resort Policies */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Resort Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="petsAllowed"
              checked={!!policies.petsAllowed}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">🐕 Pets Allowed</label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="smokingAllowed"
              checked={!!policies.smokingAllowed}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">🚬 Smoking Allowed</label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="alcoholAllowed"
              checked={!!policies.alcoholAllowed}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">🍺 Alcohol Allowed</label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="outsideFoodAllowed"
              checked={!!policies.outsideFoodAllowed}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">🍔 Outside Food Allowed</label>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <input
              type="checkbox"
              name="eventsAllowed"
              checked={!!policies.eventsAllowed}
              onChange={handleChange}
              className="w-5 h-5 accent-[#004F4D]"
            />
            <label className="text-sm font-medium">🎉 Event / Party Allowed</label>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Clear policies help guests understand what to expect and reduce disputes.
        </p>
      </div>
    </div>
  );
};

export default StepResortPolicies;
