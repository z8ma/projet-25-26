import { useState, useEffect } from 'react';
import { favoritesApi } from '../services/api';

interface FavoriteButtonProps {
  professionalId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

export default function FavoriteButton({
  professionalId,
  size = 'md',
  showLabel = false,
  onToggle,
}: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkIfSaved();
  }, [professionalId]);

  const checkIfSaved = async () => {
    try {
      const response = await favoritesApi.checkFavorite(professionalId);
      setIsSaved(response.isSaved);
    } catch (error) {
      console.error('Error checking favorite:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    try {
      if (isSaved) {
        await favoritesApi.removeFromFavorites(professionalId);
        setIsSaved(false);
        onToggle?.(false);
      } else {
        await favoritesApi.addToFavorites(professionalId);
        setIsSaved(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (initialLoading) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-xl transition-all duration-200 ${
        isSaved
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg
        className={`${iconSizes[size]} transition-transform duration-200 ${
          isSaved ? 'scale-110' : 'scale-100'
        }`}
        fill={isSaved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {isSaved ? 'Favori' : 'Ajouter'}
        </span>
      )}
    </button>
  );
}
