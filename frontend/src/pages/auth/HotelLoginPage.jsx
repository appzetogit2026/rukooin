import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Building2, ChevronLeft, MapPin, Briefcase } from 'lucide-react';

const HotelLoginPage = () => {
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
        if (value && index < 5) {
            document.getElementById(`hotel-otp-${index + 1}`).focus();
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp.join('').length !== 6) {
            setError('Please enter complete OTP');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/hotel/dashboard'); // Hotel dashboard route
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex flex-col">

            {/* Header */}
            <div className="px-5 pt-8 pb-4 flex justify-between items-center">
                <button
                    onClick={() => step === 'otp' ? setStep('phone') : navigate(-1)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="text-xs font-bold text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
                    🏨 Hotel Partner
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 flex flex-col">

                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Building2 className="text-amber-600" size={28} />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white block">Rukkoo.in</span>
                            <span className="text-xs text-white/60 font-medium">Partner Portal</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">
                        {step === 'phone' ? 'Hotel Login' : 'Verify OTP'}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {step === 'phone'
                            ? 'Access your hotel dashboard'
                            : `Code sent to +91 ${phone}`
                        }
                    </p>
                </motion.div>

                {/* Form */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    {step === 'phone' ? (
                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Registered Phone Number
                                </label>
                                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="px-4 py-4 bg-white/5 border-r border-white/10 flex items-center gap-2">
                                        <span className="text-lg">🇮🇳</span>
                                        <span className="text-white font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="Enter phone number"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-bold text-lg placeholder:text-white/30 outline-none"
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="w-full bg-white text-amber-700 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Get OTP <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Register Link */}
                            <p className="text-center text-white/60 text-sm">
                                New partner?{' '}
                                <button type="button" onClick={() => navigate('/hotel/register')} className="text-yellow-300 font-bold">
                                    Register Hotel
                                </button>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-4">
                                    Enter 6-digit OTP
                                </label>
                                <div className="flex gap-3 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`hotel-otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            className="w-12 h-14 bg-white/10 border-2 border-white/20 rounded-xl text-center text-white text-2xl font-black focus:border-yellow-300 outline-none transition-all"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {error && <p className="text-red-300 text-xs mt-3 text-center">{error}</p>}
                            </div>

                            <div className="text-center">
                                <p className="text-white/50 text-sm">
                                    Didn't receive? <button type="button" className="text-yellow-300 font-bold">Resend</button>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-amber-700 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Access Dashboard <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Benefits */}
                <div className="py-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                        <p className="text-xs font-bold text-white/80 mb-3">Partner Benefits</p>
                        <div className="space-y-2">
                            {[
                                { icon: Briefcase, text: "Manage bookings easily" },
                                { icon: MapPin, text: "Increase visibility" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-white/60 text-xs">
                                    <item.icon size={14} className="text-yellow-300" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelLoginPage;
