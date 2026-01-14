import React from 'react';
import { MapPin, Star, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property, data, className = "" }) => {
  const navigate = useNavigate();

  const item = property || data;

  if (!item) return null;

  const {
    _id,
    name,
    address,
    images,
    propertyType,
    rating,
    startingPrice,
    details
  } = item;

  // Handle nested details if present (SearchPage mock data structure support)
  const amenities = details?.amenities || item.amenities;

  // Determine badge color based on type
  const getTypeColor = (type) => {
    switch (type) {
      case 'Hotel': return 'bg-blue-100 text-blue-700';
      case 'Villa': return 'bg-purple-100 text-purple-700';
      case 'Resort': return 'bg-orange-100 text-orange-700';
      case 'Homestay': return 'bg-green-100 text-green-700';
      case 'Hostel': return 'bg-pink-100 text-pink-700';
      case 'PG': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      onClick={() => navigate(`/hotel/${_id}`)}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-0 cursor-pointer active:scale-95 transition-transform duration-200 hover:shadow-md ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-32 w-full bg-gray-50 p-2 flex items-center justify-center">
        <img
          src={images?.cover || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={name}
          className="w-full h-full object-contain rounded-lg"
        />

        {/* Type Badge */}
        <div className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${getTypeColor(propertyType)} shadow-sm`}>
          {propertyType}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-bold text-surface shadow-sm border border-gray-100">
          <Star size={10} className="fill-honey text-honey" />
          {rating || 4.5}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xs text-gray-800 line-clamp-1">{name}</h3>
        </div>

        <div className="flex items-start gap-1 text-gray-500 text-[10px] mb-2 min-h-[2em]">
          <MapPin size={12} className="mt-0.3 shrink-0" />
          <span className="leading-tight line-clamp-2">
            {address?.city}, {address?.state}
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-gray-400 font-medium">Starts from</p>
            <div className="flex items-center gap-1 text-surface font-bold text-xs">
              <IndianRupee size={12} />
              {startingPrice ? startingPrice.toLocaleString() : 'N/A'}
              <span className="text-[10px] text-gray-400 font-normal ml-0.5">/ night</span>
            </div>
          </div>

          <button className="bg-surface/10 text-surface px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-surface hover:text-white transition-colors">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
