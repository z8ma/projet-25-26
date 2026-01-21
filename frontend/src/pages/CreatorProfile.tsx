import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { creatorApi, aiApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';

type TabType = 'profile' | 'projects' | 'professionals';

export default function CreatorProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile state
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Projects/Conversations state
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Professionals state
  const [matchedProfessionals, setMatchedProfessionals] = useState<any[]>([]);
  const [professionalsLoading, setProfessionalsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'CREATOR') {
      navigate('/dashboard');
      return;
    }

    loadProfile();
    loadConversations();
    loadMatchedProfessionals();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'projects') {
      loadConversations();
    } else if (activeTab === 'professionals') {
      loadMatchedProfessionals();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      const response = await creatorApi.getProfile();
      if (response.success) {
        setCompanyName(response.data.companyName || '');
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const response = await aiApi.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMatchedProfessionals = async () => {
    setProfessionalsLoading(true);
    try {
      const response = await aiApi.getConversations();
      if (response.success) {
        const allMatches: any[] = [];
        response.data.forEach((conv: any) => {
          if (conv.matches && conv.matches.length > 0) {
            conv.matches.forEach((match: any) => {
              allMatches.push({
                ...match,
                conversationTitle: conv.projectTitle,
                conversationId: conv.id,
              });
            });
          }
        });
        setMatchedProfessionals(allMatches);
      }
    } catch (err: any) {
      console.error('Error loading professionals:', err);
    } finally {
      setProfessionalsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await creatorApi.updateProfile({ companyName });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En cours' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Terminé' },
      ABANDONED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Abandonné' },
    };

    const config = statusConfig[status] || statusConfig.IN_PROGRESS;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getMatchStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PROPOSED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Proposé' },
      CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacté' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepté' },
      DECLINED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Refusé' },
    };

    const config = statusConfig[status] || statusConfig.PROPOSED;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <CreatorLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez votre profil et consultez votre activité</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-100 text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{conversations.length}</p>
          <p className="text-sm text-gray-500 mt-1">Projets créés</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-green-100 text-green-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {conversations.filter((c) => c.status === 'COMPLETED').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Projets terminés</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-100 text-purple-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {matchedProfessionals.filter((m) => m.status === 'CONTACTED').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Pros contactés</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-yellow-100 text-yellow-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {conversations.reduce((sum, c) => sum + (c.aiCreditsUsed || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Crédits IA utilisés</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mon Profil
              </span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'projects'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Mes Projets
              </span>
            </button>
            <button
              onClick={() => setActiveTab('professionals')}
              className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'professionals'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Professionnels
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du profil</h2>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Profil mis à jour avec succès
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Ma Startup"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </span>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Mes Projets & Conversations</h2>
                <Link
                  to="/brainstorming"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary-500/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau Projet
                </Link>
              </div>

              {conversationsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Aucun projet pour le moment</p>
                  <Link
                    to="/brainstorming"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer votre premier projet
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv: any) => (
                    <div key={conv.id} className="border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:border-primary-200 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{conv.projectTitle || 'Sans titre'}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Créé le {new Date(conv.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {getStatusBadge(conv.status)}
                          <Link
                            to={`/brainstorming/${conv.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-medium transition-all"
                          >
                            Ouvrir
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Messages</p>
                          <p className="font-semibold text-gray-900">
                            {Array.isArray(conv.messages) ? conv.messages.length : 0}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Crédits IA</p>
                          <p className="font-semibold text-gray-900">{conv.aiCreditsUsed}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-gray-500 text-xs mb-1">Matchs</p>
                          <p className="font-semibold text-gray-900">
                            {conv.matches?.length || 0}
                          </p>
                        </div>
                      </div>

                      {conv.projectSummary && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-600 line-clamp-2">{conv.projectSummary}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'professionals' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Professionnels Contactés</h2>

              {professionalsLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement...</p>
                </div>
              ) : matchedProfessionals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">Aucun professionnel contacté pour le moment</p>
                  <Link
                    to="/brainstorming"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Démarrer un projet
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedProfessionals.map((match: any) => (
                    <div key={match.id} className="border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:border-primary-200 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                            {match.professional.firstName[0]}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {match.professional.firstName} {match.professional.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {match.professional.professions?.[0]?.profession?.name || 'Profession non spécifiée'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Projet: {match.conversationTitle || 'Sans titre'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          {getMatchStatusBadge(match.status)}
                          <span className="text-lg font-bold text-green-600">{match.matchScore}% match</span>
                        </div>
                      </div>

                      {match.reasoning && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm font-medium text-blue-900 mb-1">Pourquoi ce match?</p>
                          <p className="text-sm text-blue-700">{match.reasoning}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm mb-4">
                        {match.professional.experienceYears && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {match.professional.experienceYears} ans d'expérience
                          </div>
                        )}
                        {match.professional.hourlyRate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {match.professional.hourlyRate}€/h
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        <Link
                          to={`/brainstorming/${match.conversationId}`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                        >
                          Voir le projet
                        </Link>
                        {match.professional.user?.email && (
                          <a
                            href={`mailto:${match.professional.user.email}`}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-medium transition-all"
                          >
                            Contacter par email
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CreatorLayout>
  );
}
