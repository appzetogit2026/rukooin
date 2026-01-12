import mongoose from 'mongoose';

const hotelDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  config: {
    hotelCategory: { type: String, enum: ['Budget', 'Standard', 'Premium', 'Luxury'] },
    starRating: String
  },

  policies: {
    // Timings
    checkInTime: String,
    checkOutTime: String,
    earlyCheckIn: String,
    lateCheckOut: String,

    // Guest Policies
    idProofMandatory: String,
    coupleFriendly: String,
    localIdsAllowed: String,
    petFriendly: String,

    // Cancellation
    cancellationPolicy: String,
    refundRules: String
  },

  amenities: [String],

  contacts: {
    receptionPhone: String,
    managerPhone: String,
    emergencyContact: String
  },

  documents: {
    ownershipProof: String,
    fireSafety: String,
    gstDetails: String,
    tourismReg: String
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

export default mongoose.model('HotelDetails', hotelDetailsSchema);
