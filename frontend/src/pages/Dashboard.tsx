import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { aiApi, matchingApi, creatorApi, subscriptionApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';
import CreditHistoryModal from '../components/CreditHistoryModal';
import OnboardingChecklist from '../components/creator/OnboardingChecklist';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Match {
  id: string;
  matchScore: number;
  status: string;
  professional: {
    firstName: string;
    lastName: string;
    professions: { profession: { name: string } }[];
  };
}

interface Conversation {
  id: string;
  projectTitle: string | null;
  projectSummary: string | null;
  status: string;
  aiCreditsUsed: number;
  matches: Match[];
  updatedAt: string;
}

interface MessageConversation {
  unreadCount: number;
}

export default function Dashboard() {
  useDocumentTitle('Dashboard | JUNY');

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageConversations, setMessageConversations] = useState<MessageConversation[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showCreditHistory, setShowCreditHistory] = useState(false);

  // Scroll animations
  const heroAnimation = useScrollAnimation();
  const actionsAnimation = useScrollAnimation();
  const contentAnimation = useScrollAnimation();
  const checklistAnimation = useScrollAnimation();

  useEffect(() => {
    if (!user) navigate('/login');
    if (user?.role === 'PROFESSIONAL') navigate('/profile/professional');
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [convResponse, msgResponse, profileResponse, subResponse] = await Promise.all([
          aiApi.getConversations(),
          matchingApi.getConversations(),
          creatorApi.getProfile(),
          subscriptionApi.getCurrent(),
        ]);
        setConversations(convResponse.data || []);
        setMessageConversations(msgResponse.data || []);
        if (profileResponse.success) setCreatorProfile(profileResponse.data);
        if (subResponse.success) setSubscription(subResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'CREATOR') fetchData();
  }, [user]);

  if (!user || user.role === 'PROFESSIONAL') return null;

  // Stats
  const activeProjects = conversations.filter(c => c.status === 'IN_PROGRESS' || c.status === 'COMPLETED').length;
  const totalMatches = conversations.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
  const totalCreditsUsed = conversations.reduce((acc, c) => acc + (c.aiCreditsUsed || 0), 0);
  const totalCreditsMax = subscription?.plan?.aiCreditsMonth || 50;
  const creditsLeft = subscription ? subscription.aiCreditsRemaining : Math.max(0, totalCreditsMax - totalCreditsUsed);
  const unreadMessages = messageConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalMessages = messageConversations.length;

  const recentMatches: Match[] = conversations
    .flatMap(c => c.matches || [])
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  const recentProjects = [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const acceptedMatches = conversations.reduce(
    (acc, c) => acc + (c.matches?.filter(m => m.status === 'ACCEPTED').length || 0), 0
  );

  const getMatchStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { label: 'Accepté', color: 'bg-emerald-100 text-emerald-700' };
      case 'CONTACTED': return { label: 'Contacté', color: 'bg-blue-100 text-blue-700' };
      case 'PROPOSED': return { label: 'Proposé', color: 'bg-amber-100 text-amber-700' };
      case 'DECLINED': return { label: 'Refusé', color: 'bg-red-100 text-red-700' };
      default: return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getProjectStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return { label: 'En cours', dot: 'bg-blue-500' };
      case 'COMPLETED': return { label: 'Terminé', dot: 'bg-emerald-500' };
      case 'ABANDONED': return { label: 'Abandonné', dot: 'bg-gray-400' };
      default: return { label: 'Actif', dot: 'bg-primary-500' };
    }
  };

  return (
    <CreatorLayout>
      <div className="space-y-6">

        {/* ── Hero gradient card ── */}
        <div
          ref={heroAnimation.ref}
          className={`bg-gradient-to-br from-primary-600 via-primary-500 to-orange-400 rounded-2xl p-8 text-white relative overflow-hidden transition-all duration-700 ${
            heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Tableau de bord</p>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Bonjour, {user.creator?.companyName || 'Créateur'} 👋
                </h1>
                <p className="text-white/70 mt-1 text-sm">
                  {loading ? 'Chargement...' : activeProjects > 0
                    ? `${activeProjects} projet${activeProjects > 1 ? 's' : ''} en cours · ${totalMatches} match${totalMatches > 1 ? 's' : ''} IA`
                    : 'Prêt à lancer votre premier projet ?'
                  }
                </p>
              </div>
              <Link
                to="/brainstorming"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-orange-50 transition-all duration-200 shadow-lg shadow-black/10 hover:scale-105 shrink-0 self-start"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Brainstorming IA
              </Link>
            </div>

            {/* 4 metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Projets */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{loading ? '—' : activeProjects}</div>
                <div className="text-sm text-white/70 mt-0.5">Projets</div>
                <svg className="w-full h-8 mt-2" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <polyline points="0,20 14,18 28,15 42,17 57,12 71,14 85,10 100,8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className="group-hover:stroke-white/70 transition-all" />
                </svg>
              </div>

              {/* Matchs IA */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{loading ? '—' : totalMatches}</div>
                <div className="text-sm text-white/70 mt-0.5">Matchs IA</div>
                <svg className="w-full h-8 mt-2" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <polyline points="0,22 14,20 28,16 42,14 57,10 71,8 85,5 100,3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className="group-hover:stroke-white/70 transition-all" />
                </svg>
              </div>

              {/* Messages */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer" onClick={() => navigate('/messages')}>
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold">{loading ? '—' : totalMessages}</div>
                <div className="text-sm text-white/70 mt-0.5">
                  {unreadMessages > 0 ? `${unreadMessages} non lu${unreadMessages > 1 ? 's' : ''}` : 'Messages'}
                </div>
                <svg className="w-full h-8 mt-2" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <polyline points="0,18 14,15 28,17 42,12 57,14 71,10 85,12 100,8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className="group-hover:stroke-white/70 transition-all" />
                </svg>
              </div>

              {/* Crédits IA */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 hover:bg-white/25 transition-all duration-300 group cursor-pointer" onClick={() => setShowCreditHistory(true)}>
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{loading ? '—' : creditsLeft}</div>
                <div className="text-sm text-white/70 mt-0.5">Crédits restants</div>
                {/* Credits progress bar */}
                <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${loading ? 100 : Math.round((creditsLeft / totalCreditsMax) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div
          ref={actionsAnimation.ref}
          className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 delay-100 ${
            actionsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/brainstorming"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900">Brainstorming</div>
              <div className="text-xs text-gray-500">Nouveau projet IA</div>
            </div>
          </Link>

          <Link
            to="/projects"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900">Mes projets</div>
              <div className="text-xs text-gray-500">Suivre l'avancement</div>
            </div>
          </Link>

          <Link
            to="/messages"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group relative"
          >
            {unreadMessages > 0 && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900">Messages</div>
              <div className="text-xs text-gray-500">
                {unreadMessages > 0 ? `${unreadMessages} non lu${unreadMessages > 1 ? 's' : ''}` : 'Conversations'}
              </div>
            </div>
          </Link>

          <Link
            to="/profile/creator"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-gray-900">Mon profil</div>
              <div className="text-xs text-gray-500">Modifier</div>
            </div>
          </Link>
        </div>

        {/* ── Main content 3-columns ── */}
        <div
          ref={contentAnimation.ref}
          className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${
            contentAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Col 1 (span 2): Recent projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  Projets récents
                </h2>
                <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Tout voir →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">Aucun projet pour l'instant</p>
                  <p className="text-gray-400 text-sm mb-4">Lancez un brainstorming IA pour démarrer</p>
                  <Link
                    to="/brainstorming"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer un projet
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentProjects.map((conv) => {
                    const statusConf = getProjectStatusConfig(conv.status);
                    const matchCount = conv.matches?.length || 0;
                    const acceptedCount = conv.matches?.filter(m => m.status === 'ACCEPTED').length || 0;
                    return (
                      <Link
                        key={conv.id}
                        to="/projects"
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-orange-100 rounded-xl flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {conv.projectTitle || 'Projet sans titre'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.projectSummary || 'Aucun résumé'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {matchCount > 0 && (
                            <span className="text-xs text-gray-400">{acceptedCount}/{matchCount} matchs</span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${statusConf.dot}`} />
                            <span className="text-xs text-gray-500">{statusConf.label}</span>
                          </div>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* IA stats card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Activité IA
              </h2>
              <div className="space-y-4">
                {/* Credits bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600">Crédits IA utilisés</span>
                    <button onClick={() => setShowCreditHistory(true)} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                      {loading ? '—' : totalCreditsUsed} / {loading ? '—' : totalCreditsMax}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        totalCreditsUsed / totalCreditsMax > 0.8 ? 'bg-red-500' :
                        totalCreditsUsed / totalCreditsMax > 0.5 ? 'bg-amber-500' : 'bg-primary-500'
                      }`}
                      style={{ width: loading ? '0%' : `${Math.round((totalCreditsUsed / totalCreditsMax) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{loading ? '—' : creditsLeft} crédits restants</p>
                </div>

                <div className="border-t border-gray-100" />

                {/* Match stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{loading ? '—' : totalMatches}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Générés</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">
                      {loading ? '—' : conversations.reduce((acc, c) => acc + (c.matches?.filter(m => m.status === 'CONTACTED').length || 0), 0)}
                    </div>
                    <div className="text-xs text-blue-600 mt-0.5">Contactés</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-emerald-700">{loading ? '—' : acceptedMatches}</div>
                    <div className="text-xs text-emerald-600 mt-0.5">Acceptés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Recent matches */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Meilleurs matchs
                </h2>
                <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Voir tout →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentMatches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Aucun match</p>
                  <p className="text-gray-400 text-xs mt-1">Lancez un brainstorming pour en obtenir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMatches.map((match, matchIndex) => {
                    const isFreeTier = subscription?.isFreeTier === true;

                    // Lock matches beyond the first one for free tier users
                    if (isFreeTier && matchIndex > 0) {
                      return (
                        <div key={match.id} className="relative rounded-xl overflow-hidden">
                          {/* Blurred content underneath */}
                          <div className="blur-sm pointer-events-none select-none flex items-center gap-3 p-3" aria-hidden>
                            <div className="relative w-11 h-11 shrink-0">
                              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                                <circle cx="22" cy="22" r="18" fill="none" stroke="#ff7900" strokeWidth="4" strokeDasharray={`${(match.matchScore / 100) * 113} 113`} strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-gray-900">{match.matchScore}%</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">•••••• ••••••</p>
                              <p className="text-xs text-gray-500 truncate">••••••••</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 text-gray-500">••••</span>
                          </div>
                          {/* Lock overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-gradient-to-br from-primary-100 to-orange-100 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-800">Profil verrouillé</p>
                                <Link to="/settings" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Passer au Starter →</Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const statusConf = getMatchStatusConfig(match.status);
                    return (
                      <div key={match.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                        {/* Score circle */}
                        <div className="relative w-11 h-11 shrink-0">
                          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                            <circle cx="22" cy="22" r="18" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                            <circle
                              cx="22" cy="22" r="18" fill="none"
                              stroke="#ff7900" strokeWidth="4"
                              strokeDasharray={`${(match.matchScore / 100) * 113} 113`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-900">{match.matchScore}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {match.professional.firstName} {match.professional.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {match.professional.professions?.[0]?.profession?.name || 'Créatif'}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link
                to="/brainstorming"
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau projet
              </Link>
            </div>

            {/* Profile completion mini card */}
            {creatorProfile && (() => {
              const fields = [
                creatorProfile.companyName,
                creatorProfile.industry,
                creatorProfile.description,
                creatorProfile.profilePictureUrl,
                creatorProfile.phone,
              ];
              const completed = fields.filter(Boolean).length;
              const pct = Math.round((completed / fields.length) * 100);
              if (pct >= 100) return null;
              return (
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl border border-primary-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary-800">Profil</span>
                    <span className="text-sm font-bold text-primary-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2 mb-3">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-primary-700 mb-3">Un profil complet attire plus de talents</p>
                  <Link
                    to="/profile/creator"
                    className="w-full flex items-center justify-center px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Compléter mon profil
                  </Link>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Onboarding checklist ── */}
        <div
          ref={checklistAnimation.ref}
          className={`transition-all duration-700 delay-300 ${
            checklistAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <OnboardingChecklist
            creatorProfile={creatorProfile}
            conversations={conversations}
            messageConversations={messageConversations}
            loading={loading}
          />
        </div>

      </div>

      {showCreditHistory && <CreditHistoryModal onClose={() => setShowCreditHistory(false)} />}
    </CreatorLayout>
  );
}
