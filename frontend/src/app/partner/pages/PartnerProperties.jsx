import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Pencil, PlusCircle, Trash2, Eye } from 'lucide-react';
import { propertyService } from '../../../services/apiService';
import PartnerHeader from '../components/PartnerHeader';

const PartnerProperties = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertiesByType, setPropertiesByType] = useState({});

  const fetchProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await propertyService.getMy();
      const grouped = {};
      (res.properties || []).forEach(p => {
        const type = p.propertyType || 'other';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(p);
      });
      setPropertiesByType(grouped);
    } catch (e) {
      setError(e?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleEditProperty = (property) => {
    if (property.propertyType === 'hotel') {
      navigate('/hotel/join-hotel', { state: { property } });
    } else if (property.propertyType === 'villa') {
      navigate('/hotel/join-villa', { state: { property } });
    } else if (property.propertyType === 'hostel') {
      navigate('/hotel/join-hostel', { state: { property } });
    } else if (property.propertyType === 'pg') {
      navigate('/hotel/join-pg', { state: { property } });
    } else if (property.propertyType === 'resort') {
      navigate('/hotel/join-resort', { state: { property } });
    } else if (property.propertyType === 'homestay') {
      navigate('/hotel/join-homestay', { state: { property } });
    }
  };

  const handleViewDetails = (property) => {
    navigate(`/hotel/properties/${property._id}`);
  };

  const sections = Object.entries(propertiesByType);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PartnerHeader title="My Properties" subtitle="Manage your listings by property type" />

      <div className="px-4 pt-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={14} /> Your Listings
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/hotel/join')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#004F4D] text-white text-[11px] font-bold uppercase tracking-wide active:scale-95"
            >
              <PlusCircle size={14} /> Add New
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-xs text-gray-500">Loading properties...</p>
        )}

        {!loading && sections.length === 0 && (
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>No properties found. Start by adding your first property.</p>
          </div>
        )}

        <div className="space-y-6">
          {sections.map(([type, list]) => (
            <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {type.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-gray-500">{list.length} properties</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {list.map(property => (
                  <div key={property._id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {property.coverImage ? (
                        <img
                          src={property.coverImage}
                          alt={property.propertyName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {property.propertyName}
                          </p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                            <span>
                              {property.address?.city || 'Unknown City'}, {property.address?.state || ''}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border text-gray-600 bg-gray-50 uppercase font-bold">
                            {property.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[11px] text-gray-400 line-clamp-2">
                          {property.shortDescription || 'No short description'}
                        </p>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => handleViewDetails(property)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 text-gray-700 text-[10px] font-bold uppercase border border-gray-200"
                          >
                            <Eye size={11} /> Details
                          </button>
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase border border-teal-100"
                          >
                            <Pencil size={11} /> Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-500 border border-red-100"
                            disabled
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerProperties;
