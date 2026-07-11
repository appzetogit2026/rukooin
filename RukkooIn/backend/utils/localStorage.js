import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root uploads directory on the server
const UPLOADS_ROOT = path.join(__dirname, '../uploads');

// Base URL used to construct public-facing image URLs
// On VPS this will be e.g. https://api.rukkoo.in — set BASE_URL in .env
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

/**
 * Ensure a directory exists, creating it recursively if needed.
 * @param {string} dir - Absolute directory path
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Generate a unique filename preserving the original extension.
 * @param {string} originalName - Original file name (e.g. "photo.jpg")
 * @returns {string} - Unique filename (e.g. "1720693845123-a3f9c.jpg")
 */
const generateFilename = (originalName = 'file') => {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const timestamp = Date.now();
  const random = crypto.randomBytes(3).toString('hex'); // 6 hex chars
  const baseName = path.basename(originalName, ext)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .substring(0, 40);
  return `${timestamp}-${random}-${baseName}${ext}`;
};

/**
 * Upload a file from its local temp path to the permanent uploads directory.
 * The temp file is deleted after copying (same behaviour as Cloudinary utility).
 *
 * @param {string} tempFilePath - Absolute path to the temporary file (from multer diskStorage)
 * @param {string} folder       - Sub-folder inside /uploads/ (e.g. 'properties', 'blogs')
 * @param {string|null} customFilename - Optional custom filename (without extension)
 * @returns {Promise<{success: boolean, url: string, publicId: string, format: string, bytes: number}>}
 */
export const uploadToLocal = async (tempFilePath, folder = 'general', customFilename = null) => {
  try {
    const destDir = path.join(UPLOADS_ROOT, folder);
    ensureDir(destDir);

    const originalName = path.basename(tempFilePath);
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    const filename = customFilename ? `${customFilename}${ext}` : generateFilename(originalName);
    const destPath = path.join(destDir, filename);

    // Copy from temp to permanent location
    fs.copyFileSync(tempFilePath, destPath);

    // Delete temp file (same as Cloudinary utility — keeps disk clean)
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    const stats = fs.statSync(destPath);
    const publicId = `${folder}/${filename}`;
    const url = `${BASE_URL}/uploads/${folder}/${filename}`;

    return {
      success: true,
      url,
      publicId,
      format: ext.replace('.', ''),
      bytes: stats.size,
    };
  } catch (error) {
    console.error('[LocalStorage] Upload error:', error);

    // Clean up temp file even on error
    if (fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch (_) { /* ignore */ }
    }

    throw new Error('Failed to upload file to local storage');
  }
};

/**
 * Upload a Base64-encoded image to the permanent uploads directory.
 * Supports both raw base64 strings and data-URI strings.
 *
 * @param {string} base64String - Base64 string (with or without data: prefix)
 * @param {string} folder       - Sub-folder inside /uploads/
 * @param {string|null} publicId - Optional filename (without extension); random if not provided
 * @returns {Promise<{success: boolean, url: string, publicId: string, format: string, bytes: number}>}
 */
export const uploadBase64ToLocal = async (base64String, folder = 'general', publicId = null) => {
  try {
    const destDir = path.join(UPLOADS_ROOT, folder);
    ensureDir(destDir);

    // Parse data URI to extract mime type and raw base64
    let mimeType = 'image/jpeg';
    let rawBase64 = base64String;

    if (base64String.startsWith('data:')) {
      const matches = base64String.match(/^data:([^;]+);base64,(.+)$/s);
      if (matches) {
        mimeType = matches[1];
        rawBase64 = matches[2];
      }
    }

    // Determine file extension from MIME type
    const extMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
      'application/pdf': '.pdf',
    };
    const ext = extMap[mimeType] || '.jpg';

    const fileId = publicId
      ? `${publicId}${ext}`
      : `${Date.now()}-${crypto.randomBytes(3).toString('hex')}${ext}`;

    const destPath = path.join(destDir, fileId);
    const buffer = Buffer.from(rawBase64, 'base64');
    fs.writeFileSync(destPath, buffer);

    const stats = fs.statSync(destPath);
    const savedPublicId = `${folder}/${fileId}`;
    const url = `${BASE_URL}/uploads/${folder}/${fileId}`;

    console.log(`[LocalStorage] Base64 upload success: ${url}`);

    return {
      success: true,
      url,
      publicId: savedPublicId,
      format: ext.replace('.', ''),
      bytes: stats.size,
    };
  } catch (error) {
    console.error('[LocalStorage] Base64 upload error:', error);
    throw new Error('Failed to upload base64 image to local storage');
  }
};

/**
 * Smart delete: handles BOTH local files and old Cloudinary public IDs.
 *
 * - If the given value looks like a local URL (contains '/uploads/') OR a local path,
 *   it deletes the file from disk.
 * - If it looks like a Cloudinary public_id (e.g. 'rukkoin/properties/xyz'),
 *   it delegates to the Cloudinary SDK (imported lazily to avoid circular deps).
 *
 * @param {string} publicIdOrUrl - Either a local publicId, a local URL, or a Cloudinary public_id
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteFile = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) {
    return { success: false, message: 'No ID or URL provided' };
  }

  const value = String(publicIdOrUrl);

  // --- LOCAL FILE ---
  const isLocalUrl = value.includes('/uploads/');
  const isLocalPublicId = !value.includes('cloudinary.com') && !value.includes('http') && value.includes('/');

  if (isLocalUrl || isLocalPublicId) {
    try {
      let relPath;

      if (isLocalUrl) {
        // Extract path after /uploads/ from the full URL
        const match = value.match(/\/uploads\/(.+)$/);
        relPath = match ? match[1] : null;
      } else {
        // publicId is already relative like "properties/filename.jpg"
        relPath = value;
      }

      if (!relPath) {
        return { success: false, message: 'Could not resolve local file path' };
      }

      const absPath = path.join(UPLOADS_ROOT, relPath);

      if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
        console.log(`[LocalStorage] Deleted local file: ${absPath}`);
        return { success: true, message: 'File deleted successfully' };
      } else {
        console.warn(`[LocalStorage] File not found (already deleted?): ${absPath}`);
        return { success: true, message: 'File not found (already deleted)' };
      }
    } catch (error) {
      console.error('[LocalStorage] Delete error:', error);
      return { success: false, message: 'Failed to delete local file' };
    }
  }

  // --- CLOUDINARY FILE (old images) ---
  try {
    const { v2 as cloudinary } = await import('cloudinary');
    const result = await cloudinary.uploader.destroy(value);
    return {
      success: result.result === 'ok',
      message: result.result === 'ok' ? 'Cloudinary file deleted successfully' : 'Cloudinary file not found',
    };
  } catch (error) {
    console.error('[LocalStorage] Cloudinary delete error:', error);
    return { success: false, message: 'Failed to delete from Cloudinary' };
  }
};

export default { uploadToLocal, uploadBase64ToLocal, deleteFile };
