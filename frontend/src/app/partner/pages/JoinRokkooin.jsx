import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { useNavigate } from 'react-router-dom';
import StepWrapper from '../components/StepWrapper';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useLenis } from '../../shared/hooks/useLenis';

// Steps Components
import StepPropertyType from '../steps/StepPropertyType';
import StepSpaceType from '../steps/StepSpaceType';
import StepLocationCheck from '../steps/StepLocationCheck';
import StepPropertyName from '../steps/StepPropertyName';
import StepAddress from '../steps/StepAddress';
import StepPropertyDetails from '../steps/StepPropertyDetails';
import StepFacilities from '../steps/StepFacilities';
import StepPropertyImages from '../steps/StepPropertyImages';
import StepKyc from '../steps/StepKyc';
import StepOtp from '../steps/StepOtp';
import StepTerms from '../steps/StepTerms';

const steps = [
    { id: 1, title: 'Property Type', desc: 'What kind of place will you host?' },
    { id: 2, title: 'Space Type', desc: 'Who will guests stay with?' },
    { id: 3, title: 'Location', desc: 'Where is your property located?' },
    { id: 4, title: 'Property Name', desc: 'Give your property a name' },
    { id: 5, title: 'Address', desc: 'Confirm your property address' },
    { id: 6, title: 'Property Details', desc: 'Add essential details' },
    { id: 7, title: 'Facilities', desc: 'What amenities do you offer?' },
    { id: 8, title: 'Photos', desc: 'Add some photos' },
    { id: 9, title: 'KYC Verification', desc: 'Verify your ID' },
    { id: 10, title: 'Verification', desc: 'Enter OTP sent to your phone' },
    { id: 11, title: 'Agreement', desc: 'Terms & Conditions' },
];

const JoinRokkooin = () => {
    useLenis();
    const navigate = useNavigate();
    const { currentStep, nextStep, prevStep, formData, updateFormData } = usePartnerStore();
    const [error, setError] = useState('');

    const currentStepIndex = currentStep - 1;
    // Calculate progress based on steps array
    const progress = (currentStep / steps.length) * 100;

    const handleNext = () => {
        setError('');

        // VALIDATION LOGIC
        if (currentStep === 1 && !formData.propertyType) return setError('Please select a property type');
        if (currentStep === 2 && !formData.spaceType) return setError('Please select a space type');
        // Location validation (manual or coords)
        if (currentStep === 3 && !formData.location?.type) return setError('Please confirm your location');
        if (currentStep === 4 && (!formData.propertyName || formData.propertyName.length < 3)) return setError('Please enter a valid property name');
        if (currentStep === 5 && (!formData.address?.line1 || !formData.address?.city)) return setError('Please enter a complete address');

        if (currentStep === 6) {
            if (!formData.totalFloors) updateFormData({ totalFloors: 1 });
            if (!formData.totalRooms) updateFormData({ totalRooms: 1 });
            if (!formData.propertyRating || !formData.propertyDescription) return setError('Please rate your property and add a description');
        }
        if (currentStep === 7 && (!formData.facilities || formData.facilities.length === 0)) return setError('Please select at least one facility');
        if (currentStep === 8) {
            const facade = formData.images?.filter(i => i.category === 'facade').length || 0;
            const bedroom = formData.images?.filter(i => i.category === 'bedroom').length || 0;
            const bathroom = formData.images?.filter(i => i.category === 'bathroom').length || 0;
            if (facade < 4) return setError('Please upload at least 4 Facade/Entrance photos');
            if (bedroom < 6) return setError('Please upload at least 6 Bedroom photos');
            if (bathroom < 3) return setError('Please upload at least 3 Bathroom photos');
        }
        if (currentStep === 9 && (!formData.kycDocType || !formData.kycIdNumber)) return setError('Please complete KYC details');
        if (currentStep === 10 && (!formData.otpCode || formData.otpCode.length < 4)) return setError('Please enter the 4-digit OTP');
        if (currentStep === 11 && !formData.termsAccepted) return setError('Please accept the Terms & Conditions');

        if (currentStep < steps.length) {
            nextStep();
        } else {
            // Final Submit Logic - Send to Admin for Approval
            const propertySubmission = {
                ...formData,
                status: 'PENDING_APPROVAL',
                submittedAt: new Date().toISOString(),
                partnerId: 'PARTNER-' + Math.floor(Math.random() * 10000),
            };

            console.log("Property Listing Request Submitted to Admin:", propertySubmission);

            // TODO: API Call to backend
            // await axios.post('/api/admin/property-requests', propertySubmission);

            // Store in localStorage for demo (simulating backend)
            const existingRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
            existingRequests.push(propertySubmission);
            localStorage.setItem('propertyRequests', JSON.stringify(existingRequests));

            alert("✅ Property Listing Request Submitted!\n\nYour property details have been sent to admin for review. You'll be notified once approved.");
            navigate('/hotel/partner-dashboard');
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
            case 3: return <StepLocationCheck />;
            case 4: return <StepPropertyName />;
            case 5: return <StepAddress />;
            case 6: return <StepPropertyDetails />;
            case 7: return <StepFacilities />;
            case 8: return <StepPropertyImages />;
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
