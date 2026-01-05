import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { useNavigate } from 'react-router-dom';
import StepWrapper from '../components/StepWrapper';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useLenis } from '../../shared/hooks/useLenis';
import { authService, hotelService } from '../../../services/apiService';

// Steps Components
import StepPropertyType from '../steps/StepPropertyType';
import StepSpaceType from '../steps/StepSpaceType';
import StepPropertyName from '../steps/StepPropertyName';
import StepAddress from '../steps/StepAddress';
import StepPropertyDetails from '../steps/StepPropertyDetails';
import StepFacilities from '../steps/StepFacilities';
import StepPropertyImages from '../steps/StepPropertyImages';
import StepKyc from '../steps/StepKyc';
import StepOtp from '../steps/StepOtp';
import StepTerms from '../steps/StepTerms';
import StepRoomDetails from '../steps/StepRoomDetails';

const steps = [
    { id: 1, title: 'Basics', desc: 'Property Type' },
    { id: 2, title: 'Space', desc: 'Who will guests stay with?' },
    { id: 3, title: 'Identity', desc: 'Give your property a name' },
    { id: 4, title: 'Address', desc: 'Confirm your property address' },
    { id: 5, title: 'Details', desc: 'Configuration and policies' },
    { id: 6, title: 'Photos', desc: 'Property-wide photos' },
    { id: 7, title: 'Amenities', desc: 'Property facilities' },
    { id: 8, title: 'Rooms', desc: 'Add room categories & pricing' },
    { id: 9, title: 'KYC', desc: 'Identity verification' },
    { id: 10, title: 'Verify', desc: 'OTP Verification' },
    { id: 11, title: 'Launch', desc: 'Review & Publish' },
];

const JoinRokkooin = () => {
    useLenis();
    const navigate = useNavigate();
    const { currentStep, nextStep, prevStep, formData, updateFormData } = usePartnerStore();
    const [error, setError] = useState('');

    const currentStepIndex = currentStep - 1;
    // Calculate progress based on steps array
    const progress = (currentStep / steps.length) * 100;

    const handleNext = async () => {
        setError('');

        // VALIDATION LOGIC
        if (currentStep === 1 && !formData.propertyType) return setError('Please select a property type');
        if (currentStep === 2 && !formData.spaceType) return setError('Please select a space type');
        if (currentStep === 3 && (!formData.propertyName || formData.propertyName.length < 3)) return setError('Please enter a valid property name');
        if (currentStep === 4 && (!formData.address?.street || !formData.address?.city)) return setError('Please enter a complete address');

        if (currentStep === 5) {
            if (!formData.details?.totalFloors) updateFormData({ details: { ...formData.details, totalFloors: 1 } });
            if (!formData.description || formData.description.length < 50) return setError('Description must be at least 50 characters');
        }
        if (currentStep === 6) {
            const facade = formData.images?.filter(i => i.category === 'facade').length || 0;
            if (facade < 4) return setError('Please upload at least 4 Facade/Entrance photos');
        }
        if (currentStep === 7 && (!formData.facilities || formData.facilities.length === 0)) return setError('Please select at least one facility');
        if (currentStep === 8 && (!formData.rooms || formData.rooms.length === 0)) return setError('Please add at least one room category');

        if (currentStep === 9 && (!formData.kyc?.docType || !formData.kyc?.idNumber)) return setError('Please complete KYC details');

        if (currentStep === 10 && (!formData.otpCode || formData.otpCode.length < 6)) return setError('Please enter the 6-digit OTP');
        if (currentStep === 11 && !formData.termsAccepted) return setError('Please accept the Terms & Conditions');

        // SAVE DRAFT STEP (Before moving next)
        if (currentStep < steps.length && currentStep !== 10) {
            try {
                // Prepare Payload with proper mapping
                const payload = {
                    ...formData,
                    step: currentStep,
                    hotelDraftId: formData.hotelDraftId,
                    propertyName: formData.propertyName || 'Incomplete Property',
                    propertyType: formData.propertyType || 'Unknown'
                };

                // Map coordinates
                if (formData.location?.lat && formData.location?.lng) {
                    payload.address = {
                        ...formData.address,
                        coordinates: {
                            lat: formData.location.lat,
                            lng: formData.location.lng
                        }
                    };
                }

                const draftResponse = await authService.saveOnboardingStep(payload);

                if (draftResponse && draftResponse.hotelId) {
                    updateFormData({ hotelDraftId: draftResponse.hotelId });
                }
            } catch (err) {
                console.warn("Failed to save draft:", err);
            }
        }

        if (currentStep < steps.length) {
            nextStep();
        } else {
            // Final Submit Logic
            try {
                const response = await authService.verifyPartnerOtp({
                    ...formData,
                    // Ensure these are mapped if needed, or backend handles it
                    otp: formData.otpCode,
                    phone: formData.phone, // Ensure phone is passed
                    hotelDraftId: formData.hotelDraftId // Link to draft
                });

                console.log("Registration Success:", response);
                alert("✅ Registration Successful! Redirecting to Dashboard...");
                navigate('/hotel/dashboard');
                // You might want to reset the store here
                // resetForm();
            } catch (err) {
                console.error("Registration Failed:", err);
                setError(err.message || "Registration Failed. Please try again.");
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            prevStep();
        } else {
            navigate('/hotel'); // Exit wizard
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <StepPropertyType />;
            case 2: return <StepSpaceType />;
            case 3: return <StepPropertyName />;
            case 4: return <StepAddress />;
            case 5: return <StepPropertyDetails />;
            case 6: return <StepPropertyImages />;
            case 7: return <StepFacilities />;
            case 8: return <StepRoomDetails />;
            case 9: return <StepKyc />;
            case 10: return <StepOtp />;
            case 11: return <StepTerms />;
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
                    <span className="text-xs md:text-sm font-bold text-[#003836] truncate max-w-[150px] md:max-w-none">{steps[currentStepIndex]?.title}</span>
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
            <main className="flex-1 flex flex-col pt-20 pb-24 px-4 md:px-0 max-w-lg mx-auto w-full relative">
                <div className="mb-4 md:text-center px-1">
                    <h1 className="text-xl md:text-3xl font-black mb-1 leading-tight">{steps[currentStepIndex]?.title}</h1>
                    <p className="text-gray-500 text-xs md:text-base leading-snug">{steps[currentStepIndex]?.desc}</p>
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
                        disabled={currentStep === 1}
                    >
                        Back
                    </button>

                    <div className="flex-1 flex flex-col items-end">
                        <button
                            onClick={handleNext}
                            className="bg-[#004F4D] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                        >
                            {currentStep === steps.length ? 'Submit Application' : 'Next'}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="absolute top-[-40px] left-0 right-0 flex justify-center w-full px-4">
                        <div className="bg-red-500 text-white text-[10px] md:text-sm font-bold px-4 py-1.5 rounded-full shadow-lg animate-bounce text-center break-words max-w-full">
                            {error}
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default JoinRokkooin;
