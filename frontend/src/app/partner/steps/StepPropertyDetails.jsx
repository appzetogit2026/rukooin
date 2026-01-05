import React, { useRef, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Star, FileText, Info, HeartHandshake, PawPrint, Cigarette, CheckCircle, Building, Minus, Plus, ShieldCheck, GlassWater, PartyPopper, UtensilsCrossed } from 'lucide-react';

const StepPropertyDetails = () => {
    const { formData, updateFormData, updatePolicies, updateDetails } = usePartnerStore();
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

    const handlePolicyToggle = (id) => {
        const currentPolicies = formData.policies || {};
        updatePolicies({ [id]: !currentPolicies[id] });
    };

    return (
        <div ref={containerRef} className="pb-10 pt-2 px-1">

            {/* 1. Description Section */}
            <div className="anim-item mb-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <FileText size={14} /> About Property
                </label>
                <textarea
                    placeholder="Tell guests what makes your place unique..."
                    className="w-full h-24 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#004F4D] focus:ring-0 resize-none text-sm placeholder-gray-400 transition-all font-medium"
                    value={formData.description || ''}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                ></textarea>
                <p className="text-right text-[10px] text-gray-400 mt-1">Min. 50 characters</p>
            </div>

            {/* 2. Building Info & Timings */}
            <div className="anim-item mb-5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Building size={14} /> Property Configuration
                </label>
                <div className="flex flex-col gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">

                    {/* Total Floors */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <span className="text-xs font-bold text-gray-600">Total Floors</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => updateDetails({ totalFloors: Math.max(1, (formData.details?.totalFloors || 1) - 1) })}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-all"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-lg font-black text-[#003836] w-6 text-center">{formData.details?.totalFloors || 1}</span>
                            <button
                                onClick={() => updateDetails({ totalFloors: (formData.details?.totalFloors || 1) + 1 })}
                                className="w-8 h-8 rounded-full bg-[#004F4D] text-white flex items-center justify-center active:scale-95 transition-all"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Check-in / Check-out */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Check-in Time</label>
                            <select
                                value={formData.policies?.checkInTime || '12:00 PM'}
                                onChange={(e) => updatePolicies({ checkInTime: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-sm font-bold focus:border-[#004F4D] outline-none"
                            >
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="01:00 PM">01:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Check-out Time</label>
                            <select
                                value={formData.policies?.checkOutTime || '11:00 AM'}
                                onChange={(e) => updatePolicies({ checkOutTime: e.target.value })}
                                className="w-full p-2.5 rounded-lg border border-gray-200 bg-white text-sm font-bold focus:border-[#004F4D] outline-none"
                            >
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="09:00 AM">09:00 AM</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>

            {/* 3. Property Policies */}
            <div className="anim-item">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                    <Info size={14} /> Property Policies
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                        { id: 'coupleFriendly', label: 'Couples', icon: HeartHandshake },
                        { id: 'petsAllowed', label: 'Pets', icon: PawPrint },
                        { id: 'smokingAllowed', label: 'Smoking', icon: Cigarette },
                        { id: 'localIdsAllowed', label: 'Local ID', icon: ShieldCheck },
                        { id: 'alcoholAllowed', label: 'Alcohol', icon: GlassWater },
                        { id: 'forEvents', label: 'Events', icon: PartyPopper },
                        { id: 'outsideFoodAllowed', label: 'Food', icon: UtensilsCrossed },
                    ].map((policy) => {
                        const isActive = !!formData.policies?.[policy.id];
                        return (
                            <button
                                key={policy.id}
                                type="button"
                                onClick={() => handlePolicyToggle(policy.id)}
                                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200 active:scale-95 touch-manipulation relative overflow-hidden ${isActive
                                    ? 'border-[#004F4D] bg-[#004F4D] text-white shadow-md'
                                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200 shadow-sm'
                                    }`}
                            >
                                <policy.icon size={16} className={`shrink-0 ${isActive ? 'stroke-white' : 'stroke-gray-300'}`} />
                                <span className="text-[10px] font-bold leading-tight uppercase tracking-tight">{policy.label}</span>

                                {isActive && (
                                    <CheckCircle size={10} className="absolute top-1 right-1 text-white/40" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 italic px-1 font-medium">
                    * Tap to enable features or permissions for your property.
                </p>
            </div>

        </div>
    );
};

export default StepPropertyDetails;
