import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadFile } from '../services/upload.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const portfolioDir = path.join(uploadsDir, 'portfolio');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, portfolioDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `portfolio-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.'));
  }
};

// File filter for brainstorming - images and PDFs
const brainstormingFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou PDF.'));
  }
};

// File filter for portfolio media - images, videos, and PDFs
const portfolioMediaFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP, MP4, WebM ou PDF.'));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Configure multer for Cloudinary uploads (memory storage) - for brainstorming
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: brainstormingFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max (images ~10MB, PDFs ~15MB)
  },
});

// Configure multer for portfolio media (images, videos, PDFs) - Cloudinary
export const uploadPortfolioMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter: portfolioMediaFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (videos up to 30sec)
  },
});

export class UploadController {
  // POST /api/upload/brainstorming - Upload brainstorming file (image or PDF) to Cloudinary
  async uploadBrainstormingImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Upload to Cloudinary
      const result = await uploadFile(req.file.buffer, req.file.mimetype, 'juny/brainstorming');

      res.json({
        success: true,
        message: 'Fichier uploadé avec succès',
        data: {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resourceType,
          fileSize: result.fileSize,
          pages: result.pages,
        },
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'upload',
      });
    }
  }

  // POST /api/upload/brainstorming/multiple - Upload multiple brainstorming files (images/PDFs)
  async uploadBrainstormingImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Upload all files in parallel to Cloudinary
      const uploadPromises = files.map((file) =>
        uploadFile(file.buffer, file.mimetype, 'juny/brainstorming')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: `${results.length} fichier(s) uploadé(s) avec succès`,
        data: results.map((result) => ({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resourceType,
          fileSize: result.fileSize,
          pages: result.pages,
        })),
      });
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'upload',
      });
    }
  }

  // POST /api/upload/portfolio - Upload portfolio image
  async uploadPortfolioImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Build the URL for the uploaded file
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
      const imageUrl = `${baseUrl}/uploads/portfolio/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploadée avec succès',
        data: {
          filename: req.file.filename,
          imageUrl,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de l\'upload',
      });
    }
  }

  // DELETE /api/upload/portfolio/:filename - Delete portfolio image
  async deletePortfolioImage(req: Request, res: Response) {
    try {
      const filename = req.params.filename as string;
      const filePath = path.join(portfolioDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Fichier non trouvé',
        });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Image supprimée avec succès',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la suppression',
      });
    }
  }
}

export const uploadController = new UploadController();
