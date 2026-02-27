import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '../components/CreatorLayout';
import { favoritesApi, professionalApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import { PortfolioViewModal } from '../components/professional/PortfolioTab/PortfolioViewModal';
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
    profilePictureUrl: string | null;
    bio: string | null;
    experienceYears: number | null;
    hourlyRate: string | null;
    availability: string | null;
    averageRating: string | null;
    professions: Array<{ profession: { name: string; category: string }; isPrimary: boolean }>;
    portfolios: Array<{ id: string; title: string; imageUrl: string | null }>;
  };
}

interface LikedPortfolio {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  projectType: string | null;
  isFeatured: boolean;
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
    professions: Array<{ profession: { id: string; name: string; category: string }; isPrimary: boolean }>;
  };
  tags: Array<{ id: string; tag: string }>;
  media: Array<{ id: string; url: string; type: string; thumbnailUrl: string | null }>;
  _count: { likes: number };
}

type ActiveTab = 'liked' | 'following';

export default function SavedProfessionals() {
  useDocumentTitle('Mes listes | JUNY');

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ActiveTab>('liked');

  const [following, setFollowing] = useState<SavedProfessional[]>([]);
  const [likedPortfolios, setLikedPortfolios] = useState<LikedPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPortfolio, setSelectedPortfolio] = useState<LikedPortfolio | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [followRes, likedRes] = await Promise.all([
        favoritesApi.getSavedProfessionals(),
        professionalApi.getMyLikedPortfolios(),
      ]);
      setFollowing(followRes.data || []);
      setLikedPortfolios(likedRes.data || []);
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFollow = (professionalId: string) => {
    setFollowing((prev) => prev.filter((f) => f.professionalId !== professionalId));
  };

  const saveNote = async (professionalId: string) => {
    try {
      await favoritesApi.updateNote(professionalId, noteText);
      setFollowing((prev) =>
        prev.map((f) => f.professionalId === professionalId ? { ...f, note: noteText } : f)
      );
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const getPrimaryProfession = (professional: { professions: Array<{ profession: { name: string }; isPrimary: boolean }> }) => {
    const primary = professional.professions.find((p) => p.isPrimary);
    return primary?.profession.name || professional.professions[0]?.profession.name || 'Professionnel';
  };

  const getPortfolioImage = (p: LikedPortfolio) => {
    return (
      p.imageUrl ||
      p.media?.find((m) => m.type === 'IMAGE')?.url ||
      p.media?.[0]?.thumbnailUrl ||
      p.media?.[0]?.url ||
      null
    );
  };

  const getAvailabilityLabel = (availability: string | null) => {
    switch (availability) {
      case 'Disponible': return { label: 'Disponible', cls: 'bg-green-100 text-green-700' };
      case 'Partiellement disponible': return { label: 'Partiellement', cls: 'bg-yellow-100 text-yellow-700' };
      default: return { label: 'Non spécifié', cls: 'bg-gray-100 text-gray-600' };
    }
  };

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes listes</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Projets likés et créateurs suivis</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'liked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill={activeTab === 'liked' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Projets likés
            {likedPortfolios.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {likedPortfolios.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'following' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Créateurs suivis
            {following.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-xs font-semibold rounded-full">
                {following.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : activeTab === 'liked' ? (
          // ===== PROJETS LIKÉS =====
          likedPortfolios.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet liké</h3>
              <p className="text-gray-500 max-w-sm mx-auto text-sm">
                Likez des projets depuis l'explorateur pour les retrouver ici.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Explorer les projets
              </button>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {likedPortfolios.map((portfolio) => {
                const imgUrl = getPortfolioImage(portfolio);
                return (
                  <div
                    key={portfolio.id}
                    className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    onClick={() => setSelectedPortfolio(portfolio)}
                  >
                    <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
                      {imgUrl ? (
                        <img src={imgUrl} alt={portfolio.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Liked badge */}
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>

                    <div className="p-2.5">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{portfolio.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {portfolio.professional.profilePictureUrl ? (
                          <img src={portfolio.professional.profilePictureUrl} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                            {portfolio.professional.firstName?.[0]}{portfolio.professional.lastName?.[0]}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {portfolio.professional.firstName} {portfolio.professional.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          // ===== CRÉATEURS SUIVIS =====
          following.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun créateur suivi</h3>
              <p className="text-gray-500 max-w-sm mx-auto text-sm">
                Suivez des créatifs depuis l'explorateur pour les retrouver ici.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Explorer les créatifs
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {following.map((fav) => {
                const avail = getAvailabilityLabel(fav.professional.availability);
                return (
                  <div
                    key={fav.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/pro/${fav.professionalId}`)}
                  >
                    {/* Portfolio preview */}
                    {fav.professional.portfolios.length > 0 && fav.professional.portfolios[0].imageUrl && (
                      <div className="h-28 bg-gray-100 overflow-hidden">
                        <img src={fav.professional.portfolios[0].imageUrl} alt="Portfolio" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {fav.professional.profilePictureUrl ? (
                            <img
                              src={fav.professional.profilePictureUrl}
                              alt={`${fav.professional.firstName} ${fav.professional.lastName}`}
                              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {fav.professional.firstName?.[0]}{fav.professional.lastName?.[0]}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {fav.professional.firstName} {fav.professional.lastName}
                            </h3>
                            <p className="text-xs text-gray-500">{getPrimaryProfession(fav.professional)}</p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <FavoriteButton
                            professionalId={fav.professionalId}
                            variant="follow"
                            onToggle={(isSaved) => !isSaved && handleRemoveFollow(fav.professionalId)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        {fav.professional.experienceYears && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {fav.professional.experienceYears} ans
                          </span>
                        )}
                        {fav.professional.averageRating && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {parseFloat(fav.professional.averageRating).toFixed(1)}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full font-medium ${avail.cls}`}>
                          {avail.label}
                        </span>
                      </div>

                      {/* Note */}
                      <div className="pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        {editingNote === fav.professionalId ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Ajouter une note..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingNote(null)} className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                              <button onClick={() => saveNote(fav.professionalId)} className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">Enregistrer</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingNote(fav.professionalId); setNoteText(fav.note || ''); }}
                            className="w-full text-left text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="truncate">{fav.note || 'Ajouter une note...'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Portfolio lightbox */}
      {selectedPortfolio && (
        <PortfolioViewModal
          portfolio={selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
          author={{
            id: selectedPortfolio.professional.id,
            firstName: selectedPortfolio.professional.firstName,
            lastName: selectedPortfolio.professional.lastName,
            profilePictureUrl: selectedPortfolio.professional.profilePictureUrl,
            profession: getPrimaryProfession(selectedPortfolio.professional),
          }}
          onViewProfile={(id) => navigate(`/pro/${id}`)}
        />
      )}
    </CreatorLayout>
  );
}
