import React from 'react';
import usePartnerStore from '../store/partnerStore';
import { Check } from 'lucide-react';

const AMENITIES_CATEGORIES = {
    "Basic": ["Free WiFi", "Power Backup", "Parking", "Lift", "Reception"],
    "Comfort": ["AC", "Heater", "Housekeeping", "Laundry Service", "Wheelchair Access"],
    "Kitchen & Dining": ["Stove", "Refrigerator", "Microwave", "Restaurant", "Cafeteria", "Bar"],
    "Outdoor & Relax": ["Swimming Pool", "Garden", "BBQ", "Bonfire", "Gym"],
    "Safety & Security": ["CCTV Cameras", "Security Guard", "Caretaker", "First Aid Kit", "Fire Extinguisher"]
};

// Hostel Specific Categories
const HOSTEL_AMENITIES_CATEGORIES = {
    "Basic": ["WiFi", "Power Backup", "Parking", "Water Cooler"],
    "Common Areas": ["Common Lounge", "TV Room", "Study Room", "Library", "Terrace", "Co-working Space"],
    "Food & Drink": ["Cafe", "Mess", "Kitchen Access", "Vending Machine", "Breakfast Included"],
    "Safety & Security": ["CCTV Cameras", "24/7 Security", "Biometric Access", "Warden"],
    "Services & Utilities": ["Laundry", "Housekeeping", "Ironing Facilities", "Lockers"]
};

// Flatten for easy checking, or just check implementation below
const StepFacilities = () => {
    const { formData, updateFormData } = usePartnerStore();
    const { amenities = [], propertyCategory } = formData;

    // Select categories based on type
    const categoriesToRender = (propertyCategory === 'Hostel' || propertyCategory === 'PG')
        ? HOSTEL_AMENITIES_CATEGORIES
        : AMENITIES_CATEGORIES;

    const toggleAmenity = (amenity) => {
        if (amenities.includes(amenity)) {
            updateFormData({ amenities: amenities.filter(a => a !== amenity) });
        } else {
            updateFormData({ amenities: [...amenities, amenity] });
        }
    };

    return (
        <div className="space-y-8">
            {Object.entries(categoriesToRender).map(([category, items]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">
                        {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {items.map(opt => (
                            <div
                                key={opt}
                                onClick={() => toggleAmenity(opt)}
                                className={`
                                    relative cursor-pointer px-3 py-2 rounded-xl border flex items-center gap-3 transition-all select-none
                                    min-h-[50px] hover:shadow-sm active:scale-[0.98]
                                    ${amenities.includes(opt)
                                        ? 'border-[#004F4D] bg-[#004F4D]/5 text-[#004F4D]'
                                        : 'border-gray-200 hover:border-[#004F4D]/30 text-gray-600 bg-white'
                                    }
                                `}
                            >
                                {/* Custom Checkbox */}
                                <div className={`
                                    shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors
                                    ${amenities.includes(opt) ? 'bg-[#004F4D] border-[#004F4D]' : 'border-gray-300 bg-gray-50'}
                                `}>
                                    {amenities.includes(opt) && <Check size={10} className="text-white" strokeWidth={4} />}
                                </div>

                                {/* Text */}
                                <span className="text-xs font-bold leading-tight">{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StepFacilities;
