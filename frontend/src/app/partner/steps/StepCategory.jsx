import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { Building, Home, Key, Users, Briefcase } from 'lucide-react';

const CATEGORIES = [
  { id: 'Hotel', label: 'Hotel', icon: Building, bookingType: 'Nightly', inventoryType: 'room', desc: 'Room-based nightly stays.' },
  { id: 'Resort', label: 'Resort', icon: Key, bookingType: 'Nightly', inventoryType: 'room', desc: 'Relaxation & activities.' },
  { id: 'Villa', label: 'Villa', icon: Home, bookingType: 'Nightly', inventoryType: 'unit', desc: 'Entire unit rentals.' },
  { id: 'Homestay', label: 'Homestay', icon: Home, bookingType: 'Nightly', inventoryType: 'room', desc: 'Live with host or private.' }, // Logic handles room vs unit later? Or strictly 'room' here? User said inventoryType="room | unit". I'll default to 'room' but allow toggle later or just set generic 'unit' if entire? Protocol says Room OR Entire. 
  { id: 'Hostel', label: 'Hostel', icon: Users, bookingType: 'Bed-based', inventoryType: 'bed', desc: 'Budget bed-based stays.' },
  { id: 'PG', label: 'PG', icon: Briefcase, bookingType: 'Monthly', inventoryType: 'bed', desc: 'Long-term stays.' },
];

const StepCategory = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { hotelDraftId, propertyCategory } = formData;

  const handleSelect = (cat) => {
    if (hotelDraftId) return; // Locked

    updateFormData({
      propertyCategory: cat.id,
      bookingType: cat.bookingType,
      inventoryType: cat.inventoryType
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#003836]">Select Property Category</h2>
      <p className="text-gray-500 text-sm">Choose the type of property you are listing. This cannot be changed later.</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = propertyCategory === cat.id;
          const isLocked = !!hotelDraftId;

          return (
            <div
              key={cat.id}
              onClick={() => !isLocked && handleSelect(cat)}
              className={`
                    cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all
                    ${isSelected ? 'border-[#004F4D] bg-[#004F4D]/5' : 'border-gray-100 hover:border-[#004F4D]/50'}
                    ${isLocked && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
            >
              <div className={`p-3 rounded-full ${isSelected ? 'bg-[#004F4D] text-white' : 'bg-gray-100 text-[#003836]'}`}>
                <Icon size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-[#003836]">{cat.label}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
              </div>
              {isSelected && (
                <div className="mt-2 text-[10px] font-mono bg-gray-200 px-2 py-1 rounded text-gray-600">
                  {cat.bookingType} • {cat.inventoryType}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hotelDraftId && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 text-xs text-center">
          ⚠ Category is locked for this draft. Start a new onboarding to change.
        </div>
      )}
    </div>
  );
};

export default StepCategory;
