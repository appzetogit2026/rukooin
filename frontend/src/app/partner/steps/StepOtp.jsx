import React, { useState, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';

const StepOtp = ({ autoSend = false }) => {
  const { formData, updateFormData } = usePartnerStore();
  const [timeLeft, setTimeLeft] = useState(30);

  // In a real app, autoSend would trigger an API call to send OTP on mount
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (e) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    updateFormData({ otpCode: val });
  };

  const handleResend = () => {
    setTimeLeft(30);
    // Trigger resend API
    alert(`OTP Resent to ${formData.phone}`);
  };

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold text-[#003836]">Mobile Verification</h2>
      <p className="text-gray-500">
        We have sent a verification code to <br />
        <span className="font-bold text-[#003836]">+91 {formData.phone}</span>
      </p>

      <div className="flex justify-center my-8">
        <input
          type="text"
          value={formData.otpCode || ''}
          onChange={handleChange}
          className="w-48 text-center text-3xl tracking-[0.5em] font-bold border-b-2 border-gray-300 focus:border-[#004F4D] outline-none py-2 bg-transparent"
          placeholder="••••••"
          autoFocus
        />
      </div>

      <div className="text-sm">
        {timeLeft > 0 ? (
          <p className="text-gray-400">Resend code in {timeLeft}s</p>
        ) : (
          <button onClick={handleResend} className="text-[#004F4D] font-bold underline hover:text-[#003836]">
            Resend Code
          </button>
        )}
      </div>
    </div>
  );
};

export default StepOtp;
