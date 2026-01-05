import React, { useRef, useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { FileText, UploadCloud, CheckCircle, Loader2, Smartphone, Mail } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepKyc = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const [uploading, setUploading] = useState(null); // 'front' or 'back'

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const updateKyc = (updates) => {
        updateFormData({ kyc: { ...(formData.kyc || {}), ...updates } });
    };

    const handleFileUpload = async (side, e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(side);
            const uploadData = new FormData();
            uploadData.append('images', file);

            const res = await hotelService.uploadImages(uploadData);
            if (res.success && res.urls?.[0]) {
                updateKyc({ [`doc${side}`]: res.urls[0] });
            }
        } catch (error) {
            alert('Document upload failed');
        } finally {
            setUploading(null);
        }
    };

    return (
        <div ref={containerRef} className="pb-10 pt-2 px-1">
            <div className="anim-item mb-8">
                <h3 className="text-xl font-black text-[#003836] mb-1">Identity & Business</h3>
                <p className="text-xs text-gray-400 font-medium">Verified properties build trust with guests.</p>
            </div>

            {/* Contact Details */}
            <div className="anim-item mb-8">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block flex items-center gap-2">
                    <Smartphone size={14} /> Contact Information
                </label>
                <div className="space-y-3">
                    <div className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 focus-within:bg-white focus-within:border-[#004F4D] transition-all shadow-sm">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5 block">Primary Phone</label>
                        <div className="flex items-center gap-2">
                            <span className="text-base font-black text-gray-400">+91</span>
                            <input
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                className="w-full bg-transparent border-none p-0 text-base font-black text-[#003836] placeholder-gray-300 focus:ring-0"
                                value={formData.phone || ''}
                                onChange={(e) => updateFormData({ phone: e.target.value.replace(/\D/g, '') })}
                            />
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl px-5 py-3 border border-gray-100 focus-within:bg-white focus-within:border-[#004F4D] transition-all shadow-sm">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5 block flex items-center gap-1">
                            <Mail size={10} /> Business Email
                        </label>
                        <input
                            type="email"
                            placeholder="business@example.com"
                            className="w-full bg-transparent border-none p-0 text-base font-black text-[#003836] placeholder-gray-300 focus:ring-0"
                            value={formData.email || ''}
                            onChange={(e) => updateFormData({ email: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* ID Number Input */}
            <div className="anim-item mb-8">
                <div className="bg-gray-50 rounded-2xl px-5 py-4 border-2 border-[#004F4D]/10 focus-within:bg-white focus-within:border-[#004F4D] transition-all shadow-inner">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                        Enter 12-Digit Aadhaar Number
                    </label>
                    <input
                        type="text"
                        placeholder="0000 0000 0000"
                        maxLength={12}
                        className="w-full bg-transparent border-none p-0 text-xl font-black text-[#003836] placeholder-gray-200 focus:ring-0 uppercase tracking-widest"
                        value={formData.kyc?.idNumber || ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                            updateKyc({ docType: 'Aadhaar Card', idNumber: val });
                        }}
                    />
                </div>
            </div>

            {/* Upload Areas */}
            <div className="anim-item grid grid-cols-1 gap-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Upload High-Res Photos</label>

                {['Front', 'Back'].map((side) => {
                    const sideKey = `doc${side}`;
                    const url = formData.kyc?.[sideKey];
                    const isUploading = uploading === side;

                    return (
                        <div key={side} className={`relative rounded-3xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${url ? 'border-green-500 bg-green-50/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={isUploading}
                                onChange={(e) => handleFileUpload(side, e)}
                            />

                            {url ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-green-500 shrink-0">
                                        <img src={url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-green-700 uppercase">{side} Side Uploaded</p>
                                        <p className="text-[10px] text-green-600 font-bold">Tap to replace document</p>
                                    </div>
                                    <CheckCircle size={24} className="text-green-500" />
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white shadow-md text-[#004F4D] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                                    </div>
                                    <span className="text-xs font-black text-[#003836] uppercase tracking-widest">{isUploading ? 'Uploading...' : `${side} Side`}</span>
                                    <span className="text-[10px] text-gray-400 mt-1 font-bold">PDF, JPG or PNG</span>
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
