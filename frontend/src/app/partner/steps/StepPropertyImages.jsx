import React, { useRef, useEffect, useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import gsap from 'gsap';
import { Plus, Image as ImageIcon, X, Star } from 'lucide-react';

const StepPropertyImages = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    // Simulating local preview state (in real app, this would be File objects or URLs)
    const [images, setImages] = useState(formData.images || []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.anim-item',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleFileChange = (e, category = 'general') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImage = {
                    id: Date.now(),
                    url: event.target.result,
                    file: file,
                    category: category
                };
                const updatedImages = [...images, newImage];
                setImages(updatedImages);
                updateFormData({ images: updatedImages });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (id) => {
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);
        updateFormData({ images: updatedImages });
    };

    return (
        <div ref={containerRef} className="pb-10 pt-2 px-1">
            <h3 className="text-xl font-bold mb-2 text-gray-900 px-1 md:hidden">Add Photos</h3>
            <p className="text-gray-500 text-xs mb-4 px-1">Upload photos for each category to proceed.</p>

            <div className="flex flex-col gap-6">
                {/* 1. Facade (Min 1) */}
                <div className="anim-item">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Facade / Entrance</label>
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">Min 1</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {/* Add Button for Facade */}
                        <button
                            onClick={() => fileInputRef.current.click() || (fileInputRef.current.dataset.category = 'facade')}
                            className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-gray-400 flex flex-col items-center justify-center bg-gray-50 text-gray-400 active:scale-95 touch-manipulation"
                        >
                            <Plus size={20} />
                            <span className="text-[8px] font-bold mt-1 uppercase">Add</span>
                        </button>

                        {/* Images */}
                        {images.filter(img => img.category === 'facade').map((img) => (
                            <div key={img.id} className="shrink-0 w-24 h-24 rounded-xl relative overflow-hidden">
                                <img src={img.url} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Bedroom (Min 2) */}
                <div className="anim-item">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bedroom</label>
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">Min 2</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => fileInputRef.current.click() || (fileInputRef.current.dataset.category = 'bedroom')}
                            className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-gray-400 flex flex-col items-center justify-center bg-gray-50 text-gray-400 active:scale-95 touch-manipulation"
                        >
                            <Plus size={20} />
                            <span className="text-[8px] font-bold mt-1 uppercase">Add</span>
                        </button>
                        {images.filter(img => img.category === 'bedroom').map((img) => (
                            <div key={img.id} className="shrink-0 w-24 h-24 rounded-xl relative overflow-hidden">
                                <img src={img.url} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Bathroom (Min 2) */}
                <div className="anim-item">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bathroom</label>
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">Min 2</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => fileInputRef.current.click() || (fileInputRef.current.dataset.category = 'bathroom')}
                            className="shrink-0 w-24 h-24 rounded-xl border border-dashed border-gray-400 flex flex-col items-center justify-center bg-gray-50 text-gray-400 active:scale-95 touch-manipulation"
                        >
                            <Plus size={20} />
                            <span className="text-[8px] font-bold mt-1 uppercase">Add</span>
                        </button>
                        {images.filter(img => img.category === 'bathroom').map((img) => (
                            <div key={img.id} className="shrink-0 w-24 h-24 rounded-xl relative overflow-hidden">
                                <img src={img.url} className="w-full h-full object-cover" />
                                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={10} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const category = fileInputRef.current.dataset.category;
                        handleFileChange(e, category);
                    }}
                />
            </div>
        </div>
    );
};

export default StepPropertyImages;
