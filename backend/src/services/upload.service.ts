import cloudinary from '../config/cloudinary.js';

interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format: string;
  resourceType: 'image' | 'raw';
  fileSize?: number;
  pages?: number; // For PDFs
}

/**
 * Detect file type from mimetype
 */
function getResourceType(mimetype: string): 'image' | 'raw' {
  if (mimetype.startsWith('image/')) {
    return 'image';
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
 * Upload file (image or PDF) to Cloudinary
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

    // Add transformations only for images
    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 1920, height: 1920, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ];
    }

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType,
      fileSize: result.bytes,
      pages: result.pages, // Available for PDFs
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
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
