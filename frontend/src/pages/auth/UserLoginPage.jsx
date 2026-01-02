import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Shield, ChevronLeft, Sparkles } from 'lucide-react';

const UserLoginPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('phone'); // phone | otp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setError('');
        setLoading(true);
        // Simulate OTP send
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }
        setError('');
        setLoading(true);
        // Simulate verification
        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 1500);
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface via-[#005856] to-[#003836] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-8 pb-4">
                <button
                    onClick={() => step === 'otp' ? setStep('phone') : navigate(-1)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 flex flex-col">

                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Sparkles className="text-surface" size={24} />
                        </div>
                        <span className="text-2xl font-black text-white">Rukkoo.in</span>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">
                        {step === 'phone' ? 'Welcome Back!' : 'Verify OTP'}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {step === 'phone'
                            ? 'Enter your phone number to continue'
                            : `We've sent a 6-digit code to +91 ${phone}`
                        }
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                >
                    {step === 'phone' ? (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            {/* Phone Input */}
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Phone Number
                                </label>
                                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 transition-all">
                                    <div className="px-4 py-4 bg-white/5 border-r border-white/10 flex items-center gap-2">
                                        <span className="text-lg">🇮🇳</span>
                                        <span className="text-white font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="Enter 10-digit number"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-bold text-lg placeholder:text-white/30 outline-none"
                                        autoFocus
                                    />
                                    {phone.length === 10 && (
                                        <div className="pr-4">
                                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <Shield size={14} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="w-full bg-white text-surface font-bold py-4 rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Get OTP <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            {/* OTP Input */}
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-4">
                                    Enter 6-digit OTP
                                </label>
                                <div className="flex gap-3 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-14 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-center text-white text-2xl font-black focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
                            </div>

                            {/* Resend Timer */}
                            <div className="text-center">
                                <p className="text-white/50 text-sm">
                                    Didn't receive code? <button type="button" className="text-accent font-bold">Resend</button>
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6}
                                className="w-full bg-white text-surface font-bold py-4 rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verify & Continue <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Footer */}
                <div className="py-8 text-center">
                    <p className="text-white/40 text-xs">
                        By continuing, you agree to our{' '}
                        <span className="text-white/60 underline">Terms of Service</span> and{' '}
                        <span className="text-white/60 underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserLoginPage;
