import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { aiApi, matchingApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';
import CreditHistoryModal from '../components/CreditHistoryModal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

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
  status: string;
  aiCreditsUsed: number;
  matches: Match[];
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
  const [showCreditHistory, setShowCreditHistory] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // Redirect professionals to their profile
    if (user?.role === 'PROFESSIONAL') {
      navigate('/profile/professional');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [convResponse, msgResponse] = await Promise.all([
          aiApi.getConversations(),
          matchingApi.getConversations(),
        ]);
        setConversations(convResponse.data || []);
        setMessageConversations(msgResponse.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'CREATOR') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role === 'PROFESSIONAL') return null;

  // Calculate real stats
  const activeProjects = conversations.filter(c => c.status === 'IN_PROGRESS' || c.status === 'COMPLETED').length;
  const totalMatches = conversations.reduce((acc, c) => acc + (c.matches?.length || 0), 0);
  const totalCreditsUsed = conversations.reduce((acc, c) => acc + (c.aiCreditsUsed || 0), 0);
  const unreadMessages = messageConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const totalMessages = messageConversations.length;

  // Get recent matches (last 3)
  const recentMatches: Match[] = conversations
    .flatMap(c => c.matches || [])
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  const stats = [
    {
      label: 'Projets',
      value: loading ? '...' : String(activeProjects),
      change: loading ? '' : `${conversations.filter(c => c.status === 'IN_PROGRESS').length} en cours`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'primary',
    },
    {
      label: 'Matchs IA',
      value: loading ? '...' : String(totalMatches),
      change: loading ? '' : `${conversations.filter(c => c.matches?.some(m => m.status === 'ACCEPTED')).length} acceptés`,
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green',
    },
    {
      label: 'Messages',
      value: loading ? '...' : String(totalMessages),
      change: loading ? '' : (unreadMessages > 0 ? `${unreadMessages} non lu${unreadMessages > 1 ? 's' : ''}` : 'Tout lu'),
      changeType: unreadMessages > 0 ? 'neutral' : 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      label: 'Crédits IA',
      value: loading ? '...' : String(Math.max(0, 100 - totalCreditsUsed)),
      change: 'restants',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'purple',
      onClick: () => setShowCreditHistory(true),
    },
  ];

  return (
    <CreatorLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Bonjour, {user.creator?.companyName || 'Créateur'}
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité et des opportunités qui vous attendent.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className={`bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${stat.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              stat.color === 'primary' ? 'bg-primary-100 text-primary-600' :
              stat.color === 'green' ? 'bg-green-100 text-green-600' :
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {stat.icon}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            <div className="flex items-center gap-1 mt-2">
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {stat.change}
              </p>
              {stat.onClick && (
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* CTA Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 sm:p-8 text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Prêt à lancer un nouveau projet ?
              </h2>
              <p className="text-white/80 mb-6 max-w-md">
                Notre IA vous accompagne dans la définition de votre brief et trouve les meilleurs talents pour vous.
              </p>
              <Link
                to="/brainstorming"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Démarrer le Brainstorming IA
              </Link>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              to="/profile/creator"
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Compléter mon profil</h3>
              <p className="text-sm text-gray-500">Ajoutez vos informations pour de meilleurs matchs</p>
            </Link>

            <Link
              to="/projects"
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Voir mes projets</h3>
              <p className="text-sm text-gray-500">Suivez l'avancement de vos collaborations</p>
            </Link>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Matchs récents</h2>
            <Link to="/brainstorming" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            ) : recentMatches.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Aucun match pour le moment</p>
                <p className="text-gray-400 text-xs mt-1">Lancez un brainstorming pour trouver des créatifs</p>
              </div>
            ) : (
              recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {match.professional.firstName[0]}{match.professional.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {match.professional.firstName} {match.professional.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {match.professional.professions?.[0]?.profession?.name || 'Créatif'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {match.matchScore}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/brainstorming"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau projet
          </Link>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Conseil du jour</h3>
            <p className="text-sm text-gray-600">
              Plus votre brief est détaillé, meilleurs seront vos matchs ! Utilisez le brainstorming IA pour structurer votre projet et obtenir des recommandations personnalisées.
            </p>
          </div>
        </div>
      </div>

      {/* Credit History Modal */}
      {showCreditHistory && (
        <CreditHistoryModal onClose={() => setShowCreditHistory(false)} />
      )}
    </CreatorLayout>
  );
}
