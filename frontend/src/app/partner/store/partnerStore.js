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
    kyc: { docType: 'Aadhaar Card' },
    phone: '',
    rooms: [],
    policies: {
        checkInTime: '12:00 PM',
        checkOutTime: '11:00 AM',
        coupleFriendly: false,
        petsAllowed: false,
        smokingAllowed: false,
        localIdsAllowed: false,
        alcoholAllowed: false,
        forEvents: false,
        outsideFoodAllowed: false
    },
    hotelDraftId: null, // Stores the draft ID from backend
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
                updatePolicies: (updates) => set((state) => ({
                    formData: {
                        ...state.formData,
                        policies: { ...(state.formData.policies || {}), ...updates }
                    }
                })),
                updateDetails: (updates) => set((state) => ({
                    formData: {
                        ...state.formData,
                        details: { ...(state.formData.details || {}), ...updates }
                    }
                })),
                resetForm: () => set({ currentStep: 1, formData: INITIAL_DATA }),

                // Room Management Actions
                addRoom: (room) => set((state) => ({
                    formData: {
                        ...state.formData,
                        rooms: [...(state.formData.rooms || []), {
                            ...room,
                            id: room.id || Date.now().toString(),
                            images: room.images || [],
                            createdAt: new Date()
                        }]
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
