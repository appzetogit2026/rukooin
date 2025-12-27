import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Home, Grip, Building2, Palmtree } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';

const options = [
    { id: 'hotel', label: 'Hotel', icon: Building2 },
    { id: 'resort', label: 'Resort', icon: Palmtree },
    { id: 'homestay', label: 'Homestay', icon: Home },
    { id: 'lodge', label: 'Lodge', icon: Grip },
];

const StepPropertyType = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".property-card", {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleSelect = (id) => {
        updateFormData({ propertyType: id });
    };

    return (

        <div ref={containerRef} className="pt-2 md:pt-10">
            {/* Title rendered by parent, minimal spacing here */}

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className={`property-card cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 group active:scale-95 touch-manipulation
                            ${formData.propertyType === opt.id
                                ? 'border-black bg-gray-50 ring-1 ring-black'
                                : 'border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${formData.propertyType === opt.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                            <opt.icon size={18} />
                        </div>
                        <span className={`text-base font-bold ${formData.propertyType === opt.id ? 'text-black' : 'text-gray-600'}`}>
                            {opt.label}
                        </span>

                        {/* Selected Indicator */}
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center
                            ${formData.propertyType === opt.id ? 'border-black bg-black' : 'border-gray-300'}`}>
                            {formData.propertyType === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepPropertyType;
