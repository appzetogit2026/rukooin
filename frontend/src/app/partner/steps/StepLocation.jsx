import React, { useState, useEffect, useCallback } from 'react';
import usePartnerStore from '../store/partnerStore';
import { MapPin, Search, Navigation } from 'lucide-react';
import { hotelService } from '../../../services/apiService';
import debounce from 'lodash.debounce';

const StepLocation = () => {
  const { formData, updateFormData } = usePartnerStore();
  const { address } = formData;
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Debounced Search using Backend API
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
        city: place.city,
        state: place.state,
        pincode: place.pincode,
        area: place.area || '',
        landmark: place.landmark || '',
        country: 'India'
      },
      location: {
        type: 'Point',
        coordinates: [place.location.lng, place.location.lat] // GeoJSON [lng, lat]
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
                pincode: addr.zipCode,
                area: addr.area || '',
                country: 'India'
              },
              location: {
                type: 'Point',
                coordinates: [longitude, latitude] // GeoJSON [lng, lat]
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
      (error) => {
        alert('Unable to retrieve your location');
        setDetecting(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({
      address: { ...address, [name]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Detect */}
      <div className="space-y-2 relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search area, landmark or city..."
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#004F4D]"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {loading && <span className="absolute right-3 top-3 text-xs text-gray-400">Loading...</span>}
          </div>
          <button
            onClick={handleUseCurrentLocation}
            disabled={detecting}
            title="Use Current Location"
            className="bg-[#004F4D]/10 text-[#004F4D] p-3 rounded-lg hover:bg-[#004F4D]/20 transition-colors shrink-0 aspect-square flex items-center justify-center"
          >
            <Navigation size={20} className={detecting ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Predictions Dropdown */}
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

      {/* Manual Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
          <input name="addressLine" value={address.addressLine || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="Street, House No." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
          <input name="area" value={address.area || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="e.g. Indiranagar" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
          <input name="landmark" value={address.landmark || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="e.g. Near Metro Station" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input name="city" value={address.city || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
            <input name="pincode" value={address.pincode || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input name="state" value={address.state || ''} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input name="country" value={address.country || 'India'} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepLocation;
