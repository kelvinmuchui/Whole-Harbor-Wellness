/**
 * Safe URL sanitization and client-side image compression helpers
 * ensuring uploaded media fits comfortably within Firestore's 1MB document limit.
 */

export function isSafeMediaOrLinkUrl(value?: string): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/') || trimmed.startsWith('#/')) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return true;
  }
  return false;
}

export function sanitizeLinkUrl(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return isSafeMediaOrLinkUrl(trimmed) ? trimmed : undefined;
}

export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxBytes = 420_000
): Promise<{ dataUrl: string; mimeType: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only PNG, JPEG, WebP, or GIF image files are supported.');
  }

  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  if (rawDataUrl.length <= maxBytes && /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(rawDataUrl)) {
    return { dataUrl: rawDataUrl, mimeType: file.type };
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image for optimization.'));
    img.src = rawDataUrl;
  });

  const scale = Math.min(1, maxWidth / Math.max(image.width, image.height, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas image processing is unavailable in this browser.');
  }
  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.85;
  let output = canvas.toDataURL('image/jpeg', quality);
  while (output.length > maxBytes && quality > 0.35) {
    quality -= 0.12;
    output = canvas.toDataURL('image/jpeg', quality);
  }

  if (output.length > 520_000) {
    throw new Error('Compressed image still exceeds 500 KB storage limit. Please select a smaller image.');
  }

  return { dataUrl: output, mimeType: 'image/jpeg' };
}
