import express from 'express';
import { getAllHotels, getHotelById, createHotel, getMyHotels, updateHotel, deleteHotel, saveOnboardingStep, getCurrentLocation } from '../controllers/hotelController.js';
import upload from '../utils/cloudinary.js';

import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Image Upload
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

router.post('/onboarding/step', saveOnboardingStep); // Public draft saving
router.get('/location/current', getCurrentLocation);
router.get('/', getAllHotels);
router.get('/partner/my-hotels', protect, authorizedRoles('partner', 'admin'), getMyHotels);
router.get('/:id', getHotelById);

// Protected Partner Routes
router.post('/', protect, authorizedRoles('partner', 'admin'), createHotel);
router.put('/:id', protect, authorizedRoles('partner', 'admin'), updateHotel);
router.delete('/:id', protect, authorizedRoles('partner', 'admin'), deleteHotel);

export default router;
