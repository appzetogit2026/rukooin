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
    rooms: [],
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

                // Room Management Actions
                addRoom: (room) => set((state) => ({
                    formData: {
                        ...state.formData,
                        rooms: [...(state.formData.rooms || []), { ...room, id: Date.now().toString(), createdAt: new Date() }]
                    }
                })),
                updateRoom: (roomId, updates) => set((state) => ({
                    formData: {
                        ...state.formData,
                        rooms: (state.formData.rooms || []).map(r => r.id === roomId ? { ...r, ...updates } : r)
                    }
                })),
                deleteRoom: (roomId) => set((state) => ({
                    formData: {
                        ...state.formData,
                        rooms: (state.formData.rooms || []).filter(r => r.id !== roomId)
                    }
                })),
            }),
            {
                name: 'partner-registration-storage', // unique name
            }
        )
    )
);

export default usePartnerStore;
