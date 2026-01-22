import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Upload, X } from 'lucide-react';
import { authService } from '../../../services/apiService';

const StepOwnerDetails = () => {
  const { formData, updateFormData } = usePartnerStore();
  const [uploading, setUploading] = useState({}); // { fieldName: boolean }

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

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    const data = new FormData();
    data.append('images', file); // 'images' matches _uploadMiddleware

    try {
      const response = await authService.uploadDocs(data);
      if (response.success && response.urls.length > 0) {
        handleChange(field, response.urls[0]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const renderUploadField = (label, field, placeholder) => {
    const value = formData[field];
    const isUploading = uploading[field];

    return (
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
        {value ? (
           <div className="relative w-full border border-green-200 bg-green-50 rounded-xl px-3 py-2 flex items-center justify-between">
             <span className="text-xs text-green-700 truncate flex-1">{value.split('/').pop()}</span>
             <button 
               onClick={() => handleChange(field, '')}
               className="ml-2 text-red-500 hover:text-red-700"
             >
               <X size={16} />
             </button>
             <a href={value} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 text-xs underline">View</a>
           </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`file-${field}`}
              onChange={(e) => handleFileUpload(field, e.target.files[0])}
              disabled={isUploading}
            />
            <label 
              htmlFor={`file-${field}`}
              className={`w-full border-2 border-dashed ${isUploading ? 'border-gray-300 bg-gray-100' : 'border-gray-300 hover:border-[#004F4D] hover:bg-gray-50'} rounded-xl px-3 py-3 flex flex-col items-center justify-center cursor-pointer transition-colors`}
            >
              {isUploading ? (
                <span className="text-xs text-gray-500 animate-pulse">Uploading...</span>
              ) : (
                <>
                  <Upload size={16} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">{placeholder}</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Owner Name */}
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Name</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Registered owner full name"
          value={formData.owner_name || ''}
          onChange={e => handleChange('owner_name', e.target.value)}
        />
      </div>

      {/* Aadhaar Section */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Aadhaar Number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="12-digit Aadhaar number"
            value={formData.aadhaar_number || ''}
            onChange={e => handleChange('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {renderUploadField('Aadhaar Front', 'aadhaar_front', 'Upload Front')}
          {renderUploadField('Aadhaar Back', 'aadhaar_back', 'Upload Back')}
        </div>
      </div>

      {/* PAN Section */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">PAN Number</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="10-digit PAN number"
            value={formData.pan_number || ''}
            onChange={e => handleChange('pan_number', e.target.value.toUpperCase().slice(0, 10))}
          />
        </div>
        <div>
           {renderUploadField('PAN Card Image', 'pan_card_image', 'Upload PAN Card')}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 mb-1">Owner Address</label>
        <input
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
          placeholder="Street address"
          value={formData.owner_address?.street || ''}
          onChange={e => handleAddressChange('street', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
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
        <div className="grid grid-cols-2 gap-2">
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Pincode"
            value={formData.owner_address?.zipCode || ''}
            onChange={e => handleAddressChange('zipCode', e.target.value)}
          />
          <input
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004F4D]"
            placeholder="Country"
            value={formData.owner_address?.country || ''}
            onChange={e => handleAddressChange('country', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default StepOwnerDetails;