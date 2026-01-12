import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHostelContacts = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { contacts = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      contacts: { ...contacts, [name]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Contact & Operations</h2>
        <p className="text-sm text-gray-500">Provide contact details for hostel operations</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reception Phone *</label>
          <input
            type="tel"
            name="receptionPhone"
            value={contacts.receptionPhone || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="+91 9876543210"
          />
          <p className="text-xs text-gray-500 mt-1">Front desk contact for guests</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Manager Phone *</label>
          <input
            type="tel"
            name="managerPhone"
            value={contacts.managerPhone || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="+91 9876543211"
          />
          <p className="text-xs text-gray-500 mt-1">Manager for booking queries and issues</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact *</label>
          <input
            type="tel"
            name="emergencyContact"
            value={contacts.emergencyContact || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="+91 9876543212"
          />
          <p className="text-xs text-gray-500 mt-1">24/7 emergency contact number</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Important:</strong> These numbers will be shared with confirmed guests. Ensure they are active and monitored.
        </p>
      </div>
    </div>
  );
};

export default StepHostelContacts;
