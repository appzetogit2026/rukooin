import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { authService } from '../../../services/apiService';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ label, value, onChange, placeholder = "Upload Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('File size too large (max 5MB)');
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

  const clearImage = () => {
    onChange('');
    setError('');
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-2">{label}</label>

      {value ? (
        <div className="relative group">
          <div className="h-32 w-full rounded-xl bg-gray-50 border border-gray-200 overflow-hidden relative">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
              type="button"
            >
              <X size={14} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-[10px] truncate text-center font-medium">Uploaded Successfully</p>
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

  return (
    <div className="space-y-6">
      {/* Name Section */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Name</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Registered owner full name"
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
            value={formData.aadhaar_number}
            onChange={e => handleChange('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ImageUploader
            label="Front Image"
            value={formData.aadhaar_front}
            onChange={(url) => handleChange('aadhaar_front', url)}
            placeholder="Front Side"
          />
          <ImageUploader
            label="Back Image"
            value={formData.aadhaar_back}
            onChange={(url) => handleChange('aadhaar_back', url)}
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
              value={formData.pan_number}
              onChange={e => handleChange('pan_number', e.target.value.toUpperCase().slice(0, 10))}
            />
          </div>
          <ImageUploader
            label="PAN Card Image"
            value={formData.pan_card_image}
            onChange={(url) => handleChange('pan_card_image', url)}
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
          value={formData.owner_address?.street || ''}
          onChange={e => handleAddressChange('street', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="City"
            value={formData.owner_address?.city || ''}
            onChange={e => handleAddressChange('city', e.target.value)}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="State"
            value={formData.owner_address?.state || ''}
            onChange={e => handleAddressChange('state', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Pincode"
            maxLength={6}
            value={formData.owner_address?.zipCode || ''}
            onChange={e => handleAddressChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Country"
            readOnly
            value={formData.owner_address?.country || 'India'}
            onChange={e => handleAddressChange('country', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOwnerDetails;
