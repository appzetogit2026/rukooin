/**
 * Smart Image Compression Utility
 * 
 * Strategy:
 * 1. If image size < 9.5MB: Return original (No compression needed).
 * 2. If image size > 9.5MB: Compress to safely fit under Cloudinary 10MB limit.
 */
export const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    // 1. Check if file is an image
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // 2. SMART CHECK: If file is already safe (< 9.5 MB), skip compression
    // 9.5MB limit gives a 500KB buffer for header overhead
    if (file.size < 9.5 * 1024 * 1024) {
      console.log(`Skipping compression: ${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB (Safe)`);
      resolve(file);
      return;
    }

    console.log(`Auto-Compressing: ${file.name} is ${(file.size / 1024 / 1024).toFixed(2)}MB (> 9.5MB Limit)`);

    const image = new Image();
    try {
      image.src = URL.createObjectURL(file);
    } catch (e) {
      reject(e);
      return;
    }

    image.onload = () => {
      URL.revokeObjectURL(image.src);

      let width = image.width;
      let height = image.height;
      const maxWidth = 1920;
      const maxHeight = 1920;

      // Resize logic only if huge
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);

      // Compress to 0.8 quality to ensure drop below 10MB
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          console.log(`Compressed Result: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(compressedFile);
        },
        'image/jpeg',
        0.8
      );
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(image.src);
      reject(error);
    };
  });
};
