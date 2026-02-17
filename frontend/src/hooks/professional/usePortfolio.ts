import { useState, useRef } from 'react';
import { professionalApi } from '../../services/api';

interface PortfolioForm {
  title: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  projectType: string;
  tags: string;
  clientType: string;
  projectGoal: string;
  roleDescription: string;
  projectDuration: string;
  projectImpact: string;
  projectYear: string;
  isFeatured: boolean;
}

export interface MediaFile {
  id?: string; // ID from DB (for existing media)
  file?: File; // File object (for new uploads)
  type: 'IMAGE' | 'VIDEO' | 'PDF';
  url: string; // Preview URL or Cloudinary URL
  thumbnailUrl?: string;
  name: string;
  size: number;
  duration?: number;
  order: number;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

const initialPortfolioForm: PortfolioForm = {
  title: '',
  description: '',
  imageUrl: '',
  projectUrl: '',
  projectType: '',
  tags: '',
  clientType: '',
  projectGoal: '',
  roleDescription: '',
  projectDuration: '',
  projectImpact: '',
  projectYear: '',
  isFeatured: false,
};

const ALLOWED_TYPES: Record<string, 'IMAGE' | 'VIDEO' | 'PDF'> = {
  'image/jpeg': 'IMAGE',
  'image/jpg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/webp': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'application/pdf': 'PDF',
};

const MAX_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  PDF: 20 * 1024 * 1024,   // 20MB
};

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioForm>(initialPortfolioForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media management
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const resetPortfolioForm = () => {
    setPortfolioForm(initialPortfolioForm);
    setEditingPortfolio(null);
    setImagePreview(null);
    setMediaFiles([]);
    setShowPortfolioForm(false);
  };

  const startEditPortfolio = (portfolio: any) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title || '',
      description: portfolio.description || '',
      imageUrl: portfolio.imageUrl || '',
      projectUrl: portfolio.projectUrl || '',
      projectType: portfolio.projectType || '',
      tags: portfolio.tags?.map((t: any) => t.tag).join(', ') || '',
      clientType: portfolio.clientType || '',
      projectGoal: portfolio.projectGoal || '',
      roleDescription: portfolio.roleDescription || '',
      projectDuration: portfolio.projectDuration || '',
      projectImpact: portfolio.projectImpact || '',
      projectYear: portfolio.projectYear?.toString() || '',
      isFeatured: portfolio.isFeatured || false,
    });
    setImagePreview(portfolio.imageUrl || null);
    // Load existing media
    if (portfolio.media?.length > 0) {
      setMediaFiles(
        portfolio.media.map((m: any) => ({
          id: m.id,
          type: m.type,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl,
          name: m.url.split('/').pop() || 'media',
          size: m.fileSize || 0,
          duration: m.duration,
          order: m.order,
        }))
      );
    } else {
      setMediaFiles([]);
    }
    setShowPortfolioForm(true);
  };

  // === MEDIA FUNCTIONS ===

  const validateMediaFile = (file: File): string | null => {
    const mediaType = ALLOWED_TYPES[file.type];
    if (!mediaType) {
      return 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP, MP4, WebM ou PDF.';
    }
    const maxSize = MAX_SIZES[mediaType];
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return `Fichier trop volumineux. Maximum ${maxMB}MB pour les ${mediaType === 'IMAGE' ? 'images' : mediaType === 'VIDEO' ? 'vidéos' : 'PDFs'}.`;
    }
    return null;
  };

  const addMediaFiles = (files: FileList | File[]) => {
    const newFiles: MediaFile[] = [];
    const currentCount = mediaFiles.length;

    for (let i = 0; i < files.length; i++) {
      if (currentCount + newFiles.length >= 10) {
        setError('Maximum 10 médias par projet');
        break;
      }

      const file = files[i];
      const validationError = validateMediaFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }

      const mediaType = ALLOWED_TYPES[file.type];
      const previewUrl = mediaType === 'VIDEO'
        ? URL.createObjectURL(file)
        : mediaType === 'IMAGE'
          ? URL.createObjectURL(file)
          : ''; // PDF: no preview

      newFiles.push({
        file,
        type: mediaType,
        url: previewUrl,
        name: file.name,
        size: file.size,
        order: currentCount + newFiles.length,
      });
    }

    if (newFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...newFiles]);
      setError('');
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((prev) => {
      const file = prev[index];
      // Revoke object URL if it's a local preview
      if (file.file && file.url) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i }));
    });
  };

  const reorderMediaFiles = async (fromIndex: number, toIndex: number, portfolioId?: string) => {
    setMediaFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((f, i) => ({ ...f, order: i }));
    });

    // Persist order to backend if portfolio exists
    if (portfolioId) {
      try {
        const updatedOrder = [...mediaFiles];
        const [moved] = updatedOrder.splice(fromIndex, 1);
        updatedOrder.splice(toIndex, 0, moved);
        const mediaIds = updatedOrder.map(m => m.id).filter(Boolean);
        if (mediaIds.length > 0) {
          await professionalApi.reorderPortfolioMedia(portfolioId, mediaIds as string[]);
        }
      } catch (err) {
        console.error('Failed to persist media order:', err);
      }
    }
  };

  const uploadMediaForPortfolio = async (portfolioId: string) => {
    const newFiles = mediaFiles.filter((f) => f.file && !f.id);
    if (newFiles.length === 0) return;

    for (let i = 0; i < newFiles.length; i++) {
      const mediaFile = newFiles[i];
      const fileIndex = mediaFiles.findIndex((f) => f === mediaFile);

      // Mark as uploading
      setMediaFiles((prev) =>
        prev.map((f, idx) => idx === fileIndex ? { ...f, uploading: true, progress: 0 } : f)
      );

      try {
        const result = await professionalApi.uploadPortfolioMedia(
          portfolioId,
          mediaFile.file!,
          (progress) => {
            setMediaFiles((prev) =>
              prev.map((f, idx) => idx === fileIndex ? { ...f, progress } : f)
            );
          }
        );

        // Update with server data
        setMediaFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? {
                  ...f,
                  id: result.data.id,
                  url: result.data.url,
                  thumbnailUrl: result.data.thumbnailUrl,
                  uploading: false,
                  progress: 100,
                }
              : f
          )
        );
      } catch (err: any) {
        setMediaFiles((prev) =>
          prev.map((f, idx) =>
            idx === fileIndex
              ? { ...f, uploading: false, error: err.response?.data?.message || 'Erreur upload' }
              : f
          )
        );
      }
    }
  };

  const deleteExistingMedia = async (portfolioId: string, mediaId: string) => {
    try {
      await professionalApi.deletePortfolioMedia(portfolioId, mediaId);
      setMediaFiles((prev) => prev.filter((f) => f.id !== mediaId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addMediaFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleMediaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      addMediaFiles(e.dataTransfer.files);
    }
  };

  // === LEGACY IMAGE UPLOAD (backward compat) ===

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setPortfolioForm({ ...portfolioForm, imageUrl: base64String });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('Erreur lors de l\'upload de l\'image');
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // === CRUD PORTFOLIO ===

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title) {
      setError('Le titre est requis');
      return;
    }
    try {
      const portfolioData = {
        ...portfolioForm,
        tags: portfolioForm.tags ? portfolioForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      };
      const response = await professionalApi.addPortfolio(portfolioData);
      const newPortfolio = response.data || response;

      // Upload media files for the new portfolio
      if (mediaFiles.length > 0 && newPortfolio.id) {
        await uploadMediaForPortfolio(newPortfolio.id);
      }

      setPortfolios([...portfolios, { ...newPortfolio, media: mediaFiles }]);
      resetPortfolioForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!portfolioForm.title) {
      setError('Le titre est requis');
      return;
    }
    try {
      const portfolioData = {
        ...portfolioForm,
        tags: portfolioForm.tags ? portfolioForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      };
      const updatedPortfolio = await professionalApi.updatePortfolio(
        editingPortfolio.id,
        portfolioData
      );

      // Upload new media files
      if (mediaFiles.some((f) => f.file && !f.id)) {
        await uploadMediaForPortfolio(editingPortfolio.id);
      }

      setPortfolios(
        portfolios.map((p) => (p.id === editingPortfolio.id ? { ...updatedPortfolio, media: mediaFiles } : p))
      );
      resetPortfolioForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleRemovePortfolio = async (id: string) => {
    try {
      await professionalApi.removePortfolio(id);
      setPortfolios(portfolios.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return {
    portfolios,
    setPortfolios,
    showPortfolioForm,
    setShowPortfolioForm,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    imagePreview,
    setImagePreview,
    uploading,
    error,
    setError,
    fileInputRef,
    resetPortfolioForm,
    startEditPortfolio,
    handleImageUpload,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleAddPortfolio,
    handleUpdatePortfolio,
    handleRemovePortfolio,
    // Media management
    mediaFiles,
    setMediaFiles,
    mediaInputRef,
    addMediaFiles,
    removeMediaFile,
    reorderMediaFiles,
    uploadMediaForPortfolio,
    deleteExistingMedia,
    handleMediaInputChange,
    handleMediaDrop,
  };
}
