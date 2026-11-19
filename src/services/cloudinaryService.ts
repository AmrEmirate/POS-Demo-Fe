/**
 * Demo Upload Service (Local DataURL preview, tanpa mengunggah ke Cloudinary produksi)
 */

export const CLOUDINARY_CONFIG = {
  cloudName: 'a61epbay',
  uploadPreset: 'dimsum_intan',
  apiUrl: 'https://api.cloudinary.com/v1_1/a61epbay/image/upload',
};

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<string> {
  if (onProgress) onProgress(30);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(String(reader.result || ''));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar lokal'));
    reader.readAsDataURL(file);
  });
}
