import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { Upload, CheckCircle, Smartphone } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepOwnerDetails = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { owner_address = {} } = formData;

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('images', file);

    try {
      const response = await hotelService.uploadImages(uploadData);
      if (response.urls && response.urls[0]) {
        updateFormData({ [field]: response.urls[0] });
      }
    } catch (error) {
      console.error('Upload failed', error);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      owner_address: { ...owner_address, [name]: value }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const renderUploadBtn = (field, label) => (
    <label className={`
            flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all
            ${formData[field] ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300 hover:bg-gray-50'}
        `}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type="file" className="hidden" onChange={(e) => handleUpload(e, field)} accept="image/*" />
      {formData[field] ? <CheckCircle size={18} className="text-green-600" /> : <Upload size={18} className="text-gray-400" />}
    </label>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Identity Verification</h2>

      {/* Owner Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name (As per ID)</label>
          <input name="owner_name" value={formData.owner_name || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
            <input name="aadhaar_number" value={formData.aadhaar_number || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" maxLength={12} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <input name="pan_number" value={formData.pan_number || ''} onChange={handleChange} className="w-full p-3 border rounded-lguppercase" maxLength={10} style={{ textTransform: 'uppercase' }} />
          </div>
        </div>

        {/* Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderUploadBtn('aadhaar_front', 'Aadhaar Front')}
          {renderUploadBtn('aadhaar_back', 'Aadhaar Back')}
          {renderUploadBtn('pan_card_image', 'PAN Card')}
        </div>
      </div>

      <hr />

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Permanent Address</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
          <input name="street" value={owner_address.street || ''} onChange={handleAddressChange} className="w-full p-3 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input name="city" value={owner_address.city || ''} onChange={handleAddressChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input name="zipCode" value={owner_address.zipCode || ''} onChange={handleAddressChange} className="w-full p-3 border rounded-lg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input name="state" value={owner_address.state || ''} onChange={handleAddressChange} className="w-full p-3 border rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default StepOwnerDetails;
