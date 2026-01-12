import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X } from 'lucide-react';

const StepResortNearby = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { nearbyPlaces = [] } = formData;
  const [showForm, setShowForm] = useState(false);

  const [newPlace, setNewPlace] = useState({
    name: '',
    category: 'Tourist Spot',
    distance: ''
  });

  const handleAdd = () => {
    updateFormData({
      nearbyPlaces: [...nearbyPlaces, newPlace]
    });
    setShowForm(false);
    setNewPlace({
      name: '',
      category: 'Tourist Spot',
      distance: ''
    });
  };

  const handleRemove = (index) => {
    updateFormData({
      nearbyPlaces: nearbyPlaces.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#003836]">Nearby Places & Attractions</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Place
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Why important:</strong> Guests often choose resorts based on proximity to attractions. Add as many nearby places as possible!
        </p>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place Name *</label>
              <input
                value={newPlace.name}
                onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                placeholder="e.g. Calangute Beach"
                className="w-full p-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={newPlace.category}
                onChange={(e) => setNewPlace({ ...newPlace, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option>Tourist Spot</option>
                <option>Beach</option>
                <option>Hill Station</option>
                <option>Forest / Wildlife</option>
                <option>Temple / Religious Site</option>
                <option>Hospital</option>
                <option>Market / Shopping</option>
                <option>Airport</option>
                <option>Railway Station</option>
                <option>Bus Stand</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Distance *</label>
              <input
                value={newPlace.distance}
                onChange={(e) => setNewPlace({ ...newPlace, distance: e.target.value })}
                placeholder="e.g. 2 km or 10 minutes"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add Place</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {['Tourist Spot', 'Beach', 'Hospital', 'Transport'].map(category => {
          const places = nearbyPlaces.filter(p =>
            (category === 'Transport' && ['Airport', 'Railway Station', 'Bus Stand'].includes(p.category)) ||
            (category === 'Beach' && ['Beach', 'Hill Station', 'Forest / Wildlife'].includes(p.category)) ||
            p.category === category
          );

          if (places.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="font-semibold text-sm text-gray-600 mb-2">{category === 'Transport' ? 'Transport' : category}s</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {places.map((place, idx) => {
                  const originalIdx = nearbyPlaces.indexOf(place);
                  return (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center group">
                      <div>
                        <p className="font-medium text-sm">{place.name}</p>
                        <p className="text-xs text-gray-500">{place.category} • {place.distance}</p>
                      </div>
                      <button onClick={() => handleRemove(originalIdx)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {nearbyPlaces.length === 0 && !showForm && (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            No nearby places added. Click "Add Place" to configure.
          </div>
        )}
      </div>

      {nearbyPlaces.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{nearbyPlaces.length}</strong> nearby places added
          </p>
        </div>
      )}
    </div>
  );
};

export default StepResortNearby;
