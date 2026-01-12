import mongoose from 'mongoose';

const hostelDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  // Config
  config: {
    hostelType: { type: String, enum: ['Boys', 'Girls', 'Mixed'] },
    curfewTime: String,
    ageRestriction: Boolean,
    visitorsAllowed: Boolean,
    alcoholAllowed: Boolean,
    dormitoryAvailable: Boolean,
    commonWashrooms: Boolean
  },

  // Policies
  policies: {
    checkInTime: String,
    checkOutTime: String,
    cancellationPolicy: String,
    idRequirement: String
  },

  amenities: [String],

  contacts: {
    receptionPhone: String,
    managerPhone: String,
    emergencyContact: String
  },

  documents: {
    ownershipProof: String,
    localRegistration: String,
    fireSafetyCert: String
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

export default mongoose.model('HostelDetails', hostelDetailsSchema);
