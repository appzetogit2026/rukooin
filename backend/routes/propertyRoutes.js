import express from 'express';
import {
  saveOnboardingStep,
  getAllHotels,
  getPropertyById,
  getMyProperties,
  deleteProperty,
  getCurrentLocation,
  reverseGeocodeAddress,
  searchLocation,
  calculateDistance
} from '../controllers/propertyController.js';
import upload from '../utils/cloudinary.js';
import { protect as authProtect, authorizedRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Image Upload Route
router.post('/upload', upload.array('images', 20), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const uploadedUrls = files.map(file => file.path);
    res.status(200).json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Public Routes
router.get('/', getAllHotels);
router.get('/location/current', getCurrentLocation);
router.post('/location/address', reverseGeocodeAddress);
router.get('/location/search', searchLocation);
router.get('/location/distance', calculateDistance);

// Partner Routes
router.post('/onboarding/save-step', authProtect, authorizedRoles('partner', 'admin'), saveOnboardingStep);
router.get('/partner/my-hotels', authProtect, authorizedRoles('partner', 'admin'), getMyProperties);

// ID Routes
router.get('/:id', getPropertyById);
router.delete('/:id', authProtect, authorizedRoles('partner', 'admin'), deleteProperty);

export default router;
