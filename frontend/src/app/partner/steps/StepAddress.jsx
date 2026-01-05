import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MapPin, Navigation, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import { hotelService } from '../../../services/apiService';

const StepAddress = () => {
    const { formData, updateFormData } = usePartnerStore();
    const containerRef = useRef(null);
    const [fetching, setFetching] = useState(false);
    const [showForm, setShowForm] = useState(!!(formData.address?.city && formData.address?.street));

    const autoFillAddress = async (lat, lng) => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAP_API_KEY;
        if (!apiKey) return;

        try {
            setFetching(true);
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await response.json();

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

                updateFormData({
                    address: {
                        ...formData.address,
                        street: street,
                        city: city,
                        state: state,
                        zipCode: pincode,
                        country: country || 'India'
                    }
                });
                setShowForm(true);
            }
        } catch (error) {
            console.error("Failed to auto-fill address:", error);
            alert("Location found but failed to get address details. Please enter manually.");
        } finally {
            setFetching(false);
        }
    };

    const handleGPS = async () => {
        setFetching(true);
        try {
            const res = await hotelService.getCurrentLocation();
            if (res.success && res.location) {
                const { lat, lng } = res.location;
                updateFormData({
                    location: { lat, lng, type: 'gps' }
                });
                await autoFillAddress(lat, lng);
                return;
            }
        } catch (error) {
            console.warn("Backend GPS failed, falling back to browser:", error);
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    updateFormData({
                        location: { lat: latitude, lng: longitude, type: 'gps' }
                    });
                    await autoFillAddress(latitude, longitude);
                },
                (error) => {
                    setFetching(false);
                    alert("Unable to detect location. Please enter manually.");
                    setShowForm(true);
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        } else {
            setFetching(false);
            alert("Location detection not supported.");
            setShowForm(true);
        }
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".anim-field", {
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, [showForm]);

    const handleChange = (field, value) => {
        updateFormData({
            address: { ...formData.address, [field]: value }
        });
    };

    return (
        <div ref={containerRef} className="pt-2 md:pt-4">

            {/* Location Options */}
            {!showForm && !fetching ? (
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleGPS}
                        className="p-5 rounded-2xl border border-gray-100 hover:border-[#004F4D] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 bg-gray-50 active:scale-95 touch-manipulation anim-field"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#004F4D] text-white flex items-center justify-center shadow-lg">
                            <Navigation size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#003836]">I am at the property</h3>
                            <p className="text-gray-400 text-[10px]">Auto-fill address using current location</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowForm(true)}
                        className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center gap-3 active:scale-95 touch-manipulation anim-field"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <MapPin size={18} className="text-[#004F4D]" />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-[#003836] text-xs">Enter address manually</span>
                            <span className="text-[9px] text-gray-400">Search for area or type street name</span>
                        </div>
                    </button>
                </div>
            ) : fetching ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 anim-field">
                    <Loader2 className="animate-spin text-[#004F4D]" size={32} />
                    <div className="text-center">
                        <p className="text-sm font-bold text-[#003836]">Fetching your address...</p>
                        <p className="text-[10px] text-gray-400">Consulting Google Maps</p>
                    </div>
                </div>
            ) : null}

            {/* Address Form */}
            {showForm && !fetching && (
                <div className="anim-field">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Selected Address</h4>
                        <button
                            onClick={handleGPS}
                            className="text-[10px] font-bold text-[#004F4D] flex items-center gap-1 hover:underline"
                        >
                            <RefreshCw size={10} /> Recenter GPS
                        </button>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
                        <div className="form-group">
                            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Building / Street</label>
                            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 bg-white shadow-sm">
                                <MapPin size={16} className="text-gray-300 mr-2" />
                                <input
                                    type="text"
                                    className="w-full outline-none font-medium text-sm placeholder:text-gray-200"
                                    placeholder="e.g. 102, Green Valley Apartments"
                                    value={formData.address?.street || ''}
                                    onChange={(e) => handleChange('street', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">City</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium text-sm bg-white shadow-sm"
                                    placeholder="City"
                                    value={formData.address?.city || ''}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Pincode</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium text-sm bg-white shadow-sm"
                                    placeholder="000000"
                                    value={formData.address?.zipCode || ''}
                                    onChange={(e) => handleChange('zipCode', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">State</label>
                            <input
                                type="text"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none font-medium text-sm bg-white shadow-sm"
                                placeholder="State"
                                value={formData.address?.state || ''}
                                onChange={(e) => handleChange('state', e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => setShowForm(false)}
                            className="mt-2 text-center text-[10px] font-bold text-gray-300 hover:text-gray-500 uppercase tracking-tight"
                        >
                            ← Back to selection options
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StepAddress;
