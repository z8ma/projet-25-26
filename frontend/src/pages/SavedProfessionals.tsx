import { useState, useEffect } from 'react';
import CreatorLayout from '../components/CreatorLayout';
import { favoritesApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface SavedProfessional {
  id: string;
  professionalId: string;
  note: string | null;
  createdAt: string;
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    experienceYears: number | null;
    hourlyRate: string | null;
    availability: string | null;
    averageRating: string | null;
    professions: Array<{
      profession: {
        name: string;
        category: string;
      };
      isPrimary: boolean;
    }>;
    portfolios: Array<{
      id: string;
      title: string;
      imageUrl: string | null;
    }>;
  };
}

export default function SavedProfessionals() {
  useDocumentTitle('Favoris | JUNY');

  const [favorites, setFavorites] = useState<SavedProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getSavedProfessionals();
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (professionalId: string) => {
    setFavorites((prev) => prev.filter((f) => f.professionalId !== professionalId));
  };

  const startEditNote = (fav: SavedProfessional) => {
    setEditingNote(fav.professionalId);
    setNoteText(fav.note || '');
  };

  const saveNote = async (professionalId: string) => {
    try {
      await favoritesApi.updateNote(professionalId, noteText);
      setFavorites((prev) =>
        prev.map((f) =>
          f.professionalId === professionalId ? { ...f, note: noteText } : f
        )
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const getPrimaryProfession = (professional: SavedProfessional['professional']) => {
    const primary = professional.professions.find((p) => p.isPrimary);
    return primary?.profession.name || professional.professions[0]?.profession.name || 'Professionnel';
  };

  const formatAvailability = (availability: string | null) => {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible',
      PARTIALLY_AVAILABLE: 'Partiellement dispo',
      NOT_AVAILABLE: 'Non disponible',
    };
    return labels[availability || ''] || 'Non spécifié';
  };

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Favoris</h1>
            <p className="text-gray-500 mt-1">
              Professionnels que vous avez sauvegardés
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{favorites.length} favori{favorites.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun favori pour l'instant
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Sauvegardez des professionnels depuis vos brainstormings pour les retrouver facilement ici.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Portfolio preview */}
                {fav.professional.portfolios.length > 0 && fav.professional.portfolios[0].imageUrl && (
                  <div className="h-32 bg-gray-100 overflow-hidden">
                    <img
                      src={fav.professional.portfolios[0].imageUrl}
                      alt="Portfolio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                        {fav.professional.firstName?.[0]}{fav.professional.lastName?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {fav.professional.firstName} {fav.professional.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getPrimaryProfession(fav.professional)}
                        </p>
                      </div>
                    </div>
                    <FavoriteButton
                      professionalId={fav.professionalId}
                      size="sm"
                      onToggle={(isSaved) => !isSaved && handleRemove(fav.professionalId)}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    {fav.professional.experienceYears && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fav.professional.experienceYears} ans
                      </span>
                    )}
                    {fav.professional.averageRating && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {parseFloat(fav.professional.averageRating).toFixed(1)}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      fav.professional.availability === 'AVAILABLE'
                        ? 'bg-green-100 text-green-700'
                        : fav.professional.availability === 'PARTIALLY_AVAILABLE'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {formatAvailability(fav.professional.availability)}
                    </span>
                  </div>

                  {/* Note */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {editingNote === fav.professionalId ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Ajouter une note personnelle..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => saveNote(fav.professionalId)}
                            className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditNote(fav)}
                        className="w-full text-left text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {fav.note || 'Ajouter une note...'}
                      </button>
                    )}
                  </div>

                  {/* Saved date */}
                  <p className="text-xs text-gray-400 mt-2">
                    Ajouté le {new Date(fav.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CreatorLayout>
  );
}
