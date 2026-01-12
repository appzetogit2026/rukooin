export default {
  type: "Resort",
  label: "Resort",
  steps: [
    { key: "basic", label: "Basic Details", component: "ResortBasicInfo" },
    { key: "location", label: "Location & Map", component: "Location" },
    { key: "amenities", label: "Resort Amenities", component: "ResortAmenities" },
    { key: "rooms", label: "Room Configuration", component: "ResortRooms" },
    { key: "meals", label: "Meal Plans", component: "ResortMeals" },
    { key: "activities", label: "Activities", component: "ResortActivities" },
    { key: "photos", label: "Photos & Media", component: "PropertyImages" },
    { key: "contacts", label: "Contact & Management", component: "Contacts" },
    { key: "policies", label: "House Rules", component: "ResortPolicies" },
    { key: "nearby", label: "Nearby Attractions", component: "NearbyPlaces" },
    { key: "documents", label: "Legal Documents", component: "ResortDocuments" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
