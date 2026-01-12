import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHomestayPricing = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { pricing = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      pricing: { ...pricing, [name]: value }
    });
  };

  const basePrice = parseFloat(pricing.basePrice) || 0;
  const extraGuestCharge = parseFloat(pricing.extraGuestCharge) || 0;
  const exampleTotal = basePrice + (extraGuestCharge * 1); // 1 extra guest

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Pricing & Availability</h2>
        <p className="text-sm text-gray-500">Set your nightly rates</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price per Night (₹) *</label>
            <input
              type="number"
              name="basePrice"
              value={pricing.basePrice || ''}
              onChange={handleChange}
              placeholder="2000"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extra Guest Charge (₹)</label>
            <input
              type="number"
              name="extraGuestCharge"
              value={pricing.extraGuestCharge || ''}
              onChange={handleChange}
              placeholder="500"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            />
          </div>
        </div>

        {basePrice > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              💰 Example: Base ({basePrice}) + 1 extra guest ({extraGuestCharge}) = ₹{exampleTotal}/night
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Pricing Tip:</strong> Research similar homestays in your area. Competitive pricing attracts more bookings!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepHomestayPricing;
