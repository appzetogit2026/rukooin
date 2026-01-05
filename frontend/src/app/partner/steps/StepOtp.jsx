import React, { useRef, useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { ShieldCheck } from 'lucide-react';
import { authService } from '../../../services/apiService';

const StepOtp = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)' }
            );
        }, containerRef);
        // Focus first input on mount
        inputs.current[0]?.focus();

        // Send OTP on Mount
        const sendOtp = async () => {
            if (formData.phone && formData.phone.length === 10) {
                try {
                    await authService.sendOtp(formData.phone);
                    console.log("OTP Sent via StepOtp");
                } catch (err) {
                    console.error("Failed to send OTP:", err);
                    alert("Failed to send OTP. Please try again.");
                }
            }
        };
        sendOtp();

        return () => ctx.revert();
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        updateFormData({ otpCode: newOtp.join('') });

        // Auto-advance
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return (
        <div ref={containerRef} className="pb-24 pt-8 px-4 flex flex-col items-center text-center">

            <div className="anim-item w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck size={40} />
            </div>

            <div className="anim-item mb-8">
                <h3 className="text-2xl font-black text-[#003836] mb-2">Confirm it's you</h3>
                <p className="text-gray-500 text-sm max-w-[250px] mx-auto">
                    We sent a 6-digit code to
                    <span className="block font-bold text-[#003836] mt-1">+91 {formData.phone || '98765 43210'}</span>
                </p>
            </div>

            {/* OTP Inputs */}
            <div className="anim-item flex gap-2 mb-10 justify-center">
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={el => inputs.current[i] = el}
                        type="tel"
                        maxLength={1}
                        className="w-10 h-14 md:w-12 md:h-16 rounded-xl bg-gray-50 border-2 border-gray-200 text-center text-xl font-bold text-[#003836] focus:border-[#004F4D] focus:bg-white focus:ring-0 transition-all caret-[#004F4D]"
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                    />
                ))}
            </div>

            {/* Resend Link */}
            <div className="anim-item">
                <p className="text-sm text-gray-400 font-medium">
                    Didn't get it? <button className="text-[#004F4D] font-bold underline ml-1">Resend in 30s</button>
                </p>
            </div>

        </div>
    );
};

export default StepOtp;
