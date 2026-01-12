import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X } from 'lucide-react';

const StepResortMeals = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { mealPlans = [] } = formData;
  const [showForm, setShowForm] = useState(false);

  const [newMeal, setNewMeal] = useState({
    mealType: 'Room Only',
    priceImpact: '0',
    included: false,
    breakfast: { timing: '7:00 AM - 10:00 AM' },
    lunch: { timing: '12:30 PM - 3:00 PM' },
    dinner: { timing: '7:30 PM - 10:00 PM' },
    cuisineType: 'Multi-Cuisine'
  });

  const handleAdd = () => {
    updateFormData({
      mealPlans: [...mealPlans, newMeal]
    });
    setShowForm(false);
    setNewMeal({
      mealType: 'Room Only',
      priceImpact: '0',
      included: false,
      breakfast: { timing: '7:00 AM - 10:00 AM' },
      lunch: { timing: '12:30 PM - 3:00 PM' },
      dinner: { timing: '7:30 PM - 10:00 PM' },
      cuisineType: 'Multi-Cuisine'
    });
  };

  const handleRemove = (index) => {
    updateFormData({
      mealPlans: mealPlans.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">Meal Plans</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Meal Plan
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meal Type *</label>
              <select
                value={newMeal.mealType}
                onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Room Only</option>
                <option>Breakfast Included</option>
                <option>Half Board (Breakfast + Dinner)</option>
                <option>Full Board (All Meals)</option>
                <option>All-Inclusive Package</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price Impact per Person (₹)</label>
              <input
                type="number"
                value={newMeal.priceImpact}
                onChange={(e) => setNewMeal({ ...newMeal, priceImpact: e.target.value })}
                placeholder="500"
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 0 if included in room rate</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cuisine Type</label>
              <select
                value={newMeal.cuisineType}
                onChange={(e) => setNewMeal({ ...newMeal, cuisineType: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Multi-Cuisine</option>
                <option>Indian</option>
                <option>Continental</option>
                <option>Chinese</option>
                <option>Seafood</option>
                <option>Vegetarian</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                checked={newMeal.included}
                onChange={(e) => setNewMeal({ ...newMeal, included: e.target.checked })}
                className="w-5 h-5 accent-[#004F4D]"
              />
              <label className="text-sm font-medium">Included in Base Price</label>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold text-sm mb-2">Meal Timings</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Breakfast</label>
                  <input
                    value={newMeal.breakfast.timing}
                    onChange={(e) => setNewMeal({ ...newMeal, breakfast: { timing: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Lunch</label>
                  <input
                    value={newMeal.lunch.timing}
                    onChange={(e) => setNewMeal({ ...newMeal, lunch: { timing: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Dinner</label>
                  <input
                    value={newMeal.dinner.timing}
                    onChange={(e) => setNewMeal({ ...newMeal, dinner: { timing: e.target.value } })}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add Meal Plan</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {mealPlans.map((meal, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg">{meal.mealType}</h3>
              <p className="text-gray-500 text-sm">
                {meal.included ? 'Included in Room Price' : `+₹${meal.priceImpact} per person`} • {meal.cuisineType}
              </p>
            </div>
            <button onClick={() => handleRemove(idx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>
        ))}

        {mealPlans.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No meal plans added. Click "Add Meal Plan" to configure.
          </div>
        )}
      </div>
    </div>
  );
};

export default StepResortMeals;
