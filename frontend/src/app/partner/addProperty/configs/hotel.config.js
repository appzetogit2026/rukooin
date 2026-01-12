export default {
  type: "Hotel",
  label: "Hotel",
  steps: [
    { key: "basic", label: "Hotel Basic Info", component: "HotelBasicInfo" },
    { key: "location", label: "Location & Address", component: "Location" },
    { key: "nearby", label: "Nearby Places", component: "NearbyPlaces" },
    { key: "rooms", label: "Room Types & Inventory", component: "HotelRooms" },
    { key: "amenities", label: "Hotel Amenities", component: "HotelAmenities" },
    { key: "policies", label: "Policies & Rules", component: "HotelPolicies" },
    { key: "contacts", label: "Contact & Management", component: "Contacts" },
    { key: "documents", label: "Documents & Compliance", component: "HotelDocuments" },
    { key: "photos", label: "Property Media", component: "PropertyImages" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
