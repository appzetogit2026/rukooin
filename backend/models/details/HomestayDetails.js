import mongoose from 'mongoose';

const homestayDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  // Configuration
  // Configuration
  config: {
    // Style
    hostLivesOnSite: { type: Boolean, default: false }, // Legacy? Frontend uses hostLivesOnProperty
    hostLivesOnProperty: { type: String, default: 'No' }, // From StepHomestayStyle (Select 'Yes'/'No')
    sharedAreas: { type: Boolean, default: false },
    sharedWithHost: { type: String, default: 'No' }, // From StepHomestayStyle
    propertySize: String, // From StepHomestayStyle
    entryType: String, // From StepHomestayStyle
    stayExperience: String, // From StepHomestayStyle
    idealFor: [String], // From StepHomestayBasicInfo

    // Food (StepHomestayAmenities)
    breakfastIncluded: String, // 'Yes', 'Paid', 'No'
    mealsAvailable: String, // 'Yes', 'No'
    foodType: String, // 'Veg only', 'Veg + Non-veg'

    // Legacy or Other
    bookingMode: { type: String, enum: ['Room Based', 'Entire Property'], default: 'Room Based' },
    checkInTime: String,
    checkOutTime: String
  },

  // Policies (Time, Rules)
  // Policies (Time, Rules)
  policies: {
    checkInTime: String,
    checkOutTime: String,
    houseRules: [String], // Custom rules
    cancellationPolicy: String,
    alcoholAllowed: { type: String, default: 'Allowed' },
    petsAllowed: { type: String, default: 'Allowed' },
    smokingAllowed: { type: String, default: 'Allowed' },
    loudMusicAllowed: { type: String, default: 'Allowed' },
    idProofRequired: { type: Boolean, default: true }
  },

  hostName: String,
  hostContact: String,

  amenities: [String],
  documents: {
    ownershipProof: String
  },
  contacts: {
    managerPhone: String
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

export default mongoose.model('HomestayDetails', homestayDetailsSchema);
