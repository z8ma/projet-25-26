import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatorLayout from '../components/CreatorLayout';
import { professionalApi, subscriptionApi } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import FilterDropdown from '../components/FilterDropdown';
import { PortfolioViewModal } from '../components/professional/PortfolioTab/PortfolioViewModal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string | null;
  experienceYears: number | null;
  hourlyRate: string | null;
  availability: string | null;
  averageRating: string | null;
  totalRatings: number;
  projectsCompleted: number;
  isPremium: boolean;
  professions: Array<{
    profession: { id: string; name: string; category: string };
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
    media?: Array<{ id: string; type: string; url: string; thumbnailUrl: string | null }>;
  }>;
}

interface PortfolioItem {
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
    professions: Array<{
      profession: { id: string; name: string; category: string };
      isPrimary: boolean;
    }>;
  };
  tags: Array<{ id: string; tag: string }>;
  media: Array<{ id: string; url: string; type: string; thumbnailUrl: string | null }>;
  _count: { likes: number };
}

interface Profession {
  id: string;
  name: string;
  category: string;
}

const FREE_PROFILE_LIMIT = 3;

const PROJECT_TYPES = [
  { value: 'branding', label: 'Branding' },
  { value: 'ui-ux', label: 'UI / UX' },
  { value: 'web-design', label: 'Web design' },
  { value: 'motion', label: 'Motion' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'social-media', label: 'Social media' },
  { value: 'direction-artistique', label: 'Direction artistique' },
  { value: 'print', label: 'Print' },
  { value: 'no-code', label: 'No-code / Webflow' },
  { value: '3d-cgi', label: '3D / CGI' },
  { value: 'photographie', label: 'Photographie' },
  { value: 'video', label: 'Vidéo' },
];

type SubTab = 'projects' | 'professionals';

export default function ExploreProfessionals() {
  useDocumentTitle('Explorer | JUNY');

  const navigate = useNavigate();
  const [subTab, setSubTab] = useState<SubTab>('projects');

  // --- Subscription ---
  const [isPro, setIsPro] = useState(false);
  const [viewedProfiles, setViewedProfiles] = useState<Set<string>>(new Set());

  // --- Professionals state ---
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [proLoading, setProLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [proSearch, setProSearch] = useState('');
  const [proPage, setProPage] = useState(1);
  const [proTotalPages, setProTotalPages] = useState(1);

  // --- Projects state ---
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [projLoading, setProjLoading] = useState(true);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [projSearch, setProjSearch] = useState('');
  const [projPage, setProjPage] = useState(1);
  const [projTotalPages, setProjTotalPages] = useState(1);
  const [likedPortfolios, setLikedPortfolios] = useState<Set<string>>(new Set());

  const [showFilters, setShowFilters] = useState(false);

  // Scroll animations
  const headerAnimation = useScrollAnimation();
  const contentAnimation = useScrollAnimation([subTab]);

  useEffect(() => {
    loadProfessions();
    checkSubscription();
    const saved = localStorage.getItem('viewedProfiles');
    if (saved) {
      setViewedProfiles(new Set(JSON.parse(saved)));
    }
  }, []);

  // Load professionals when sub-tab or filters change
  useEffect(() => {
    if (subTab === 'professionals') {
      loadProfessionals();
    }
  }, [selectedProfession, selectedAvailability, proSearch, proPage, subTab]);

  // Load portfolios when sub-tab or filters change
  useEffect(() => {
    if (subTab === 'projects') {
      loadPortfolios();
    }
  }, [selectedProjectType, projSearch, projPage, subTab]);

  const checkSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrent();
      const subscription = response.data;
      setIsPro(subscription?.status === 'ACTIVE' && subscription?.plan?.name !== 'Gratuit');
    } catch {
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
    setProLoading(true);
    try {
      const response = await professionalApi.exploreProfessionals({
        profession: selectedProfession || undefined,
        availability: selectedAvailability || undefined,
        search: proSearch || undefined,
        page: proPage,
        limit: 12,
      });
      setProfessionals(response.data || []);
      setProTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setProLoading(false);
    }
  };

  const loadPortfolios = async () => {
    setProjLoading(true);
    try {
      const response = await professionalApi.explorePortfolios({
        projectType: selectedProjectType || undefined,
        search: projSearch || undefined,
        page: projPage,
        limit: 18,
      });
      const loadedPortfolios = response.data || [];
      setPortfolios(loadedPortfolios);
      setProjTotalPages(response.pagination?.totalPages || 1);

      if (loadedPortfolios.length > 0) {
        try {
          const portfolioIds = loadedPortfolios.map((p: PortfolioItem) => p.id);
          const likesRes = await professionalApi.getLikedPortfolios(portfolioIds);
          setLikedPortfolios(new Set(likesRes.data || []));
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setProjLoading(false);
    }
  };

  const handleLike = async (portfolioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (likedPortfolios.has(portfolioId)) {
        await professionalApi.unlikePortfolio(portfolioId);
        setLikedPortfolios(prev => { const n = new Set(prev); n.delete(portfolioId); return n; });
        setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, _count: { likes: Math.max(0, p._count.likes - 1) } } : p));
      } else {
        await professionalApi.likePortfolio(portfolioId);
        setLikedPortfolios(prev => new Set(prev).add(portfolioId));
        setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, _count: { likes: p._count.likes + 1 } } : p));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const canViewProfile = (professionalId: string) => {
    if (isPro) return true;
    if (viewedProfiles.has(professionalId)) return true;
    if (viewedProfiles.size < FREE_PROFILE_LIMIT) return true;
    return false;
  };

  const handleViewProfile = (professional: Professional) => {
    if (!canViewProfile(professional.id)) return;
    if (!isPro && !viewedProfiles.has(professional.id)) {
      const newViewed = new Set(viewedProfiles);
      newViewed.add(professional.id);
      setViewedProfiles(newViewed);
      localStorage.setItem('viewedProfiles', JSON.stringify([...newViewed]));
    }
    navigate(`/pro/${professional.id}`);
  };

  const getPrimaryProfession = (
    professional: Professional | PortfolioItem['professional'],
  ) => {
    const primary = professional.professions.find((p) => p.isPrimary);
    return primary?.profession.name || professional.professions[0]?.profession.name || 'Professionnel';
  };

  const getAvailabilityColor = (availability: string | null) => {
    switch (availability) {
      case 'Disponible':
        return 'bg-green-100 text-green-700';
      case 'Partiellement disponible':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPortfolioImage = (portfolio: PortfolioItem) => {
    return (
      portfolio.imageUrl ||
      portfolio.media?.find((m) => m.type === 'IMAGE')?.url ||
      portfolio.media?.[0]?.thumbnailUrl ||
      portfolio.media?.[0]?.url ||
      null
    );
  };

  const remainingFreeViews = Math.max(0, FREE_PROFILE_LIMIT - viewedProfiles.size);

  return (
    <CreatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div
          ref={headerAnimation.ref}
          className={`transition-all duration-700 ${
            headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explorer</h1>
              <p className="text-gray-500 mt-0.5 text-sm">
                Découvrez des projets et des talents créatifs
              </p>
            </div>

            {/* Free views badge - only visible on professionals tab */}
            {subTab === 'professionals' && !isPro && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-100 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-700">
                  {remainingFreeViews} profil{remainingFreeViews !== 1 ? 's' : ''} gratuit{remainingFreeViews !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => { setSubTab('projects'); setShowFilters(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                subTab === 'projects'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Projets
            </button>
            <button
              onClick={() => { setSubTab('professionals'); setShowFilters(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                subTab === 'professionals'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Professionnels
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={contentAnimation.ref}
          className={`transition-all duration-700 delay-100 ${
            contentAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* ============ PROJECTS SUB-TAB ============ */}
          {subTab === 'projects' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un projet, un tag..."
                    value={projSearch}
                    onChange={(e) => { setProjSearch(e.target.value); setProjPage(1); }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  {projSearch && (
                    <button
                      onClick={() => setProjSearch('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`sm:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      showFilters ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filtres
                  </button>

                  <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
                    <FilterDropdown
                      value={selectedProjectType}
                      onChange={(v) => { setSelectedProjectType(v); setProjPage(1); }}
                      placeholder="Type de projet"
                      options={PROJECT_TYPES}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      }
                    />
                    {selectedProjectType && (
                      <button
                        onClick={() => { setSelectedProjectType(''); setProjPage(1); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Effacer
                      </button>
                    )}
                  </div>

                  <div className="hidden sm:block ml-auto text-sm text-gray-400">
                    {portfolios.length} projet{portfolios.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              {projLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : portfolios.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
                  <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {portfolios.map((portfolio) => {
                    const imgUrl = getPortfolioImage(portfolio);
                    return (
                      <div
                        key={portfolio.id}
                        className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        onClick={() => setSelectedPortfolio(portfolio)}
                      >
                        {/* Image */}
                        <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={portfolio.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Like button */}
                        <button
                          onClick={(e) => handleLike(portfolio.id, e)}
                          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-colors ${likedPortfolios.has(portfolio.id) ? 'text-red-500' : 'text-gray-400'}`}
                            fill={likedPortfolios.has(portfolio.id) ? 'currentColor' : 'none'}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>

                        {/* Likes count */}
                        {portfolio._count.likes > 0 && (
                          <div className="absolute top-10 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-full">
                            {portfolio._count.likes}
                          </div>
                        )}

                        {/* Info */}
                        <div className="p-2.5">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{portfolio.title}</h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {portfolio.professional.profilePictureUrl ? (
                              <img
                                src={portfolio.professional.profilePictureUrl}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                              />
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
              )}

              {/* Pagination */}
              {projTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setProjPage(Math.max(1, projPage - 1))}
                    disabled={projPage === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {projPage} sur {projTotalPages}
                  </span>
                  <button
                    onClick={() => setProjPage(Math.min(projTotalPages, projPage + 1))}
                    disabled={projPage === projTotalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============ PROFESSIONALS SUB-TAB ============ */}
          {subTab === 'professionals' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, compétence..."
                    value={proSearch}
                    onChange={(e) => { setProSearch(e.target.value); setProPage(1); }}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                  {proSearch && (
                    <button
                      onClick={() => setProSearch('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`sm:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      showFilters ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filtres
                  </button>

                  <div className={`flex flex-wrap gap-2 ${showFilters ? '' : 'hidden sm:flex'}`}>
                    <FilterDropdown
                      value={selectedProfession}
                      onChange={(v) => { setSelectedProfession(v); setProPage(1); }}
                      placeholder="Métier"
                      options={professions.map((p) => ({ value: p.name, label: p.name }))}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                    <FilterDropdown
                      value={selectedAvailability}
                      onChange={(v) => { setSelectedAvailability(v); setProPage(1); }}
                      placeholder="Disponibilité"
                      options={[
                        { value: 'Disponible', label: 'Disponible' },
                        { value: 'Partiellement disponible', label: 'Partiellement' },
                        { value: 'Non disponible', label: 'Indisponible' },
                      ]}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    {(selectedProfession || selectedAvailability) && (
                      <button
                        onClick={() => { setSelectedProfession(''); setSelectedAvailability(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Effacer
                      </button>
                    )}
                  </div>

                  <div className="hidden sm:block ml-auto text-sm text-gray-400">
                    {professionals.length} résultat{professionals.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Professionals Grid */}
              {proLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : professionals.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun créatif trouvé</h3>
                  <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {professionals.map((professional) => {
                    const isBlurred = !canViewProfile(professional.id);
                    return (
                      <div
                        key={professional.id}
                        className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 ${
                          isBlurred ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                        }`}
                        onClick={() => !isBlurred && handleViewProfile(professional)}
                      >
                        {/* Portfolio Preview */}
                        <div className={`h-32 bg-gray-100 grid grid-cols-2 gap-0.5 ${isBlurred ? 'blur-md' : ''}`}>
                          {professional.portfolios.length > 0 ? (
                            professional.portfolios.slice(0, 4).map((portfolio) => {
                              const coverUrl = portfolio.imageUrl
                                || portfolio.media?.find((m) => m.type === 'IMAGE')?.url
                                || portfolio.media?.[0]?.thumbnailUrl
                                || portfolio.media?.[0]?.url;
                              return (
                                <div key={portfolio.id} className="bg-gray-200 overflow-hidden">
                                  {coverUrl ? (
                                    <img src={coverUrl} alt={portfolio.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="col-span-2 flex items-center justify-center text-gray-400">
                              <span className="text-sm">Pas de portfolio</span>
                            </div>
                          )}
                        </div>

                        {/* Premium Badge */}
                        {professional.isPremium && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 z-20">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Pro
                          </div>
                        )}


                        {/* Centered Avatar */}
                        <div className={`flex justify-center -mt-8 relative z-10 ${isBlurred ? 'blur-sm' : ''}`}>
                          {professional.profilePictureUrl ? (
                            <img
                              src={professional.profilePictureUrl}
                              alt={`${professional.firstName} ${professional.lastName}`}
                              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-white shadow-md">
                              {professional.firstName?.[0]}{professional.lastName?.[0]}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className={`px-4 pb-4 pt-2 text-center ${isBlurred ? 'blur-sm' : ''}`}>
                          <h3 className="font-semibold text-gray-900">
                            {professional.firstName} {professional.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{getPrimaryProfession(professional)}</p>

                          <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mt-2">
                            {professional.experienceYears && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {professional.experienceYears} ans
                              </span>
                            )}
                            {professional.averageRating && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {parseFloat(professional.averageRating).toFixed(1)}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(professional.availability)}`}>
                              {professional.availability || 'Non spécifié'}
                            </span>
                          </div>

                          {professional.softwareSkills.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                              {professional.softwareSkills.slice(0, 3).map((skill) => (
                                <span key={skill.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
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

                          {/* Follow Button */}
                          <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <FavoriteButton
                              professionalId={professional.id}
                              variant="follow"
                            />
                          </div>
                        </div>

                        {/* Blur Overlay */}
                        {isBlurred && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-center mb-2">Passez à Pro</h4>
                            <p className="text-sm text-gray-500 text-center mb-4">
                              Accédez à tous les profils sans limite
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/pricing'); }}
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

              {/* Pagination */}
              {proTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setProPage(Math.max(1, proPage - 1))}
                    disabled={proPage === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {proPage} sur {proTotalPages}
                  </span>
                  <button
                    onClick={() => setProPage(Math.min(proTotalPages, proPage + 1))}
                    disabled={proPage === proTotalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Lightbox */}
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
