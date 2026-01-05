import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import axios from 'axios';

export const saveOnboardingStep = async (req, res) => {
  // ... same as above

  try {
    const { hotelDraftId, step, ...data } = req.body;

    let hotelId = hotelDraftId;
    let hotel;

    if (hotelId) {
      // Use findOneAndUpdate to avoid VersionError (optimistic concurrency) issue
      // We merge provided data into the document.
      // Note: For deep nested objects like address, we might want to use dot notation if we want partial updates
      // inside address. But typically the frontend sends full object for that step.
      // To be safe, we will assume step-based partial updates where 'address' is replaced if provided.

      const updateFields = {};
      if (data.name) updateFields.name = data.name;
      if (data.description) updateFields.description = data.description;
      if (data.propertyType) updateFields.propertyType = data.propertyType;
      if (data.spaceType) updateFields.spaceType = data.spaceType;
      // For objects, if provided, we replace/merge. 
      // Mongoose merge logic in findOneAndUpdate is complex. 
      // We will perform a merge at application level if needed, but since this is a draft, replacing the sub-doc is usually fine.
      if (data.address) updateFields.address = data.address; // Replaces address subdoc
      if (data.details) updateFields.details = data.details;
      if (data.policies) updateFields.policies = data.policies;
      if (data.kyc) updateFields.kyc = data.kyc;
      if (data.images) updateFields.images = data.images;
      if (data.facilities) updateFields.facilities = data.facilities;
      if (data.rooms) updateFields.rooms = data.rooms;
      if (data.status) updateFields.status = data.status;

      hotel = await Hotel.findByIdAndUpdate(
        hotelId,
        { $set: updateFields },
        { new: true, runValidators: false } // Skip validation for drafts
      );

      // If ID provided but not found (deleted?):
      if (!hotel) {
        hotel = new Hotel({ ...data, status: 'draft' });
        await hotel.save({ validateBeforeSave: false });
      }

    } else {
      // Create new draft
      hotel = new Hotel({
        ...data,
        name: data.propertyName || 'Draft Property',
        status: 'draft'
      });
      await hotel.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: 'Step saved',
      hotelId: hotel._id
    });

  } catch (error) {
    console.error('Save Onboarding Step Error:', error);
    res.status(500).json({ message: 'Server error saving draft' });
  }
};

/**
 * @desc    Get all hotels (with simple filters)
 * @route   GET /api/hotels
 * @access  Public
 */
export const getAllHotels = async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query;
    let query = { status: 'approved' }; // Only show approved hotels

    // Filter by City
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const hotels = await Hotel.find(query);
    res.json(hotels);
  } catch (error) {
    console.error('Get All Hotels Error:', error);
    res.status(500).json({ message: 'Server error fetching hotels' });
  }
};

/**
 * @desc    Get single hotel details
 * @route   GET /api/hotels/:id
 * @access  Public
 */
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    console.error('Get Hotel Error:', error);
    res.status(500).json({ message: 'Server error fetching hotel details' });
  }
};

/**
 * @desc    Create a new hotel
 * @route   POST /api/hotels
 * @access  Private (Partner/Admin)
 */
export const createHotel = async (req, res) => {
  try {
    const newHotel = new Hotel({
      ...req.body,
      ownerId: req.user._id,
      status: 'pending' // Default to pending for approval
    });
    const savedHotel = await newHotel.save();
    res.status(201).json(savedHotel);
  } catch (error) {
    console.error('Create Hotel Error:', error);
    res.status(500).json({ message: 'Server error creating hotel' });
  }
};

/**
 * @desc    Get hotels owned by logged in partner
 * @route   GET /api/hotels/partner/my-hotels
 * @access  Private (Partner)
 */
export const getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ ownerId: req.user._id });
    res.json(hotels);
  } catch (error) {
    console.error('Get My Hotels Error:', error);
    res.status(500).json({ message: 'Server error fetching your hotels' });
  }
};

/**
 * @desc    Update hotel details
 * @route   PUT /api/hotels/:id
 * @access  Private (Owner/Admin)
 */
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check ownership
    if (hotel.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this hotel' });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedHotel);
  } catch (error) {
    console.error('Update Hotel Error:', error);
    res.status(500).json({ message: 'Server error updating hotel' });
  }
};

/**
 * @desc    Delete hotel
 * @route   DELETE /api/hotels/:id
 * @access  Private (Owner/Admin)
 */
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check ownership
    if (hotel.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this hotel' });
    }

    await hotel.deleteOne();
    res.json({ message: 'Hotel removed' });
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    res.status(500).json({ message: 'Server error deleting hotel' });
  }
};
/**
 * @desc    Get current location based on IP
 * @route   GET /api/hotels/location/current
 * @access  Public
 */
export const getCurrentLocation = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Google API Key not configured' });
    }

    // Google Geolocation API uses the requester's IP if body is empty
    const response = await axios.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {});

    if (response.data && response.data.location) {
      return res.status(200).json({
        success: true,
        location: {
          lat: response.data.location.lat,
          lng: response.data.location.lng,
          accuracy: response.data.accuracy
        }
      });
    }

    res.status(404).json({ message: 'Could not detect location' });

  } catch (error) {
    console.error('Geolocation Error:', error.response?.data || error.message);

    // Fallback to a simpler IP-based service if Google fails or is restricted
    try {
      const ipResponse = await axios.get('http://ip-api.com/json');
      if (ipResponse.data && ipResponse.data.status === 'success') {
        return res.status(200).json({
          success: true,
          location: {
            lat: ipResponse.data.lat,
            lng: ipResponse.data.lon,
            city: ipResponse.data.city,
            type: 'ip-based'
          }
        });
      }
    } catch (fallbackError) {
      console.error('Fallback Geolocation Error:', fallbackError.message);
    }

    res.status(500).json({ message: 'Server error detecting location' });
  }
};
