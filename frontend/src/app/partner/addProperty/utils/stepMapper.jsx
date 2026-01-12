import React from 'react';
import StepBasicDetails from '../../steps/StepBasicDetails';
import StepBasicInfo from '../../steps/StepBasicInfo';
import StepLocation from '../../steps/StepLocation';
import StepFacilities from '../../steps/StepFacilities';
import StepPropertyImages from '../../steps/StepPropertyImages';
import StepPolicies from '../../steps/StepPolicies';
import StepContacts from '../../steps/StepContacts';
import StepOwnerDetails from '../../steps/StepOwnerDetails';
import StepKyc from '../../steps/StepKyc';
import StepReview from '../../steps/StepReview';

// Config Components
import StepConfigHotelResort from '../../steps/StepConfigHotelResort';
import StepConfigVilla from '../../steps/StepConfigVilla';
import StepConfigPG from '../../steps/StepConfigPG';
import StepConfigHostel from '../../steps/StepConfigHostel';
import StepConfigHomestay from '../../steps/StepConfigHomestay';
import StepInventoryRooms from '../../steps/StepInventoryRooms';
import StepInventoryUnit from '../../steps/StepInventoryUnit';

// Villa-specific Components
import StepVillaStructure from '../../steps/StepVillaStructure';
import StepVillaAmenities from '../../steps/StepVillaAmenities';
import StepVillaPricing from '../../steps/StepVillaPricing';
import StepVillaContacts from '../../steps/StepVillaContacts';
import StepHouseRules from '../../steps/StepHouseRules';
import StepVillaDocuments from '../../steps/StepVillaDocuments';

// Hostel-specific Components
import StepHostelConfig from '../../steps/StepHostelConfig';
import StepHostelInventory from '../../steps/StepHostelInventory';
import StepHostelAmenities from '../../steps/StepHostelAmenities';
import StepHostelContacts from '../../steps/StepHostelContacts';
import StepHostelPolicies from '../../steps/StepHostelPolicies';
import StepHostelDocuments from '../../steps/StepHostelDocuments';

// Resort-specific Components
import StepResortBasicInfo from '../../steps/StepResortBasicInfo';
import StepResortDocuments from '../../steps/StepResortDocuments';
import StepResortAmenities from '../../steps/StepResortAmenities';
import StepResortRooms from '../../steps/StepResortRooms';
import StepResortMeals from '../../steps/StepResortMeals';
import StepResortActivities from '../../steps/StepResortActivities';
import StepResortPolicies from '../../steps/StepResortPolicies';
import StepResortNearby from '../../steps/StepResortNearby';
import StepResortGallery from '../../steps/StepResortGallery';

// Common Components
import StepNearbyPlaces from '../../steps/StepNearbyPlaces';

// Homestay-specific Components
import StepHomestayBasicInfo from '../../steps/StepHomestayBasicInfo';
import StepHomestayStyle from '../../steps/StepHomestayStyle';
import StepHomestayPricing from '../../steps/StepHomestayPricing';
import StepHomestayAmenities from '../../steps/StepHomestayAmenities';
import StepHomestayPolicies from '../../steps/StepHomestayPolicies';
import StepHomestayDocuments from '../../steps/StepHomestayDocuments';

// PG-specific Components
import StepPGBasicInfo from '../../steps/StepPGBasicInfo';
import StepPGInventory from '../../steps/StepPGInventory';
import StepPGAmenities from '../../steps/StepPGAmenities';
import StepPGFood from '../../steps/StepPGFood';
import StepPGRules from '../../steps/StepPGRules';
import StepPGDocuments from '../../steps/StepPGDocuments';

// Hotel-specific Components
import StepHotelBasicInfo from '../../steps/StepHotelBasicInfo';
import StepHotelRooms from '../../steps/StepHotelRooms';
import StepHotelAmenities from '../../steps/StepHotelAmenities';
import StepHotelPolicies from '../../steps/StepHotelPolicies';
import StepHotelDocuments from '../../steps/StepHotelDocuments';

const components = {
  BasicDetails: StepBasicDetails,
  BasicInfo: StepBasicInfo,
  Location: StepLocation,
  Facilities: StepFacilities,
  PropertyImages: StepPropertyImages,
  Policies: StepPolicies,
  Contacts: StepContacts,
  OwnerDetails: StepOwnerDetails,
  Kyc: StepKyc,
  Review: StepReview,

  // Configs
  ConfigHotelResort: StepConfigHotelResort,
  ConfigVilla: StepConfigVilla,
  ConfigPG: StepConfigPG,
  ConfigHostel: StepConfigHostel,
  ConfigHomestay: StepConfigHomestay,

  InventoryRooms: StepInventoryRooms,
  InventoryUnit: StepInventoryUnit,

  // Villa-specific
  VillaStructure: StepVillaStructure,
  VillaAmenities: StepVillaAmenities,
  VillaPricing: StepVillaPricing,
  VillaContacts: StepVillaContacts,
  HouseRules: StepHouseRules,
  VillaDocuments: StepVillaDocuments,

  // Hostel-specific
  HostelConfig: StepHostelConfig,
  HostelInventory: StepHostelInventory,
  HostelAmenities: StepHostelAmenities,
  HostelContacts: StepHostelContacts,
  HostelPolicies: StepHostelPolicies,
  HostelDocuments: StepHostelDocuments,

  // Resort-specific
  ResortBasicInfo: StepResortBasicInfo,
  ResortDocuments: StepResortDocuments,
  ResortAmenities: StepResortAmenities,
  ResortRooms: StepResortRooms,
  ResortMeals: StepResortMeals,
  ResortActivities: StepResortActivities,
  ResortPolicies: StepResortPolicies,
  ResortNearby: StepResortNearby,
  ResortGallery: StepResortGallery,

  // Homestay-specific
  HomestayBasicInfo: StepHomestayBasicInfo,
  HomestayStyle: StepHomestayStyle,
  HomestayPricing: StepHomestayPricing,
  HomestayAmenities: StepHomestayAmenities,
  HomestayPolicies: StepHomestayPolicies,
  HomestayDocuments: StepHomestayDocuments,

  // PG-specific
  PGBasicInfo: StepPGBasicInfo,
  PGInventory: StepPGInventory,
  PGAmenities: StepPGAmenities,
  PGFood: StepPGFood,
  PGRules: StepPGRules,
  PGDocuments: StepPGDocuments,

  // Hotel-specific
  HotelBasicInfo: StepHotelBasicInfo,
  HotelRooms: StepHotelRooms,
  HotelAmenities: StepHotelAmenities,
  HotelPolicies: StepHotelPolicies,
  HotelDocuments: StepHotelDocuments,

  // Common across all types
  NearbyPlaces: StepNearbyPlaces
};

export const getStepComponent = (stepName) => {
  return components[stepName] || (() => <div>Step Not Found: {stepName}</div>);
};
