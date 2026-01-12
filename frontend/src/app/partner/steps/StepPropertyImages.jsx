import React, { useRef } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Upload, X } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepPropertyImages = () => {
    const { formData, updateFormData } = usePartnerStore();
    const { images = { cover: '', gallery: [] } } = formData;
    const gallery = images.gallery || [];

    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const uploadData = new FormData();
        files.forEach(file => uploadData.append('images', file));

        try {
            // Assuming this service returns { success: true, urls: ['...'] }
            const response = await hotelService.uploadImages(uploadData);

            if (response.urls) {
                if (type === 'cover') {
                    updateFormData({ images: { ...images, cover: response.urls[0] } });
                } else {
                    updateFormData({ images: { ...images, gallery: [...gallery, ...response.urls] } });
                }
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        }
    };

    const removeGalleryImage = (index) => {
        const newGallery = gallery.filter((_, i) => i !== index);
        updateFormData({ images: { ...images, gallery: newGallery } });
    };

    return (
        <div className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700">Cover Image *</h3>
                <div
                    onClick={() => coverInputRef.current?.click()}
                    className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 bg-cover bg-center"
                    style={{ backgroundImage: images.cover ? `url(${images.cover})` : 'none' }}
                >
                    {!images.cover && (
                        <div className="flex flex-col items-center text-gray-400">
                            <Upload size={24} />
                            <span className="text-xs mt-1">Upload Cover</span>
                        </div>
                    )}
                    <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handleUpload(e, 'cover')} accept="image/*" />
                </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-700">Gallery Images (Min 5) *</h3>
                <div className="grid grid-cols-3 gap-2">
                    {gallery.map((url, i) => (
                        <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                            <img src={url} className="w-full h-full object-cover" alt="Gallery" />
                            <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400"
                    >
                        <Upload size={20} />
                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => handleUpload(e, 'gallery')} accept="image/*" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepPropertyImages;
