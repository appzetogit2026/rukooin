import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepUserRegistration = () => {
  const { formData, updateFormData } = usePartnerStore();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    updateFormData({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Create Partner Account</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            maxLength={10}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="9876543210"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={!!formData.termsAccepted}
            onChange={handleChange}
            className="w-5 h-5 accent-[#004F4D]"
          />
          <span className="text-sm text-gray-600">I accept the <span className="text-[#004F4D] font-bold cursor-pointer">Terms & Conditions</span></span>
        </div>
      </div>
    </div>
  );
};

export default StepUserRegistration;
