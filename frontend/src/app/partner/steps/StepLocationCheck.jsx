import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MapPin, Navigation } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';

const StepLocationCheck = () => {
    const { formData, updateFormData, nextStep } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".loc-card", {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleGPS = () => {
        // Mock GPS for frontend demo
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                updateFormData({
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        type: 'gps'
                    }
                });
                nextStep(); // Auto advance on GPS success
            }, (error) => {
                alert("Location access denied. Please verify manually.");
            });
        }
    };

    return (
        <div ref={containerRef} className="pt-2 md:pt-10">
            {/* Title moved to parent wrapper for cleaner mobile structure, but kept here if parent doesn't render it. Currently parent renders steps[i].title, so we might duplicate. Actually, this component renders "Is the property located here?" which is specific. Let's make it smaller. */}

            <div className="flex flex-col gap-3">
                {/* GPS Option */}
                <div
                    onClick={handleGPS}
                    className="loc-card cursor-pointer p-5 rounded-2xl border border-gray-100 hover:border-[#004F4D] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center gap-3 group bg-gray-50 active:scale-95 touch-manipulation"
                >
                    <div className="w-12 h-12 rounded-full bg-[#004F4D] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Navigation size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[#003836] leading-tight">Yes, I am at the property</h3>
                        <p className="text-gray-500 text-xs mt-1">Use my current location</p>
                    </div>
                </div>

                {/* Manual Option */}
                <div
                    onClick={() => {
                        updateFormData({ location: { type: 'manual' } });
                        // Optional: Navigate next or show map search
                        // For now just select it. User clicks Next.
                    }}
                    className={`loc-card cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3 active:scale-95 touch-manipulation
                        ${formData.location?.type === 'manual' ? 'border-[#004F4D] bg-white ring-1 ring-[#004F4D]' : 'border-gray-200 bg-white'}`}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-[#004F4D]" />
                    </div>
                    <div>
                        <span className="block font-bold text-[#003836] text-sm">No, I will search manually</span>
                        {formData.location?.type === 'manual' && <span className="text-[10px] text-green-600 font-bold">Selected</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepLocationCheck;
