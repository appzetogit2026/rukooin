import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file on local filesystem
 * @param {Object} options - Upload options (folder, resource_type, public_id)
 * @returns {Promise<Object>} - Upload result
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'rukkoin_uploads',
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation || [
        { width: 1000, crop: 'limit' },
        { quality: 'auto' }
      ]
    };

    if (options.public_id) {
      uploadOptions.public_id = options.public_id;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Try to cleanup even on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload file to Cloudinary: ' + error.message);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} public_id - Public ID of the file
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return {
      success: result.result === 'ok',
      message: result.result === 'ok' ? 'File deleted successfully' : 'File not found'
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
};

export default cloudinary;
