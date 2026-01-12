export default {
  type: "PG",
  label: "PG",
  steps: [
    { key: "basic", label: "PG Basic Info", component: "PGBasicInfo" },
    { key: "location", label: "Location & Address", component: "Location" },
    { key: "nearby", label: "Nearby Places", component: "NearbyPlaces" },
    { key: "rooms", label: "Rooms & Bed Sharing", component: "PGInventory" },
    { key: "amenities", label: "Amenities & Facilities", component: "PGAmenities" },
    { key: "food", label: "Food & Services", component: "PGFood" },
    { key: "rules", label: "Rules & Restrictions", component: "PGRules" },
    { key: "contacts", label: "Contact & Management", component: "Contacts" },
    { key: "documents", label: "Documents & Compliance", component: "PGDocuments" },
    { key: "photos", label: "Property Media", component: "PropertyImages" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
