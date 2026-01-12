export default {
  type: "Villa",
  label: "Villa",
  steps: [
    { key: "basic", label: "Basic Info", component: "BasicInfo" },
    { key: "location", label: "Location & Map", component: "Location" },
    { key: "structure", label: "Villa Structure", component: "VillaStructure" },
    { key: "amenities", label: "Amenities", component: "VillaAmenities" },
    { key: "pricing", label: "Pricing", component: "VillaPricing" },
    { key: "photos", label: "Photos & Media", component: "PropertyImages" },
    { key: "contacts", label: "Contact & Management", component: "VillaContacts" },
    { key: "house-rules", label: "House Rules", component: "HouseRules" },
    { key: "nearby", label: "Nearby Attractions", component: "NearbyPlaces" },
    { key: "documents", label: "Documents", component: "VillaDocuments" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
