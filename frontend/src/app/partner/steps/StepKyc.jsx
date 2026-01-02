import React, { useRef, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { FileText, UploadCloud, CheckCircle } from 'lucide-react';

const StepKyc = () => {
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

    // Helper for file inputs (simulated)
    const handleFile = (field, e) => {
        if (e.target.files[0]) {
            // In a real app, upload to server. Here we just store the fake name/url
            updateFormData({ [field]: e.target.files[0].name });
        }
    };

    return (
        <div ref={containerRef} className="pb-24 pt-2 px-1">
            <div className="anim-item mb-6">
                <h3 className="text-xl font-bold text-[#003836] mb-1">Verify Identity</h3>
                <p className="text-gray-500 text-sm">We need to verify your business details.</p>
            </div>

            {/* 1. Document Type Selection */}
            <div className="anim-item mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Document Type</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {['GST Certificate', 'PAN Card', 'Aadhaar'].map((type) => (
                        <button
                            key={type}
                            onClick={() => updateFormData({ kycDocType: type })}
                            className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-bold border transition-all ${formData.kycDocType === type
                                ? 'bg-[#004F4D] text-white border-[#004F4D]'
                                : 'bg-white text-gray-500 border-gray-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. ID Number Input */}
            <div className="anim-item mb-8">
                <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 focus-within:bg-white focus-within:border-[#004F4D] focus-within:ring-1 focus-within:ring-[#004F4D] transition-all shadow-sm">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                        {formData.kycDocType ? `${formData.kycDocType} Number` : 'Document Number'}
                    </label>
                    <input
                        type="text"
                        placeholder="ABCDE1234F"
                        className="w-full bg-transparent border-none p-0 text-lg font-bold text-[#003836] placeholder-gray-300 focus:ring-0 uppercase"
                        value={formData.kycIdNumber || ''}
                        onChange={(e) => updateFormData({ kycIdNumber: e.target.value.toUpperCase() })}
                    />
                </div>
            </div>

            {/* 3. Upload Areas */}
            <div className="anim-item grid grid-cols-1 gap-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Upload Document</label>

                {['Front', 'Back'].map((side) => {
                    const fieldName = `kycDoc${side}`;
                    const hasFile = formData[fieldName];

                    return (
                        <div key={side} className={`relative rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center cursor-pointer group ${hasFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleFile(fieldName, e)}
                            />
                            {hasFile ? (
                                <>
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                        <CheckCircle size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-green-800">{String(hasFile).slice(0, 15)}...</span>
                                    <span className="text-xs text-green-600">Tap to change</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-white shadow-sm text-gray-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">{side} Side</span>
                                    <span className="text-xs text-gray-400">Tap to upload</span>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default StepKyc;
