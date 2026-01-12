import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepVillaContacts = () => {
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
        <h2 className="text-2xl font-bold text-[#003836]">Contact & Management</h2>
        <p className="text-sm text-gray-500">Provide contact details for property management</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caretaker Phone *</label>
          <input
            type="tel"
            name="caretakerPhone"
            value={contacts.caretakerPhone || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="+91 9876543210"
          />
          <p className="text-xs text-gray-500 mt-1">On-site caretaker or property manager</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Phone *</label>
          <input
            type="tel"
            name="managerPhone"
            value={contacts.managerPhone || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="+91 9876543211"
          />
          <p className="text-xs text-gray-500 mt-1">Primary contact for bookings and queries</p>
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
          <p className="text-xs text-gray-500 mt-1">24/7 reachable number for emergencies</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ <strong>Important:</strong> These numbers will be shared with confirmed guests only. Keep them active and reachable.
        </p>
      </div>
    </div>
  );
};

export default StepVillaContacts;
