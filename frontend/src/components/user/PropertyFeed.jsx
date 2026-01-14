import React, { useEffect, useState } from 'react';
import { hotelService } from '../../services/apiService';
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
        if (selectedType && selectedType !== 'All') filters.category = selectedType;
        if (selectedCity && selectedCity !== 'All') filters.city = selectedCity;

        const data = await hotelService.getAll(filters);
        setProperties(data);
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
