import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { MapPin, Search, Filter, Star, IndianRupee, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropertyCard from '../../components/user/PropertyCard';
const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    // Filters State
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || 'all',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        amenities: [],
        radius: 50
    });

    const [location, setLocation] = useState(null); // { lat, lng }

    useEffect(() => {
        fetchProperties();
    }, [searchParams, location]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = Object.fromEntries([...searchParams]);

            // Add location if present
            if (location) {
                params.lat = location.lat;
                params.lng = location.lng;
                params.radius = filters.radius;
            }

            const res = await propertyService.getPublicProperties(params);

            // Backend returns a direct array of properties
            if (Array.isArray(res)) {
                setProperties(res);
            } else if (res.success && Array.isArray(res.properties)) {
                // Fallback for wrapped response
                setProperties(res.properties);
            } else {
                setProperties([]);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.type && filters.type !== 'all') params.type = filters.type;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.sort) params.sort = filters.sort;
        if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');

        setSearchParams(params);
        setShowFilters(false); // Close mobile menu if open
    };

    const handleNearMe = async () => {
        try {
            toast.loading('Getting location...');
            const loc = await propertyService.getCurrentLocation();
            toast.dismiss();
            toast.success('Location found!');
            setLocation(loc);
            // Automatically confirm params with sort by distance
            updateFilter('sort', 'distance');
            setSearchParams(prev => {
                const p = Object.fromEntries([...prev]);
                p.sort = 'distance';
                return p;
            });
        } catch (err) {
            toast.dismiss();
            toast.error('Could not get location. Please enable permissions.');
        }
    };

    const propertyTypes = ['All', 'Hotel', 'Villa', 'Resort', 'Homestay', 'PG', 'Hostel'];
    const sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Price: Low to High', value: 'price_low' },
        { label: 'Price: High to Low', value: 'price_high' },
        { label: 'Top Rated', value: 'rating' },
        { label: 'Nearest', value: 'distance' },
    ];

    return (
        <div className="min-h-screen bg-white pb-24">

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 pb-3 pt-3 px-4 shadow-sm">

                {/* Search Input Row */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by city, hotel, or area..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm font-medium text-gray-700 bg-gray-50/50"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                {/* Actions Row */}
                <div className="flex gap-3">
                    <button
                        onClick={handleNearMe}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-bold transition-all active:scale-95
                        ${location
                                ? 'bg-primary/5 text-primary border-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Navigation size={14} className={location ? "fill-primary" : ""} />
                        {location ? "Nearby Active" : "Near Me"}
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95
                        ${showFilters ? 'bg-gray-100' : 'bg-white'}`}
                    >
                        <Filter size={14} />
                        Filters
                    </button>
                </div>

                {/* Radius Slider - Shows when Near Me is active */}
                {location && (
                    <div className="mt-3 pt-3 border-t border-gray-100 transition-all animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                <MapPin size={12} />
                                Search Radius
                            </label>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {filters.radius} km
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={filters.radius}
                            onChange={(e) => updateFilter('radius', Number(e.target.value))}
                            onMouseUp={() => fetchProperties()}
                            onTouchEnd={() => fetchProperties()}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-400 font-medium">1 km</span>
                            <span className="text-[10px] text-gray-400 font-medium">100 km</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="px-4 py-4">

                {/* Results Count & Sort */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-800">
                        {properties.length} properties found
                    </h2>

                    {/* Sort Dropdown (Small) */}
                    <div className="relative">
                        <select
                            value={filters.sort}
                            onChange={(e) => updateFilter('sort', e.target.value)}
                            className="text-xs font-bold text-gray-500 bg-transparent outline-none pr-1 cursor-pointer"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value} disabled={opt.value === 'distance' && !location}>
                                    Sort by {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white h-64 rounded-2xl animate-pulse border border-gray-100"></div>
                        ))}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-6">
                            <Search size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">No properties found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                            Try changing your search or filters to find what you're looking for.
                        </p>
                        <button
                            onClick={() => {
                                setFilters({
                                    search: '',
                                    type: 'all',
                                    minPrice: '',
                                    maxPrice: '',
                                    sort: 'newest',
                                    amenities: [],
                                    radius: 50
                                });
                                setLocation(null);
                                setSearchParams({});
                            }}
                            className="mt-8 text-sm font-bold text-primary hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {properties.map(property => (
                            <PropertyCard key={property._id} property={property} />
                        ))}
                    </div>
                )}
            </div>

            {/* Filters Sidebar/Modal (Same logic, slightly updated style if needed) */}
            <div className={`
                fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300
                ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `} onClick={() => setShowFilters(false)}>
                <div
                    className={`
                        absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-5 overflow-y-auto transition-transform duration-300
                        ${showFilters ? 'translate-x-0' : 'translate-x-full'}
                    `}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100">✕</button>
                    </div>

                    <div className="space-y-8">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {propertyTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateFilter('type', type.toLowerCase())}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all
                                        ${(filters.type === type.toLowerCase() || (type === 'All' && filters.type === 'all'))
                                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Price Range</label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-primary"
                                        value={filters.minPrice}
                                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                                    />
                                </div>
                                <span className="text-gray-400 font-bold">-</span>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-primary"
                                        value={filters.maxPrice}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Radius */}
                        {location && (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700">Search Radius</label>
                                    <span className="text-xs font-bold text-primary">{filters.radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="50"
                                    value={filters.radius}
                                    onChange={(e) => updateFilter('radius', e.target.value)}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        )}

                        <button
                            onClick={applyFilters}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SearchPage;
