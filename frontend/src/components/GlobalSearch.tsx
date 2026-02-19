import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi, matchingApi } from '../services/api';

interface SearchResult {
  type: 'project' | 'message' | 'professional';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };

    // Add slight delay to avoid immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Open search with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [projectsRes, conversationsRes] = await Promise.all([
        aiApi.getConversations(),
        matchingApi.getConversations(),
      ]);

      const searchResults: SearchResult[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Search in projects/brainstorming conversations
      const projects = projectsRes.data || [];
      projects.forEach((project: any) => {
        if (
          project.projectTitle?.toLowerCase().includes(lowerQuery) ||
          project.projectSummary?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            type: 'project',
            id: project.id,
            title: project.projectTitle || 'Projet sans titre',
            subtitle: project.projectSummary?.slice(0, 60) + '...' || 'Brainstorming IA',
            link: `/brainstorming/${project.id}`,
          });
        }

        // Search in professionals matched
        project.matches?.forEach((match: any) => {
          const fullName = `${match.professional?.firstName} ${match.professional?.lastName}`.toLowerCase();
          if (fullName.includes(lowerQuery)) {
            searchResults.push({
              type: 'professional',
              id: match.id,
              title: `${match.professional?.firstName} ${match.professional?.lastName}`,
              subtitle: match.professional?.professions?.[0]?.profession?.name || 'Professionnel',
              link: `/brainstorming/${project.id}`,
            });
          }
        });
      });

      // Search in message conversations
      const conversations = conversationsRes.data || [];
      conversations.forEach((conv: any) => {
        const professional = conv.match?.professional;
        if (professional) {
          const fullName = `${professional.firstName} ${professional.lastName}`.toLowerCase();
          if (fullName.includes(lowerQuery)) {
            searchResults.push({
              type: 'message',
              id: conv.id,
              title: `Conversation avec ${professional.firstName} ${professional.lastName}`,
              subtitle: conv.match?.aiConversation?.projectTitle || 'Messages',
              link: `/messages?id=${conv.match?.id}`,
            });
          }
        }
      });

      // Remove duplicates
      const uniqueResults = searchResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.id === result.id && r.type === result.type)
      );

      setResults(uniqueResults.slice(0, 8));
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].link);
      setIsOpen(false);
      setQuery('');
    }
  };

  // Get icon based on result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return (
          <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'professional':
        return (
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Search Input Trigger - Minimal Design */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 w-full px-4 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/60 rounded-xl transition-all duration-200"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left text-sm text-gray-400">Rechercher...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/80 rounded text-[10px] font-medium text-gray-400 border border-gray-200/60">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Search Modal - Clean Design */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/20 backdrop-blur-sm">
          {/* Modal */}
          <div
            ref={modalRef}
            className="fixed inset-x-4 top-[20%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-900/10 overflow-hidden ring-1 ring-gray-900/5">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4">
                <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher..."
                  className="flex-1 text-base text-gray-900 placeholder-gray-400 bg-transparent border-0 outline-none focus:ring-0"
                />
                {loading ? (
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
                ) : query ? (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>

              {/* Divider */}
              {(query || results.length > 0) && <div className="h-px bg-gray-100" />}

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {query && results.length === 0 && !loading ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Aucun résultat pour "{query}"</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          navigate(result.link);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${index === selectedIndex
                            ? 'bg-gray-50'
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : !query ? (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Raccourcis</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigate('/brainstorming');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">Nouveau brainstorming</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200 font-medium">↑↓</kbd>
                      <span>naviguer</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-white rounded border border-gray-200 font-medium">↵</kbd>
                      <span>ouvrir</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-medium">esc</kbd>
                    <span>fermer</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
