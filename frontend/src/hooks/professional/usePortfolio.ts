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

export function usePortfolio() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioForm>(initialPortfolioForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetPortfolioForm = () => {
    setPortfolioForm(initialPortfolioForm);
    setEditingPortfolio(null);
    setImagePreview(null);
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
    setShowPortfolioForm(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (max 5MB)
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
      console.error('Error uploading image:', err);
      setError('Erreur lors de l\'upload de l\'image');
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

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
      const newPortfolio = await professionalApi.addPortfolio(portfolioData);
      setPortfolios([...portfolios, newPortfolio]);
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
      setPortfolios(
        portfolios.map((p) => (p.id === editingPortfolio.id ? updatedPortfolio : p))
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
  };
}
