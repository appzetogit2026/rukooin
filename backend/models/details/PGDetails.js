import mongoose from 'mongoose';

const pgDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  config: {
    pgType: { type: String, enum: ['Boys', 'Girls', 'Unisex'] },
    idealFor: [String],

    // Food & Services
    mealsIncluded: { type: String, enum: ['Yes', 'No', 'Not Available'] },
    mealTypes: [String],
    foodType: String,
    mealTimings: String,

    laundryService: String,
    housekeeping: String,
    linenChange: String,

    // Rules
    curfewTime: String,
    noticePeriod: String
  },

  policies: {
    checkInTime: String,
    checkOutTime: String,
    visitorPolicy: String,
    smokingAlcohol: String,
    cookingAllowed: String,
    generalRules: String,
    otherRules: String
  },

  amenities: [String],

  contacts: {
    managerPhone: String,
    altManagerPhone: String,
    emergencyContact: String
  },

  documents: {
    ownershipProof: String,
    municipalReg: String,
    fireSafety: String
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

export default mongoose.model('PGDetails', pgDetailsSchema);
