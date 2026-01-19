import React, { useState, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import { authService } from '../../../services/apiService';
import { Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const StepOtp = ({ autoSend = false }) => {
  const { formData, updateFormData } = usePartnerStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleChange = (value) => {
    updateFormData({ otpCode: value.replace(/\D/g, '').slice(0, 6) });
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      // Re-call registerPartner to generate a new OTP
      // We must send the full payload again as the backend requires it for the tempData update
      const payload = { ...formData, role: 'partner' };
      await authService.registerPartner(payload);

      toast.success("OTP Resent Successfully");
      setTimeLeft(30); // Reset timer
    } catch (error) {
      console.error("Resend Error:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-[#003836]">Verify Mobile Number</h3>
        <p className="text-sm text-gray-500">
          Enter the 6-digit OTP sent to <span className="font-bold text-[#003836]">+91 {formData.phone}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <input
          className="w-48 border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#004F4D] transition-all"
          value={formData.otpCode}
          onChange={e => handleChange(e.target.value)}
          placeholder="••••••"
          maxLength={6}
          autoFocus
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleResend}
          disabled={timeLeft > 0 || isResending}
          className={`
            flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-colors
            ${timeLeft > 0
              ? 'text-gray-400 cursor-not-allowed bg-gray-50'
              : 'text-[#004F4D] hover:bg-[#004F4D]/10 bg-transparent'
            }
          `}
        >
          {isResending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} className={timeLeft === 0 ? "" : "opacity-0"} />
          )}
          {timeLeft > 0 ? `Resend OTP in ${formatTime(timeLeft)}` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
};

export default StepOtp;

