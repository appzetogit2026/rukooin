import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, ChevronLeft, ArrowRight, MapPin, Phone, Mail,
    User, FileText, CheckCircle, Camera
} from 'lucide-react';
import { authService } from '../../services/apiService';

const HotelSignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Basic | 2: Hotel Details | 3: OTP
    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        phone: '',
        hotelName: '',
        hotelAddress: '',
        city: '',
        pincode: '',
        roomCount: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'pincode') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, name === 'phone' ? 10 : 6) });
        } else if (name === 'roomCount') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '') });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.ownerName.trim() || formData.phone.length !== 10) {
            setError('Please fill all required fields');
            return;
        }
        setError('');
        setStep(2);
    };

    const handleStep2Submit = async (e) => {
        e.preventDefault();
        if (!formData.hotelName.trim() || !formData.hotelAddress.trim() || !formData.city.trim()) {
            setError('Please fill all required fields');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await authService.sendOtp(formData.phone);
            setStep(3);
        } catch (err) {
            console.error("OTP Error:", err);
            setError(err.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`hotel-signup-otp-${index + 1}`).focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }
        setLoading(true);

        try {
            // Call the special partner verification endpoint
            await authService.verifyPartnerOtp({
                ...formData,
                otp: otpValue
            });
            // On success, token is set by apiService. Redirect to dashboard.
            navigate('/hotel/dashboard');
        } catch (err) {
            console.error("Verification Error:", err);
            setError(err.message || 'Invalid OTP or Registration Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex flex-col">

            {/* Header */}
            <div className="px-5 pt-8 pb-4 flex justify-between items-center">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/60">Step {step}/3</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-6 mb-6">
                <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? 'bg-yellow-300' : 'bg-white/20'}`} />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 flex flex-col overflow-y-auto">

                {/* Header Text */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <Building2 className="text-amber-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white mb-1">
                        {step === 1 && 'Owner Details'}
                        {step === 2 && 'Hotel Information'}
                        {step === 3 && 'Verify Phone'}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {step === 1 && 'Tell us about yourself'}
                        {step === 2 && 'Add your property details'}
                        {step === 3 && `Enter OTP sent to +91 ${formData.phone}`}
                    </p>
                </motion.div>

                {/* Forms */}
                <motion.div
                    key={`form-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Owner Name *
                                </label>
                                <div className="flex items-center bg-white/10 rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="pl-4"><User size={20} className="text-white/50" /></div>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Phone Number *
                                </label>
                                <div className="flex items-center bg-white/10 rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="px-4 py-4 bg-white/5 border-r border-white/10">
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

                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Email <span className="text-white/30">(Optional)</span>
                                </label>
                                <div className="flex items-center bg-white/10 rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="pl-4"><Mail size={20} className="text-white/50" /></div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-300 text-xs">{error}</p>}

                            <button
                                type="submit"
                                className="w-full bg-white text-amber-700 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStep2Submit} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Hotel/Property Name *
                                </label>
                                <div className="flex items-center bg-white/10 rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="pl-4"><Building2 size={20} className="text-white/50" /></div>
                                    <input
                                        type="text"
                                        name="hotelName"
                                        value={formData.hotelName}
                                        onChange={handleChange}
                                        placeholder="Enter hotel name"
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Address *
                                </label>
                                <div className="flex items-start bg-white/10 rounded-2xl border border-white/20 overflow-hidden focus-within:border-yellow-300 transition-all">
                                    <div className="pl-4 pt-4"><MapPin size={20} className="text-white/50" /></div>
                                    <textarea
                                        name="hotelAddress"
                                        value={formData.hotelAddress}
                                        onChange={handleChange}
                                        placeholder="Full address"
                                        rows={2}
                                        className="flex-1 bg-transparent px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className="w-full bg-white/10 rounded-2xl border border-white/20 px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none focus:border-yellow-300"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="Pincode"
                                        className="w-full bg-white/10 rounded-2xl border border-white/20 px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none focus:border-yellow-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-2">
                                    Number of Rooms
                                </label>
                                <input
                                    type="text"
                                    name="roomCount"
                                    value={formData.roomCount}
                                    onChange={handleChange}
                                    placeholder="e.g. 25"
                                    className="w-full bg-white/10 rounded-2xl border border-white/20 px-4 py-4 text-white font-medium placeholder:text-white/30 outline-none focus:border-yellow-300"
                                />
                            </div>

                            {error && <p className="text-red-300 text-xs">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-amber-700 font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send OTP <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/60 uppercase tracking-wider block mb-4">
                                    Enter 6-digit OTP
                                </label>
                                <div className="flex gap-3 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`hotel-signup-otp-${index}`}
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
                                        Complete Registration <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* Footer */}
                <div className="py-6 text-center">
                    <p className="text-white/40 text-xs">
                        Already registered?{' '}
                        <button onClick={() => navigate('/hotel/login')} className="text-yellow-300 font-bold">Login</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HotelSignupPage;
