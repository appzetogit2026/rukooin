import React, { useState, useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';
import { authService } from '../../../services/apiService';
import { Upload, X, Check, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ImageUploader = ({ label, value, onChange, placeholder = "Upload Image", onView }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size too large (max 10MB)');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('files', file);

      const res = await authService.uploadDocs(fd);
      if (res.success && res.urls && res.urls.length > 0) {
        onChange(res.urls[0]);
      } else {
        setError('Upload failed');
      }
    } catch (err) {
      console.error(err);
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    onChange('');
    setError('');
  };

  return (
    <div className="flex flex-col h-full">
      <label className="block text-xs font-bold text-gray-500 mb-2 truncate">{label}</label>

      {value ? (
        <div className="relative group h-32 w-full rounded-xl bg-gray-50 border border-gray-200 overflow-hidden shadow-sm">
          <img src={value} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => onView(value)}
              className="p-2 bg-white rounded-full text-[#004F4D] hover:bg-emerald-50 transition-colors shadow-lg"
              title="View Image"
              type="button"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={clearImage}
              className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg"
              title="Remove Image"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />
          <div className={`
             border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors
             ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-[#004F4D] hover:bg-[#004F4D]/5 bg-gray-50'}
          `}>
            {uploading ? (
              <Loader2 size={24} className="text-[#004F4D] animate-spin" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                <Upload size={16} />
              </div>
            )}
            <div className="text-center">
              <p className="text-xs font-bold text-gray-600">
                {uploading ? 'Uploading...' : placeholder}
              </p>
              {error ? (
                <p className="text-[10px] text-red-500 mt-1">{error}</p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-1">Tap to select</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StepOwnerDetails = () => {
  const { formData, updateFormData } = usePartnerStore();
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleAddressChange = (field, value) => {
    updateFormData({
      owner_address: {
        ...(formData.owner_address || {}),
        [field]: value
      }
    });
  };

  const handleFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-xl"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
            >
              <X size={28} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center text-white/50 text-sm font-medium">
                Tap anywhere outside to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Name Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Name</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Registered owner full name"
          onFocus={handleFocus}
          value={formData.owner_name}
          onChange={e => handleChange('owner_name', e.target.value)}
        />
      </div>

      {/* Aadhaar Section */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-black text-[#003836]">Aadhaar Verification</h3>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Aadhaar Number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D] tracking-widest font-mono"
            placeholder="XXXX XXXX XXXX"
            maxLength={12}
            onFocus={handleFocus}
            value={formData.aadhaar_number}
            onChange={e => handleChange('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ImageUploader
            label="Front Image"
            value={formData.aadhaar_front}
            onChange={(url) => handleChange('aadhaar_front', url)}
            onView={setPreviewImage}
            placeholder="Front Side"
          />
          <ImageUploader
            label="Back Image"
            value={formData.aadhaar_back}
            onChange={(url) => handleChange('aadhaar_back', url)}
            onView={setPreviewImage}
            placeholder="Back Side"
          />
        </div>
      </div>

      {/* PAN Section */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-black text-[#003836]">PAN Verification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">PAN Number</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#004F4D] font-mono"
              placeholder="ABCDE1234F"
              maxLength={10}
              onFocus={handleFocus}
              value={formData.pan_number}
              onChange={e => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                handleChange('pan_number', val.slice(0, 10));
              }}
            />
          </div>
          <ImageUploader
            label="PAN Card Image"
            value={formData.pan_card_image}
            onChange={(url) => handleChange('pan_card_image', url)}
            onView={setPreviewImage}
            placeholder="Upload PAN"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-black text-[#003836]">Owner Address</h3>

        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Street address (House No, Building, Street)"
          onFocus={handleFocus}
          value={formData.owner_address?.street || ''}
          onChange={e => handleAddressChange('street', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="City"
            onFocus={handleFocus}
            value={formData.owner_address?.city || ''}
            onChange={e => handleAddressChange('city', e.target.value)}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="State"
            onFocus={handleFocus}
            value={formData.owner_address?.state || ''}
            onChange={e => handleAddressChange('state', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Pincode"
            maxLength={6}
            onFocus={handleFocus}
            value={formData.owner_address?.zipCode || ''}
            onChange={e => handleAddressChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Country"
            readOnly
            onFocus={handleFocus}
            value={formData.owner_address?.country || 'India'}
            onChange={e => handleAddressChange('country', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOwnerDetails;
