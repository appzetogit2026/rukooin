import express from 'express';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';
import {
  uploadImages,
  _uploadMiddleware,
  getAddressFromCoordinates,
  searchLocation,
  calculateDistance
} from '../controllers/hotelController.js';
import { getPropertyDetails } from '../controllers/propertyController.js';

const router = express.Router();

router.get('/:id', getPropertyDetails);
router.post('/upload', protect, authorizedRoles('partner', 'admin'), _uploadMiddleware, uploadImages);
router.post('/location/address', protect, authorizedRoles('partner', 'admin'), getAddressFromCoordinates);
router.get('/location/search', protect, authorizedRoles('partner', 'admin'), searchLocation);
router.get('/location/distance', protect, authorizedRoles('partner', 'admin'), calculateDistance);

export default router;

