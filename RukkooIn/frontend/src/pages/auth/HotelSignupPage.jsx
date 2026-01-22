import React, { useState, useEffect } from 'react';
import usePartnerStore from '../../app/partner/store/partnerStore';
import { useNavigate } from 'react-router-dom';
import StepWrapper from '../../app/partner/components/StepWrapper';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useLenis } from '../../app/shared/hooks/useLenis';
import { authService, userService } from '../../services/apiService';
import { requestNotificationPermission } from '../../utils/firebase';

// Updated Steps Components
import StepUserRegistration from '../../app/partner/steps/StepUserRegistration';
import StepOwnerDetails from '../../app/partner/steps/StepOwnerDetails';

const OTPInput = () => {
    const { formData, updateFormData } = usePartnerStore();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#004F4D]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#004F4D]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#003836]">Verify Phone Number</h3>
                <p className="text-sm text-gray-500">
                    We've sent a 6-digit code to <span className="font-bold text-[#003836]">{formData.phone}</span>
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">One Time Password (OTP)</label>
                <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="w-full h-14 text-center text-2xl font-bold tracking-widest border border-gray-200 rounded-xl focus:border-[#004F4D] focus:ring-2 focus:ring-[#004F4D]/10 outline-none transition-all placeholder:text-gray-200"
                    value={formData.otpCode || ''}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        updateFormData({ otpCode: val });
                    }}
                    autoFocus
                />
            </div>

            <p className="text-center text-xs text-gray-400">
                Didn't receive code? <button className="text-[#004F4D] font-bold hover:underline">Resend</button>
            </p>
        </div>
    );
};


const steps = [
    { id: 1, title: 'Registration', desc: 'Create your partner account' },
    { id: 2, title: 'Owner Details', desc: 'Identity and Address' },
    { id: 3, title: 'Verification', desc: 'Enter OTP sent to mobile' },
];

const HotelSignup = () => {
    useLenis();
    const navigate = useNavigate();
    const { currentStep, nextStep, prevStep, formData, setStep } = usePartnerStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form on mount if desired, or ensure correct step
    useEffect(() => {
        setStep(1);
    }, [setStep]);

    const currentStepIndex = currentStep - 1;
    const progress = (currentStep / steps.length) * 100;

    const handleNext = async () => {
        setError('');

        // --- STEP 1: BASIC INFO VALIDATION ---
        if (currentStep === 1) {
            if (!formData.full_name || formData.full_name.length < 3) return setError('Please enter a valid full name');
            if (!formData.email || !formData.email.includes('@')) return setError('Please enter a valid email');
            if (!formData.phone || formData.phone.length !== 10) return setError('Please enter a valid 10-digit phone number');
            if (!formData.termsAccepted) return setError('You must accept the Terms & Conditions');

            // Proceed to Step 2
            nextStep();
        }

        // --- STEP 2: OWNER DETAILS SUBMISSION ---
        else if (currentStep === 2) {
            // Validation
            if (!formData.owner_name) return setError('Owner Name is required');
            if (!formData.aadhaar_number || formData.aadhaar_number.length !== 12) return setError('Valid 12-digit Aadhaar Number is required');
            if (!formData.aadhaar_front) return setError('Aadhaar Front Image is required');
            if (!formData.aadhaar_back) return setError('Aadhaar Back Image is required');
            if (!formData.pan_number || formData.pan_number.length !== 10) return setError('Valid 10-digit PAN Number is required');
            if (!formData.pan_card_image) return setError('PAN Card Image is required');

            if (!formData.owner_address?.street || !formData.owner_address?.city || !formData.owner_address?.state || !formData.owner_address?.zipCode) {
                return setError('Complete address details are required');
            }

            // SUBMIT TO BACKEND (Request OTP)
            setLoading(true);
            try {
                // Ensure role is partner
                const payload = { ...formData, role: 'partner' };
                await authService.registerPartner(payload);
                setLoading(false);
                nextStep(); // Go to OTP Step
            } catch (err) {
                setLoading(false);
                console.error("Registration Error:", err);
                setError(err.message || "Registration failed. Please check your details.");
            }
        }

        // --- STEP 3: OTP VERIFICATION ---
        else if (currentStep === 3) {
            const otpCode = formData.otpCode;
            if (!otpCode || otpCode.length !== 6) return setError('Please enter the 6-digit OTP sent to your phone.');

            setLoading(true);
            try {
                // Determine Payload for verify using phone from formData
                const verifyPayload = {
                    phone: formData.phone,
                    otp: otpCode,
                };

                await authService.verifyPartnerOtp(verifyPayload); // This should call verifyPartnerOtp

                // Update FCM Notification permission if possible here, or do it on login
                // We can try requesting permission now if user is technically logged in or just registered
                try {
                    const token = await requestNotificationPermission();
                    if (token) {
                        await userService.updateFcmToken(token, 'web');
                    }
                } catch (e) { console.warn('FCM error', e); }

                alert("Registration successful! Your account is pending admin approval.");
                navigate('/hotel/login');
            } catch (err) {
                setLoading(false);
                setError(err.message || "Invalid OTP");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            prevStep();
        } else {
            navigate('/hotel'); // Exit
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <StepUserRegistration />;
            case 2: return <StepOwnerDetails />;
            case 3: return <OTPInput />;
            default: return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#003836] flex flex-col font-sans selection:bg-[#004F4D] selection:text-white">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 px-4 flex items-center justify-between border-b border-gray-100">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} className="text-[#003836]" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Step {currentStep} of {steps.length}</span>
                    <span className="text-xs md:text-sm font-bold text-[#003836] truncate">{steps[currentStepIndex]?.title}</span>
                </div>
                <button onClick={() => navigate('/hotel')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={20} className="text-[#003836]" />
                </button>
            </header>

            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-gray-100 h-1">
                <div
                    className="h-full bg-[#004F4D] transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col pt-24 pb-28 px-4 md:px-0 max-w-lg mx-auto w-full relative">
                <div className="mb-6 md:text-center px-1">
                    <h1 className="text-2xl md:text-3xl font-black mb-1 leading-tight">{steps[currentStepIndex]?.title}</h1>
                    <p className="text-gray-500 text-sm md:text-base leading-snug">{steps[currentStepIndex]?.desc}</p>
                </div>

                <div className="flex-1 relative">
                    <StepWrapper stepKey={currentStep}>
                        {renderStep()}
                    </StepWrapper>
                </div>
            </main>

            {/* Bottom Action Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 md:p-6 z-50">
                <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
                    <button
                        onClick={handleBack}
                        className="text-xs font-bold underline px-3 py-2 text-gray-400 hover:text-[#004F4D] transition-colors"
                        disabled={currentStep === 1 || loading}
                    >
                        Back
                    </button>

                    <div className="flex-1 flex flex-col items-end">
                        <button
                            onClick={handleNext}
                            disabled={loading}
                            className={`bg-[#004F4D] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 w-full md:w-auto justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    {currentStep === steps.length ? 'Verify & Login' : 'Next Step'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="absolute top-[30px] left-0 right-0 flex justify-center w-full px-4 transform -translate-y-full">
                        <div className="bg-red-500 text-white text-[10px] md:text-sm font-bold px-4 py-2 rounded-full shadow-lg animate-bounce text-center break-words max-w-full">
                            {error}
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default HotelSignup;
