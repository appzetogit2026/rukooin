import React, { useEffect, useState } from 'react';
import { propertyService } from '../../services/apiService';
import PropertyCard from './PropertyCard';
import { Loader2 } from 'lucide-react';

const PropertyFeed = ({ selectedType, selectedCity }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = {};
        // Backend expects 'type' for property type filtering
        if (selectedType && selectedType !== 'All') filters.type = selectedType;

        // Note: Backend currently does not support 'city' filtering in main query. 
        // We might need to filter client-side if strict filtering is needed.
        // For now, we fetch based on type.

        const data = await propertyService.getPublic(filters);

        // Client-side filtering for City if selected (since backend ignores it)
        let filteredData = data;
        if (selectedCity && selectedCity !== 'All') {
          filteredData = data.filter(p => p.address?.city?.toLowerCase() === selectedCity.toLowerCase());
        }

        setProperties(filteredData);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError("Could not load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [selectedType, selectedCity]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-surface" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>No properties found in this category.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map(property => (
        <PropertyCard key={property._id} data={property} />
      ))}
    </div>
  );
};

export default PropertyFeed;
