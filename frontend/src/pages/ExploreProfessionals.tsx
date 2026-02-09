import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '../components/CreatorLayout';
import { professionalApi, subscriptionApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import FilterDropdown from '../components/FilterDropdown';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  experienceYears: number | null;
  hourlyRate: string | null;
  availability: string | null;
  averageRating: string | null;
  totalRatings: number;
  projectsCompleted: number;
  isPremium: boolean;
  professions: Array<{
    profession: {
      id: string;
      name: string;
      category: string;
    };
    isPrimary: boolean;
  }>;
  softwareSkills: Array<{
    id: string;
    softwareName: string;
    proficiencyLevel: string | null;
  }>;
  portfolios: Array<{
    id: string;
    title: string;
    imageUrl: string | null;
    projectUrl: string | null;
    projectType: string | null;
    isFeatured: boolean;
  }>;
}

interface Profession {
  id: string;
  name: string;
  category: string;
}

const FREE_PROFILE_LIMIT = 3;

export default function ExploreProfessionals() {
  useDocumentTitle('Explorer | JUNY');

  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [viewedProfiles, setViewedProfiles] = useState<Set<string>>(new Set());

  // Filters
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected professional for detail view
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Scroll animations
  const headerAnimation = useScrollAnimation();
  const searchAnimation = useScrollAnimation();
  const professionalsAnimation = useScrollAnimation();

  useEffect(() => {
    loadProfessions();
    checkSubscription();
    // Load viewed profiles from localStorage
    const saved = localStorage.getItem('viewedProfiles');
    if (saved) {
      setViewedProfiles(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    loadProfessionals();
  }, [selectedProfession, selectedAvailability, searchQuery, page]);

  const checkSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrent();
      // Check if user has an active Pro subscription
      const subscription = response.data;
      setIsPro(subscription?.status === 'ACTIVE' && subscription?.plan?.name !== 'Gratuit');
    } catch (error) {
      setIsPro(false);
    }
  };

  const loadProfessions = async () => {
    try {
      const response = await professionalApi.listAllProfessions();
      setProfessions(response.data || []);
    } catch (error) {
      console.error('Error loading professions:', error);
    }
  };

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      const response = await professionalApi.exploreProfessionals({
        profession: selectedProfession || undefined,
        availability: selectedAvailability || undefined,
        search: searchQuery || undefined,
        page,
        limit: 12,
      });
      setProfessionals(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const canViewProfile = (professionalId: string, _index: number) => {
    if (isPro) return true;
    if (viewedProfiles.has(professionalId)) return true;
    if (viewedProfiles.size < FREE_PROFILE_LIMIT) return true;
    return false;
  };

  const handleViewProfile = async (professional: Professional, index: number) => {
    if (!canViewProfile(professional.id, index)) {
      return; // Show upgrade modal handled by the card click
    }

    // Track viewed profile for non-Pro users
    if (!isPro && !viewedProfiles.has(professional.id)) {
      const newViewed = new Set(viewedProfiles);
      newViewed.add(professional.id);
      setViewedProfiles(newViewed);
      localStorage.setItem('viewedProfiles', JSON.stringify([...newViewed]));
    }

    setDetailLoading(true);
    try {
      const response = await professionalApi.getProfessionalById(professional.id);
      setSelectedProfessional(response.data);
    } catch (error) {
      console.error('Error loading professional details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getPrimaryProfession = (professional: Professional) => {
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

  const getAvailabilityColor = (availability: string | null) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700';
      case 'PARTIALLY_AVAILABLE':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const remainingFreeViews = FREE_PROFILE_LIMIT - viewedProfiles.size;

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div
          ref={headerAnimation.ref}
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 transition-all duration-700 ${
            headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Explorer</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              Découvrez des talents pour vos projets
            </p>
          </div>

          {!isPro && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-amber-700">
                {remainingFreeViews} profil{remainingFreeViews !== 1 ? 's' : ''} gratuit{remainingFreeViews !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Search and Filters - Elegant Design */}
        <div
          ref={searchAnimation.ref}
          className={`flex flex-col gap-4 transition-all duration-700 delay-100 ${
            searchAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter toggle on mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`sm:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showFilters
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtres
            </button>

            {/* Filters */}
            <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
              {/* Profession Filter */}
              <FilterDropdown
                value={selectedProfession}
                onChange={setSelectedProfession}
                placeholder="Métier"
                options={professions.map((p) => ({ value: p.name, label: p.name }))}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              />

              {/* Availability Filter */}
              <FilterDropdown
                value={selectedAvailability}
                onChange={setSelectedAvailability}
                placeholder="Disponibilité"
                options={[
                  { value: 'AVAILABLE', label: 'Disponible' },
                  { value: 'PARTIALLY_AVAILABLE', label: 'Partiellement' },
                  { value: 'NOT_AVAILABLE', label: 'Indisponible' },
                ]}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              {/* Clear filters */}
              {(selectedProfession || selectedAvailability) && (
                <button
                  onClick={() => {
                    setSelectedProfession('');
                    setSelectedAvailability('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Effacer
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="hidden sm:block ml-auto text-sm text-gray-400">
              {professionals.length} résultat{professionals.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Professionals Grid */}
        <div
          ref={professionalsAnimation.ref}
          className={`transition-all duration-700 delay-200 ${
            professionalsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        ) : professionals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun créatif trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos filtres de recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional, index) => {
              const isBlurred = !canViewProfile(professional.id, index);

              return (
                <div
                  key={professional.id}
                  className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 ${
                    isBlurred ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                  }`}
                  onClick={() => !isBlurred && handleViewProfile(professional, index)}
                >
                  {/* Portfolio Preview */}
                  <div className={`h-40 bg-gray-100 grid grid-cols-2 gap-0.5 ${isBlurred ? 'blur-md' : ''}`}>
                    {professional.portfolios.length > 0 ? (
                      professional.portfolios.slice(0, 4).map((portfolio) => (
                        <div key={portfolio.id} className="bg-gray-200 overflow-hidden">
                          {portfolio.imageUrl ? (
                            <img
                              src={portfolio.imageUrl}
                              alt={portfolio.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex items-center justify-center text-gray-400">
                        <span className="text-sm">Pas de portfolio</span>
                      </div>
                    )}
                  </div>

                  {/* Premium Badge */}
                  {professional.isPremium && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Pro
                    </div>
                  )}

                  {/* Content */}
                  <div className={`p-4 ${isBlurred ? 'blur-sm' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {professional.firstName?.[0]}{professional.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {professional.firstName} {professional.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getPrimaryProfession(professional)}
                          </p>
                        </div>
                      </div>
                      {!isBlurred && (
                        <FavoriteButton professionalId={professional.id} size="sm" />
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      {professional.experienceYears && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {professional.experienceYears} ans
                        </span>
                      )}
                      {professional.averageRating && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {parseFloat(professional.averageRating).toFixed(1)}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(professional.availability)}`}>
                        {formatAvailability(professional.availability)}
                      </span>
                    </div>

                    {/* Skills */}
                    {professional.softwareSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {professional.softwareSkills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {skill.softwareName}
                          </span>
                        ))}
                        {professional.softwareSkills.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{professional.softwareSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Blur Overlay for locked profiles */}
                  {isBlurred && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-center mb-2">
                        Passez à Pro
                      </h4>
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Accédez à tous les profils de créatifs sans limite
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/pricing');
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
                      >
                        Voir les offres
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Professional Detail Modal */}
      {selectedProfessional && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProfessional(null)} />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {detailLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {selectedProfessional.firstName?.[0]}{selectedProfessional.lastName?.[0]}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {selectedProfessional.firstName} {selectedProfessional.lastName}
                        </h2>
                        <p className="text-gray-500">
                          {getPrimaryProfession(selectedProfessional)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FavoriteButton professionalId={selectedProfessional.id} />
                      <button
                        onClick={() => setSelectedProfessional(null)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedProfessional.experienceYears || '-'}
                        </div>
                        <div className="text-sm text-gray-500">Années d'exp.</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedProfessional.projectsCompleted}
                        </div>
                        <div className="text-sm text-gray-500">Projets</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                          {selectedProfessional.averageRating ? (
                            <>
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {parseFloat(selectedProfessional.averageRating).toFixed(1)}
                            </>
                          ) : '-'}
                        </div>
                        <div className="text-sm text-gray-500">Note moyenne</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedProfessional.hourlyRate ? `${selectedProfessional.hourlyRate}€` : '-'}
                        </div>
                        <div className="text-sm text-gray-500">Taux horaire</div>
                      </div>
                    </div>

                    {/* Bio */}
                    {selectedProfessional.bio && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                        <p className="text-gray-600">{selectedProfessional.bio}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedProfessional.softwareSkills.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Compétences</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfessional.softwareSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                            >
                              {skill.softwareName}
                              {skill.proficiencyLevel && (
                                <span className="ml-1 text-primary-500">
                                  ({skill.proficiencyLevel})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio */}
                    {selectedProfessional.portfolios.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Portfolio</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {/* Sort to show featured first */}
                          {[...selectedProfessional.portfolios]
                            .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
                            .map((portfolio) => (
                            <div
                              key={portfolio.id}
                              className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden ${
                                portfolio.isFeatured ? 'ring-2 ring-yellow-400' : ''
                              }`}
                            >
                              {portfolio.isFeatured && (
                                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-full">
                                  En avant
                                </div>
                              )}
                              {portfolio.imageUrl ? (
                                <img
                                  src={portfolio.imageUrl}
                                  alt={portfolio.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <p className="text-white font-medium truncate">{portfolio.title}</p>
                                  {portfolio.projectType && (
                                    <p className="text-white/80 text-sm">{portfolio.projectType}</p>
                                  )}
                                  {portfolio.projectUrl && (
                                    <ExternalLinkWarning
                                      url={portfolio.projectUrl}
                                      className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs rounded-full hover:bg-white/30 transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      Voir le projet
                                    </ExternalLinkWarning>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer CTA */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                    <button
                      onClick={() => navigate('/brainstorming')}
                      className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
                    >
                      Démarrer un projet avec ce créatif
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}
