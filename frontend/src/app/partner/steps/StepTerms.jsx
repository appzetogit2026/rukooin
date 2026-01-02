import React, { useRef, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { ScrollText, Check } from 'lucide-react';

const StepTerms = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const toggleAgreement = () => {
        updateFormData({ termsAccepted: !formData.termsAccepted });
    };

    return (
        <div ref={containerRef} className="pb-24 pt-2 px-1 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-[#003836] px-1 flex items-center gap-2">
                <ScrollText size={20} /> Partner Agreement
            </h3>

            {/* Scrollable Terms Content */}
            <div className="anim-item flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 overflow-y-auto max-h-[50vh] mb-6 shadow-inner">
                <div className="prose prose-sm prose-gray">
                    <h4 className="font-bold text-[#003836]">1. Introduction</h4>
                    <p>Welcome to Rokkooin Partner Program. By listing your property...</p>

                    <h4 className="font-bold text-[#003836] mt-4">2. Commission & Payments</h4>
                    <p>Rokkooin charges a flat 15% commission on all confirmed bookings. Payouts are processed weekly via NEFT/IMPS...</p>

                    <h4 className="font-bold text-[#003836] mt-4">3. Operating Standards</h4>
                    <p>Partners must maintain high cleanliness standards. Any guest complaints regarding hygiene may lead to delisting...</p>

                    <h4 className="font-bold text-[#003836] mt-4">4. Cancellation Policy</h4>
                    <p>Guests can cancel up to 24 hours before check-in for a full refund. As a partner, you agree to these terms...</p>

                    <p className="mt-4 text-xs text-gray-400">Last updated: Dec 2024</p>
                </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="anim-item px-1">
                <button
                    onClick={toggleAgreement}
                    className="flex items-start gap-4 p-4 rounded-2xl border transition-all w-full text-left bg-white shadow-sm hover:border-[#004F4D] group"
                    style={{ borderColor: formData.termsAccepted ? '#004F4D' : '#e5e7eb' }}
                >
                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.termsAccepted ? 'bg-[#004F4D] border-[#004F4D] text-white' : 'border-gray-300 bg-white text-transparent'
                        }`}>
                        <Check size={14} strokeWidth={4} />
                    </div>
                    <div>
                        <span className="block font-bold text-[#003836] text-sm">I accept the Terms & Conditions</span>
                        <span className="block text-xs text-gray-500 mt-0.5">By clicking this, I agree to the policies mentioned above.</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default StepTerms;
