import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { aiApi, matchingApi, ratingApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';

export default function Brainstorming() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showConversationsSidebar, setShowConversationsSidebar] = useState(false);

  // Contact professional modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [contactMessage, setContactMessage] = useState('');

  // Confirmation modal for early matching
  const [confirmMatchingModalOpen, setConfirmMatchingModalOpen] = useState(false);
  const [readiness, setReadiness] = useState<any>({ ready: false, goodCount: 0, missingCategories: [] });

  // Edit title modal
  const [editTitleModalOpen, setEditTitleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<any>(null);

  // Rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [matchToRate, setMatchToRate] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!user || user.role !== 'CREATOR') {
      navigate('/dashboard');
      return;
    }

    loadConversations();
  }, [user, navigate]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await aiApi.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const response = await aiApi.getConversation(id);
      if (response.success) {
        setCurrentConversation(response.data);
        setMessages(response.data.messages || []);

        // Load matches if they exist
        if (response.data.matches && response.data.matches.length > 0) {
          setMatches(response.data.matches);
        }
      }
    } catch (err: any) {
      console.error('Error loading conversation:', err);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await aiApi.createConversation({
        projectTitle: 'Nouveau projet',
      });
      if (response.success) {
        await loadConversations();
        navigate(`/brainstorming/${response.data.id}`);
        setShowConversationsSidebar(false);
      }
    } catch (err: any) {
      console.error('Error creating conversation:', err);
    }
  };

  const openEditTitleModal = () => {
    setNewTitle(currentConversation?.projectTitle || '');
    setEditTitleModalOpen(true);
  };

  const updateTitle = async () => {
    if (!currentConversation || !newTitle.trim()) return;

    try {
      const response = await aiApi.updateConversationTitle(currentConversation.id, {
        projectTitle: newTitle,
      });

      if (response.success) {
        setCurrentConversation({ ...currentConversation, projectTitle: newTitle });
        setEditTitleModalOpen(false);
        await loadConversations();
      }
    } catch (err: any) {
      console.error('Error updating title:', err);
    }
  };

  const openDeleteModal = (conversation: any) => {
    setConversationToDelete(conversation);
    setDeleteModalOpen(true);
  };

  const deleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      await aiApi.deleteConversation(conversationToDelete.id);
      setDeleteModalOpen(false);
      setConversationToDelete(null);

      // If deleting current conversation, navigate away
      if (conversationToDelete.id === currentConversation?.id) {
        navigate('/brainstorming');
        setCurrentConversation(null);
      }

      await loadConversations();
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConversation || loading) return;

    setLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');

    try {
      const response = await aiApi.addMessage(currentConversation.id, {
        message: userMessage,
        role: 'user',
      });

      if (response.success) {
        setMessages(response.data.conversation.messages);
        setCurrentConversation(response.data.conversation);

        // Update readiness state
        if (response.data.readiness) {
          setReadiness(response.data.readiness);
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = () => {
    // Check if we have enough information quality (at least 3 "good" categories)
    if (!readiness.ready) {
      // Show confirmation modal if not enough quality information
      setConfirmMatchingModalOpen(true);
    } else {
      // Directly launch matching if enough quality information
      generateMatches();
    }
  };

  const generateMatches = async () => {
    if (!currentConversation || matchingLoading) return;

    setConfirmMatchingModalOpen(false);
    setMatchingLoading(true);
    try {
      const response = await matchingApi.generateMatches(currentConversation.id);
      if (response.success) {
        setMatches(response.data);
        setShowMatches(true);
      }
    } catch (err: any) {
      console.error('Error generating matches:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const openContactModal = (match: any) => {
    setSelectedMatch(match);
    setContactModalOpen(true);
    setContactMessage(`Bonjour,\n\nJe suis intéressé par votre profil pour mon projet "${currentConversation?.projectTitle}". Seriez-vous disponible pour discuter?\n\nCordialement`);
  };

  const contactProfessional = async () => {
    if (!selectedMatch || !contactMessage.trim()) return;

    try {
      const response = await matchingApi.contactProfessional(selectedMatch.id, {
        message: contactMessage,
      });

      if (response.success) {
        setContactModalOpen(false);
        setSelectedMatch(null);
        setContactMessage('');
        // Reload matches to update status
        const matchesResponse = await matchingApi.getMatches(currentConversation.id);
        if (matchesResponse.success) {
          setMatches(matchesResponse.data);
        }
      }
    } catch (err: any) {
      console.error('Error contacting professional:', err);
    }
  };

  const openRatingModal = (match: any) => {
    setMatchToRate(match);
    setRating(5);
    setRatingComment('');
    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!matchToRate) return;

    try {
      const response = await ratingApi.createRating({
        matchId: matchToRate.id,
        rating,
        comment: ratingComment || undefined,
      });

      if (response.success) {
        setRatingModalOpen(false);
        setMatchToRate(null);
        // Reload matches
        const matchesResponse = await matchingApi.getMatches(currentConversation.id);
        if (matchesResponse.success) {
          setMatches(matchesResponse.data);
        }
      }
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      alert(err.response?.data?.message || 'Erreur lors de la notation');
    }
  };

  const getProjectStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      NOT_STARTED: { label: 'Pas commencé', color: 'bg-gray-100 text-gray-800' },
      IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
      REVIEW: { label: 'En revue', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.NOT_STARTED;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) return null;

  return (
    <CreatorLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brainstorming IA</h1>
            <p className="text-gray-600 mt-1">Décrivez votre projet et trouvez les meilleurs talents</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConversationsSidebar(!showConversationsSidebar)}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline">Mes projets</span>
              {conversations.length > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {conversations.length}
                </span>
              )}
            </button>
            <button
              onClick={createNewConversation}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau projet
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Conversations Sidebar - Mobile/Tablet overlay, Desktop sidebar */}
          {showConversationsSidebar && (
            <>
              {/* Mobile backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setShowConversationsSidebar(false)}
              />
              {/* Sidebar */}
              <div className="fixed lg:relative inset-y-0 left-0 lg:inset-auto z-50 lg:z-auto w-80 bg-white rounded-none lg:rounded-2xl shadow-2xl lg:shadow-sm border-r lg:border border-gray-100 flex flex-col overflow-hidden">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mes projets</h3>
                  <button
                    onClick={() => setShowConversationsSidebar(false)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Terminés</option>
                    <option value="ABANDONED">Abandonnés</option>
                  </select>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm">Aucun projet trouvé</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`relative group mb-2 rounded-xl transition-all ${
                          conv.id === currentConversation?.id
                            ? 'bg-primary-50 border-2 border-primary-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <Link
                          to={`/brainstorming/${conv.id}`}
                          onClick={() => setShowConversationsSidebar(false)}
                          className="block p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              conv.id === currentConversation?.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate pr-6">
                                {conv.projectTitle || 'Sans titre'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                              </p>
                              {conv.matches?.length > 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {conv.matches.length} match{conv.matches.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDeleteModal(conv);
                          }}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-900">{currentConversation.projectTitle}</h2>
                          <button
                            onClick={openEditTitleModal}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Modifier le titre"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          {messages.length} message{messages.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleGenerateMatches}
                        disabled={matchingLoading}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {matchingLoading ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Matching...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="hidden sm:inline">Trouver des pros</span>
                          </>
                        )}
                      </button>
                      {matches.length > 0 && (
                        <button
                          onClick={() => setShowMatches(!showMatches)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            showMatches
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="hidden sm:inline">{showMatches ? 'Masquer' : 'Voir'}</span>
                          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{matches.length}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Commencez votre brainstorming!</h3>
                        <p className="text-gray-600">
                          Décrivez votre projet et je vous aiderai à le développer et trouver les meilleurs professionnels.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg: any, index: number) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-2xl px-4 py-3 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-md'
                              : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
                          <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                          <span className="text-sm text-gray-500">L'IA réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-white">
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Décrivez votre projet..."
                      className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all text-sm sm:text-base"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !inputMessage.trim()}
                      className="px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
                    >
                      <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span className="hidden sm:inline">Envoyer</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Prêt à brainstormer?</h3>
                  <p className="text-gray-600 mb-6">
                    Sélectionnez un projet existant ou créez-en un nouveau pour commencer.
                  </p>
                  <button
                    onClick={createNewConversation}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau projet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Matches Sidebar */}
          {showMatches && matches.length > 0 && (
            <div className="hidden lg:flex w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Professionnels Matchés</h3>
                <p className="text-sm text-gray-500 mt-1">{matches.length} résultat{matches.length > 1 ? 's' : ''}</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {matches.map((match: any) => (
                  <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {match.professional.firstName[0]}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {match.professional.firstName} {match.professional.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {match.professional.professions[0]?.profession?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{match.matchScore}%</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      {getProjectStatusBadge(match.projectStatus)}
                    </div>

                    {match.reasoning && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{match.reasoning}</p>
                    )}

                    <div className="flex gap-2 text-xs text-gray-500 mb-3">
                      {match.professional.experienceYears && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {match.professional.experienceYears} ans
                        </span>
                      )}
                      {match.professional.hourlyRate && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {match.professional.hourlyRate}€/h
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => openContactModal(match)}
                        disabled={match.status === 'CONTACTED'}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          match.status === 'CONTACTED'
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30'
                        }`}
                      >
                        {match.status === 'CONTACTED' ? 'Déjà contacté' : 'Contacter'}
                      </button>

                      {match.projectStatus === 'COMPLETED' && !match.rating && (
                        <button
                          onClick={() => openRatingModal(match)}
                          className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all"
                        >
                          Noter ce professionnel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Matches Panel */}
      {showMatches && matches.length > 0 && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Professionnels Matchés</h3>
                <p className="text-sm text-gray-500">{matches.length} résultat{matches.length > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={() => setShowMatches(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {matches.map((match: any) => (
                <div key={match.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.professional.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {match.professional.firstName} {match.professional.lastName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {match.professional.professions[0]?.profession?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{match.matchScore}%</div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    {getProjectStatusBadge(match.projectStatus)}
                  </div>

                  {match.reasoning && (
                    <p className="text-sm text-gray-600 mb-3">{match.reasoning}</p>
                  )}

                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    {match.professional.experienceYears && (
                      <span>{match.professional.experienceYears} ans d'exp.</span>
                    )}
                    {match.professional.hourlyRate && (
                      <span>{match.professional.hourlyRate}€/h</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openContactModal(match)}
                      disabled={match.status === 'CONTACTED'}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        match.status === 'CONTACTED'
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                      }`}
                    >
                      {match.status === 'CONTACTED' ? 'Déjà contacté' : 'Contacter'}
                    </button>

                    {match.projectStatus === 'COMPLETED' && !match.rating && (
                      <button
                        onClick={() => openRatingModal(match)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-yellow-100 text-yellow-700"
                      >
                        Noter
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {editTitleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le titre du projet</h3>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all mb-6"
              placeholder="Titre du projet"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setEditTitleModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={updateTitle}
                disabled={!newTitle.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && conversationToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Supprimer ce projet?</h3>
            <p className="text-gray-600 text-center mb-6">
              Êtes-vous sûr de vouloir supprimer "{conversationToDelete.projectTitle}"? Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={deleteConversation}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && matchToRate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Noter {matchToRate.professional.firstName} {matchToRate.professional.lastName}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Note (sur 5)
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                placeholder="Partagez votre expérience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitRating}
                className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors"
              >
                Envoyer la note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Early Matching */}
      {confirmMatchingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Informations incomplètes</h3>

            <p className="text-gray-600 text-center mb-4">
              Pour un matching optimal, j'ai besoin d'au moins <strong>3 catégories bien définies</strong>.
              Actuellement, j'ai <strong>{readiness.goodCount} catégorie{readiness.goodCount > 1 ? 's' : ''}</strong> avec des informations de qualité.
            </p>

            {readiness.missingCategories && readiness.missingCategories.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Il me manque des détails sur:</p>
                <ul className="space-y-1">
                  {readiness.missingCategories.map((category: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center mb-6">
              Voulez-vous quand même trouver des professionnels maintenant? Les résultats risquent d'être moins précis.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmMatchingModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Continuer la discussion
              </button>
              <button
                onClick={generateMatches}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-colors"
              >
                Lancer quand même
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedMatch.professional.firstName[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacter {selectedMatch.professional.firstName} {selectedMatch.professional.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedMatch.professional.professions[0]?.profession?.name}
                </p>
              </div>
            </div>

            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none mb-6"
              placeholder="Votre message..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => setContactModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={contactProfessional}
                disabled={!contactMessage.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium disabled:opacity-50 transition-all"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </CreatorLayout>
  );
}
