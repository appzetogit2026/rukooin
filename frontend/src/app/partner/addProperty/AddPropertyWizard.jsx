import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import usePartnerStore from '../store/partnerStore';
import { getPropertyConfig } from './configs';
import { getStepComponent } from './utils/stepMapper.jsx';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { hotelService } from '../../../services/apiService';
import StepCategory from '../steps/StepCategory';
import { validateStep } from './validations';
import { toast } from 'react-hot-toast';

const AddPropertyWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentStep, formData, prevStep, nextStep, setStep, totalSteps, updateFormData, resetForm } = usePartnerStore();
  const [loading, setLoading] = useState(!!id);

  // Initial Data Fetch for Edit Mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      const fetchProperty = async () => {
        try {
          const data = await hotelService.getById(id);
          if (data) {
            // Map Backend Data to Frontend Store
            const mappedData = {
              hotelDraftId: data._id,
              propertyCategory: data.propertyType,
              name: data.name || '',
              description: data.description || '',
              shortDescription: data.shortDescription || '',
              address: data.address || {},
              location: data.location || {},
              images: data.images || { cover: '', gallery: [] },
              amenities: data.amenities || [],
              nearbyPlaces: data.nearbyPlaces || [],
              inventory: data.inventory || [],
              config: data.config || {},
              policies: data.policies || {},
              contacts: data.contacts || {},
              documents: data.documents || {},
              status: data.status,
              isLive: data.isLive
            };
            updateFormData(mappedData);
            // Optionally reset step to 1 if first load?
            // setStep(1); 
          }
        } catch (error) {
          console.error("Failed to fetch property", error);
          toast.error("Failed to load property details");
          navigate('/hotel/properties');
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    } else {
      // Start Fresh for New Property
      resetForm();
    }
  }, [id]);


  // 1. Get Configuration based on selected Category
  const config = useMemo(() => {
    return getPropertyConfig(formData.propertyCategory || 'Hotel');
  }, [formData.propertyCategory]);

  // 2. Define Steps (Category + Config Steps)
  const steps = useMemo(() => {
    return [
      { key: 'category', label: 'Property Type', component: 'StepCategory' },
      ...config.steps
    ];
  }, [config]);

  // 3. Sync Total Steps to Store
  useEffect(() => {
    usePartnerStore.setState({ totalSteps: steps.length });
  }, [steps.length]);

  // 4. Get Current Component
  const activeStepConfig = steps[currentStep - 1] || steps[0];
  const StepComponent = activeStepConfig.key === 'category'
    ? StepCategory
    : getStepComponent(activeStepConfig.component);

  // 5. Handlers
  const getPayloadForStep = (key, data) => {
    const common = {
      hotelDraftId: data.hotelDraftId,
      propertyCategory: data.propertyCategory,
      step: currentStep
    };

    switch (key) {
      case 'category': return { ...common };
      case 'basic': return { ...common, name: data.name, description: data.description, shortDescription: data.shortDescription, config: data.config };
      case 'location': return { ...common, address: data.address, location: data.location };
      case 'rooms':
      case 'inventory':
        return { ...common, inventory: data.inventory, pricing: data.pricing };
      case 'amenities': return { ...common, amenities: data.amenities, config: data.config };
      case 'policies': return { ...common, policies: data.policies };
      case 'contacts': return { ...common, contacts: data.contacts };
      case 'documents': return { ...common, documents: data.documents };
      case 'photos': return { ...common, images: data.images };
      case 'review': return { ...common, status: data.status };
      case 'food': return { ...common, config: data.config };
      case 'rules': return { ...common, policies: data.policies, config: data.config };
      case 'meals': return { ...common, mealPlans: data.mealPlans };
      case 'activities': return { ...common, activities: data.activities };
      case 'nearby': return { ...common, nearbyPlaces: data.nearbyPlaces };
      case 'style': return { ...common, config: data.config };
      case 'structure': return { ...common, config: data.config };
      case 'pricing': return { ...common, pricing: data.pricing, cleaningFee: data.cleaningFee, securityDeposit: data.securityDeposit };
      default: return { ...common, ...data };
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.propertyCategory) {
      toast.error("Please select a property category");
      return;
    }
    try {
      const payload = getPayloadForStep(activeStepConfig.key, formData);
      const response = await hotelService.saveOnboardingStep(payload);
      if (response && response.hotelId) {
        updateFormData({ hotelDraftId: response.hotelId });
        toast.success('Draft saved successfully');
      }
    } catch (err) {
      console.error("Draft save failed", err);
      toast.error('Failed to save draft');
    }
  };

  const handleNext = async () => {
    // Validation
    if (activeStepConfig.key !== 'category') {
      const errors = validateStep(activeStepConfig.key, formData);
      if (errors.length > 0) {
        toast.error(errors[0]);
        return;
      }
    } else {
      if (!formData.propertyCategory) {
        toast.error("Please select a property category");
        return;
      }
    }

    // Save Draft logic
    if (formData.propertyCategory) {
      try {
        const payload = getPayloadForStep(activeStepConfig.key, formData);

        // If Final Step, set status to pending
        if (currentStep === steps.length) {
          payload.status = 'pending';
          payload.isLive = false;
        }

        const response = await hotelService.saveOnboardingStep(payload);
        if (response && response.hotelId) {
          updateFormData({ hotelDraftId: response.hotelId });
        }

        // If final step, show success and redirect
        if (currentStep === steps.length) {
          toast.success('Property submitted for approval! 🎉');
          setTimeout(() => {
            navigate('/hotel/properties');
          }, 1500);
          return; // Don't proceed to nextStep
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
        toast.error('Failed to save. Please try again.');
        return;
      }
    }

    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  // Progress Bar Calculation
  const progress = Math.round(((currentStep) / steps.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#004F4D] font-bold animate-pulse">Loading Property Details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="font-bold text-lg text-gray-800">
              {activeStepConfig.label} <span className="text-gray-400 font-normal text-sm ml-2">Step {currentStep} of {steps.length}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleSaveDraft} className="text-sm font-semibold text-[#004F4D] flex items-center gap-1 hover:bg-[#004F4D]/5 px-3 py-1.5 rounded-lg transition-colors">
              <Save size={16} /> Save Draft
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div className="bg-[#004F4D] h-1 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[400px]">
          <StepComponent />
        </div>
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[60]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Back
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 bg-[#004F4D] hover:bg-[#003836] text-white rounded-xl font-bold shadow-lg shadow-[#004F4D]/20 transform active:scale-95 transition-all flex items-center gap-2"
          >
            {currentStep === steps.length ? 'Submit for Approval' : 'Next Step'} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyWizard;
