import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelService, bookingService } from '../../services/apiService';
import {
  MapPin, Star, Share2, Heart, ArrowLeft,
  Wifi, Coffee, Car, Shield, Info, CheckCircle, Clock,
  Users, Calendar, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState({ rooms: 1, adults: 2, children: 0 });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await hotelService.getById(id);
        
        // Handle backend response structure { property, roomTypes, documents }
        let normalizedData = response;
        
        if (response.property) {
          const { property: backendProp, roomTypes = [] } = response;
          normalizedData = {
            ...backendProp,
            name: backendProp.propertyName,
            images: {
              cover: backendProp.coverImage,
              gallery: backendProp.propertyImages || []
            },
            rating: backendProp.avgRating,
            inventory: roomTypes.map(rt => ({
              ...rt,
              id: rt._id,
              pricing: {
                basePrice: rt.pricePerNight,
                extraGuestPrice: rt.extraAdultPrice
              }
            })),
            amenities: backendProp.amenities || [],
            policies: {
              checkInTime: backendProp.checkInTime,
              checkOutTime: backendProp.checkOutTime,
              cancellationPolicy: backendProp.cancellationPolicy,
              houseRules: backendProp.houseRules
            }
          };
        }

        setProperty(normalizedData);
        if (normalizedData.inventory && normalizedData.inventory.length > 0) {
          setSelectedRoom(normalizedData.inventory[0]);
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        toast.error("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Helper derived state for hooks (safe access)
  const propertyType = property?.propertyType;
  const isBedBased = ['Hostel', 'PG'].includes(propertyType);

  // Update guests when rooms change to ensure valid state
  useEffect(() => {
    if (isBedBased) {
      setGuests(prev => ({ ...prev, adults: prev.rooms, children: 0 }));
    }
  }, [guests.rooms, isBedBased]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedRoom]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-surface" size={40} /></div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Property not found</div>;

  const {
    _id, name, address, images, description, rating,
    inventory, amenities, policies, config
  } = property;

  const hasInventory = inventory && inventory.length > 0;
  // Treated as Whole Unit if it's a Villa OR (Homestay/Apartment with NO separate inventory units)
  const isWholeUnit = propertyType === 'Villa' || (['Homestay', 'Apartment'].includes(propertyType) && !hasInventory);

  const getNightBreakup = (room) => {
    if (!room || !room.pricing) {
      return { nights: 0, weekdayNights: 0, weekendNights: 0, perNight: getRoomPrice(room) };
    }
    const { basePrice, weekendPrice } = room.pricing;
    if (!dates.checkIn || !dates.checkOut) {
      const base = typeof basePrice === 'number' ? basePrice : (typeof weekendPrice === 'number' ? weekendPrice : getRoomPrice(room));
      return { nights: 0, weekdayNights: 0, weekendNights: 0, perNight: base };
    }
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    if (isNaN(start) || isNaN(end) || end <= start) {
      const base = typeof basePrice === 'number' ? basePrice : (typeof weekendPrice === 'number' ? weekendPrice : getRoomPrice(room));
      return { nights: 0, weekdayNights: 0, weekendNights: 0, perNight: base };
    }
    let current = new Date(start);
    let nights = 0;
    let weekdayNights = 0;
    let weekendNights = 0;
    let total = 0;
    while (current < end) {
      const day = current.getDay();
      const isWeekendDay = day === 5 || day === 6;
      const dayPrice = isWeekendDay && typeof weekendPrice === 'number' ? weekendPrice : (typeof basePrice === 'number' ? basePrice : getRoomPrice(room));
      total += dayPrice;
      nights += 1;
      if (isWeekendDay) weekendNights += 1;
      else weekdayNights += 1;
      current.setDate(current.getDate() + 1);
    }
    const perNight = nights > 0 ? Math.round(total / nights) : getRoomPrice(room);
    return { nights, weekdayNights, weekendNights, perNight };
  };

  const getRoomPrice = (room) => {
    if (!room) return null;
    if (room.pricing) {
      if (typeof room.pricing.basePrice === 'number') return room.pricing.basePrice;
      if (typeof room.pricing.weekendPrice === 'number') return room.pricing.weekendPrice;
    }
    return room.price || null;
  };

  const getExtraPricingLabels = (room) => {
    if (!room || !room.pricing) return [];
    const labels = [];
    if (typeof room.pricing.extraAdultPrice === 'number') {
      labels.push(`Extra adult: ₹${room.pricing.extraAdultPrice} / night`);
    }
    if (typeof room.pricing.extraChildPrice === 'number') {
      labels.push(`Extra child: ₹${room.pricing.extraChildPrice} / night`);
    }
    return labels;
  };

  const getMaxAdults = () => {
    if (isWholeUnit) return property.structure?.maxGuests || property.maxGuests || 12;
    if (isBedBased) return guests.rooms; // 1 person per bed

    // If a room is selected, prioritize its specific limits
    if (selectedRoom) {
      if (selectedRoom.maxAdults) return selectedRoom.maxAdults * guests.rooms;
      if (selectedRoom.capacity) return selectedRoom.capacity * guests.rooms;
    }

    if (propertyType === 'Resort') return guests.rooms * 4; // Resorts often allow more
    return guests.rooms * 3; // Max 3 adults per room standard
  };

  const getMaxChildren = () => {
    if (isBedBased) return 0;
    if (isWholeUnit) return 6;

    if (selectedRoom && selectedRoom.maxChildren !== undefined) {
      return selectedRoom.maxChildren * guests.rooms;
    }

    return guests.rooms * 2; // Max 2 children per room
  };

  const getUnitLabel = () => {
    if (isBedBased) return 'Beds';
    if (propertyType === 'Homestay' || propertyType === 'Villa') return 'Units';
    return 'Rooms';
  };

  const getGalleryImages = () => {
    if (selectedRoom && selectedRoom.images && selectedRoom.images.length > 0) {
      return selectedRoom.images
        .map((img) => (typeof img === 'string' ? img : img.url))
        .filter(Boolean);
    }
    const list = [];
    if (images?.cover) list.push(images.cover);
    if (Array.isArray(images?.gallery)) list.push(...images.gallery);
    if (list.length > 0) return list;
    return ['https://via.placeholder.com/800x600'];
  };

  const galleryImages = getGalleryImages();
  const mainImage = galleryImages[Math.min(currentImageIndex, Math.max(galleryImages.length - 1, 0))];
  const activeRoom = selectedRoom || (hasInventory ? inventory[0] : null);
  const stayPricing = getNightBreakup(activeRoom);
  const bookingRoom = selectedRoom || activeRoom;
  const extraPricingLabels = getExtraPricingLabels(bookingRoom);
  const bookingBarPrice =
    stayPricing.nights > 0
      ? stayPricing.perNight
      : getRoomPrice(bookingRoom) || property.minPrice || null;

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handleBook = async () => {
    if (!dates.checkIn || !dates.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (!isWholeUnit && !selectedRoom) {
      toast.error(`Please select a ${isBedBased ? 'bed/room' : 'room'} first`);
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        hotelId: _id,
        inventoryId: selectedRoom?._id, // undefined for whole unit
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        guests: {
          ...guests,
          units: guests.rooms // Backend uses 'units' or 'rooms'
        },
        // totalAmount is calculated on backend usually, but we can pass estimate if needed
      };

      const response = await bookingService.create(payload);
      toast.success("Booking initiated!");
      navigate(`/booking/${response.bookingId || response.booking?.bookingId || response._id}`, {
        state: { booking: response.booking || response }
      });
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(error.message || "Failed to initiate booking");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header Image */}
      <div className="relative h-[40vh] md:h-[50vh]">
        <img
          src={mainImage}
          alt={name}
          className="w-full h-full object-cover"
        />
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {galleryImages.map((_, index) => (
                <span
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-4 left-4 z-10">
          <button onClick={() => navigate(-1)} className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors">
            <ArrowLeft size={20} className="text-surface" />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors">
            <Share2 size={20} className="text-surface" />
          </button>
          <button className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors">
            <Heart size={20} className="text-surface" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-0 md:px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.1)] p-5 pb-32 md:p-8 min-h-screen md:min-h-fit">

          {/* Title & Badge */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-surface/10 text-surface text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {propertyType}
                </span>
                {rating && (
                  <div className="flex items-center gap-1 bg-honey/10 text-honey-dark px-2 py-0.5 rounded text-[10px] font-bold">
                    <Star size={10} className="fill-honey text-honey" />
                    {rating}
                  </div>
                )}
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-textDark mb-1 leading-tight">{name}</h1>
              <div className="flex items-start gap-1.5 text-gray-500 text-xs md:text-sm">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2 md:line-clamp-1">{address?.addressLine}, {address?.city}, {address?.state}</span>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-surface">₹{stayPricing.perNight || getRoomPrice(activeRoom) || property.minPrice || 'N/A'}</p>
              {stayPricing.nights > 0 && (
                <p className="text-[11px] text-gray-400">
                  {stayPricing.nights} nights ({stayPricing.weekdayNights} weekday, {stayPricing.weekendNights} weekend)
                </p>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-textDark mb-3">About this place</h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {description || "No description available."}
            </p>
          </div>

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-textDark mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-gray-600 text-sm">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <CheckCircle size={16} className="text-surface" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type Specific Info - Dynamic Rendering */}
          {propertyType === 'PG' && config && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h3 className="font-bold text-yellow-900 mb-2">PG Details</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>Type: {config.pgType}</li>
                  <li>Food: {config.mealsIncluded === 'Yes' ? `Included (${config.foodType})` : 'Not Included'}</li>
                  <li>Notice Period: {config.noticePeriod}</li>
                  {config.laundryService && <li>Laundry: {config.laundryService}</li>}
                  {config.housekeeping && <li>Housekeeping: {config.housekeeping}</li>}
                </ul>
              </div>
            </div>
          )}

          {propertyType === 'Hotel' && config && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2">Hotel Info</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Category: {config.hotelCategory}</li>
                  {config.starRating && <li>Rating: {config.starRating} Stars</li>}
                </ul>
              </div>
            </div>
          )}

          {propertyType === 'Villa' && (property.structure || config) && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-bold text-green-900 mb-2">Villa Structure</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  {property.structure ? (
                    <>
                      <li>Bedrooms: {property.structure.bedrooms}</li>
                      <li>Bathrooms: {property.structure.bathrooms}</li>
                      <li>Max Guests: {property.structure.maxGuests}</li>
                      <li>Kitchen: {property.structure.kitchenAvailable ? 'Available' : 'No'}</li>
                    </>
                  ) : (
                    <li>Details available on request</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {propertyType === 'Resort' && config && (
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-teal-50 rounded-xl">
                  <h3 className="font-bold text-teal-900 mb-2">Resort Highlights</h3>
                  <ul className="text-sm text-teal-800 space-y-1">
                    <li>Theme: {config.resortTheme}</li>
                    <li>Category: {config.resortCategory}</li>
                    <li>Reception: {config.receptionAvailable ? '24/7' : 'Limited Hours'}</li>
                  </ul>
                </div>
                {property.mealPlans && property.mealPlans.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <h3 className="font-bold text-orange-900 mb-2">Meal Plans</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.mealPlans.map((plan, i) => (
                        <span key={i} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          {plan.mealType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {property.activities && property.activities.length > 0 && (
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <h3 className="font-bold text-indigo-900 mb-2">Activities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {property.activities.map((act, i) => (
                      <div key={i} className="text-sm text-indigo-800">
                        <span className="font-semibold">{act.name}</span>
                        <span className="text-xs ml-1 opacity-75">({act.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {propertyType === 'Homestay' && config && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <h3 className="font-bold text-amber-900 mb-2">Homestay Experience</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  {property.hostName && <li>Host: {property.hostName}</li>}
                  <li>Food: {config.foodType} ({config.mealsAvailable === 'Yes' ? 'Available' : 'Not Available'})</li>
                  <li>Shared Areas: {config.sharedAreas ? 'Yes' : 'No'}</li>
                  {config.idealFor && config.idealFor.length > 0 && <li>Ideal For: {Array.isArray(config.idealFor) ? config.idealFor.join(', ') : config.idealFor}</li>}
                  {config.stayExperience && <li>Experience: {config.stayExperience}</li>}
                </ul>
              </div>
            </div>
          )}

          {propertyType === 'Hostel' && config && (
            <div className="mb-8 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <h3 className="font-bold text-purple-900 mb-2">Hostel Info</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>Type: {config.hostelType}</li>
                  <li>Curfew: {config.curfewTime || 'No Curfew'}</li>
                  <li>Age Restriction: {config.ageRestriction ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Inventory / Rooms - Conditional */}
          {!isWholeUnit && inventory && inventory.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-textDark mb-4">
                {isBedBased ? 'Choose your Bed/Room' : 'Choose your room'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {inventory.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => setSelectedRoom(room)}
                    className={`
                      border rounded-xl p-4 cursor-pointer transition-all relative overflow-hidden
                      ${selectedRoom?._id === room._id ? 'border-surface bg-surface/5 ring-1 ring-surface' : 'border-gray-200 hover:border-surface/50'}
                    `}
                  >
                    {selectedRoom?._id === room._id && (
                      <div className="absolute top-0 right-0 bg-surface text-white text-[10px] px-2 py-1 rounded-bl-lg">
                        Selected
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-textDark">{room.type}</h4>
                      <span className="font-bold text-surface">₹{getRoomPrice(room) || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{room.description || `Comfortable ${room.type}`}</p>
                    {getExtraPricingLabels(room).length > 0 && (
                      <div className="text-[11px] text-gray-600 mb-2 space-y-0.5">
                        {getExtraPricingLabels(room).map((label, index) => (
                          <div key={index}>{label}</div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {room.amenities?.slice(0, 3).map((am, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-600">{am}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Inputs (Date & Guest) */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-bold text-textDark mb-3">Trip Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Check-in</label>
                <input
                  type="date"
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-surface"
                  value={dates.checkIn}
                  onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Check-out</label>
                <input
                  type="date"
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-surface"
                  value={dates.checkOut}
                  onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                />
              </div>

              {/* Dynamic Guest/Room Inputs */}
              {!isWholeUnit && (
                <div className="col-span-1">
                  <label className="text-xs text-gray-500 block mb-1">{getUnitLabel()}</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-surface"
                    value={guests.rooms}
                    onChange={e => setGuests({ ...guests, rooms: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}

              <div className="col-span-1">
                <label className="text-xs text-gray-500 block mb-1">Adults</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-surface"
                  value={guests.adults}
                  onChange={e => setGuests({ ...guests, adults: parseInt(e.target.value) })}
                  disabled={isBedBased}
                >
                  {Array.from({ length: getMaxAdults() }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {!isBedBased && (
                <div className="col-span-1">
                  <label className="text-xs text-gray-500 block mb-1">Children</label>
                  <select
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-surface"
                    value={guests.children}
                    onChange={e => setGuests({ ...guests, children: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: getMaxChildren() + 1 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          {policies && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-textDark mb-4">House Rules & Policies</h2>
              <div className="grid md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-surface" />
                  <div>
                    <span className="font-semibold block text-textDark">Check-in</span>
                    <span>{policies.checkInTime || '12:00 PM'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-surface" />
                  <div>
                    <span className="font-semibold block text-textDark">Check-out</span>
                    <span>{policies.checkOutTime || '11:00 AM'}</span>
                  </div>
                </div>

                {policies.cancellationPolicy && (
                  <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                    <Info size={18} className="text-surface" />
                    <div>
                      <span className="font-semibold block text-textDark">Cancellation Policy</span>
                      <span>{policies.cancellationPolicy}</span>
                    </div>
                  </div>
                )}

                {/* Dynamic Policy Badges */}
                <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {[
                    { label: 'Pets Allowed', value: policies.petsAllowed || policies.petFriendly, type: 'bool' },
                    { label: 'Smoking Allowed', value: policies.smokingAllowed || policies.smokingAlcohol, type: 'bool' },
                    { label: 'Alcohol Allowed', value: policies.alcoholAllowed, type: 'bool' },
                    { label: 'Couple Friendly', value: policies.coupleFriendly, type: 'bool' },
                    { label: 'ID Required', value: policies.idProofMandatory || policies.idProofRequired || policies.idRequirement, type: 'mixed' }
                  ].map((rule, idx) => {
                    if (rule.value === undefined || rule.value === null) return null;

                    let displayValue = '';
                    if (rule.type === 'bool') {
                      if (rule.value === true || rule.value === 'Yes' || rule.value === 'Allowed') displayValue = 'Yes';
                      else if (rule.value === false || rule.value === 'No' || rule.value === 'Not Allowed') displayValue = 'No';
                      else displayValue = rule.value; // Fallback
                    } else {
                      displayValue = typeof rule.value === 'boolean' ? (rule.value ? 'Yes' : 'No') : rule.value;
                    }

                    if (!displayValue) return null;

                    return (
                      <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <Shield size={14} className="text-gray-400" />
                        <span>{rule.label}: <span className="font-semibold text-textDark">{displayValue}</span></span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom House Rules List */}
                {policies.houseRules && Array.isArray(policies.houseRules) && policies.houseRules.length > 0 && (
                  <div className="col-span-2 mt-2">
                    <span className="font-semibold block text-textDark mb-2">Additional Rules</span>
                    <ul className="list-disc list-inside space-y-1">
                      {policies.houseRules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Object based house rules (Villa) */}
                {policies.houseRules && !Array.isArray(policies.houseRules) && typeof policies.houseRules === 'object' && (
                  <div className="col-span-2 mt-2">
                    <span className="font-semibold block text-textDark mb-2">House Rules</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(policies.houseRules).map(([key, val], i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded border ${val ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}: {val ? 'Yes' : 'No'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Price per night</p>
            <p className="font-bold text-lg text-surface">
              ₹{bookingBarPrice || 'N/A'}
            </p>
            {extraPricingLabels.length > 0 && (
              <p className="text-[11px] text-gray-500">
                {extraPricingLabels.join(' • ')}
              </p>
            )}
          </div>
          <button
            onClick={handleBook}
            disabled={bookingLoading}
            className="bg-surface text-white px-8 py-3 rounded-xl font-bold flex-1 md:flex-none md:w-64 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-surface-dark transition-colors"
          >
            {bookingLoading ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default PropertyDetailsPage;
