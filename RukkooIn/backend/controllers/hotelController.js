import axios from 'axios';
import upload from '../utils/cloudinary.js';

const mapAddressComponents = (components) => {
  const get = (type) => {
    const c = components.find((x) => x.types?.includes(type));
    return c ? c.long_name : '';
  };
  const country = get('country');
  const state = get('administrative_area_level_1');
  const city = get('locality') || get('administrative_area_level_2') || get('sublocality');
  const area = get('sublocality') || get('neighborhood') || '';
  const pincode = get('postal_code');
  return { country, state, city, area, pincode };
};

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No images provided' });
    }
    const urls = req.files.map((f) => f.path);
    res.json({ success: true, urls });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getAddressFromCoordinates = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng must be numbers' });
    }
    const key = process.env.GOOGLE_MAP_API_KEY;
    if (!key) {
      return res.status(500).json({ message: 'Maps API key not configured' });
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
    const { data } = await axios.get(url);
    const first = Array.isArray(data.results) ? data.results[0] : null;
    if (!first) return res.status(404).json({ message: 'Address not found' });
    const { country, state, city, area, pincode } = mapAddressComponents(first.address_components || []);
    res.json({
      success: true,
      country,
      state,
      city,
      area,
      fullAddress: first.formatted_address || '',
      pincode,
      latitude: lat,
      longitude: lng
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const searchLocation = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || !String(query).trim()) {
      return res.status(400).json({ message: 'query is required' });
    }
    const key = process.env.GOOGLE_MAP_API_KEY;
    if (!key) {
      return res.status(500).json({ message: 'Maps API key not configured' });
    }
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${key}`;
    const { data } = await axios.get(url);
    const results = (data.results || []).map((r) => {
      const types = Array.isArray(r.types) ? r.types : [];
      let type = 'tourist';
      if (types.includes('airport')) type = 'airport';
      else if (types.includes('train_station')) type = 'railway';
      else if (types.includes('shopping_mall') || types.includes('store')) type = 'market';
      return {
        name: r.name,
        lat: r.geometry?.location?.lat,
        lng: r.geometry?.location?.lng,
        type
      };
    });
    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const calculateDistance = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng } = req.query;
    const toNum = (v) => Number(v);
    const oLat = toNum(originLat);
    const oLng = toNum(originLng);
    const dLat = toNum(destLat);
    const dLng = toNum(destLng);
    if ([oLat, oLng, dLat, dLng].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLatR = toRad(dLat - oLat);
    const dLngR = toRad(dLng - oLng);
    const a =
      Math.sin(dLatR / 2) * Math.sin(dLatR / 2) +
      Math.cos(toRad(oLat)) * Math.cos(toRad(dLat)) * Math.sin(dLngR / 2) * Math.sin(dLngR / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    res.json({ success: true, distanceKm: Number(km.toFixed(2)) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const _uploadMiddleware = upload.array('images', 10);
