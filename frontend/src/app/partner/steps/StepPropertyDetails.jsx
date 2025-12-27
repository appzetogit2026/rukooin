import React, { useRef, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Star, FileText, Info, HeartHandshake, PawPrint, Cigarette, CheckCircle, Building, Minus, Plus } from 'lucide-react';

const StepPropertyDetails = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleRating = (rating) => {
        updateFormData({ propertyRating: rating });
    };

    return (

        <div ref={containerRef} className="pb-10 pt-2 px-1">

            {/* 1. Star Rating Section */}
            <div className="anim-item mb-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Star size={14} /> Hotel Star Rating
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRating(star)}
                            className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 ${formData.propertyRating === star
                                ? 'border-black bg-black text-white shadow-lg scale-100' // No scale on mobile to save space or tiny scale
                                : 'border-gray-200 bg-white text-gray-400'
                                }`}
                        >
                            <span className="text-lg font-black leading-none mb-0.5">{star}</span>
                            <Star
                                size={10}
                                className={formData.propertyRating === star ? 'fill-white' : 'fill-transparent'}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Description Section */}
            <div className="anim-item mb-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <FileText size={14} /> About Property
                </label>
                <textarea
                    placeholder="Tell guests what makes your place unique..."
                    className="w-full h-24 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-black focus:ring-0 resize-none text-sm placeholder-gray-400 transition-all font-medium"
                    value={formData.propertyDescription || ''}
                    onChange={(e) => updateFormData({ propertyDescription: e.target.value })}
                ></textarea>
                <p className="text-right text-[10px] text-gray-400 mt-1">Min. 50 characters</p>
            </div>

            {/* 3. Building Layout (Floors & Rooms) */}
            <div className="anim-item mb-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Building size={14} /> Building Layout
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {/* Floors Counter */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Floors</span>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => updateFormData({ totalFloors: Math.max(1, (formData.totalFloors || 1) - 1) })}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black active:scale-95 transition-all"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-xl font-black text-gray-900">{formData.totalFloors || 1}</span>
                            <button
                                onClick={() => updateFormData({ totalFloors: (formData.totalFloors || 1) + 1 })}
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center active:scale-95 transition-all"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Rooms Counter */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Rooms</span>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => updateFormData({ totalRooms: Math.max(1, (formData.totalRooms || 1) - 1) })}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black active:scale-95 transition-all"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-xl font-black text-gray-900">{formData.totalRooms || 1}</span>
                            <button
                                onClick={() => updateFormData({ totalRooms: (formData.totalRooms || 1) + 1 })}
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center active:scale-95 transition-all"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Property Policies (Highlights) */}
            <div className="anim-item">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Info size={14} /> Property Policies
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'coupleFriendly', label: 'Couple Friendly', icon: HeartHandshake },
                        { id: 'petsAllowed', label: 'Pets Allowed', icon: PawPrint },
                        { id: 'smokingAllowed', label: 'Smoking Allowed', icon: Cigarette },
                    ].map((policy) => (
                        <button
                            key={policy.id}
                            onClick={() => updateFormData({ [policy.id]: !formData[policy.id] })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 aspect-[4/3] active:scale-95 touch-manipulation relative overflow-hidden ${formData[policy.id]
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                                }`}
                        >
                            <policy.icon size={20} className={`mb-1.5 z-10 ${formData[policy.id] ? 'stroke-white' : 'stroke-gray-400'}`} />
                            <span className="text-[10px] font-bold leading-tight text-center z-10">{policy.label}</span>

                            {/* Selected Checkmark Watermark */}
                            {formData[policy.id] && (
                                <div className="absolute -bottom-2 -right-2 text-white/10 rotate-[-15deg]">
                                    <CheckCircle size={40} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic px-1">
                    * Tap to enable specific policies for your property.
                </p>
            </div>

        </div>
    );
};

export default StepPropertyDetails;
