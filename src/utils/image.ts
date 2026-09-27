/**
 * Downscale an uploaded image so its data URL safely fits in localStorage
 * (~5MB quota shared with all other site content). SVGs pass through
 * untouched; rasters are resized to `maxDim` and recompressed.
 */
export const fileToSizedDataUrl = (file: File, maxDim = 512): Promise<string> => {
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Image processing is not available in this browser.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // PNG keeps transparency for logos; fall back to JPEG when still large.
        const png = canvas.toDataURL('image/png');
        if (png.length < 700_000) {
          resolve(png);
        } else {
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      } catch {
        reject(new Error('Could not process image. Try a smaller file.'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file is not a readable image.'));
    };
    img.src = url;
  });
};
