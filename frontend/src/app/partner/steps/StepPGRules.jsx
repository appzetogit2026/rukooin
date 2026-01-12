import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepPGRules = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {}, config = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      policies: { ...policies, [name]: value }
    });
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      config: { ...config, [name]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Rules & Restrictions</h2>
        <p className="text-sm text-gray-500">Set house rules for tenants</p>
      </div>

      <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        ⚠️ <strong>Note:</strong> Gender restrictions are auto-applied based on your PG Category selection
        ({config.pgType || 'Not Selected'}).
      </div>

      <div className="space-y-4">
        {/* Check-in / Check-out Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in Time</label>
            <input
              type="time"
              name="checkInTime"
              value={policies.checkInTime || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Check-out Time</label>
            <input
              type="time"
              name="checkOutTime"
              value={policies.checkOutTime || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* Curfew */}
        <div>
          <label className="block text-sm font-medium mb-1">Entry Curfew Time</label>
          <input
            type="time"
            name="curfewTime"
            value={config.curfewTime || ''}
            onChange={handleConfigChange}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Visitor Policy */}
        <div>
          <label className="block text-sm font-medium mb-1">Visitor Policy</label>
          <select name="visitorPolicy" value={policies.visitorPolicy || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select</option>
            <option value="Allowed (Daytime only)">Allowed (Daytime only)</option>
            <option value="Allowed in Common Areas">Allowed in Common Areas</option>
            <option value="Not Allowed">Not Allowed</option>
            <option value="Parents Only">Parents Only</option>
          </select>
        </div>

        {/* Smoking & Cooking */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Smoking / Alcohol</label>
            <select name="smokingAlcohol" value={policies.smokingAlcohol || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="">Select</option>
              <option value="Strictly Prohibited">Strictly Prohibited</option>
              <option value="Designated Areas">Designated Areas Only</option>
              <option value="Allowed">Allowed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cooking Allowed?</label>
            <select name="cookingAllowed" value={policies.cookingAllowed || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Only Maggi/Tea">Only Maggi/Tea</option>
            </select>
          </div>
        </div>

        {/* General Rules */}
        <div>
          <label className="block text-sm font-medium mb-1">General Rules</label>
          <textarea
            name="generalRules"
            value={policies.generalRules || ''}
            onChange={handleChange}
            placeholder="Any specific house rules..."
            className="w-full p-3 border rounded-lg h-24"
          />
        </div>
      </div>
    </div>
  );
};

export default StepPGRules;
