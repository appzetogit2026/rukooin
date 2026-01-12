import hotelConfig from './hotel.config';
import villaConfig from './villa.config';
import pgConfig from './pg.config';
import hostelConfig from './hostel.config';
import resortConfig from './resort.config';
import homestayConfig from './homestay.config';

export const propertyConfigs = {
  Hotel: hotelConfig,
  Villa: villaConfig,
  PG: pgConfig,
  Hostel: hostelConfig,
  Resort: resortConfig,
  Homestay: homestayConfig
};

export const getPropertyConfig = (type) => {
  return propertyConfigs[type] || hotelConfig; // Default to Hotel
};
