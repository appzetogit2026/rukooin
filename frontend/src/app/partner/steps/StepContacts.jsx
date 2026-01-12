import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepContacts = () => {
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
      <h2 className="text-2xl font-bold text-[#003836]">Contacts & Operations</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reception Phone *</label>
          <input type="tel" name="receptionPhone" value={contacts.receptionPhone || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="+91..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Manager Phone *</label>
          <input type="tel" name="managerPhone" value={contacts.managerPhone || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="+91..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact (Optional)</label>
          <input type="tel" name="emergencyContact" value={contacts.emergencyContact || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="+91..." />
        </div>
      </div>
    </div>
  );
};

export default StepContacts;
