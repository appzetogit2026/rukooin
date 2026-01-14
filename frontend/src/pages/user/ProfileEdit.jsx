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
    <div className="min-h-screen bg-white flex flex-col items-center pt-safe-top px-6 pb-24 md:pb-0">


      {/* 1. Header Removed - Spacer for top padding */}
      <div className="h-6"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-6"
      >

        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-surface text-white flex items-center justify-center shadow-lg shadow-surface/20">
              <User size={32} />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-100 shadow-sm cursor-pointer">
              <Save size={12} className="text-surface" />
            </div>
          </div>
          <h2 className="mt-3 text-lg font-bold text-gray-900">{formData.name || 'User'}</h2>
          <p className="text-xs text-gray-400 font-medium">+91 {formData.phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Section: Personal Info */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2 focus-within:border-surface transition-colors">
                <User size={16} className="text-gray-300" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2 focus-within:border-surface transition-colors">
                <Mail size={16} className="text-gray-300" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>


          {/* Section: Address */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address Details</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={fetchingLocation}
                className="flex items-center gap-1 text-[10px] font-bold text-surface bg-surface/5 px-2 py-1 rounded-md"
              >
                {fetchingLocation ? <Loader2 size={10} className="animate-spin" /> : <Navigation size={10} />}
                Auto-Detect
              </button>
            </div>

            {/* Address Inputs - Minimalist Style */}
            <div className="space-y-4 pt-1">
              {/* Street */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Street Address</label>
                <div className="border-b border-gray-100 focus-within:border-surface transition-colors">
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full py-2 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                    placeholder="House No, Street, Area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* City */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">City</label>
                  <div className="border-b border-gray-100 focus-within:border-surface transition-colors">
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full py-2 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                      placeholder="City"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Pincode</label>
                  <div className="border-b border-gray-100 focus-within:border-surface transition-colors">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full py-2 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                      placeholder="000000"
                    />
                  </div>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">State</label>
                <div className="border-b border-gray-100 focus-within:border-surface transition-colors">
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="w-full py-2 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-surface text-white py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-surface/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Profile'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileEdit;
