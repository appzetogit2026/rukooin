import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, User, Mail, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';

const UserSignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('details'); // details | otp
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 10) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDetailsSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return;
        }
        if (formData.phone.length !== 10) {
            setError('Please enter a valid phone number');
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
            document.getElementById(`signup-otp-${index + 1}`).focus();
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
            navigate('/');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface via-[#005856] to-[#003836] flex flex-col">

            {/* Header */}
            <div className="px-5 pt-8 pb-4">
                <button
                    onClick={() => step === 'otp' ? setStep('details') : navigate(-1)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Progress Indicator */}
            <div className="px-6 mb-6">
                <div className="flex gap-2">
                    <div className={`h-1 flex-1 rounded-full ${step === 'details' || step === 'otp' ? 'bg-accent' : 'bg-white/20'}`} />
                    <div className={`h-1 flex-1 rounded-full ${step === 'otp' ? 'bg-accent' : 'bg-white/20'}`} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 flex flex-col overflow-y-auto">

                {/* Header Text */}
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
                        {step === 'details' ? 'Create Account' : 'Verify Phone'}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {step === 'details'
                            ? 'Join Rukkoo.in for amazing hotel deals'
                            : `Enter the code sent to +91 ${formData.phone}`
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
                    {step === 'details' ? (
                        <form onSubmit={handleDetailsSubmit} className="space-y-5">
                            {/* Name Input */}
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Full Name
                                </label>
                                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden focus-within:border-accent transition-all">
                                    <div className="pl-4">
                                        <User size={20} className="text-white/50" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Email Input (Optional) */}
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Email <span className="text-white/30">(Optional)</span>
                                </label>
                                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden focus-within:border-accent transition-all">
                                    <div className="pl-4">
                                        <Mail size={20} className="text-white/50" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Phone Number
                                </label>
                                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden focus-within:border-accent transition-all">
                                    <div className="px-4 py-4 bg-white/5 border-r border-white/10 flex items-center gap-2">
                                        <span className="text-lg">🇮🇳</span>
                                        <span className="text-white font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-bold placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-xs">{error}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-surface font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Continue <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Login Link */}
                            <p className="text-center text-white/60 text-sm">
                                Already have an account?{' '}
                                <button type="button" onClick={() => navigate('/login')} className="text-accent font-bold">
                                    Login
                                </button>
                            </p>
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
                                            id={`signup-otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            className="w-12 h-14 bg-white/10 border-2 border-white/20 rounded-xl text-center text-white text-2xl font-black focus:border-accent outline-none transition-all"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>
                                {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
                            </div>

                            <div className="text-center">
                                <p className="text-white/50 text-sm">
                                    Didn't receive? <button type="button" className="text-accent font-bold">Resend OTP</button>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-surface font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Footer */}
                <div className="py-6 text-center">
                    <p className="text-white/40 text-xs">
                        By signing up, you agree to our Terms & Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserSignupPage;
