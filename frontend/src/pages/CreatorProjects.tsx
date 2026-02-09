import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { aiApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';
import ProjectExportModal from '../components/ProjectExportModal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  experienceYears: number;
  hourlyRate: number;
  professions: { profession: { name: string } }[];
}

interface Match {
  id: string;
  matchScore: number;
  status: 'PROPOSED' | 'CONTACTED' | 'ACCEPTED' | 'DECLINED';
  projectStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
  reasoning?: string;
  professional: Professional;
  startedAt?: string;
  completedAt?: string;
}

interface Conversation {
  id: string;
  projectTitle: string | null;
  projectSummary: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  aiCreditsUsed: number;
  createdAt: string;
  updatedAt: string;
  messages: { role: string; content: string }[];
  matches: Match[];
}

type FilterType = 'all' | 'active' | 'completed' | 'pending';

export default function CreatorProjects() {
  useDocumentTitle('Mes Projets | JUNY');

  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; project: Conversation | null }>({ open: false, project: null });
  const [deleting, setDeleting] = useState(false);
  const [exportModal, setExportModal] = useState<{ open: boolean; project: Conversation | null }>({ open: false, project: null });

  // Scroll animations
  const headerAnimation = useScrollAnimation();
  const statsAnimation = useScrollAnimation();
  const filtersAnimation = useScrollAnimation();
  const projectsAnimation = useScrollAnimation();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'CREATOR') {
      navigate('/dashboard');
      return;
    }
    fetchConversations();
  }, [token, user, navigate]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await aiApi.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteModal.project) return;

    try {
      setDeleting(true);
      await aiApi.deleteConversation(deleteModal.project.id);
      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== deleteModal.project?.id));
      setDeleteModal({ open: false, project: null });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (e: React.MouseEvent, project: Conversation) => {
    e.stopPropagation(); // Prevent expanding the project card
    setDeleteModal({ open: true, project });
  };

  const openExportModal = (e: React.MouseEvent, project: Conversation) => {
    e.stopPropagation(); // Prevent expanding the project card
    setExportModal({ open: true, project });
  };

  // Statistiques
  const stats = {
    total: conversations.length,
    active: conversations.filter(c =>
      c.status === 'COMPLETED' &&
      c.matches.some(m => m.projectStatus === 'IN_PROGRESS' || m.projectStatus === 'REVIEW')
    ).length,
    completed: conversations.filter(c =>
      c.matches.some(m => m.projectStatus === 'COMPLETED')
    ).length,
    pending: conversations.filter(c =>
      c.status === 'IN_PROGRESS' ||
      (c.status === 'COMPLETED' && c.matches.every(m => m.projectStatus === 'NOT_STARTED'))
    ).length,
    professionals: conversations.reduce((acc, c) => acc + c.matches.filter(m => m.status === 'ACCEPTED').length, 0),
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(c => {
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        c.projectTitle?.toLowerCase().includes(query) ||
        c.projectSummary?.toLowerCase().includes(query) ||
        c.matches.some(m =>
          `${m.professional.firstName} ${m.professional.lastName}`.toLowerCase().includes(query)
        );
      if (!matchesSearch) return false;
    }

    // Filtre par statut
    switch (filter) {
      case 'active':
        return c.status === 'COMPLETED' &&
          c.matches.some(m => m.projectStatus === 'IN_PROGRESS' || m.projectStatus === 'REVIEW');
      case 'completed':
        return c.matches.some(m => m.projectStatus === 'COMPLETED');
      case 'pending':
        return c.status === 'IN_PROGRESS' ||
          (c.status === 'COMPLETED' && c.matches.every(m => m.projectStatus === 'NOT_STARTED'));
      default:
        return true;
    }
  });

  const getProjectProgress = (conversation: Conversation): number => {
    if (conversation.status === 'ABANDONED') return 0;

    const hasContacted = conversation.matches.some(m => m.status === 'CONTACTED');
    const hasProposed = conversation.matches.some(m => m.status === 'PROPOSED');
    const acceptedMatches = conversation.matches.filter(m => m.status === 'ACCEPTED');

    // Pas encore de matches acceptés
    if (acceptedMatches.length === 0) {
      if (hasContacted) return 25;
      if (hasProposed) return 15;
      return 5;
    }

    const completedCount = acceptedMatches.filter(m => m.projectStatus === 'COMPLETED').length;
    const inProgressCount = acceptedMatches.filter(m => m.projectStatus === 'IN_PROGRESS').length;
    const reviewCount = acceptedMatches.filter(m => m.projectStatus === 'REVIEW').length;

    if (completedCount === acceptedMatches.length) return 100;

    // Base 20% pour avoir des matches acceptés, puis progression selon l'avancement
    const progress = 20 +
      (inProgressCount * 20 / acceptedMatches.length) +
      (reviewCount * 40 / acceptedMatches.length) +
      (completedCount * 60 / acceptedMatches.length);

    return Math.min(Math.round(progress), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'REVIEW': return 'bg-amber-500';
      case 'NOT_STARTED': return 'bg-gray-400';
      case 'CANCELLED': return 'bg-red-500';
      case 'ABANDONED': return 'bg-gray-500';
      default: return 'bg-primary-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Terminé';
      case 'IN_PROGRESS': return 'En cours';
      case 'REVIEW': return 'En revue';
      case 'NOT_STARTED': return 'Pas commencé';
      case 'CANCELLED': return 'Annulé';
      case 'ABANDONED': return 'Abandonné';
      default: return status;
    }
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Accepté' };
      case 'CONTACTED': return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Contacté' };
      case 'PROPOSED': return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Proposé' };
      case 'DECLINED': return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Refusé' };
      default: return { color: 'bg-gray-100 text-gray-700 border-gray-200', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const FILTER_OPTIONS: { id: FilterType; label: string; bgColor: string; activeColor: string }[] = [
    { id: 'all', label: 'Tous', bgColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700', activeColor: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' },
    { id: 'active', label: 'En cours', bgColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700', activeColor: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' },
    { id: 'completed', label: 'Terminés', bgColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700', activeColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' },
    { id: 'pending', label: 'En attente', bgColor: 'bg-gray-100 hover:bg-gray-200 text-gray-700', activeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30' },
  ];

  if (loading) {
    return (
      <CreatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement de vos projets...</p>
          </div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout>
      {/* Header */}
      <div
        ref={headerAnimation.ref}
        className={`mb-8 transition-all duration-700 ${
          headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              Mes Projets
            </h1>
            <p className="text-gray-500 mt-1">Suivez l'avancement de tous vos projets et collaborations</p>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div
          ref={statsAnimation.ref}
          className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 transition-all duration-700 delay-100 ${
            statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total projets</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">En cours</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500">Terminés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.professionals}</p>
                <p className="text-sm text-gray-500">Créatifs acceptés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          ref={filtersAnimation.ref}
          className={`flex flex-wrap gap-3 mt-6 transition-all duration-700 delay-200 ${
            filtersAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                filter === option.id ? option.activeColor : option.bgColor
              }`}
            >
              <span>{option.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === option.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {option.id === 'all' ? stats.total :
                 option.id === 'active' ? stats.active :
                 option.id === 'completed' ? stats.completed : stats.pending}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div
        ref={projectsAnimation.ref}
        className={`transition-all duration-700 delay-300 ${
          projectsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
      {filteredConversations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-6 text-center">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer votre premier projet avec l\'IA'}
            </p>
            <Link
              to="/brainstorming"
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primary-500/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer un projet
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => {
            const progress = getProjectProgress(conversation);
            const isExpanded = expandedProject === conversation.id;
            const acceptedProfessionals = conversation.matches.filter(m => m.status === 'ACCEPTED');
            const allProfessionals = conversation.matches;

            return (
              <div
                key={conversation.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-300"
              >
                {/* Project Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedProject(isExpanded ? null : conversation.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {conversation.projectTitle || 'Projet sans titre'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(conversation.status)}`}>
                          {getStatusLabel(conversation.status)}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {conversation.projectSummary || 'Aucun résumé disponible'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Professionals avatars stack */}
                      {allProfessionals.length > 0 && (
                        <div className="flex -space-x-3">
                          {allProfessionals.slice(0, 4).map((match) => (
                            <div
                              key={match.id}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                              title={`${match.professional.firstName} ${match.professional.lastName}`}
                            >
                              {match.professional.firstName[0]}{match.professional.lastName[0]}
                            </div>
                          ))}
                          {allProfessionals.length > 4 && (
                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-semibold text-sm shadow-sm">
                              +{allProfessionals.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Export button */}
                      <button
                        onClick={(e) => openExportModal(e, conversation)}
                        className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-500 transition-all duration-200"
                        title="Exporter le brief"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => openDeleteModal(e, conversation)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
                        title="Supprimer le projet"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      <button className={`p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Progression globale</span>
                      <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Créé le {formatDate(conversation.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{conversation.messages.length} messages</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{allProfessionals.length} créatifs matchés</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{acceptedProfessionals.length} acceptés</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Professionals List */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Créatifs associés
                        </h4>
                        <Link
                          to={`/brainstorming/${conversation.id}`}
                          className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors border border-primary-200"
                        >
                          Voir le projet →
                        </Link>
                      </div>

                      {allProfessionals.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 mb-4">Aucun créatif n'a encore été matché à ce projet</p>
                          <Link
                            to={`/brainstorming/${conversation.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg text-sm font-medium transition-all hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Lancer le matching IA
                          </Link>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {allProfessionals.map((match) => {
                            const statusBadge = getMatchStatusBadge(match.status);
                            return (
                              <div
                                key={match.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Avatar */}
                                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                                    {match.professional.firstName[0]}{match.professional.lastName[0]}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h5 className="font-semibold text-gray-900">
                                        {match.professional.firstName} {match.professional.lastName}
                                      </h5>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                                        {statusBadge.label}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {match.professional.professions.map(p => p.profession.name).join(', ') || 'Créatif'}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {match.professional.experienceYears || 0} ans d'exp.
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {match.professional.hourlyRate || 0}€/h
                                      </span>
                                      {match.startedAt && (
                                        <span className="flex items-center gap-1">
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                          </svg>
                                          Démarré le {formatDate(match.startedAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Match Score & Project Status */}
                                  <div className="flex items-center gap-4">
                                    {/* Match Score */}
                                    <div className="text-center">
                                      <div className="relative w-14 h-14">
                                        <svg className="w-14 h-14 transform -rotate-90">
                                          <circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-gray-100"
                                          />
                                          <circle
                                            cx="28"
                                            cy="28"
                                            r="24"
                                            stroke="url(#gradientLight)"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${(match.matchScore / 100) * 150.8} 150.8`}
                                            className="transition-all duration-500"
                                          />
                                          <defs>
                                            <linearGradient id="gradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                                              <stop offset="0%" stopColor="#f97316" />
                                              <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                          </defs>
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                                          {match.matchScore}%
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-400 mt-1">Match</span>
                                    </div>

                                    {/* Project Status */}
                                    {match.status === 'ACCEPTED' && (
                                      <div className={`px-3 py-2 rounded-lg text-white text-sm font-medium ${getStatusColor(match.projectStatus)}`}>
                                        {getStatusLabel(match.projectStatus)}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Reasoning */}
                                {match.reasoning && (
                                  <div className="mt-3 p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                                    <p className="text-xs text-gray-600 italic flex items-start gap-1.5">
                                      <svg className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                      </svg>
                                      {match.reasoning}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        to="/brainstorming"
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-primary-500/30 transition-all duration-200 hover:scale-110 z-50"
        title="Nouveau projet"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.project && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Supprimer ce projet ?</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-gray-900 mb-1">
                {deleteModal.project.projectTitle || 'Projet sans titre'}
              </p>
              <p className="text-sm text-gray-500">
                {deleteModal.project.matches.length} créatif(s) associé(s) · {deleteModal.project.messages.length} message(s)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, project: null })}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModal.open && exportModal.project && (
        <ProjectExportModal
          project={exportModal.project as any}
          onClose={() => setExportModal({ open: false, project: null })}
        />
      )}
    </CreatorLayout>
  );
}
