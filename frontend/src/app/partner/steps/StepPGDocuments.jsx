import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { hotelService } from '../../../services/apiService';
import { Upload, CheckCircle, FileText } from 'lucide-react';

const DocItem = ({ id, label, required, documents, onUpload }) => (
  <div className="border p-4 rounded-lg flex items-center justify-between bg-white">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${documents[id] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
        {documents[id] ? <CheckCircle size={20} /> : <FileText size={20} />}
      </div>
      <div>
        <h4 className="font-medium text-gray-800">{label}</h4>
        <p className="text-xs text-gray-500">
          {documents[id] ? 'Uploaded' : required ? 'Mandatory' : 'Optional'}
        </p>
      </div>
    </div>
    <label className="cursor-pointer bg-[#004F4D]/10 text-[#004F4D] px-4 py-2 rounded text-sm font-medium hover:bg-[#004F4D]/20 transition-all">
      {documents[id] ? 'Change' : 'Upload'}
      <input
        type="file"
        className="hidden"
        onChange={(e) => onUpload(e, id)}
        accept=".pdf,.jpg,.png,.jpeg"
      />
    </label>
  </div>
);

const StepPGDocuments = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Documents & Compliance</h2>
        <p className="text-sm text-gray-500">Upload legal documents for verification</p>
      </div>

      <div className="space-y-3">
        <DocItem
          id="ownershipProof"
          label="Property Ownership / Rent Agreement"
          required={true}
          documents={documents}
          onUpload={handleUpload}
        />
        <DocItem
          id="municipalReg"
          label="Municipal Registration"
          required={false}
          documents={documents}
          onUpload={handleUpload}
        />
        <DocItem
          id="fireSafety"
          label="Fire Safety Certificate"
          required={false}
          documents={documents}
          onUpload={handleUpload}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
        <p className="text-sm text-blue-800">
          ℹ️ Your documents will be securely stored and only used for verification purposes.
        </p>
      </div>
    </div>
  );
};

export default StepPGDocuments;
