import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, ArrowRight, Loader2, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/rokologin-removebg-preview.png';

const UserSignup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Enter Details, 2: Enter OTP
    const [method, setMethod] = useState('phone');
    const [formData, setFormData] = useState({
        name: '',
        contact: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || formData.name.length < 3) {
            setError('Please enter your full name');
            return;
        }

        if (method === 'phone' && formData.contact.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        if (method === 'email' && !formData.contact.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="inline-block mb-4"
                    >
                        <img src={logo} alt="Rukkoo.in" className="w-32 h-auto" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-2">Join thousands of happy travelers</p>
                </div>

                <motion.div
                    layout
                    className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Sign Up</h2>

                                <form onSubmit={handleSendOTP} className="space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Method Toggle */}
                                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setMethod('phone')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${method === 'phone'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            <Phone size={16} className="inline mr-2" />
                                            Phone
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod('email')}
                                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${method === 'email'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-gray-500'
                                                }`}
                                        >
                                            <Mail size={16} className="inline mr-2" />
                                            Email
                                        </button>
                                    </div>

                                    {/* Contact */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {method === 'phone' ? 'Phone Number' : 'Email Address'}
                                        </label>
                                        <div className="relative">
                                            {method === 'phone' ? (
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            ) : (
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            )}
                                            <input
                                                type={method === 'phone' ? 'tel' : 'email'}
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                placeholder={method === 'phone' ? '9876543210' : 'you@example.com'}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-sm"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                Continue
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Shield size={32} className="text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Code sent to {method === 'phone' ? `+91 ${formData.contact}` : formData.contact}
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="flex gap-2 justify-center">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOTPChange(index, e.target.value)}
                                                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                            />
                                        ))}
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-sm text-center"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-gray-500 text-sm hover:text-gray-700"
                                    >
                                        Change details
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-emerald-600 font-medium hover:underline"
                    >
                        Login
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default UserSignup;
