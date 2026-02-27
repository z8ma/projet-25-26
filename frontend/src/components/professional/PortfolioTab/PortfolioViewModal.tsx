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
  const [comments, setComments] = React.useState<any[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [commentSubmitting, setCommentSubmitting] = React.useState(false);

  const allMedia: any[] = React.useMemo(() => {
    const items: any[] = [];
    if (portfolio.imageUrl) {
      items.push({ type: 'IMAGE', url: portfolio.imageUrl, name: 'Image principale' });
    }
    if (portfolio.media?.length > 0) {
      items.push(...portfolio.media.sort((a: any, b: any) => a.order - b.order));
    }
    return items;
  }, [portfolio]);

  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex transition-all duration-300 ${
        isVisible ? 'bg-black/90 backdrop-blur-md' : 'bg-black/0'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full h-full flex flex-col transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 translate-y-4'
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
                Voir le projet
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

        {/* Content area */}
        <div className="flex-1 flex min-h-0">

          {/* Left: images scrollable — Behance style */}
          <div className="flex-1 overflow-y-auto">
            {allMedia.length > 0 ? (
              <div className="flex flex-col">
                {allMedia.map((media: any, index: number) => (
                  <div key={media.id || index} className="w-full">
                    {media.type === 'IMAGE' && (
                      <img
                        src={media.url}
                        alt={media.name || portfolio.title}
                        className="w-full h-auto block"
                        draggable={false}
                      />
                    )}
                    {media.type === 'VIDEO' && (
                      <video
                        src={media.url}
                        controls
                        autoPlay={index === 0}
                        className="w-full h-auto block"
                      />
                    )}
                    {media.type === 'PDF' && (
                      <div className="flex items-center justify-center py-16 bg-white/5 border-b border-white/10">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="text-white/80 font-medium mb-3">{media.name || 'Document PDF'}</p>
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                          >
                            Ouvrir le PDF
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white/40">
                <div className="text-center">
                  <svg className="w-20 h-20 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Aucun média pour ce projet</p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 overflow-y-auto flex-shrink-0 hidden md:block">
            <div className="p-6 space-y-6">

              {/* Author */}
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

              {/* Comments */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
                  Commentaires ({comments.length})
                </h4>

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

                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-sm">
                      Aucun commentaire pour le moment.
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
                          {commenterAvatar ? (
                            <img src={commenterAvatar} alt={commenterName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {commenterName.charAt(0).toUpperCase()}
                            </div>
                          )}
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
      </div>
    </div>,
    document.body
  );
}
