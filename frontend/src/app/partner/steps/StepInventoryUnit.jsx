import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepInventoryUnit = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { pricing = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      pricing: {
        ...pricing,
        [name]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Pricing & Availability</h2>
      <p className="text-gray-500">Set the pricing for booking the entire unit/property.</p>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Base Price per Night (₹)</label>
          <input
            type="number"
            name="basePrice"
            value={pricing.basePrice || ''}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg text-lg font-bold"
            placeholder="e.g. 15000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cleaning Fee (One-time)</label>
          <input
            type="number"
            name="cleaningFee"
            value={pricing.cleaningFee || ''}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="e.g. 1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Security Deposit</label>
          <input
            type="number"
            name="securityDeposit"
            value={pricing.securityDeposit || ''}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="e.g. 5000"
          />
        </div>
      </div>
    </div>
  );
};

export default StepInventoryUnit;
