import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, IndianRupee, Users, BedDouble, ArrowLeft, CheckCircle } from 'lucide-react';
import { propertyService } from '../../../services/apiService';
import PartnerHeader from '../components/PartnerHeader';

const PartnerPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await propertyService.getDetails(id);
        setProperty(res.property || null);
        setRoomTypes(res.roomTypes || []);
      } catch (e) {
        setError(e?.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getEditPath = (p) => {
    if (!p?.propertyType) return null;
    if (p.propertyType === 'hotel') return '/hotel/join-hotel';
    if (p.propertyType === 'villa') return '/hotel/join-villa';
    if (p.propertyType === 'hostel') return '/hotel/join-hostel';
    if (p.propertyType === 'pg') return '/hotel/join-pg';
    if (p.propertyType === 'resort') return '/hotel/join-resort';
    if (p.propertyType === 'homestay') return '/hotel/join-homestay';
    return null;
  };

  const handleEditProperty = () => {
    const path = getEditPath(property);
    if (path) {
      navigate(path, { state: { property } });
    }
  };

  const handleEditRoomTypes = () => {
    const path = getEditPath(property);
    if (path) {
      navigate(path, { state: { property, initialStep: 2 } });
    }
  };

  const statusLabel = property?.status || 'draft';
  const isLive = !!property?.isLive;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PartnerHeader />
      <div className="px-4 pt-4 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs text-gray-500 mb-3 active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>Back to properties</span>
        </button>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#004F4D] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {!loading && !error && property && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-100 relative">
                {property.coverImage ? (
                  <img
                    src={property.coverImage}
                    alt={property.propertyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                    No cover image
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {property.propertyType || 'Property'}
                    </p>
                    <h1 className="text-lg font-black text-gray-900 leading-snug truncate">
                      {property.propertyName}
                    </h1>
                    <p className="mt-1 text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {property.address?.city || 'Unknown City'}, {property.address?.state || ''}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full border text-gray-700 bg-gray-50 uppercase font-bold">
                      {statusLabel}
                    </span>
                    {isLive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} />
                        Live
                      </span>
                    )}
                  </div>
                </div>
                {(property.shortDescription || property.description) && (
                  <p className="text-xs text-gray-600">
                    {property.shortDescription || property.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleEditProperty}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#004F4D] text-white text-xs font-bold uppercase active:scale-95"
              >
                Edit Property
              </button>
              <button
                onClick={handleEditRoomTypes}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white text-[#004F4D] border border-[#004F4D]/20 text-xs font-bold uppercase active:scale-95"
              >
                Manage Room Types
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Room Types
                </h2>
                <span className="text-[10px] text-gray-500">
                  {roomTypes.length} active
                </span>
              </div>

              {roomTypes.length === 0 && (
                <p className="text-xs text-gray-500">
                  No room types added yet. Use Manage Room Types to create them.
                </p>
              )}

              {roomTypes.length > 0 && (
                <div className="space-y-3">
                  {roomTypes.map((rt) => (
                    <div
                      key={rt._id}
                      className="border border-gray-100 rounded-xl p-3 flex gap-3 items-start"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {rt.images && rt.images.length > 0 ? (
                          <img
                            src={rt.images[0]}
                            alt={rt.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {rt.name}
                            </p>
                            <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1">
                                <Users size={11} className="text-gray-400" />
                                <span>
                                  {rt.maxAdults} Adults
                                  {rt.maxChildren ? ` + ${rt.maxChildren} Children` : ''}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <BedDouble size={11} className="text-gray-400" />
                                <span>{rt.totalInventory} units</span>
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#004F4D] flex items-center justify-end gap-1">
                              <IndianRupee size={11} />
                              <span>{rt.pricePerNight}</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Per night, before tax
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border text-gray-600 bg-gray-50 uppercase font-bold">
                            {rt.inventoryType} • {rt.roomCategory}
                          </span>
                          <button
                            onClick={handleEditRoomTypes}
                            className="text-[10px] font-bold text-[#004F4D] active:scale-95"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerPropertyDetails;

