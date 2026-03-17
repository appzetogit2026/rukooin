import axios from 'axios';

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WA_API_URL || 'http://bhashsms.com/api/sendmsgutil.php';
    this.user = process.env.WA_USER;
    this.pass = process.env.WA_PASS;
    this.sender = process.env.WA_SENDER;
    this.template = process.env.WA_TEMPLATE;
    this.stype = process.env.WA_STYPE || 'utility'; // Default to utility for booking
  }

  normalizePhoneNumber(phone) {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('91') && digits.length === 12) return digits;
    if (digits.length === 10) return '91' + digits;
    return '91' + digits.slice(-10);
  }

  async sendBookingConfirmation(booking) {
    try {
      if (!this.apiUrl || !this.user || !this.pass) {
        console.warn('⚠️ [WhatsApp] Missing API credentials. Notification NOT SENT.');
        return { success: false, error: 'Missing credentials' };
      }

      const user = booking.userId;
      const property = booking.propertyId;
      
      if (!user || !user.phone) {
        console.warn('⚠️ [WhatsApp] No user phone found.');
        return { success: false, error: 'No phone number' };
      }

      const guestName = user.name || 'Guest';
      const hotelName = property?.propertyName || 'Hotel';
      const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const totalAmount = booking.totalAmount;
      
      // Google Maps Link (Directions)
      // Example: https://www.google.com/maps/dir/?api=1&destination=26.2124007%2C78.1772053
      let hotelLocationLink = "https://www.google.com/maps/dir/?api=1&destination=";
      
      if (property?.location?.coordinates && property.location.coordinates.length === 2) {
        const [lng, lat] = property.location.coordinates;
        hotelLocationLink += `${lat}%2C${lng}`;
      } else {
        const address = property?.address?.fullAddress || property?.propertyName || 'Hotel';
        hotelLocationLink += encodeURIComponent(address);
      }

      // Template Variables (6 variables for rukkoo_confirmed)
      const variables = [
        guestName,           // Dear {#var#}
        hotelName,           // Hotel: {#var#}
        checkInDate,         // Check-in Date: {#var#}
        totalAmount,         // Total Payment: {#var#}
        guestName,           // Guest Name: {#var#}
        hotelLocationLink    // Hotel Location: {#var#}
      ];

      const normalizedPhone = this.normalizePhoneNumber(user.phone);

      // Params matching BhashSMS Utility Template requirements
      const params = {
        user: this.user,
        pass: this.pass,
        sender: this.sender,
        phone: normalizedPhone,
        text: this.template,
        priority: 'wa',
        stype: this.stype, // Changed from hardcoded 'wa' to dynamic (utility/auth)
       Params: variables.join(',')
      };

      console.log(`📨 Sending WhatsApp Template [${this.template}] to ${normalizedPhone} (SType: ${this.stype})...`);
      
      const response = await axios.get(this.apiUrl, { 
        params,
        timeout: 15000 
      });

      console.log('✅ WhatsApp Response:', response.data);
      return { success: true, response: response.data };

    } catch (error) {
      console.error('❌ WhatsApp Service Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new WhatsAppService();
