import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformOpen: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    bookingDisabledMessage: {
      type: String,
      default: 'Bookings are temporarily disabled. Please try again later.'
    },
    maintenanceTitle: {
      type: String,
      default: 'We will be back soon.'
    },
    maintenanceMessage: {
      type: String,
      default: 'The platform is under scheduled maintenance. Please check back in some time.'
    },
    defaultCommission: {
      type: Number,
      default: 15
    },
    taxRate: {
      type: Number,
      default: 18
    },
    autoPayoutEnabled: {
      type: Boolean,
      default: false
    },
    defaultCheckInTime: {
      type: String,
      default: '12:00 PM'
    },
    defaultCheckOutTime: {
      type: String,
      default: '11:00 AM'
    },
    pgMinStay: {
      type: Number,
      default: 30 // days
    },
    supportEmail: {
      type: String,
      default: 'support@rukkoo.in'
    },
    supportPhone: {
      type: String,
      default: '+91 9999999999'
    }
  },
  { timestamps: true }
);

platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;

