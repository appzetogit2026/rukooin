export default {
  type: "Hostel",
  label: "Hostel",
  steps: [
    { key: "basic", label: "Basic Info", component: "BasicInfo" },
    { key: "location", label: "Location & Map", component: "Location" },
    { key: "config", label: "Hostel Configuration", component: "HostelConfiguration" },
    { key: "inventory", label: "Room & Bed Inventory", component: "HostelInventory" },
    { key: "amenities", label: "Amenities", component: "HostelAmenities" },
    { key: "photos", label: "Photos & Media", component: "PropertyImages" },
    { key: "contacts", label: "Contact & Operations", component: "HostelContacts" },
    { key: "policies", label: "House Rules & Policies", component: "HostelPolicies" },
    { key: "nearby", label: "Nearby Attractions", component: "NearbyPlaces" },
    { key: "documents", label: "Legal & Compliance", component: "HostelDocuments" },
    { key: "review", label: "Preview & Submit", component: "Review" }
  ]
};
