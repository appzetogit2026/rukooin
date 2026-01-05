import React, { useRef, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Wifi, Tv, Car, Utensils, Wine, Waves, Dumbbell, Sparkles, ConciergeBell, Zap, ArrowUpFromLine, Coffee, Check, ShieldCheck, ThermometerSun, Building2, MonitorDot, Shirt, Stethoscope, Eye, Flame, PlusSquare } from 'lucide-react';

const MUST_HAVES = [
    { id: 'wifi', label: 'Free Wifi', icon: Wifi },
    { id: 'ac', label: 'AC', icon: Zap },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'room_service', label: 'Service', icon: ConciergeBell },
    { id: 'power_backup', label: 'Backup', icon: Zap },
    { id: 'housekeeping', label: 'Cleaning', icon: Sparkles },
    { id: 'hot_water', label: 'Hot Water', icon: ThermometerSun },
    { id: 'reception', label: '24h Front', icon: ShieldCheck },
];

const EXTRAS = [
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'restaurant', label: 'Dine-in', icon: Utensils },
    { id: 'bar', label: 'Bar', icon: Wine },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'elevator', label: 'Lift', icon: ArrowUpFromLine },
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'spa', label: 'Spa', icon: Sparkles },
    { id: 'banquet', label: 'Banquet', icon: Building2 },
    { id: 'conference', label: 'Meeting', icon: MonitorDot },
    { id: 'laundry', label: 'Laundry', icon: Shirt },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
];

const SAFETY_LIST = [
    { id: 'cctv', label: 'CCTV', icon: Eye },
    { id: 'security', label: 'Guard', icon: ShieldCheck },
    { id: 'fire', label: 'Fire Ext.', icon: Flame },
    { id: 'first_aid', label: 'First Aid', icon: PlusSquare },
];

const StepFacilities = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const selectedFacilities = formData.facilities || [];

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.2)' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const toggleFacility = (id) => {
        const newFacilities = selectedFacilities.includes(id)
            ? selectedFacilities.filter(f => f !== id)
            : [...selectedFacilities, id];
        updateFormData({ facilities: newFacilities });
    };

    const renderGrid = (items) => (
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
            {items.map((facility) => {
                const isSelected = selectedFacilities.includes(facility.id);
                return (
                    <button
                        key={facility.id}
                        onClick={() => toggleFacility(facility.id)}
                        className={`anim-item flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 aspect-square active:scale-95 touch-manipulation relative overflow-hidden ${isSelected
                            ? 'border-[#004F4D] bg-[#004F4D] text-white shadow-md'
                            : 'border-gray-200 bg-white text-gray-500'
                            }`}
                    >
                        <facility.icon size={18} strokeWidth={2} className={`mb-1 ${isSelected ? 'stroke-white' : 'stroke-gray-400'}`} />
                        <span className="text-[9px] md:text-[10px] font-bold leading-tight text-center px-1 truncate w-full">{facility.label}</span>
                        {isSelected && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        )}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div ref={containerRef} className="pb-10 pt-2 px-1">

            {/* Must Haves Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-[#004F4D]" />
                    <h3 className="text-xs font-black text-[#004F4D] uppercase tracking-wider">Must-Have Essentials</h3>
                </div>
                {renderGrid(MUST_HAVES)}
            </div>

            {/* Extras Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Sparkles size={16} className="text-amber-500" />
                    <h3 className="text-xs font-black text-[#004F4D] uppercase tracking-wider">Additional Perks</h3>
                </div>
                {renderGrid(EXTRAS)}
            </div>

            {/* Safety Section */}
            <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <Eye size={16} className="text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Safety & Security</h3>
                </div>
                {renderGrid(SAFETY_LIST)}
            </div>

        </div>
    );
};

export default StepFacilities;
