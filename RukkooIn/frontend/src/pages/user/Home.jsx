import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HeroSection from '../../components/user/HeroSection';
import ExclusiveOffers from '../../components/user/ExclusiveOffers';
import PropertyTypeFilter from '../../components/user/PropertyTypeFilter';
import PropertyFeed from '../../components/user/PropertyFeed';

const Home = () => {
    const [selectedType, setSelectedType] = useState('All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [coords, setCoords] = useState({ lat: null, lng: null });
    
    // Try to get location silently on mount if permission was previously granted
    React.useEffect(() => {
        // First, check if we have a cached location to show distances immediately
        const cachedLoc = localStorage.getItem('last_user_location');
        if (cachedLoc && !coords.lat) {
            try {
                setCoords(JSON.parse(cachedLoc));
            } catch (e) {
                console.error("Failed to parse cached location");
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCoords(newCoords);
                    localStorage.setItem('last_user_location', JSON.stringify(newCoords));
                },
                (error) => {
                    console.log("Home silent location fetch skipped:", error.message);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
            );
        }
    }, []);

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        if (city === 'Near Me') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCoords({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        toast.error("Could not get your location. Showing all properties.");
                        setSelectedCity('All');
                    }
                );
            } else {
                toast.error("Geolocation is not supported by your browser.");
                setSelectedCity('All');
            }
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <HeroSection 
                selectedCity={selectedCity} 
                onSelectCity={handleCitySelect} 
            />

            <ExclusiveOffers />

            <div className="mt-2 max-w-7xl mx-auto">
                <PropertyFeed 
                    selectedType={selectedType} 
                    selectedCity={selectedCity}
                    lat={coords.lat}
                    lng={coords.lng}
                />
            </div>
        </main>
    );
};

export default Home;
