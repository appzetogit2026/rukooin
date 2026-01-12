import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepReview = () => {
  const { formData } = usePartnerStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Review & Submit</h2>
      <p className="text-sm text-gray-500">Please review all details before submitting for approval.</p>

      <div className="space-y-4 text-sm">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h3 className="font-bold text-gray-700 border-b pb-1">Basic Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-gray-500">Name:</span> <span className="font-medium text-right">{formData.name}</span>
            <span className="text-gray-500">Category:</span> <span className="font-medium text-right">{formData.propertyCategory}</span>
            <span className="text-gray-500">Booking:</span> <span className="font-medium text-right">{formData.bookingType}</span>
          </div>
        </div>

        {formData.propertyCategory === 'Villa' ? (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-bold text-gray-700 border-b pb-1">Structure & Pricing</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span className="text-gray-500">Max Guests:</span> <span className="font-medium text-right">{formData.config?.maxGuests || '-'}</span>
              <span className="text-gray-500">Bedrooms:</span> <span className="font-medium text-right">{formData.config?.bedrooms || '-'}</span>
              <span className="text-gray-500">Bathrooms:</span> <span className="font-medium text-right">{formData.config?.bathrooms || '-'}</span>
              <span className="text-gray-500">Kitchen:</span> <span className="font-medium text-right">{formData.config?.kitchenAvailable ? 'Yes' : 'No'}</span>

              <div className="col-span-2 border-t my-1"></div>

              <span className="text-gray-500">Base Price:</span> <span className="font-medium text-right">₹{formData.pricing?.basePrice}</span>
              <span className="text-gray-500">Extra Guest:</span> <span className="font-medium text-right">₹{formData.pricing?.extraGuestPrice || 0}</span>
              <span className="text-gray-500">Cleaning Fee:</span> <span className="font-medium text-right">₹{formData.pricing?.cleaningFee || 0}</span>

              <div className="col-span-2 border-t my-1"></div>

              <span className="text-gray-500">Min Stay:</span> <span className="font-medium text-right">{formData.availabilityRules?.minStay} Nights</span>
              <span className="text-gray-500">Max Stay:</span> <span className="font-medium text-right">{formData.availabilityRules?.maxStay} Nights</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-bold text-gray-700 border-b pb-1">Inventory</h3>
            <div className="space-y-1">
              {formData.inventory?.map((inv, i) => (
                <div key={i} className="flex justify-between">
                  <span>{inv.name} ({inv.type})</span>
                  <span className="font-medium">x{inv.count}</span>
                </div>
              ))}
              {(!formData.inventory || formData.inventory.length === 0) && <p className="text-red-500 italic">No inventory added</p>}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h3 className="font-bold text-gray-700 border-b pb-1">Location</h3>
          <p className="line-clamp-2">{formData.address?.addressLine}, {formData.address?.city}</p>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
