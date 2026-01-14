import React, { useState, useCallback } from 'react';
import usePartnerStore from '../store/partnerStore';
import { MapPin, Search, Navigation } from 'lucide-react';
import { hotelService } from '../../../services/apiService';
import debounce from 'lodash.debounce';

const StepBasicDetails = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { name, description, shortDescription, propertyCategory, address } = formData;
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // --- SEARCH / MAP LOGIC (Merged from StepLocation) ---
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

  const handleSelectLocation = (place) => {
    updateFormData({
      address: {
        ...address,
        addressLine: place.formattedAddress,
        city: place.city || '',
        state: place.state || '',
        zipCode: place.pincode || '',
        coordinates: place.location // { lat, lng }
      }
    });
    setPredictions([]);
    setSearchTerm('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Update Coordinates immediately
        updateFormData({
          location: { lat: latitude, lng: longitude }
        });

        try {
          const response = await hotelService.getAddressFromCoordinates(latitude, longitude);
          if (response.success && response.address) {
            const addr = response.address;
            updateFormData({
              address: {
                ...address,
                addressLine: addr.street || addr.fullAddress,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zipCode,
                country: addr.country,
                coordinates: { lat: latitude, lng: longitude }
              }
            });
          }
        } catch (error) {
          console.error("Reverse Geocoding Failed:", error);
          alert("Could not fetch address details. Please fill manually.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        alert('Unable to retrieve your location');
        setDetecting(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Check if updating nested address
    if (['addressLine', 'city', 'state', 'zipCode'].includes(name)) {
      updateFormData({
        address: { ...address, [name]: value }
      });
    } else {
      updateFormData({ [name]: value });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header / Intro */}
      <div>
        <h2 className="text-2xl font-bold text-[#003836] mb-1">Basic Property Info</h2>
        <p className="text-sm text-gray-500">Provide essential details to list your property on Rukkoin.</p>
      </div>

      {/* Basic Info Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
          <input
            name="name"
            value={name || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-[#004F4D] focus:ring-1"
            placeholder="e.g. Hotel Sunshine Grand"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-medium">
            {propertyCategory}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
          <input
            name="shortDescription"
            value={shortDescription || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg"
            placeholder="A brief tagline like 'Luxury stay near airport'"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
          <textarea
            name="description"
            value={description || ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-200 rounded-lg h-24"
            placeholder="Describe what makes your property special..."
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Location Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Location</h3>

        {/* Auto-Search */}
        <div className="relative mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search area, landmark or city to autofill..."
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-[#004F4D]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {loading && <span className="absolute right-3 top-3 text-xs text-gray-400">Loading...</span>}
            </div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={detecting}
              className="bg-[#004F4D]/10 text-[#004F4D] p-3 rounded-lg hover:bg-[#004F4D]/20 transition-colors flex items-center gap-2 font-medium"
            >
              <Navigation size={18} className={detecting ? "animate-spin" : ""} /> Locate Me
            </button>
          </div>
          {/* Predictions */}
          {predictions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 shadow-xl rounded-lg z-20 max-h-60 overflow-y-auto mt-1">
              {predictions.map((place) => (
                <div
                  key={place.placeId}
                  onClick={() => handleSelectLocation(place)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-800">{place.formattedAddress}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Address Line *</label>
            <input name="addressLine" value={address?.addressLine || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input name="city" value={address?.city || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input name="state" value={address?.state || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input name="zipCode" value={address?.zipCode || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input value={address?.country || 'India'} disabled className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepBasicDetails;
