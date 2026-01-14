import express from 'express';
import { getPublicPage, getPublicPlatformStatus } from '../controllers/infoController.js';

const router = express.Router();

router.get('/platform/status', getPublicPlatformStatus);
router.get('/:audience/:slug', getPublicPage);

export default router;
