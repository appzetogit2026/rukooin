import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepConfiguration = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { propertyCategory, config = {} } = formData;

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      config: {
        ...config,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const renderField = (name, label, type = 'text', options = []) => (
    <div key={name} className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={config[name] || ''}
          onChange={handleConfigChange}
          className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            checked={!!config[name]}
            onChange={handleConfigChange}
            className="w-5 h-5 accent-[#004F4D]"
          />
          <span className="text-sm font-medium">{label}</span>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={config[name] || ''}
          onChange={handleConfigChange}
          className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
        />
      )}
    </div>
  );

  const isHotelOrResort = ['Hotel', 'Resort'].includes(propertyCategory);
  const isVilla = propertyCategory === 'Villa';
  const isHomestay = propertyCategory === 'Homestay';
  const isHostel = propertyCategory === 'Hostel';
  const isPG = propertyCategory === 'PG';

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-2 rounded-lg text-xs text-center text-gray-600 mb-4 border border-gray-100 uppercase tracking-widest">
        Configuring: <strong className="text-[#004F4D]">{propertyCategory}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 1. HOTEL / RESORT */}
        {isHotelOrResort && (
          <>
            {renderField('checkInTime', 'Check-in Time', 'time')}
            {renderField('checkOutTime', 'Check-out Time', 'time')}
            {renderField('receptionAvailable', '24/7 Reception', 'checkbox')}
            {renderField('floors', 'Number of Floors', 'number')}
          </>
        )}

        {/* 2. VILLA */}
        {isVilla && (
          <>
            {renderField('maxGuests', 'Max Guests (Entire Unit)', 'number')}
            {renderField('bedrooms', 'Number of Bedrooms', 'number')}
            {renderField('bathrooms', 'Number of Bathrooms', 'number')}
            {renderField('kitchenAvailable', 'Kitchen Available', 'checkbox')}
            {renderField('parkingAvailable', 'Private Parking', 'checkbox')}
          </>
        )}

        {/* 3. HOMESTAY */}
        {isHomestay && (
          <>
            {renderField('checkInTime', 'Check-in Time', 'time')}
            {renderField('checkOutTime', 'Check-out Time', 'time')}
            {renderField('hostLivesOnSite', 'Host Lives On-site', 'checkbox')}
            {renderField('sharedAreas', 'Shared Areas with Host', 'checkbox')}
            {renderField('bookingMode', 'Booking Mode', 'select', ['Room Based', 'Entire Property'])}
          </>
        )}

        {/* 4. HOSTEL */}
        {isHostel && (
          <>
            {renderField('hostelType', 'Hostel Type', 'select', ['Boys', 'Girls', 'Mixed'])}
            {renderField('curfewTime', 'Curfew Time', 'time')}
            {renderField('ageRestriction', 'Age Restriction (18+ only)', 'checkbox')}
            {renderField('visitorsAllowed', 'Visitors Allowed', 'checkbox')}

            {/* Alcohol is technically a policy, but user wants it here in flow. We can dual-bind or just handle in Config if Schema allows, or visual only mapping to policy? 
                For now, let's bind it to policies in the store if possible, or just config and backend maps it. 
                Simpler: Bind to config.alcoholAllowed if added to schema, OR update store policies from here.
                Let's use a special handler for Alcohol to update policies.
            */}
            <div className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.policies?.alcoholAllowed}
                onChange={(e) => usePartnerStore.getState().updatePolicies({ alcoholAllowed: e.target.checked })}
                className="w-5 h-5 accent-[#004F4D]"
              />
              <span className="text-sm font-medium">Alcohol Allowed</span>
            </div>

            {renderField('dormitoryAvailable', 'Dormitory Available', 'checkbox')}
            {renderField('commonWashrooms', 'Common Washrooms', 'checkbox')}
          </>
        )}

        {/* 5. PG */}
        {isPG && (
          <>
            {renderField('hostelType', 'PG Type', 'select', ['Boys', 'Girls', 'Co-living'])}
            {renderField('foodIncluded', 'Food Included', 'checkbox')}
            {renderField('noticePeriodDays', 'Notice Period (Days)', 'number')}
            {renderField('lockInPeriodDays', 'Lock-in Period (Days)', 'number')}
            {renderField('curfewTime', 'Curfew Time', 'time')}
          </>
        )}
      </div>
    </div>
  );
};

export default StepConfiguration;
