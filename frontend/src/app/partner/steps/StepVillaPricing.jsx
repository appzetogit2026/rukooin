import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepVillaPricing = () => {
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
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Pricing & Availability</h2>
        <p className="text-gray-500">Set the nightly rate for your entire villa</p>
      </div>

      <div className="bg-gradient-to-r from-[#004F4D]/10 to-[#004F4D]/5 p-6 rounded-xl border border-[#004F4D]/20">
        <p className="text-sm text-[#003836] mb-2">
          <strong>Pricing Model:</strong> One price applies to the entire villa
        </p>
        <p className="text-xs text-gray-600">
          Guests pay the same rate regardless of how many people stay (up to max guests limit)
        </p>
      </div>

      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Base Price per Night (₹) *</label>
          <input
            type="number"
            name="basePrice"
            value={pricing.basePrice || ''}
            onChange={handleChange}
            className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg font-bold outline-none focus:border-[#004F4D]"
            placeholder="e.g. 15000"
            min="500"
          />
          <p className="text-xs text-gray-500 mt-1">This is the nightly rate for the entire villa</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cleaning Fee (One-time, Optional)</label>
          <input
            type="number"
            name="cleaningFee"
            value={pricing.cleaningFee || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#004F4D]"
            placeholder="e.g. 1000"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Charged once per booking (not per night)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Security Deposit (Optional)</label>
          <input
            type="number"
            name="securityDeposit"
            value={pricing.securityDeposit || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#004F4D]"
            placeholder="e.g. 5000"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">Refundable amount held during the stay</p>
        </div>
      </div>

      {pricing.basePrice && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Example Total for 3 nights:</strong> ₹{parseInt(pricing.basePrice) * 3 + (parseInt(pricing.cleaningFee) || 0)}
            {pricing.cleaningFee && ` (₹${pricing.basePrice} × 3 nights + ₹${pricing.cleaningFee} cleaning fee)`}
          </p>
        </div>
      )}
    </div>
  );
};

export default StepVillaPricing;
