import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const INITIAL_DATA = {
    propertyType: '',
    propertyOwnership: '',
    location: null,
    propertyName: '',
    address: {},
    details: {},
    facilities: [],
    images: [],
    kyc: {},
    phone: '',
};

const usePartnerStore = create(
    devtools(
        persist(
            (set) => ({
                currentStep: 1,
                totalSteps: 11,
                formData: INITIAL_DATA,
                setStep: (step) => set({ currentStep: step }),
                nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
                prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
                updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
                resetForm: () => set({ currentStep: 1, formData: INITIAL_DATA }),
            }),
            {
                name: 'partner-registration-storage', // unique name
            }
        )
    )
);

export default usePartnerStore;
