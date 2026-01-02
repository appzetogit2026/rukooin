import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { MapPin } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';

const StepAddress = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".form-field", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                delay: 0.2,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleChange = (field, value) => {
        updateFormData({
            address: {
                ...formData.address,
                [field]: value
            }
        });
    };

    return (

        <div ref={containerRef} className="pt-2 md:pt-6">
            <h2 className="text-xl md:text-3xl font-bold text-partner-text-primary mb-4 md:hidden">Where is it?</h2>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">

                <div className="form-field">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 block">Address Line</label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-1 ring-[#004F4D] transition-all bg-white">
                        <MapPin size={18} className="text-gray-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            className="w-full outline-none font-medium placeholder:text-gray-300 text-sm"
                            placeholder="House No, Street, Area"
                            value={formData.address?.line1 || ''}
                            onChange={(e) => handleChange('line1', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="form-field">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 block">City</label>
                        <input
                            type="text"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium focus:border-[#004F4D] transition-colors bg-white text-sm"
                            placeholder="City"
                            value={formData.address?.city || ''}
                            onChange={(e) => handleChange('city', e.target.value)}
                        />
                    </div>
                    <div className="form-field">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 block">Pincode</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium focus:border-[#004F4D] transition-colors bg-white text-sm"
                            placeholder="000000"
                            value={formData.address?.pincode || ''}
                            onChange={(e) => handleChange('pincode', e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-field">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 block">State</label>
                    <select
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium focus:border-[#004F4D] transition-colors bg-white appearance-none text-sm bg-transparent"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                    >
                        <option value="">Select State</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-field">
                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 block">Nearby Landmark (Optional)</label>
                    <input
                        type="text"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium focus:border-[#004F4D] transition-colors bg-white text-sm"
                        placeholder="e.g. Near Metro Station"
                        value={formData.address?.landmark || ''}
                        onChange={(e) => handleChange('landmark', e.target.value)}
                    />
                </div>

            </form>
        </div>
    );
};

export default StepAddress;
