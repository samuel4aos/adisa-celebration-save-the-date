/**
 * Compresses an image data URL by resizing it and reducing quality.
 * @param dataUrl The original data URL
 * @param maxWidth Maximum width for the compressed image
 * @param quality Compression quality (0 to 1)
 * @returns Promise with compressed data URL
 */
export const compressImage = (
  dataUrl: string,
  maxWidth: number = 1000,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (err) => reject(err);
  });
};

/**
 * Estimates the size of a string in megabytes.
 */
export const getStorageSizeMB = (str: string): number => {
  return (str.length * 2) / (1024 * 1024);
};

/**
 * Gets the total size of everything in localStorage in megabytes.
 * (Keeping this for migration or legacy checks)
 */
export const getTotalLocalStorageSizeMB = (): number => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (val) total += val.length * 2;
    }
  }
  return total / (1024 * 1024);
};