import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { matchingApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  user: {
    id: string;
    email: string;
  };
  professions: { profession: { name: string } }[];
}

interface Conversation {
  id: string;
  projectTitle: string | null;
  projectSummary: string | null;
  status: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  matchId: string;
  subject: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface MatchWithMessages {
  id: string;
  matchScore: number;
  status: string;
  projectStatus: string;
  conversation: Conversation;
  professional: Professional;
  messages: Message[];
  unreadCount: number;
  lastMessage: Message | null;
}

export default function Messages() {
  useDocumentTitle('Messages | JUNY');

  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<MatchWithMessages[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<MatchWithMessages | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const headerAnim = useScrollAnimation([loading]);
  const chatAnim = useScrollAnimation([loading]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user?.role === 'PROFESSIONAL') {
      // Redirect pro to their profile with messages tab pre-selected
      localStorage.setItem('professional-active-tab', 'messages');
      navigate('/profile/professional');
      return;
    }
    fetchConversations();
  }, [token, user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await matchingApi.getConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conv: MatchWithMessages) => {
    setSelectedConversation(conv);
    try {
      const response = await matchingApi.getMessages(conv.id);
      setMessages(response.data || []);

      // Update unread count locally
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      );
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const response = await matchingApi.sendMessage(selectedConversation.id, {
        content: newMessage.trim(),
      });

      // Add new message to the list
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      // Update last message in conversations list
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: response.data, messages: [...c.messages, response.data] }
            : c
        )
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.conversation.projectTitle?.toLowerCase().includes(query) ||
      `${conv.professional.firstName} ${conv.professional.lastName}`.toLowerCase().includes(query)
    );
  });

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach(msg => {
      const msgDate = formatMessageDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <CreatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des messages...</p>
          </div>
        </div>
      </CreatorLayout>
    );
  }

  return (
    <CreatorLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div
          ref={headerAnim.ref}
          className={`mb-6 transition-[opacity,transform] duration-700 ${headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Messages
            {totalUnread > 0 && (
              <span className="px-3 py-1 bg-primary-500 text-white text-sm font-semibold rounded-full">
                {totalUnread}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Communiquez avec vos créatifs</p>
        </div>

        {/* Main Content */}
        <div
          ref={chatAnim.ref}
          className={`flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex transition-[opacity,transform] duration-700 delay-150 ${chatAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {/* Conversations List */}
          <div className="w-96 border-r border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📭</span>
                  </div>
                  <p className="text-gray-500">
                    {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation pour le moment'}
                  </p>
                  {!searchQuery && (
                    <p className="text-gray-400 text-sm mt-2">
                      Contactez un professionnel depuis un projet pour démarrer une conversation
                    </p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv, idx) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left animate-in slide-in-from-left-2 fade-in duration-300 ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {conv.professional.firstName[0]}{conv.professional.lastName[0]}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conv.professional.firstName} {conv.professional.lastName}
                        </h4>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatDate(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-primary-600 truncate mb-1">
                        {conv.conversation.projectTitle || 'Projet sans titre'}
                      </p>
                      {conv.lastMessage && (
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                          {conv.lastMessage.senderId === user?.id ? 'Vous: ' : ''}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {selectedConversation.professional.firstName[0]}{selectedConversation.professional.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.professional.firstName} {selectedConversation.professional.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.professional.professions.map(p => p.profession.name).join(', ') || 'Créatif'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600">
                      {selectedConversation.conversation.projectTitle}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedConversation.status === 'ACCEPTED' ? 'bg-emerald-500' :
                        selectedConversation.status === 'CONTACTED' ? 'bg-blue-500' :
                        selectedConversation.status === 'DECLINED' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></span>
                      <span className="text-xs text-gray-500">
                        {selectedConversation.status === 'ACCEPTED' ? 'Accepté' :
                         selectedConversation.status === 'CONTACTED' ? 'Contacté' :
                         selectedConversation.status === 'DECLINED' ? 'Refusé' : selectedConversation.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <span className="text-3xl">👋</span>
                      </div>
                      <p className="text-gray-500">Aucun message dans cette conversation</p>
                      <p className="text-gray-400 text-sm mt-1">Envoyez un message pour démarrer</p>
                    </div>
                  ) : (
                    groupMessagesByDate(messages).map((group, groupIndex) => (
                      <div key={groupIndex}>
                        {/* Date Separator */}
                        <div className="flex items-center justify-center my-4">
                          <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                            {group.date}
                          </span>
                        </div>

                        {/* Messages */}
                        {group.messages.map((msg) => {
                          const isMe = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex mb-3 animate-in fade-in duration-200 ${isMe ? 'justify-end slide-in-from-right-2' : 'justify-start slide-in-from-left-2'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                  isMe
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                  {formatMessageTime(msg.createdAt)}
                                  {isMe && msg.isRead && ' ✓✓'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Envoyer</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500 max-w-md">
                  Choisissez une conversation dans la liste pour voir les messages et communiquer avec vos créatifs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
}
