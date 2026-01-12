import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/apiService';
import logo from '../../assets/rokologin-removebg-preview.png';

const HotelLoginPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/hotel/dashboard');
        }
    }, [navigate]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Phone Validation
        if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            await authService.sendOtp(phone, 'login');
            setStep(2);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
        if (value === '' && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyOtp({
                phone: phone,
                otp: otpString
            });
            navigate('/hotel/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#003836] flex flex-col font-sans selection:bg-[#004F4D] selection:text-white">

            {/* Top Bar - Centered Logo */}
            <header className="px-6 pt-8 pb-4 flex justify-center items-center">
                <div className="flex items-center justify-center">
                    <img src={logo} alt="Rukkoin" className="h-12 w-auto object-contain" />
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 flex flex-col justify-center px-6 max-w-lg mx-auto w-full relative pt-4">

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl font-bold text-[#003836] mb-2">Partner Login</h1>
                    <p className="text-gray-500 font-medium">Log in to manage your property</p>
                </motion.div>

                {/* Form Area */}
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1"
                        >
                            <form onSubmit={handleSendOTP} className="space-y-6">

                                <div>
                                    <label className="text-[#003836] font-bold text-sm block mb-2">
                                        Mobile Number
                                    </label>
                                    <div className="flex items-center bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#004F4D]/20 focus-within:border-[#004F4D] transition-all h-14">
                                        <div className="pl-5 text-gray-500 font-bold border-r border-gray-200 pr-3 h-full flex items-center bg-gray-100/50">
                                            <span className="text-sm">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setPhone(val);
                                            }}
                                            placeholder="Enter 10-digit number"
                                            className="flex-1 bg-transparent px-4 text-[#003836] font-bold placeholder:text-gray-300 outline-none w-full h-full text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm font-bold bg-red-50 py-3 px-4 rounded-xl border border-red-100">
                                        {error}
                                    </p>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#004F4D] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-[#004F4D]/20 hover:shadow-[#004F4D]/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                Continue <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1"
                        >
                            <div className="mb-8 bg-green-50/50 p-6 rounded-3xl border border-green-100 text-center">
                                <div className="w-12 h-12 bg-[#004F4D]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Shield size={24} className="text-[#004F4D]" />
                                </div>
                                <h2 className="text-lg font-bold text-[#003836]">Enter OTP</h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Code sent to <span className="text-[#003836] font-bold">+91 {phone}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-8">
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOTPChange(index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !digit && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`)?.focus();
                                                }
                                            }}
                                            className="w-12 h-14 md:w-14 md:h-16 bg-white border-2 border-gray-200 rounded-2xl text-center text-[#003836] text-2xl font-black focus:border-[#004F4D] focus:ring-4 focus:ring-[#004F4D]/10 outline-none transition-all shadow-sm"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">
                                        {error}
                                    </p>
                                )}

                                <div className="space-y-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#004F4D] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-[#004F4D]/20 hover:shadow-[#004F4D]/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            'Verify & Login'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-gray-400 text-sm font-bold hover:text-[#004F4D] transition-colors"
                                    >
                                        Change Mobile Number
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="py-8 text-center mt-auto">
                    <p className="text-gray-400 text-sm font-medium">
                        New to Rukkoo?{' '}
                        <button
                            onClick={() => navigate('/hotel/register')}
                            className="text-[#004F4D] font-bold hover:underline"
                        >
                            Register as a partner
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default HotelLoginPage;
