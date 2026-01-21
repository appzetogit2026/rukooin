import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const INITIAL_DATA = {
    // --- User Registration (HotelSignup) ---
    full_name: '',
    email: '',
    phone: '',
    role: 'partner',
    termsAccepted: false,
    otpCode: '', // Shared with auth

    // Owner Details
    owner_name: '',
    aadhaar_number: '',
    aadhaar_front: '',
    aadhaar_back: '',
    pan_number: '',
    pan_card_image: '',
    owner_address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    },

    // --- Property Onboarding (JoinRokkooin) ---
    hotelDraftId: null,

    // Step 1
    propertyCategory: '',
    bookingType: '',
    inventoryType: '',

    // Step 2
    name: '', // Property Name
    description: '',
    shortDescription: '',

    // Step 3
    address: {
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
        coordinates: { lat: 20.5937, lng: 78.9629 }
    },

    // Step 4
    config: {},

    // Step 5
    inventory: [],
    pricing: {
        basePrice: '',
        extraGuestPrice: '',
        cleaningFee: ''
    },
    availabilityRules: {
        minStay: 1,
        maxStay: 30,
        blockedDates: []
    },

    // Step 6
    amenities: [],

    // Step 7
    images: {
        cover: '',
        gallery: [],
        inventory: [] // Optional if tracking inventory images separately here
    },

    // Step 8
    contacts: {
        receptionPhone: '',
        managerPhone: '',
        emergencyContact: ''
    },

    // Step 9
    policies: {
        checkInPolicy: '',
        cancellationPolicy: '',
        idRequirement: '',
        genderRules: '',
        partiesAllowed: false,
        petsAllowed: false,
        smokingAllowed: false,
        alcoholAllowed: false
    },

    // Step 10
    documents: {
        ownershipProof: '',
        businessRegistration: '',
        fireSafety: ''
    },

    // --- Dashboard Data ---
    dashboardStats: {
        totalBookings: 0,
        totalEarnings: 0,
        activeProperties: 0,
        walletBalance: 0,
        recentBookings: []
    },
    isDashboardLoading: false,
    dashboardError: null,

    fetchDashboardData: async () => {
        const { api } = await import('../../../services/apiService'); // Lazy import to avoid circular deps if any
        set({ isDashboardLoading: true, dashboardError: null });
        try {
            // Parallel fetch
            const [bookingsRes, propertiesRes, walletRes] = await Promise.all([
                api.get('/bookings/partner'),
                api.get('/properties/my'),
                api.get('/wallet/stats')
            ]);

            const bookings = bookingsRes.data || [];
            const properties = propertiesRes.data?.properties || [];
            const walletStats = walletRes.data?.stats || {};

            set({
                dashboardStats: {
                    totalBookings: bookings.length,
                    totalEarnings: walletStats.totalEarnings || 0,
                    activeProperties: properties.length,
                    walletBalance: walletStats.currentBalance || 0,
                    recentBookings: bookings.slice(0, 5) // Top 5 recent
                },
                isDashboardLoading: false
            });
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
            set({
                dashboardError: error.response?.data?.message || 'Failed to fetch dashboard data',
                isDashboardLoading: false
            });
        }
    },

    status: 'draft',
    isLive: false
};

const usePartnerStore = create(
    devtools(
        persist(
            (set) => ({
                currentStep: 1,
                totalSteps: 11,
                formData: INITIAL_DATA,

                // --- Dashboard State ---
                dashboardStats: {
                    totalBookings: 0,
                    totalEarnings: 0,
                    activeProperties: 0,
                    walletBalance: 0,
                    recentBookings: []
                },
                isDashboardLoading: false,
                dashboardError: null,

                fetchDashboardData: async () => {
                    const { api } = await import('../../../services/apiService');
                    set({ isDashboardLoading: true, dashboardError: null });
                    try {
                        const [bookingsRes, propertiesRes, walletRes] = await Promise.all([
                            api.get('/bookings/partner'),
                            api.get('/properties/my'),
                            api.get('/wallet/stats')
                        ]);

                        const bookings = bookingsRes.data || [];
                        const properties = propertiesRes.data?.properties || [];
                        const walletStats = walletRes.data?.stats || {};

                        set({
                            dashboardStats: {
                                totalBookings: bookings.length,
                                totalEarnings: walletStats.totalEarnings || 0,
                                activeProperties: properties.length,
                                walletBalance: walletStats.currentBalance || 0,
                                recentBookings: bookings.slice(0, 5)
                            },
                            isDashboardLoading: false
                        });
                    } catch (error) {
                        console.error('Dashboard Fetch Error:', error);
                        set({
                            dashboardError: error.response?.data?.message || 'Failed to fetch dashboard data',
                            isDashboardLoading: false
                        });
                    }
                },

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
