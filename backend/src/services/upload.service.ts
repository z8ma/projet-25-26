import cloudinary from '../config/cloudinary.js';

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary from base64 string or buffer
 */
export async function uploadImage(
  fileData: string | Buffer,
  folder: string = 'juny/brainstorming'
): Promise<UploadResult> {
  try {
    // Convert buffer to base64 if needed
    const base64Data = Buffer.isBuffer(fileData)
      ? `data:image/jpeg;base64,${fileData.toString('base64')}`
      : fileData;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1920, height: 1920, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP when possible)
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}
