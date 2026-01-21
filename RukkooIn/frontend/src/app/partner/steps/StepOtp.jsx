import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepOtp = ({ autoSend = false }) => {
  const { formData, updateFormData } = usePartnerStore();

  const handleChange = (value) => {
    updateFormData({ otpCode: value.replace(/\D/g, '').slice(0, 6) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter the 6-digit OTP sent to +91 {formData.phone}.
      </p>
      <div className="flex gap-2 justify-center">
        <input
          className="w-40 border border-gray-200 rounded-xl px-3 py-2 text-center tracking-[0.4em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          value={formData.otpCode}
          onChange={e => handleChange(e.target.value)}
          placeholder="••••••"
        />
      </div>
      <p className="text-xs text-gray-400 text-center">
        Did not receive code? Wait a few seconds and try again.
      </p>
    </div>
  );
};

export default StepOtp;

