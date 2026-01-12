import React, { useState, useEffect } from 'react';
import usePartnerStore from '../../app/partner/store/partnerStore';
import { useNavigate } from 'react-router-dom';
import StepWrapper from '../../app/partner/components/StepWrapper';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useLenis } from '../../app/shared/hooks/useLenis';
import { authService } from '../../services/apiService';

// Updated Steps Components
import StepUserRegistration from '../../app/partner/steps/StepUserRegistration';
import StepOwnerDetails from '../../app/partner/steps/StepOwnerDetails';
import StepOtp from '../../app/partner/steps/StepOtp';

const steps = [
    { id: 1, title: 'Registration', desc: 'Create your partner account' },
    { id: 2, title: 'Owner Details', desc: 'Identity and Address' },
    { id: 3, title: 'Verification', desc: 'Verify your mobile number' },
];

const HotelSignup = () => {
    useLenis();
    const navigate = useNavigate();
    const { currentStep, nextStep, prevStep, formData, updateFormData, setStep, resetForm } = usePartnerStore();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form on mount if desired, or ensure correct step
    useEffect(() => {
        setStep(1);
    }, []);

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

            // SUBMIT TO BACKEND (Register & Send OTP)
            setLoading(true);
            try {
                // Ensure role is partner
                const payload = { ...formData, role: 'partner' };
                await authService.registerPartner(payload);

                // If successful, move to OTP step
                nextStep();
            } catch (err) {
                console.error("Registration Error:", err);
                setError(err.message || "Registration failed. Please check your details.");
            } finally {
                setLoading(false);
            }
        }

        // --- STEP 3: OTP VERIFICATION ---
        else if (currentStep === 3) {
            if (!formData.otpCode || formData.otpCode.length < 6) return setError('Please enter the 6-digit OTP');

            setLoading(true);
            try {
                const response = await authService.verifyPartnerOtp({
                    phone: formData.phone,
                    otp: formData.otpCode
                });

                console.log("Verification Success:", response);
                alert("✅ Account Verified! Redirecting to Dashboard...");

                // Redirect
                navigate('/hotel/dashboard');

                // Optional: Reset store
                // resetForm(); 
            } catch (err) {
                console.error("Verification Error:", err);
                setError(err.message || "Invalid OTP. Please try again.");
            } finally {
                setLoading(false);
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
            case 3: return <StepOtp autoSend={false} />;
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
