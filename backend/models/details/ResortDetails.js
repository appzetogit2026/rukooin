import mongoose from 'mongoose';

const resortDetailsSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    unique: true
  },

  // Resort Configuration
  config: {
    resortCategory: { type: String, enum: ['Budget', 'Premium', 'Luxury'] },
    starRating: { type: Number, min: 3, max: 5 },
    resortTheme: { type: String, enum: ['Beach', 'Jungle', 'Hill', 'Wellness', 'Adventure', 'Family'] },
    resortSize: String,
    floors: Number,
    receptionAvailable: Boolean,
    checkInTime: String,
    checkOutTime: String
  },

  // Policies
  policies: {
    checkInTime: String,
    checkOutTime: String,
    earlyCheckIn: Boolean,
    lateCheckOut: Boolean,
    cancellationPolicy: String,
    refundPolicy: String,
    idProofMandatory: { type: Boolean, default: true },
    petsAllowed: Boolean,
    smokingAllowed: Boolean,
    alcoholAllowed: Boolean,
    outsideFoodAllowed: Boolean,
    eventsAllowed: Boolean
  },

  // Meal Plans
  mealPlans: [
    {
      mealType: {
        type: String,
        enum: ['Room Only', 'Breakfast Included', 'Half Board (Breakfast + Dinner)', 'Full Board (All Meals)', 'All-Inclusive Package']
      },
      priceImpact: Number,
      included: Boolean,
      breakfast: {
        timing: String
      },
      lunch: {
        timing: String
      },
      dinner: {
        timing: String
      },
      cuisineType: String
    }
  ],

  // Activities & Experiences
  activities: [
    {
      name: String,
      type: { type: String, enum: ['Included', 'Paid'] },
      price: Number,
      timing: String,
      ageRestriction: String,
      description: String
    }
  ],

  // Nearby Places & Attractions
  nearbyPlaces: [
    {
      name: String,
      category: String,
      distance: String,
      time: String,
      placeId: String
    }
  ],

  // Amenities
  amenities: [String],

  // Documents
  documents: {
    resortLicense: String,
    fireSafety: String,
    localAuthority: String
  },

  // Contacts
  contacts: {
    receptionPhone: String,
    managerPhone: String,
    emergencyContact: String
  }

}, { timestamps: true });

export default mongoose.model('ResortDetails', resortDetailsSchema);
