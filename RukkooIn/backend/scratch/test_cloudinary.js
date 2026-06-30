import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  console.log('Configured Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('Configured API Key:', process.env.CLOUDINARY_API_KEY);
  
  try {
    // Attempt uploading a 1x1 transparent pixel GIF via base64
    const sampleImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    console.log('Attempting Cloudinary upload...');
    const result = await cloudinary.uploader.upload(sampleImage, {
      folder: 'test_folder'
    });
    console.log('Upload successful! URL:', result.secure_url);
  } catch (error) {
    console.error('Upload failed with error:', error);
  }
}

run();
