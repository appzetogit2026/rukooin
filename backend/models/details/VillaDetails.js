import mongoose from 'mongoose';

const villaDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  // Configuration
  structure: {
    bedrooms: Number,
    bathrooms: Number,
    maxGuests: Number,
    kitchenAvailable: Boolean,
    entirePlace: { type: Boolean, default: true },
    caretakerAvailable: Boolean
  },

  // Pricing (Unit based)
  pricing: {
    basePrice: Number,
    extraGuestPrice: Number,
    cleaningFee: Number
  },

  // Rules
  availabilityRules: {
    minStay: Number,
    maxStay: Number,
    blockedDates: [Date]
  },

  // Amenities & Policies
  amenities: [String],
  policies: {
    checkInTime: String,
    checkOutTime: String,
    houseRules: {
      partiesAllowed: Boolean,
      petsAllowed: Boolean,
      smokingAllowed: Boolean,
      alcoholAllowed: Boolean
    },
    cancellationPolicy: String,
    idRequirement: String
  },

  contacts: {
    caretakerPhone: String,
    managerPhone: String,
    emergencyContact: String
  },

  documents: {
    ownershipProof: String,
    govtRegistration: String,
    localPermission: String
  },

  // Nearby Places
  nearbyPlaces: [
    {
      name: String,
      category: String,
      distance: String,
      time: String,
      placeId: String
    }
  ]
}, { timestamps: true });

export default mongoose.model('VillaDetails', villaDetailsSchema);
