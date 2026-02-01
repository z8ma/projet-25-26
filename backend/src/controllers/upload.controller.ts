import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadImage } from '../services/upload.service.js';

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

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Configure multer for Cloudinary uploads (memory storage)
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for Cloudinary
  },
});

export class UploadController {
  // POST /api/upload/brainstorming - Upload brainstorming image to Cloudinary
  async uploadBrainstormingImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, 'juny/brainstorming');

      res.json({
        success: true,
        message: 'Image uploadée avec succès',
        data: {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
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

  // POST /api/upload/brainstorming/multiple - Upload multiple brainstorming images
  async uploadBrainstormingImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // Upload all images in parallel to Cloudinary
      const uploadPromises = files.map((file) =>
        uploadImage(file.buffer, 'juny/brainstorming')
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: `${results.length} image(s) uploadée(s) avec succès`,
        data: results.map((result) => ({
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
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
