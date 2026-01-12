import React, { useState, useCallback } from 'react';
import usePartnerStore from '../store/partnerStore';
import { Plus, X, Search, MapPin, Clock, Navigation } from 'lucide-react';
import { hotelService } from '../../../services/apiService';
import debounce from 'lodash.debounce';

const StepNearbyPlaces = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { nearbyPlaces = [], location } = formData;

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Origin from saved location
  const originln = location?.coordinates?.[0];
  const originlt = location?.coordinates?.[1];

  const [newPlace, setNewPlace] = useState({
    name: '',
    category: 'Tourist Spot',
    distance: '',
    time: '',
    placeId: ''
  });

  // Debounced Search
  const fetchPredictions = async (query) => {
    if (!query || query.length < 3) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await hotelService.searchLocation(query);
      if (response.success && response.results) {
        setPredictions(response.results);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(fetchPredictions, 500), []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSelectPlace = async (place) => {
    setSearchTerm(place.formattedAddress);
    setPredictions([]);
    setCalculating(true);

    try {
      const destLat = place.location.lat;
      const destLng = place.location.lng;

      // Calculate Distance
      if (originlt && originln) {
        const result = await hotelService.calculateDistance(originlt, originln, destLat, destLng);
        if (result.success) {
          setNewPlace({
            ...newPlace,
            name: place.formattedAddress.split(',')[0], // Simple name
            distance: result.distance,
            time: result.duration,
            placeId: place.placeId
          });
          setCalculating(false);
          return;
        }
      }
      // Fallback if origin missing or calc failed
      setNewPlace({
        ...newPlace,
        name: place.formattedAddress.split(',')[0],
        distance: '',
        time: ''
      });

    } catch (error) {
      console.error("Distance Calc Failed", error);
      alert('Could not calculate distance. Please fill manually.');
    } finally {
      setCalculating(false);
    }
  };

  const handleAdd = () => {
    if (!newPlace.name) return;
    updateFormData({
      nearbyPlaces: [...nearbyPlaces, newPlace]
    });
    setNewPlace({ name: '', category: 'Tourist Spot', distance: '', time: '', placeId: '' });
    setSearchTerm('');
    setShowForm(false);
  };

  const handleRemove = (index) => {
    updateFormData({
      nearbyPlaces: nearbyPlaces.filter((_, i) => i !== index)
    });
  };

  const categories = ['Tourist Spot', 'Transport', 'Hospital', 'Market', 'School', 'Temple'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#003836]">Nearby Places</h2>
          <p className="text-sm text-gray-500">Search and add nearby attractions with travel time</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-[#004F4D] font-bold">
          <Plus size={20} /> Add Place
        </button>
      </div>

      {!originlt && (
        <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
          ⚠️ Property Location is missing. Distance calculation will not work. Please complete Location step.
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          {/* Search */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Search Place (Google Maps)</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search e.g. Taj Mahal, Airport..."
                className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#004F4D]"
              />
              {loading && <span className="absolute right-3 top-3 text-xs text-gray-400">Searching...</span>}
            </div>

            {/* Predictions */}
            {predictions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border shadow-xl rounded-lg z-10 max-h-60 overflow-y-auto">
                {predictions.map((p, i) => (
                  <div key={i} onClick={() => handleSelectPlace(p)} className="p-3 hover:bg-gray-50 cursor-pointer border-b text-sm">
                    {p.formattedAddress}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual / Auto Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place Name</label>
              <input
                value={newPlace.name}
                onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={newPlace.category}
                onChange={e => setNewPlace({ ...newPlace, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Distance (Via Road)</label>
              <input
                value={newPlace.distance}
                onChange={e => setNewPlace({ ...newPlace, distance: e.target.value })}
                placeholder="e.g. 5.2 km"
                className="w-full p-3 border rounded-lg"
              />
              {calculating && <span className="absolute right-3 top-9 text-xs text-[#004F4D] animate-pulse">Calculating...</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Travel Time</label>
              <input
                value={newPlace.time}
                onChange={e => setNewPlace({ ...newPlace, time: e.target.value })}
                placeholder="e.g. 15 mins"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleAdd} className="flex-1 bg-[#004F4D] text-white py-3 rounded-lg font-bold">Add to List</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nearbyPlaces.map((place, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-start group hover:shadow-md transition-all">
            <div className="flex gap-3">
              <div className="bg-[#004F4D]/5 p-3 rounded-lg h-fit text-[#004F4D]">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{place.name}</h4>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{place.category}</span>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Navigation size={14} /> {place.distance || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {place.time || 'N/A'}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleRemove(idx)} className="text-gray-400 hover:text-red-500 p-2"><X size={18} /></button>
          </div>
        ))}
        {nearbyPlaces.length === 0 && !showForm && (
          <div className="col-span-full text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            No nearby places added.
          </div>
        )}
      </div>
    </div>
  );
};

export default StepNearbyPlaces;
