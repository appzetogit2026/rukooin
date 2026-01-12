import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepPolicies = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {}, propertyCategory } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      policies: { ...policies, [name]: value }
    });
  };

  const isHostel = propertyCategory === 'Hostel';
  const isPG = propertyCategory === 'PG';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Policies & Rules</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Policy *</label>
          <select name="cancellationPolicy" value={policies.cancellationPolicy || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select...</option>
            <option value="Flexible">Flexible (Full refund 24h before)</option>
            <option value="Moderate">Moderate (Partial refund)</option>
            <option value="Strict">Strict (No refund)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Requirement *</label>
          <select name="idRequirement" value={policies.idRequirement || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select...</option>
            <option value="Govt ID Required">Government ID Required (Aadhaar/Passport/DL)</option>
            <option value="Local ID Allowed">Local ID Allowed</option>
            <option value="Passport Required">Passport Required (Foreigners)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Policy Description *</label>
          <textarea name="checkInPolicy" value={policies.checkInPolicy || ''} onChange={handleChange} className="w-full p-3 border rounded-lg h-24" placeholder="e.g. Early check-in subject to availability..." />
        </div>

        {/* House Rules Toggles */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3">House Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'partiesAllowed', label: 'Parties Allowed' },
              { key: 'petsAllowed', label: 'Pets Allowed' },
              { key: 'smokingAllowed', label: 'Smoking Allowed' },
              { key: 'alcoholAllowed', label: 'Alcohol Allowed' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFormData({ policies: { ...policies, [key]: true } })}
                    className={`px-3 py-1 text-xs font-bold rounded ${policies[key] === true ? 'bg-green-100 text-green-700 border border-green-200' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => updateFormData({ policies: { ...policies, [key]: false } })}
                    className={`px-3 py-1 text-xs font-bold rounded ${policies[key] === false ? 'bg-red-100 text-red-700 border border-red-200' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(isHostel || isPG) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender Rules</label>
            <input name="genderRules" value={policies.genderRules || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="e.g. Mixed groups allowed..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default StepPolicies;
