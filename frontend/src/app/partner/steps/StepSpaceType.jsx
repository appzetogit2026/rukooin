import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Building, BedDouble } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';

const options = [
    { id: 'entire', label: 'Entire Property', desc: 'Guests rent the entire place', icon: Building },
    { id: 'private_room', label: 'Private Rooms', desc: 'Guests have their own room', icon: BedDouble },
];

const StepSpaceType = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".space-card", {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="pt-2 md:pt-10">
            {/* Title rendered by parent */}

            <div className="flex flex-col gap-3">
                {options.map((opt) => (
                    <div
                        key={opt.id}
                        onClick={() => updateFormData({ spaceType: opt.id })}
                        className={`space-card cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 group active:scale-95 touch-manipulation
                            ${formData.spaceType === opt.id
                                ? 'border-[#004F4D] bg-gray-50 ring-1 ring-[#004F4D]'
                                : 'border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                            ${formData.spaceType === opt.id ? 'bg-[#004F4D] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                            <opt.icon size={18} />
                        </div>
                        <div>
                            <h3 className={`text-base font-bold leading-tight ${formData.spaceType === opt.id ? 'text-[#004F4D]' : 'text-gray-800'}`}>
                                {opt.label}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>

                        {/* Selected Indicator */}
                        <div className={`ml-auto w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                            ${formData.spaceType === opt.id ? 'border-[#004F4D] bg-[#004F4D]' : 'border-gray-300'}`}>
                            {formData.spaceType === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepSpaceType;
