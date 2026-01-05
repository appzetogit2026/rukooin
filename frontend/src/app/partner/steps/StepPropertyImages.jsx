import React, { useRef, useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Plus, Image as ImageIcon, X, Star, Loader2, Camera, UserSquare2, LayoutGrid } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepPropertyImages = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [images, setImages] = useState(formData.images || []);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleFileChange = async (e, category) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploading(true);
            const uploadData = new FormData();
            files.forEach(file => uploadData.append('images', file));

            const res = await hotelService.uploadImages(uploadData);

            if (res.success && res.urls) {
                const newImages = res.urls.map(url => ({
                    id: Math.random().toString(36).substr(2, 9),
                    url: url,
                    category: category
                }));

                const updatedImages = [...images, ...newImages];
                setImages(updatedImages);
                updateFormData({ images: updatedImages });
            }
        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (id) => {
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);
        updateFormData({ images: updatedImages });
    };

    const PHOTO_CATEGORIES = [
        { id: 'facade', label: 'Facade / Entrance', min: 4, icon: Camera },
        { id: 'reception', label: 'Reception / Lobby', min: 2, icon: UserSquare2 },
        { id: 'common', label: 'Common Areas', min: 1, icon: LayoutGrid },
    ];

    return (
        <div ref={containerRef} className="pb-10 pt-2 px-1">
            <div className="mb-6 px-1">
                <h3 className="text-xl font-black text-[#003836]">Property Gallery</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    Upload beautiful photos of your property exterior and common areas. Room specific photos will be added in the next steps.
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {PHOTO_CATEGORIES.map((cat) => {
                    const catImages = images.filter(img => img.category === cat.id);
                    return (
                        <div key={cat.id} className="anim-item">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <div className="flex items-center gap-2">
                                    <cat.icon size={16} className="text-[#004F4D]" />
                                    <label className="text-xs font-black text-[#003836] uppercase tracking-wider">{cat.label}</label>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${catImages.length >= cat.min ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {catImages.length >= cat.min ? '✔ COMPLETE' : `MIN ${cat.min} REQUIRED`}
                                </span>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                                {/* Add Button */}
                                <button
                                    onClick={() => !uploading && fileInputRef.current.click() || (fileInputRef.current.dataset.category = cat.id)}
                                    disabled={uploading}
                                    className="shrink-0 w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center bg-gray-50 text-gray-400 active:scale-95 transition-all hover:border-[#004F4D] hover:text-[#004F4D] disabled:opacity-50"
                                >
                                    {uploading && fileInputRef.current?.dataset.category === cat.id ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <Plus size={24} />
                                    )}
                                    <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Add Photo</span>
                                </button>

                                {/* Image Preview List */}
                                {catImages.map((img) => (
                                    <div key={img.id} className="shrink-0 w-28 h-28 rounded-2xl relative overflow-hidden shadow-sm border border-gray-100">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white rounded-full p-1.5 shadow-lg active:scale-90 transition-transform"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const category = fileInputRef.current.dataset.category;
                        handleFileChange(e, category);
                    }}
                />
            </div>

            {/* Hint Box */}
            <div className="mt-10 p-4 bg-[#004F4D]/5 rounded-2xl border border-[#004F4D]/10 anim-item">
                <p className="text-[10px] text-[#004F4D] font-bold uppercase mb-1 flex items-center gap-1.5">
                    <ImageIcon size={12} /> Pro Tip
                </p>
                <p className="text-[11px] text-[#003836]/70 leading-relaxed">
                    Homes with high-quality facade and lobby photos get <b>40% more bookings</b>. Try to upload photos in daylight for best results.
                </p>
            </div>
        </div>
    );
};

export default StepPropertyImages;
