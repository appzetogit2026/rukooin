import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { hotelService } from '../../../services/apiService';

const StepHostelDocuments = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { documents = {} } = formData;

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('images', file);

    try {
      const response = await hotelService.uploadImages(uploadData);
      if (response.urls && response.urls[0]) {
        updateFormData({
          documents: { ...documents, [type]: response.urls[0] }
        });
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Document upload failed');
    }
  };

  const renderDocUpload = (key, label, required = true) => (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${documents[key] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
          {documents[key] ? <CheckCircle size={20} /> : <FileText size={20} />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-700">{label}</h4>
          <p className="text-xs text-gray-400">
            {documents[key] ? '✓ Uploaded' : (required ? 'Required' : 'Optional')}
          </p>
        </div>
      </div>

      <label className="cursor-pointer bg-gray-50 hover:bg-[#004F4D]/5 text-[#004F4D] px-4 py-2 rounded text-xs font-bold border border-[#004F4D]/20 transition-colors">
        {documents[key] ? 'Change' : 'Upload'}
        <input type="file" className="hidden" onChange={(e) => handleUpload(e, key)} accept=".pdf,.jpg,.png,.jpeg" />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Legal & Compliance Documents</h2>
        <p className="text-sm text-gray-500">Upload required documents for verification</p>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm mb-4 border border-yellow-200">
        ⚠️ Please upload clear, legible documents. All hostels must comply with local regulations.
      </div>

      <div className="space-y-3">
        {renderDocUpload('ownershipProof', '📄 Ownership Proof (Deed / Lease Agreement)', true)}
        {renderDocUpload('localRegistration', '🏛️ Local Registration / Tourism License', true)}
        {renderDocUpload('fireSafety', '🚒 Fire Safety Certificate', true)}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Verification:</strong> Documents will be reviewed within 24-48 hours. Your hostel will be listed after approval.
        </p>
      </div>
    </div>
  );
};

export default StepHostelDocuments;
