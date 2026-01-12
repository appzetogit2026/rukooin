import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Upload, X, Image } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepResortGallery = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { gallery = {} } = formData;
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e, category) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadData = new FormData();
    files.forEach(file => uploadData.append('images', file));

    try {
      const response = await hotelService.uploadImages(uploadData);
      if (response.urls) {
        updateFormData({
          gallery: {
            ...gallery,
            [category]: [...(gallery[category] || []), ...response.urls]
          }
        });
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (category, index) => {
    updateFormData({
      gallery: {
        ...gallery,
        [category]: gallery[category].filter((_, i) => i !== index)
      }
    });
  };

  const renderGallerySection = (category, label, minImages) => (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-md">{label} *</h3>
        <span className="text-xs text-gray-500">Min {minImages} images</span>
      </div>

      {/* Upload Button */}
      <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#004F4D] hover:bg-white transition-all mb-3">
        <Upload size={18} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-600">
          {uploading ? 'Uploading...' : 'Click to upload'}
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(e, category)}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* Image Preview Grid */}
      {gallery[category] && gallery[category].length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {gallery[category].map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`${label} ${idx + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                onClick={() => removeImage(category, idx)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className={`text-xs mt-2 ${(gallery[category]?.length || 0) >= minImages ? 'text-green-600' : 'text-orange-600'}`}>
        {gallery[category]?.length || 0} / {minImages} images uploaded
        {(gallery[category]?.length || 0) >= minImages && ' ✓'}
      </p>
    </div>
  );

  const totalImages = Object.values(gallery).flat().length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Gallery & Media</h2>
        <p className="text-sm text-gray-500">Upload high-quality images showcasing your resort</p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm border border-yellow-200">
        ⚠️ <strong>Image Quality:</strong> Upload clear, high-resolution images. Poor quality images may delay approval.
      </div>

      <div className="space-y-4">
        {renderGallerySection('exterior', 'Resort Exterior', 3)}
        {renderGallerySection('lobby', 'Lobby / Reception', 2)}
        {renderGallerySection('pool', 'Swimming Pool / Water Features', 2)}
        {renderGallerySection('restaurant', 'Restaurant / Dining Area', 2)}
        {renderGallerySection('activities', 'Activities & Recreation', 2)}
        {renderGallerySection('landscape', 'Landscape / Gardens', 2)}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h3 className="font-bold text-md mb-3">Promo Video (Optional)</h3>
        <p className="text-sm text-gray-500 mb-3">Upload a short promotional video (max 2 minutes, up to 50MB)</p>
        <input
          type="text"
          placeholder="Paste YouTube or Vimeo link"
          value={gallery.videoUrl || ''}
          onChange={(e) => updateFormData({ gallery: { ...gallery, videoUrl: e.target.value } })}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>{totalImages}</strong> images uploaded across all categories. Premium galleries improve booking conversion by 70%!
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Images depicting the resort experience (happy guests, activities, dining) perform better than just empty rooms.
        </p>
      </div>
    </div>
  );
};

export default StepResortGallery;
