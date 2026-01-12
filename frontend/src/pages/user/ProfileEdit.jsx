import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, ArrowLeft, Save, Loader2, MapPin, Navigation, Home } from 'lucide-react';
import { authService } from '../../services/apiService';
import toast from 'react-hot-toast';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      coordinates: { lat: null, lng: null }
    }
  });

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          address: user.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India',
            coordinates: { lat: null, lng: null }
          }
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }, []);

  const autoFillAddress = async (lat, lng) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
    console.log('Fetching address for coordinates:', lat, lng);

    if (!apiKey) {
      toast.error('Google Maps API key not configured');
      console.error('Missing VITE_GOOGLE_MAP_API_KEY in .env file');
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      console.log('Geocoding API URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Geocoding response:', data);

      if (data.status === 'OK' && data.results?.[0]) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let streetNumber = '';
        let route = '';
        let neighborhood = '';
        let city = '';
        let state = '';
        let pincode = '';
        let country = '';

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) streetNumber = component.long_name;
          if (types.includes('route')) route = component.long_name;
          if (types.includes('neighborhood') || types.includes('sublocality')) neighborhood = component.long_name;
          if (types.includes('locality')) city = component.long_name;
          if (types.includes('administrative_area_level_1')) state = component.long_name;
          if (types.includes('postal_code')) pincode = component.long_name;
          if (types.includes('country')) country = component.long_name;
        });

        if (!city) {
          const sublocality = addressComponents.find(c => c.types.includes('sublocality_level_1'))?.long_name;
          city = sublocality || '';
        }

        const street = [streetNumber, route, neighborhood].filter(Boolean).join(', ') || result.formatted_address.split(',')[0];

        const addressData = {
          street: street,
          city: city,
          state: state,
          zipCode: pincode,
          country: country || 'India',
          coordinates: { lat, lng }
        };

        console.log('Parsed address data:', addressData);

        setFormData(prev => ({
          ...prev,
          address: addressData
        }));

        toast.success('Address auto-filled from location!');
      } else {
        console.error('Geocoding failed. Status:', data.status);
        toast.error(`Failed to get address: ${data.status}`);
      }
    } catch (error) {
      console.error('Failed to auto-fill address:', error);
      toast.error('Failed to get address details. Please enter manually.');
    }
  };

  const handleGetCurrentLocation = () => {
    console.log('Requesting location permission...');

    if (!('geolocation' in navigator)) {
      toast.error('Location detection not supported by your browser');
      console.error('Geolocation API not available');
      return;
    }

    setFetchingLocation(true);

    // Try with high accuracy first
    const tryHighAccuracy = () => {
      console.log('Trying high accuracy mode...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ High accuracy location obtained:', { latitude, longitude });
          console.log('Accuracy:', position.coords.accuracy, 'meters');

          await autoFillAddress(latitude, longitude);
          setFetchingLocation(false);
        },
        (error) => {
          console.warn('❌ High accuracy failed:', error.message);
          // If high accuracy times out, try low accuracy
          if (error.code === 3) { // TIMEOUT
            toast.loading('Retrying with lower accuracy...', { duration: 1000 });
            tryLowAccuracy();
          } else {
            handleLocationError(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds for high accuracy
          maximumAge: 0
        }
      );
    };

    // Fallback to low accuracy (faster, less precise)
    const tryLowAccuracy = () => {
      console.log('Trying low accuracy mode (faster)...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Low accuracy location obtained:', { latitude, longitude });
          console.log('Accuracy:', position.coords.accuracy, 'meters');

          toast.success('Location found (approximate)');
          await autoFillAddress(latitude, longitude);
          setFetchingLocation(false);
        },
        (error) => {
          console.error('❌ Low accuracy also failed:', error);
          handleLocationError(error);
        },
        {
          enableHighAccuracy: false, // Faster but less accurate
          timeout: 10000, // 10 seconds
          maximumAge: 60000 // Accept cached location up to 1 minute old
        }
      );
    };

    const handleLocationError = (error) => {
      setFetchingLocation(false);
      console.error('Geolocation error:', error);

      let errorMessage = 'Unable to detect location. ';
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage += 'Permission denied. Please enable location access in your browser settings.';
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage += 'Location information unavailable. Please check your device location settings.';
          break;
        case 3: // TIMEOUT
          errorMessage += 'Location request timed out. You may be indoors or have weak GPS signal. Please enter address manually.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
      }

      toast.error(errorMessage, { duration: 5000 });
    };

    // Start with high accuracy attempt
    tryHighAccuracy();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.name.length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.updateProfile(formData);

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Profile updated successfully!');
      navigate(-1); // Go back
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-sm text-gray-500">Update your personal information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture (Placeholder) */}
            <div className="flex flex-col items-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-emerald-600 flex items-center justify-center mb-3">
                <User size={40} className="text-white" />
              </div>
              <p className="text-sm text-gray-500">Profile Picture</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Phone cannot be changed if already verified</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Home size={18} />
                  Address <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={fetchingLocation}
                  className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  {fetchingLocation ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <Navigation size={14} />
                      Use Current Location
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {/* Street */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Street/Building</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                      placeholder="e.g. 102, Green Valley Apartments"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                      placeholder="City"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pincode</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                      placeholder="000000"
                    />
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEdit;
