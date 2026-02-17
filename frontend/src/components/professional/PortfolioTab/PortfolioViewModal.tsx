import React from 'react';
import { createPortal } from 'react-dom';
import ExternalLinkWarning from '../../ExternalLinkWarning';
import { professionalApi } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

interface PortfolioViewModalProps {
  portfolio: any;
  onClose: () => void;
  onEdit?: (portfolio: any) => void;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profession?: string;
    profilePictureUrl?: string | null;
  };
  onViewProfile?: (id: string) => void;
}

export function PortfolioViewModal({ portfolio, onClose, onEdit, author, onViewProfile }: PortfolioViewModalProps) {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [commentSubmitting, setCommentSubmitting] = React.useState(false);

  const allMedia: any[] = React.useMemo(() => {
    const items: any[] = [];
    // Add main image if exists
    if (portfolio.imageUrl) {
      items.push({ type: 'IMAGE', url: portfolio.imageUrl, name: 'Image principale' });
    }
    // Add portfolio media
    if (portfolio.media?.length > 0) {
      items.push(...portfolio.media.sort((a: any, b: any) => a.order - b.order));
    }
    return items;
  }, [portfolio]);

  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // Load comments
  React.useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await professionalApi.getPortfolioComments(portfolio.id);
        setComments(response.data || []);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [portfolio.id]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft' && activeMediaIndex > 0) setActiveMediaIndex(activeMediaIndex - 1);
      if (e.key === 'ArrowRight' && activeMediaIndex < allMedia.length - 1) setActiveMediaIndex(activeMediaIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMediaIndex, allMedia.length]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || commentSubmitting) return;
    setCommentSubmitting(true);
    try {
      const response = await professionalApi.addPortfolioComment(portfolio.id, newComment.trim());
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await professionalApi.deletePortfolioComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const activeMedia = allMedia[activeMediaIndex];

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex transition-all duration-300 ${
        isVisible ? 'bg-black/90 backdrop-blur-md' : 'bg-black/0'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full h-full flex flex-col transition-all duration-400 ease-out ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h2 className="text-white font-bold text-lg">{portfolio.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {portfolio.projectType && (
                  <span className="text-white/50 text-sm">{portfolio.projectType}</span>
                )}
                {portfolio.projectYear && (
                  <span className="text-white/40 text-sm">· {portfolio.projectYear}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {portfolio.projectUrl && (
              <ExternalLinkWarning
                url={portfolio.projectUrl}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le site
              </ExternalLinkWarning>
            )}
            {onEdit && (
              <button
                onClick={() => { handleClose(); setTimeout(() => onEdit(portfolio), 300); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex min-h-0">
          {/* Media viewer */}
          <div className="flex-1 flex items-center justify-center relative px-16">
            {allMedia.length > 0 && activeMedia ? (
              <>
                {/* Main media display */}
                <div className="max-w-5xl w-full max-h-[calc(100vh-200px)] flex items-center justify-center">
                  {activeMedia.type === 'IMAGE' && (
                    <img
                      src={activeMedia.url}
                      alt={activeMedia.name || portfolio.title}
                      className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                    />
                  )}
                  {activeMedia.type === 'VIDEO' && (
                    <video
                      src={activeMedia.url}
                      controls
                      autoPlay
                      className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-2xl"
                    />
                  )}
                  {activeMedia.type === 'PDF' && (
                    <div className="w-full max-w-2xl bg-white rounded-2xl p-8 text-center">
                      <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">{activeMedia.name || 'Document PDF'}</p>
                      <a
                        href={activeMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ouvrir le PDF
                      </a>
                    </div>
                  )}
                </div>

                {/* Navigation arrows */}
                {allMedia.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveMediaIndex(Math.max(0, activeMediaIndex - 1))}
                      disabled={activeMediaIndex === 0}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                        activeMediaIndex === 0
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveMediaIndex(Math.min(allMedia.length - 1, activeMediaIndex + 1))}
                      disabled={activeMediaIndex === allMedia.length - 1}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                        activeMediaIndex === allMedia.length - 1
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-center text-white/40">
                <svg className="w-20 h-20 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Aucun média pour ce projet</p>
              </div>
            )}
          </div>

          {/* Right sidebar - project info */}
          <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 overflow-y-auto flex-shrink-0">
            <div className="p-6 space-y-6">
              {/* Author (explore mode) */}
              {author && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Auteur</h4>
                  <div className="flex items-center gap-3">
                    {author.profilePictureUrl ? (
                      <img src={author.profilePictureUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {author.firstName?.[0]}{author.lastName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{author.firstName} {author.lastName}</p>
                      {author.profession && <p className="text-white/50 text-xs truncate">{author.profession}</p>}
                    </div>
                  </div>
                  {onViewProfile && (
                    <button
                      onClick={() => { handleClose(); setTimeout(() => onViewProfile(author.id), 300); }}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white/80 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      Voir le profil
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Description */}
              {portfolio.description && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-white/80 text-sm leading-relaxed">{portfolio.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                {portfolio.projectType && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Type</span>
                    <span className="text-white/80 text-sm font-medium">{portfolio.projectType}</span>
                  </div>
                )}
                {portfolio.projectYear && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Année</span>
                    <span className="text-white/80 text-sm font-medium">{portfolio.projectYear}</span>
                  </div>
                )}
                {portfolio.clientType && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Client</span>
                    <span className="text-white/80 text-sm font-medium">{portfolio.clientType}</span>
                  </div>
                )}
                {portfolio.projectDuration && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">Durée</span>
                    <span className="text-white/80 text-sm font-medium">{portfolio.projectDuration}</span>
                  </div>
                )}
              </div>

              {/* Role */}
              {portfolio.roleDescription && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Rôle</h4>
                  <p className="text-white/80 text-sm">{portfolio.roleDescription}</p>
                </div>
              )}

              {/* Impact */}
              {portfolio.projectImpact && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Impact</h4>
                  <p className="text-white/80 text-sm">{portfolio.projectImpact}</p>
                </div>
              )}

              {/* Tags */}
              {portfolio.tags?.length > 0 && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.tags.map((t: any, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">
                        {t.tag || t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Media thumbnails */}
              {allMedia.length > 1 && (
                <div>
                  <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
                    Médias ({allMedia.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {allMedia.map((media: any, index: number) => (
                      <button
                        key={media.id || index}
                        onClick={() => setActiveMediaIndex(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          index === activeMediaIndex
                            ? 'border-purple-500 ring-2 ring-purple-500/30'
                            : 'border-transparent hover:border-white/30'
                        }`}
                      >
                        {media.type === 'IMAGE' && (
                          <img src={media.thumbnailUrl || media.url} alt="" className="w-full h-full object-cover" />
                        )}
                        {media.type === 'VIDEO' && (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                            {media.thumbnailUrl ? (
                              <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-900" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )}
                        {media.type === 'PDF' && (
                          <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-red-800/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                  Commentaires ({comments.length})
                </h4>

                {/* Add Comment Form (for authenticated users) */}
                {user && (
                  <div className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none text-sm"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || commentSubmitting}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {commentSubmitting ? 'Envoi...' : 'Commenter'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      Aucun commentaire pour le moment. Soyez le premier à commenter !
                    </div>
                  ) : (
                    comments.map((comment: any) => {
                      const isCreator = comment.user.role === 'CREATOR';
                      const commenterName = isCreator
                        ? comment.user.creator?.companyName || 'Créateur'
                        : `${comment.user.professional?.firstName || ''} ${comment.user.professional?.lastName || ''}`.trim() || 'Professionnel';
                      const commenterAvatar = isCreator
                        ? comment.user.creator?.profilePictureUrl
                        : comment.user.professional?.profilePictureUrl;
                      const isOwnComment = user?.id === comment.userId;

                      return (
                        <div key={comment.id} className="flex gap-3">
                          {/* Avatar */}
                          {commenterAvatar ? (
                            <img src={commenterAvatar} alt={commenterName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {commenterName.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Comment Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white/90 text-sm font-medium">{commenterName}</span>
                                <span className="text-white/30 text-xs">
                                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {isOwnComment && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-white/40 hover:text-red-400 transition-colors"
                                  title="Supprimer"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <p className="text-white/70 text-sm whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom media counter */}
        {allMedia.length > 1 && (
          <div className="flex items-center justify-center py-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {allMedia.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveMediaIndex(index)}
                  className={`rounded-full transition-all ${
                    index === activeMediaIndex
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
