import express from 'express';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';
import { createProperty, addRoomType, upsertDocuments, getPublicProperties, getPropertyDetails } from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', getPublicProperties);
router.get('/:id', getPropertyDetails);
router.post('/', protect, authorizedRoles('partner', 'admin'), createProperty);
router.post('/:propertyId/room-types', protect, authorizedRoles('partner', 'admin'), addRoomType);
router.post('/:propertyId/documents', protect, authorizedRoles('partner', 'admin'), upsertDocuments);

export default router;
