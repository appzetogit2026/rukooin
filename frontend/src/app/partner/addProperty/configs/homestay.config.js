export default {
  type: "Homestay",
  label: "Homestay",
  steps: [
    { key: "basic", label: "Basic Info", component: "HomestayBasicInfo" },
    { key: "location", label: "Location & Address", component: "Location" },
    { key: "style", label: "Homestay Style", component: "HomestayStyle" },
    { key: "rooms", label: "Rooms & Pricing", component: "InventoryRooms" },
    { key: "amenities", label: "Amenities", component: "HomestayAmenities" },
    { key: "policies", label: "House Rules & Policies", component: "HomestayPolicies" },
    { key: "contacts", label: "Host / Contact Details", component: "Contacts" },
    { key: "nearby", label: "Nearby Places", component: "NearbyPlaces" },
    { key: "documents", label: "Documents & Verification", component: "HomestayDocuments" },
    { key: "photos", label: "Photos & Media", component: "PropertyImages" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
