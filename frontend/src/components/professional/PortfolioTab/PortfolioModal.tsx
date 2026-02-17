import React from 'react';
import { createPortal } from 'react-dom';
import type { MediaFile } from '../../../hooks/professional/usePortfolio';

const PORTFOLIO_CLIENT_TYPES = [
  'Startup', 'PME', 'Grand compte', 'Agence', 'Particulier', 'Projet personnel',
];

interface PortfolioModalProps {
  editingPortfolio: any;
  portfolioForm: any;
  setPortfolioForm: (form: any) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  resetPortfolioForm: () => void;
  onSubmit: () => void;
  mediaFiles: MediaFile[];
  mediaInputRef: React.RefObject<HTMLInputElement | null>;
  handleMediaInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMediaDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  removeMediaFile: (index: number) => void;
  deleteExistingMedia?: (portfolioId: string, mediaId: string) => void;
  reorderMediaFiles: (fromIndex: number, toIndex: number, portfolioId?: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_CONFIG = {
  IMAGE: { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Image' },
  VIDEO: { color: 'text-purple-500', bg: 'bg-purple-50', label: 'Vidéo' },
  PDF: { color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
};

export function PortfolioModal({
  editingPortfolio,
  portfolioForm,
  setPortfolioForm,
  imagePreview,
  setImagePreview,
  uploading,
  fileInputRef,
  handleFileChange,
  handleDrop,
  handleDragOver,
  resetPortfolioForm,
  onSubmit,
  mediaFiles,
  mediaInputRef,
  handleMediaInputChange,
  handleMediaDrop,
  removeMediaFile,
  deleteExistingMedia,
  reorderMediaFiles,
}: PortfolioModalProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [showAiSection, setShowAiSection] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  // Animate in on mount
  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(resetPortfolioForm, 250);
  };

  const handleDragOverMedia = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDropMedia = (e: React.DragEvent<HTMLDivElement>) => {
    setDragOver(false);
    handleMediaDrop(e);
  };

  const handleRemoveMedia = (index: number) => {
    const media = mediaFiles[index];
    if (media.id && editingPortfolio && deleteExistingMedia) {
      deleteExistingMedia(editingPortfolio.id, media.id);
    } else {
      removeMediaFile(index);
    }
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      // Call parent reorder function with portfolio ID if editing
      reorderMediaFiles(draggedIndex, dragOverIndex, editingPortfolio?.id);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-all duration-400 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Header with gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full" />
          </div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {editingPortfolio ? 'Modifier le projet' : 'Nouveau projet'}
              </h3>
              <p className="text-purple-200 text-sm mt-1">
                {editingPortfolio ? 'Mettez votre projet à jour' : 'Ajoutez un projet à votre portfolio'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-8 space-y-6">

            {/* Title & Description row */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Titre du projet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Ex: Refonte identité visuelle pour TechCorp"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                  placeholder="Décrivez votre projet, le contexte, les résultats..."
                />
              </div>
            </div>

            {/* IMAGE DE COUVERTURE */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Image de couverture
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Optionnel)
                </span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Par défaut, la première image de vos médias sera utilisée. Uploadez une image ici pour définir une couverture personnalisée.
              </p>

              {portfolioForm.imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 bg-white shadow-sm group">
                  <img
                    src={portfolioForm.imageUrl}
                    alt="Couverture"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Changer
                    </button>
                    <button
                      onClick={() => {
                        setPortfolioForm({ ...portfolioForm, imageUrl: '' });
                        setImagePreview(null);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Retirer
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Couverture
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 bg-gradient-to-br from-purple-50 via-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 hover:border-purple-400 hover:shadow-md"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      Cliquez ou glissez une image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 5MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* MULTI-MEDIA UPLOAD ZONE */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Médias du projet
                  <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {mediaFiles.length}/10
                  </span>
                </label>
                {mediaFiles.length > 1 && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    Glissez pour réordonner
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {portfolioForm.imageUrl
                  ? "Ces médias apparaîtront dans le détail du projet."
                  : "La première image sera utilisée comme couverture si aucune couverture personnalisée n'est définie."}
              </p>

              {/* Upload zone */}
              <div
                onDrop={handleDropMedia}
                onDragOver={handleDragOverMedia}
                onDragLeave={handleDragLeave}
                onClick={() => mediaInputRef.current?.click()}
                className={`relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'bg-purple-50 border-2 border-purple-400 scale-[1.01] shadow-lg shadow-purple-500/10'
                    : 'bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 border-2 border-dashed border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,application/pdf"
                  onChange={handleMediaInputChange}
                  multiple
                  className="hidden"
                />

                <div className={`transition-transform duration-300 ${dragOver ? 'scale-110' : ''}`}>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {[
                      { gradient: 'from-blue-400 to-blue-500', icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                      { gradient: 'from-purple-400 to-purple-500', icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
                      { gradient: 'from-red-400 to-red-500', icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg transform transition-transform hover:scale-110`}
                      >
                        {item.icon}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Glissez vos fichiers ici ou{' '}
                    <span className="text-purple-600 font-semibold hover:text-purple-700">parcourez</span>
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      Images 10MB
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                      Vidéos 30s
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      PDFs 20MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Media preview grid */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {mediaFiles.map((media, index) => {
                    const config = TYPE_CONFIG[media.type];
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;
                    return (
                      <div
                        key={media.id || `new-${index}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={handleDragEnd}
                        className={`relative group rounded-2xl overflow-hidden border bg-white shadow-sm transition-all duration-300 cursor-move ${
                          isDragging
                            ? 'opacity-50 scale-95 border-purple-400'
                            : isDragOver
                            ? 'border-purple-400 border-2 scale-105 shadow-xl'
                            : 'border-gray-100 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Preview */}
                        <div className="aspect-[4/3] relative overflow-hidden">
                          {media.type === 'IMAGE' && (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          {media.type === 'VIDEO' && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                              {media.url ? (
                                <>
                                  <video
                                    src={media.url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                    onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                                  />
                                  {/* Play icon overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                      </svg>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                              )}
                              {media.duration && (
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[10px] rounded-lg font-medium">
                                  0:{String(media.duration).padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          )}
                          {media.type === 'PDF' && (
                            <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center">
                              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-2">
                                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-red-500 font-semibold">PDF</span>
                            </div>
                          )}

                          {/* Upload progress */}
                          {media.uploading && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                              <div className="w-10 h-10 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                              <span className="text-white text-sm font-semibold">{media.progress || 0}%</span>
                            </div>
                          )}

                          {/* Error */}
                          {media.error && (
                            <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex items-center justify-center p-3">
                              <span className="text-white text-xs text-center font-medium">{media.error}</span>
                            </div>
                          )}
                        </div>

                        {/* File info bar */}
                        <div className="px-3 py-2.5 flex items-center gap-2 border-t border-gray-50">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-gray-700 truncate">{media.name}</p>
                            <p className="text-[10px] text-gray-400">{formatFileSize(media.size)}</p>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveMedia(index); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/50 backdrop-blur-sm text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:scale-110 shadow-lg"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Order badge */}
                        <span className="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] rounded-lg flex items-center justify-center font-bold shadow-sm">
                          {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Type + Link row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Type de projet</label>
                <input
                  type="text"
                  value={portfolioForm.projectType}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectType: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Logo, Branding..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Lien externe
                </label>
                <input
                  type="url"
                  value={portfolioForm.projectUrl}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectUrl: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="https://behance.net/..."
                />
              </div>
            </div>

            {/* Featured toggle */}
            <label className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-amber-50/70 group border border-transparent hover:border-amber-200">
              <div className={`relative w-12 h-7 rounded-full transition-colors ${portfolioForm.isFeatured ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${portfolioForm.isFeatured ? 'translate-x-5' : ''}`} />
                <input
                  type="checkbox"
                  checked={portfolioForm.isFeatured}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, isFeatured: e.target.checked })}
                  className="sr-only"
                />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-800 text-sm">Mettre en avant</span>
                <p className="text-xs text-gray-500 mt-0.5">Ce projet sera affiché en premier et en grand</p>
              </div>
              {portfolioForm.isFeatured && (
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </label>

            {/* AI enrichment collapsible */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAiSection(!showAiSection)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-gray-800">Enrichissement IA</span>
                    <p className="text-xs text-gray-400">Optionnel - Améliore le matching</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showAiSection ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className={`transition-all duration-300 overflow-hidden ${showAiSection ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Client</label>
                    <select
                      value={portfolioForm.clientType}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, clientType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
                    >
                      <option value="">Sélectionner...</option>
                      {PORTFOLIO_CLIENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Année</label>
                    <input
                      type="number"
                      value={portfolioForm.projectYear}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, projectYear: e.target.value })}
                      min="2000"
                      max="2026"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Objectif du projet</label>
                    <input
                      type="text"
                      value={portfolioForm.projectGoal}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, projectGoal: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
                      placeholder="Ex: Refonte pour lancement produit"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Votre rôle</label>
                    <input
                      type="text"
                      value={portfolioForm.roleDescription}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, roleDescription: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-white transition-all"
                      placeholder="Ex: Direction artistique et création"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-white hover:border-gray-300 hover:text-gray-800 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98]"
          >
            {editingPortfolio ? 'Mettre à jour' : 'Ajouter le projet'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
