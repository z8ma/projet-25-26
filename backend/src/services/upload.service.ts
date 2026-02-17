import cloudinary from '../config/cloudinary.js';

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: 'image' | 'raw' | 'video';
  fileSize?: number;
  pages?: number; // For PDFs
  duration?: number; // For videos (in seconds)
  thumbnailUrl?: string; // For videos and PDFs
}

/**
 * Detect file type from mimetype
 */
function getResourceType(mimetype: string): 'image' | 'raw' | 'video' {
  if (mimetype.startsWith('image/')) {
    return 'image';
  }
  if (mimetype.startsWith('video/')) {
    return 'video';
  }
  return 'raw'; // PDFs and other documents
}

/**
 * Get appropriate MIME type for base64 data URI
 */
function getDataUriPrefix(mimetype: string): string {
  return `data:${mimetype};base64,`;
}

/**
 * Upload file (image, PDF, or video) to Cloudinary
 */
export async function uploadFile(
  fileData: Buffer,
  mimetype: string,
  folder: string = 'juny/brainstorming'
): Promise<UploadResult> {
  try {
    const resourceType = getResourceType(mimetype);
    const base64Data = `${getDataUriPrefix(mimetype)}${fileData.toString('base64')}`;

    // Different options based on file type
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
    };

    // Add transformations for images
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 1920, height: 1920, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ];
    }

    // Add transformations and validation for videos
    if (resourceType === 'video') {
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto:good' },
      ];
      // Cloudinary will generate thumbnail automatically
      uploadOptions.eager = [
        { format: 'jpg', transformation: [{ width: 640, height: 360, crop: 'fill' }] }
      ];
      uploadOptions.eager_async = false; // Wait for thumbnail generation
    }

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

    // Validate video duration (max 30 seconds)
    if (resourceType === 'video' && result.duration) {
      if (result.duration > 30) {
        // Delete the uploaded video if it exceeds duration limit
        await cloudinary.uploader.destroy(result.public_id, { resource_type: 'video' });
        throw new Error('Video duration exceeds maximum allowed (30 seconds)');
      }
    }

    // Generate thumbnail URL for videos
    let thumbnailUrl: string | undefined;
    if (resourceType === 'video') {
      // Cloudinary video thumbnail URL format
      thumbnailUrl = result.eager?.[0]?.secure_url ||
                     result.secure_url.replace(/\.(mp4|webm|mov)$/, '.jpg');
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType,
      fileSize: result.bytes,
      pages: result.pages, // Available for PDFs
      duration: result.duration, // Available for videos (in seconds)
      thumbnailUrl, // For videos
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw our custom errors
    }
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use uploadFile instead
 */
export async function uploadImage(
  fileData: string | Buffer,
  folder: string = 'juny/brainstorming'
): Promise<UploadResult> {
  const buffer = Buffer.isBuffer(fileData)
    ? fileData
    : Buffer.from(fileData.split(',')[1], 'base64');

  return uploadFile(buffer, 'image/jpeg', folder);
}

/**
 * Extract publicId from Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v1234567/juny/profile/abc123.jpg
 * Returns: juny/profile/abc123
 */
export function extractPublicIdFromUrl(cloudinaryUrl: string | null | undefined): string | null {
  if (!cloudinaryUrl) return null;

  try {
    // Check if it's a Cloudinary URL
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return null;
    }

    // Extract the path after /upload/ or /upload/vXXXXXXX/
    const uploadIndex = cloudinaryUrl.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    let pathAfterUpload = cloudinaryUrl.substring(uploadIndex + '/upload/'.length);

    // Remove version (vXXXXXXX/) if present
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');

    // Remove file extension
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }

    return pathAfterUpload;
  } catch (error) {
    console.error('Error extracting publicId from URL:', error);
    return null;
  }
}

/**
 * Delete media from Cloudinary
 */
export async function deleteMedia(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete ${resourceType} from Cloudinary`);
  }
}

/**
 * Delete image from Cloudinary
 * @deprecated Use deleteMedia instead
 */
export async function deleteImage(publicId: string): Promise<void> {
  return deleteMedia(publicId, 'image');
}

/**
 * Delete image from Cloudinary by URL
 * Convenience function that extracts publicId from URL and deletes it
 */
export async function deleteImageByUrl(cloudinaryUrl: string | null | undefined): Promise<void> {
  if (!cloudinaryUrl) return;

  const publicId = extractPublicIdFromUrl(cloudinaryUrl);
  if (!publicId) {
    console.warn('Could not extract publicId from URL:', cloudinaryUrl);
    return;
  }

  try {
    await deleteImage(publicId);
    console.log(`✅ Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Failed to delete image:', publicId, error);
    // Don't throw - we don't want to fail the main operation if deletion fails
  }
}
