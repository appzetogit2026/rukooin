import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X } from 'lucide-react';

const StepResortActivities = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { activities = [] } = formData;
  const [showForm, setShowForm] = useState(false);

  const [newActivity, setNewActivity] = useState({
    name: '',
    type: 'Included',
    price: '0',
    timing: '',
    ageRestriction: 'All Ages',
    description: ''
  });

  const handleAdd = () => {
    updateFormData({
      activities: [...activities, newActivity]
    });
    setShowForm(false);
    setNewActivity({
      name: '',
      type: 'Included',
      price: '0',
      timing: '',
      ageRestriction: 'All Ages',
      description: ''
    });
  };

  const handleRemove = (index) => {
    updateFormData({
      activities: activities.filter((_, i) => i !== index)
    });
  };

  const includedActivities = ['Swimming', 'Indoor Games', 'Morning Yoga', 'Evening Walks', 'Kids Play Area', 'Cycling'];
  const paidActivities = ['Spa & Massage', 'Adventure Sports', 'Trekking', 'Water Sports', 'Candle Light Dinner', 'Bonfire', 'DJ Night', 'Boat Rides'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">Activities & Experiences</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Activity
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Resort USP:</strong> Activities and experiences are what make resorts stand out. Add as many as possible!
        </p>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Activity Name *</label>
              <select
                value={newActivity.name}
                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Activity</option>
                <optgroup label="Included Activities">
                  {includedActivities.map(act => <option key={act}>{act}</option>)}
                </optgroup>
                <optgroup label="Paid Activities">
                  {paidActivities.map(act => <option key={act}>{act}</option>)}
                </optgroup>
                <option>Other (Custom)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Activity Type *</label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Included</option>
                <option>Paid</option>
              </select>
            </div>

            {newActivity.type === 'Paid' && (
              <div>
                <label className="block text-sm font-medium mb-1">Price per Person (₹) *</label>
                <input
                  type="number"
                  value={newActivity.price}
                  onChange={(e) => setNewActivity({ ...newActivity, price: e.target.value })}
                  placeholder="500"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Timing</label>
              <input
                value={newActivity.timing}
                onChange={(e) => setNewActivity({ ...newActivity, timing: e.target.value })}
                placeholder="e.g. 6:00 AM - 7:00 AM"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Age Restrictions</label>
              <select
                value={newActivity.ageRestriction}
                onChange={(e) => setNewActivity({ ...newActivity, ageRestriction: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>All Ages</option>
                <option>18+ Only</option>
                <option>Kids Only</option>
                <option>12+ Years</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Brief description of the activity..."
                className="w-full p-3 border rounded-lg h-20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add Activity</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start group">
            <div>
              <h3 className="font-bold text-lg">{activity.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded ${activity.type === 'Included' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {activity.type === 'Included' ? '✓ Free' : `₹${activity.price}`}
                </span>
                {activity.timing && <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">{activity.timing}</span>}
                <span className="text-xs bg-purple-100 px-2 py-1 rounded text-purple-700">{activity.ageRestriction}</span>
              </div>
              {activity.description && <p className="text-xs text-gray-500 mt-2">{activity.description}</p>}
            </div>
            <button onClick={() => handleRemove(idx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>
        ))}

        {activities.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No activities added. Click "Add Activity" to configure resort experiences.
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{activities.filter(a => a.type === 'Included').length}</strong> included activities •
            <strong> {activities.filter(a => a.type === 'Paid').length}</strong> paid experiences
          </p>
        </div>
      )}
    </div>
  );
};

export default StepResortActivities;
