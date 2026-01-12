import express from 'express';
import {
  saveOnboardingStep,
  getAllHotels,
  getPropertyById,
  getMyProperties,
  deleteProperty,
  getCurrentLocation,
  reverseGeocodeAddress,
  searchLocation
} from '../controllers/propertyController.js';
import upload from '../utils/cloudinary.js';

import { protect, authorizedRoles, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Image Upload (Independent of Model) ---
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

// --- Onboarding & Management ---
// Matches /api/hotels/onboarding/step called by frontend
router.post('/onboarding/step', saveOnboardingStep);

// Location Utils
router.get('/location/current', getCurrentLocation);
router.post('/location/address', reverseGeocodeAddress);
router.get('/location/search', searchLocation);

// Partner Routes
router.get('/partner/my-hotels', protect, authorizedRoles('partner', 'admin'), getMyProperties);

// Public / General Properties
router.get('/', getAllHotels);
router.get('/:id', getPropertyById);

// Update/Delete
// router.put('/:id', protect, authorizedRoles('partner', 'admin'), updateProperty); // updateProperty if exists
router.delete('/:id', protect, authorizedRoles('partner', 'admin'), deleteProperty);

export default router;
