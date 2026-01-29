/**
 * Compresses an image file with iterative reduction to meet target size.
 * New Target: ~5-6 MB max (to be safe under 10MB limit but keep high quality).
 * Max Dimensions: 4K (3840px)
 */
export const compressImage = async (file, targetSizeMB = 6, maxWidth = 3840, maxHeight = 3840) => {
  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const image = new Image();
    // Create URL for the file
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
      let quality = 0.95; // Start with very high quality

      // 1. Initial Scale Down (if massive, e.g. > 8K, bring it to 4K first)
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

      // Recursive function to compress until size fits
      const compressAttempt = (q) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression creation failed'));
              return;
            }

            const sizeMB = blob.size / (1024 * 1024);

            // If satisfied (under target size) or quality is too low (don't go below 0.5)
            if (sizeMB <= targetSizeMB || q < 0.55) {
              // Done
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`Image Compressed: Original ${(file.size / 1024 / 1024).toFixed(2)}MB -> New ${sizeMB.toFixed(2)}MB (Quality: ${q.toFixed(2)}, Dim: ${width}x${height})`);
              resolve(compressedFile);
            } else {
              // Try again with lower quality
              // Reduce quality by 0.1 step
              const newQ = q - 0.15;
              console.log(`Image still too large (${sizeMB.toFixed(2)}MB). Retrying with quality ${newQ.toFixed(2)}...`);
              compressAttempt(newQ);
            }
          },
          'image/jpeg',
          q
        );
      };

      // Start compression
      compressAttempt(quality);
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(image.src);
      reject(error);
    };
  });
};
