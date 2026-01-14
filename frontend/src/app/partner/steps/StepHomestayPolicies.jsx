import React, { useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X } from 'lucide-react';

const StepHomestayPolicies = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {} } = formData;
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (policies.idProofRequired === undefined) {
      updateFormData({
        policies: { ...policies, idProofRequired: true }
      });
    }
  }, [policies, updateFormData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      policies: {
        ...policies,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    const currentRules = policies.houseRules || [];
    updateFormData({
      policies: {
        ...policies,
        houseRules: [...currentRules, newRule.trim()]
      }
    });
    setNewRule('');
  };

  const removeRule = (index) => {
    const currentRules = policies.houseRules || [];
    updateFormData({
      policies: {
        ...policies,
        houseRules: currentRules.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">House Rules & Policies</h2>
        <p className="text-sm text-gray-500">Set clear rules for your guests</p>
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

      {/* Rules */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">House Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Smoking *</label>
            <select
              name="smokingAllowed"
              value={policies.smokingAllowed || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Allowed">Allowed</option>
              <option value="Not allowed">Not allowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol *</label>
            <select
              name="alcoholAllowed"
              value={policies.alcoholAllowed || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Allowed">Allowed</option>
              <option value="Not allowed">Not allowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pets *</label>
            <select
              name="petsAllowed"
              value={policies.petsAllowed || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Allowed">Allowed</option>
              <option value="Not allowed">Not allowed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loud Music Restrictions</label>
            <select
              name="loudMusicAllowed"
              value={policies.loudMusicAllowed || ''}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            >
              <option value="">Select</option>
              <option value="Allowed">Allowed</option>
              <option value="Not allowed after 10 PM">Not allowed after 10 PM</option>
              <option value="Not allowed">Not allowed</option>
            </select>
          </div>
        </div>

        {/* Custom House Rules */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional House Rules (Optional)</label>
          <div className="flex gap-2 mb-3">
            <input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="e.g. No shoes inside"
              className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
              onKeyPress={(e) => e.key === 'Enter' && addRule()}
            />
            <button
              onClick={addRule}
              className="bg-[#004F4D] text-white px-4 py-2 rounded-lg hover:bg-[#003836] transition-colors flex items-center gap-1"
            >
              <Plus size={18} /> Add
            </button>
          </div>

          {(policies.houseRules || []).length > 0 && (
            <ul className="space-y-2">
              {(policies.houseRules || []).map((rule, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                  <span className="text-sm text-gray-700">{rule}</span>
                  <button onClick={() => removeRule(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50 mt-4">
          <input
            type="checkbox"
            name="idProofRequired"
            checked={true}
            disabled
            className="w-5 h-5 accent-[#004F4D]"
          />
          <label className="text-sm font-medium">Government ID Proof Mandatory ✓ (Required by Law)</label>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div>
        <h3 className="font-bold text-lg text-gray-700 mb-3">Cancellation Policy</h3>
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
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Clear policies help avoid misunderstandings and ensure smooth hosting.
        </p>
      </div>
    </div>
  );
};

export default StepHomestayPolicies;
