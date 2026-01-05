import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true, // Optional for draft
    trim: true
  },
  description: {
    type: String
  },
  propertyType: {
    type: String, // e.g. Hotel, Homestay, Resort
    // required: true // Optional for draft
  },
  spaceType: {
    type: String // e.g. Entire Place, Private Room
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [{
    url: String,
    category: String, // facade, bedroom, bathroom, etc.
    caption: String
  }],
  facilities: [String], // e.g. Wifi, Pool
  policies: {
    checkInTime: { type: String, default: '12:00 PM' },
    checkOutTime: { type: String, default: '11:00 AM' },
    coupleFriendly: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    localIdsAllowed: { type: Boolean, default: false },
    alcoholAllowed: { type: Boolean, default: false },
    forEvents: { type: Boolean, default: false },
    outsideFoodAllowed: { type: Boolean, default: false }
  },
  rooms: [{
    title: { type: String }, // e.g. "Deluxe Room"
    price: { type: Number }, // Base Price
    occupancy: { type: Number, default: 2 }, // Max Guests
    qty: { type: Number, default: 1 }, // Number of such rooms
    amenities: [String], // Room-specific amenities
    images: [{
      url: String,
      caption: String
    }]
  }],
  details: {
    totalFloors: Number,
    totalRooms: Number
  },
  kyc: {
    docType: { type: String, default: 'Aadhaar Card' },
    idNumber: String,
    docFront: String, // URL
    docBack: String, // URL
    verified: { type: Boolean, default: false }
  },
  price: {
    type: Number,
    default: 0 // Starting price
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // Optional for draft
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'], // Added draft
    default: 'draft' // Default to draft
  }
}, { timestamps: true });

// Index for geo-search (future proofing)
hotelSchema.index({ 'address.coordinates': '2dsphere' });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
