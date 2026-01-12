import React from 'react';
import usePartnerStore from '../store/partnerStore';

const StepPGFood = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { config = {} } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      config: { ...config, [name]: value }
    });
  };

  const toggleList = (field, item) => {
    const current = config[field] || [];
    const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
    updateFormData({ config: { ...config, [field]: updated } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#003836]">Food & Services</h2>
        <p className="text-sm text-gray-500">Configure meals and housekeeping services</p>
      </div>

      {/* Food Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-700">Food Configuration</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Meals Included in Rent?</label>
          <select name="mealsIncluded" value={config.mealsIncluded || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select</option>
            <option value="Yes">Yes (Included in Rent)</option>
            <option value="No">No (Available at extra cost)</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>

        {config.mealsIncluded && config.mealsIncluded !== 'Not Available' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Meal Types Available</label>
              <div className="flex gap-4">
                {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                  <label key={meal} className={`flex-1 p-3 border rounded-lg text-center cursor-pointer ${config.mealTypes?.includes(meal) ? 'bg-[#004F4D]/10 border-[#004F4D]' : 'bg-white'}`}>
                    <input type="checkbox" checked={config.mealTypes?.includes(meal) || false} onChange={() => toggleList('mealTypes', meal)} className="hidden" />
                    {meal}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Food Type</label>
              <div className="flex gap-4">
                {['Veg Only', 'Veg + Non-Veg', 'Veg + Egg'].map(type => (
                  <label key={type} className={`flex-1 p-3 border rounded-lg text-center cursor-pointer ${config.foodType === type ? 'bg-[#004F4D] text-white' : 'bg-gray-50'}`}>
                    <input type="radio" name="foodType" value={type} checked={config.foodType === type} onChange={handleChange} className="hidden" />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meal Timings</label>
              <textarea name="mealTimings" value={config.mealTimings || ''} onChange={handleChange} placeholder="e.g. Breakfast: 8-10 AM, Dinner: 8-10 PM" className="w-full p-3 border rounded-lg h-24" />
            </div>
          </>
        )}
      </div>

      {/* Services Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-bold text-lg text-gray-700">Services</h3>

        <div>
          <label className="block text-sm font-medium mb-1">Laundry Service</label>
          <select name="laundryService" value={config.laundryService || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Select</option>
            <option value="Free">Free (Included)</option>
            <option value="Paid">Paid (Extra Charge)</option>
            <option value="Not Available">Not Available</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Housekeeping Frequency</label>
            <select name="housekeeping" value={config.housekeeping || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="">Select</option>
              <option value="Daily">Daily</option>
              <option value="Alternate Days">Alternate Days</option>
              <option value="Weekly">Weekly</option>
              <option value="On Demand">On Demand</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Linen Change Frequency</label>
            <select name="linenChange" value={config.linenChange || ''} onChange={handleChange} className="w-full p-3 border rounded-lg">
              <option value="">Select</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-Weekly">Bi-Weekly (15 days)</option>
              <option value="Monthly">Monthly</option>
              <option value="On Request">On Request</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPGFood;
