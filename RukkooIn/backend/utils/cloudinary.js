import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Basic config to ensure robustness
    return {
      folder: 'rukkoin_uploads',
      resource_type: 'auto',
      // allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'], // Let Cloudinary detect
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // Increased to 20MB for camera photos
});

export default upload;
