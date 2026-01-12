import React, { useEffect } from 'react';
import usePartnerStore from '../store/partnerStore';

const StepHotelPolicies = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { policies = {} } = formData;

  useEffect(() => {
    const defaults = {
      checkInTime: '12:00',
      checkOutTime: '11:00',
      earlyCheckIn: 'No',
      lateCheckOut: 'No',
      idProofMandatory: 'Yes',
      coupleFriendly: 'Yes',
      localIdsAllowed: 'No',
      petFriendly: 'No',
      cancellationPolicy: 'Non-Refundable'
    };

    const updates = {};
    let hasUpdates = false;

    Object.keys(defaults).forEach(key => {
      if (policies[key] === undefined || policies[key] === '') {
        updates[key] = defaults[key];
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      updateFormData({
        policies: { ...policies, ...updates }
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      policies: { ...policies, [name]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Policies & Rules</h2>
        <p className="text-sm text-gray-500">Set check-in rules and guest policies</p>
      </div>

      <div className="space-y-4">
        {/* Timings */}
        <h3 className="font-bold text-gray-700">Check-in / Check-out</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in Time</label>
            <input
              type="time"
              name="checkInTime"
              value={policies.checkInTime || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Check-out Time</label>
            <input
              type="time"
              name="checkOutTime"
              value={policies.checkOutTime || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Early Check-in Allowed?</label>
            <select
              name="earlyCheckIn"
              value={policies.earlyCheckIn || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Free">Yes, Free</option>
              <option value="Paid">Yes, Paid</option>
              <option value="Subject to Availability">Subject to Availability</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Late Check-out Allowed?</label>
            <select
              name="lateCheckOut"
              value={policies.lateCheckOut || ''}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select</option>
              <option value="No">No</option>
              <option value="Free">Yes, Free</option>
              <option value="Paid">Yes, Paid</option>
              <option value="Subject to Availability">Subject to Availability</option>
            </select>
          </div>
        </div>

        {/* Guest Policies */}
        <h3 className="font-bold text-gray-700 pt-4 border-t">Guest Policies</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID Proof Mandatory?</label>
            <select name="idProofMandatory" value={policies.idProofMandatory || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Couple Friendly?</label>
            <select name="coupleFriendly" value={policies.coupleFriendly || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Local IDs Allowed?</label>
            <select name="localIdsAllowed" value={policies.localIdsAllowed || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pet Friendly?</label>
            <select name="petFriendly" value={policies.petFriendly || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
        </div>

        {/* Cancellation */}
        <h3 className="font-bold text-gray-700 pt-4 border-t">Cancellation Policy</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Free Cancellation</label>
          <select name="cancellationPolicy" value={policies.cancellationPolicy || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="Non-Refundable">Non-Refundable</option>
            <option value="Free till 24 hrs">Free till 24 hrs before check-in</option>
            <option value="Free till 48 hrs">Free till 48 hrs before check-in</option>
            <option value="Free till 72 hrs">Free till 72 hrs before check-in</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Refund Rules / Other Details</label>
          <textarea
            name="refundRules"
            value={policies.refundRules || ''}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-24"
            placeholder="Describe refund process if applicable..."
          />
        </div>
      </div>
    </div>
  );
};

export default StepHotelPolicies;
