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
        } else {
            setCoords({ lat: null, lng: null });
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <HeroSection 
                selectedCity={selectedCity} 
                onSelectCity={handleCitySelect} 
            />

            {/* Sticky Filter Bar */}
            <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-md pt-2">
                <PropertyTypeFilter
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                />
            </div>

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
