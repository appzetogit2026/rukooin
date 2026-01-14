import Property from '../models/Property.js';
import HotelDetails from '../models/details/HotelDetails.js';
import VillaDetails from '../models/details/VillaDetails.js';
import HostelDetails from '../models/details/HostelDetails.js';
import PGDetails from '../models/details/PGDetails.js';
import ResortDetails from '../models/details/ResortDetails.js';
import HomestayDetails from '../models/details/HomestayDetails.js';
import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';
import axios from 'axios';

// Factory to get correct model
const getDetailsModel = (type) => {
  switch (type) {
    case 'Villa': return VillaDetails;
    case 'Hostel': return HostelDetails;
    case 'PG': return PGDetails;
    case 'Resort': return ResortDetails;
    case 'Homestay': return HomestayDetails;
    case 'Hotel': return HotelDetails;
    default: return HotelDetails;
  }
};

// --- SEARCH & PUBLIC ---

export const getAllHotels = async (req, res) => {
  try {
    const { city, category, search } = req.query;

    // Base Query
    const query = { status: 'approved' }; // Only show approved properties

    // 1. Filter by City
    if (city && city !== 'All') {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // 2. Filter by Category
    if (category && category !== 'All') {
      query.propertyType = category;
    }

    // 3. Text Search (Name or Location)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.area': { $regex: search, $options: 'i' } }
      ];
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    // Merge Details & Inventory for Card Display
    const mergedList = await Promise.all(properties.map(async (p) => {
      const DetailsModel = getDetailsModel(p.propertyType);
      let details = {};
      if (DetailsModel) {
        details = await DetailsModel.findOne({ propertyId: p._id }).lean();
      }

      // Optimization: Only fetch essential inventory fields for listing card
      const inventory = await Inventory.find({ propertyId: p._id })
        .select('price monthlyPrice pricing type capacity gender')
        .lean();

      // Calculate "Starting From" Price
      let minPrice = Infinity;
      inventory.forEach(item => {
        // Prioritize direct price, then nested pricing, then monthly (for PG)
        let itemPrice = item.price;
        if (!itemPrice && item.pricing?.basePrice) itemPrice = item.pricing.basePrice;
        if (!itemPrice && item.monthlyPrice) itemPrice = item.monthlyPrice;

        if (itemPrice && itemPrice < minPrice) minPrice = itemPrice;
      });

      // If no inventory price found, check VillaDetails for whole unit price
      if (minPrice === Infinity && p.propertyType === 'Villa' && details?.pricing?.basePrice) {
        minPrice = details.pricing.basePrice;
      }

      // Fallback if no inventory yet
      if (minPrice === Infinity) minPrice = p.minPrice || 0;

      return {
        ...p.toObject(),
        details: details || {}, // Contains config, policies, structure
        startingPrice: minPrice,
        inventoryCount: inventory.length
      };
    }));

    res.json(mergedList);
  } catch (error) {
    console.error('Get All Hotels Error:', error);
    res.status(500).json({ message: error.message });
  }
};


// --- ONBOARDING & CRUD ---

export const saveOnboardingStep = async (req, res) => {
  try {
    const { hotelDraftId, step, ...data } = req.body;
    const currentStep = Number(step); // Ensure step is a number
    const userId = req.user._id;

    let property;

    console.log(`Saving Step ${currentStep} for ${hotelDraftId || 'New Draft'}`);

    // STEP 1: CREATE DRAFT or INITIALIZE
    // Relaxed check: if step is 1 and no ID, OR if explicitly 'new'
    if (currentStep === 1 && (!hotelDraftId || hotelDraftId === 'new')) {
      const newProp = new Property({
        ownerId: userId,
        propertyType: data.propertyCategory,
        status: 'draft',
        location: { type: 'Point', coordinates: [0, 0] } // Initialize valid GeoJSON for index
      });
      property = await newProp.save();

      // Create initial details doc
      const DetailsModel = getDetailsModel(data.propertyCategory);
      if (DetailsModel) {
        await DetailsModel.create({ propertyId: property._id });
      }

      return res.json({ success: true, hotelId: property._id, property });
    }

    // FIND EXISTING
    if (!hotelDraftId) {
      return res.status(400).json({ message: "Property ID is missing for update step" });
    }

    property = await Property.findById(hotelDraftId);
    if (!property) return res.status(404).json({ message: `Property not found (ID: ${hotelDraftId})` });

    const type = property.propertyType;
    const DetailsModel = getDetailsModel(type);

    // --- UPDATE LOGIC ---

    // BASE PROPERTY UPDATES (Basic info, Location, Images, Status)
    if ([1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13].includes(currentStep)) {
      const updates = {};

      // Basics
      if (data.name) updates.name = data.name;
      if (data.description) updates.description = data.description;
      if (data.shortDescription) updates.shortDescription = data.shortDescription;

      // Location
      if (data.address) {
        updates.address = data.address;
      }
      if (data.location && data.location.coordinates) {
        updates.location = data.location;
      }

      // Media
      if (data.images) updates.images = data.images;

      // Status
      if (data.status) {
        console.log(`Step ${currentStep}: Updating status to: ${data.status}`);
        updates.status = data.status;
      }

      await Property.findByIdAndUpdate(hotelDraftId, { $set: updates });
    }

    // INVENTORY SAVE (If 'inventory' is present in payload, replace all)
    if (data.inventory && Array.isArray(data.inventory)) {
      console.log(`Step ${currentStep}: Replacing Inventory (${data.inventory.length} items)`);
      await Inventory.deleteMany({ propertyId: hotelDraftId });
      if (data.inventory.length > 0) {
        const items = data.inventory.map(i => ({
          ...i,
          propertyId: hotelDraftId,
          images: Array.isArray(i.images)
            ? i.images.map(img => (typeof img === 'string' ? { url: img } : img))
            : []
        }));
        await Inventory.insertMany(items);
      }
    }

    // DETAILS UPDATES (Config, Amenities, Contacts, Policies, Documents, Nearby, Pricing, Structure)
    // We allow these updates on ANY step that sends them, to be safe.
    if (DetailsModel) {
      const updates = {};

      if (data.config) updates.config = data.config;
      if (data.pgType) updates['config.pgType'] = data.pgType;

      if (data.structure) updates.structure = data.structure;
      if (data.policies) updates.policies = data.policies;
      if (data.amenities) updates.amenities = data.amenities;
      if (data.contacts) updates.contacts = data.contacts;
      if (data.documents) updates.documents = data.documents;
      if (data.nearbyPlaces) updates.nearbyPlaces = data.nearbyPlaces;

      // Pricing & Fees (Common across types)
      if (data.pricing) updates.pricing = data.pricing;
      if (data.cleaningFee !== undefined) updates.cleaningFee = data.cleaningFee;
      if (data.securityDeposit !== undefined) updates.securityDeposit = data.securityDeposit;

      // Resort specific
      if (data.mealPlans) updates.mealPlans = data.mealPlans;
      if (data.activities) updates.activities = data.activities;

      // PG/Hostel specific
      if (data.food) updates.food = data.food; // If food config is flat or obj

      if (Object.keys(updates).length > 0) {
        await DetailsModel.findOneAndUpdate(
          { propertyId: hotelDraftId },
          { $set: updates },
          { new: true, upsert: true }
        );
      }
    }

    // Return updated full data
    const updatedProp = await Property.findById(hotelDraftId);
    // Fetch details to return complete object
    const details = DetailsModel ? await DetailsModel.findOne({ propertyId: hotelDraftId }) : {};

    // Inventory
    const inventory = await Inventory.find({ propertyId: hotelDraftId });

    return res.json({
      success: true,
      hotelId: updatedProp._id,
      data: {
        ...updatedProp.toObject(),
        ...(details ? (() => {
          const { _id, ...rest } = details.toObject();
          return rest;
        })() : {}),
        inventory
      }
    });

  } catch (error) {
    console.error('Save Step Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const DetailsModel = getDetailsModel(property.propertyType);
    const details = await DetailsModel.findOne({ propertyId: property._id });
    const inventory = await Inventory.find({ propertyId: property._id });

    const fullData = {
      ...property.toObject(),
      ...(details ? (() => {
        const { _id, createdAt, updatedAt, __v, ...rest } = details.toObject();
        return rest;
      })() : {}),
      inventory,
      propertyId: property._id
    };

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    const properties = await Property.find({ ownerId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, hotels: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    await Property.findByIdAndDelete(id);
    // Also delete details and inventory
    // Ideally should check property type first
    await Inventory.deleteMany({ propertyId: id });
    // Details deletion skipped for brevity but recommended
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UTILS ---

export const getCurrentLocation = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'Google API Key not configured' });
    const response = await axios.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {});
    if (response.data && response.data.location) {
      return res.status(200).json({ success: true, location: { lat: response.data.location.lat, lng: response.data.location.lng } });
    }
    res.status(404).json({ message: 'Could not detect location' });
  } catch (error) {
    res.status(500).json({ message: 'Server error detecting location' });
  }
};

export const reverseGeocodeAddress = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      // Minimal parsing
      return res.json({
        success: true,
        address: {
          fullAddress: result.formatted_address,
          city: result.address_components.find(c => c.types.includes('locality'))?.long_name || '',
          state: result.address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '',
          pincode: result.address_components.find(c => c.types.includes('postal_code'))?.long_name || '',
          country: result.address_components.find(c => c.types.includes('country'))?.long_name || ''
        }
      });
    }
    res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchLocation = async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      return res.json({ success: true, results: response.data.results.map(r => ({ formattedAddress: r.formatted_address, location: r.geometry.location })) });
    }
    res.json({ success: true, results: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateDistance = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ message: 'Missing coordinates' });
    }
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${apiKey}`;
    const response = await axios.get(url);
    if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
      const element = response.data.rows[0].elements[0];
      return res.json({
        success: true,
        distance: element.distance.text,
        duration: element.duration.text
      });
    }
    return res.json({ success: false });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate distance' });
  }
};
