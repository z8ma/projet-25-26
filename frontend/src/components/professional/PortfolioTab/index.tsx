import React, { useState } from 'react';
import { PortfolioModal } from './PortfolioModal';
import { PortfolioViewModal } from './PortfolioViewModal';
import ExternalLinkWarning from '../../ExternalLinkWarning';
import type { MediaFile } from '../../../hooks/professional/usePortfolio';

interface PortfolioTabProps {
  portfolios: any[];
  showPortfolioForm: boolean;
  setShowPortfolioForm: (show: boolean) => void;
  editingPortfolio: any;
  portfolioForm: any;
  setPortfolioForm: (form: any) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  uploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  resetPortfolioForm: () => void;
  startEditPortfolio: (portfolio: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleAddPortfolio: () => void;
  handleUpdatePortfolio: () => void;
  handleRemovePortfolio: (id: string) => void;
  portfolioGridAnimation: any;
  // Media props
  mediaFiles: MediaFile[];
  mediaInputRef: React.RefObject<HTMLInputElement | null>;
  handleMediaInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMediaDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  removeMediaFile: (index: number) => void;
  deleteExistingMedia: (portfolioId: string, mediaId: string) => void;
  reorderMediaFiles: (fromIndex: number, toIndex: number, portfolioId?: string) => void;
}

export function PortfolioTab({
  portfolios,
  showPortfolioForm,
  setShowPortfolioForm,
  editingPortfolio,
  portfolioForm,
  setPortfolioForm,
  imagePreview,
  setImagePreview,
  uploading,
  fileInputRef,
  resetPortfolioForm,
  startEditPortfolio,
  handleFileChange,
  handleDrop,
  handleDragOver,
  handleAddPortfolio,
  handleUpdatePortfolio,
  handleRemovePortfolio,
  portfolioGridAnimation,
  // Media
  mediaFiles,
  mediaInputRef,
  handleMediaInputChange,
  handleMediaDrop,
  removeMediaFile,
  deleteExistingMedia,
  reorderMediaFiles,
}: PortfolioTabProps) {
  const [viewingPortfolio, setViewingPortfolio] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div
        ref={portfolioGridAnimation.ref}
        className={`transition-all duration-700 ${
          portfolioGridAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
            <p className="text-gray-500">
              Vos meilleures réalisations
              <span className={`ml-2 text-sm ${portfolios.length >= 20 ? 'text-red-500' : 'text-gray-400'}`}>
                ({portfolios.length}/20)
              </span>
            </p>
          </div>
          <button
            onClick={() => { resetPortfolioForm(); setShowPortfolioForm(true); }}
            disabled={portfolios.length >= 20}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              portfolios.length >= 20
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            + Ajouter
          </button>
        </div>

        {portfolios.length >= 20 && (
          <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
            Vous avez atteint la limite de 20 projets. Supprimez un projet pour en ajouter un nouveau.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Sort to show featured first */}
          {[...portfolios].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map((portfolio, index) => (
            <div
              key={portfolio.id}
              onClick={() => setViewingPortfolio(portfolio)}
              className="relative rounded-2xl overflow-hidden group cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image */}
              <div className="w-full aspect-[3/2]">
                {(() => {
                  const coverUrl = portfolio.imageUrl
                    || portfolio.media?.find((m: any) => m.type === 'IMAGE')?.url
                    || portfolio.media?.[0]?.thumbnailUrl
                    || portfolio.media?.[0]?.url;
                  return coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={portfolio.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg className="w-14 h-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  );
                })()}
              </div>

              {/* Featured badge - always visible */}
              {portfolio.isFeatured && (
                <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  En avant
                </div>
              )}

              {/* Tags - always visible bottom-left */}
              {(portfolio.projectType || portfolio.projectYear) && (
                <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  {portfolio.projectType && (
                    <span className="px-2.5 py-1 text-[11px] bg-black/50 backdrop-blur-sm text-white rounded-full font-medium">{portfolio.projectType}</span>
                  )}
                  {portfolio.projectYear && (
                    <span className="px-2.5 py-1 text-[11px] bg-black/50 backdrop-blur-sm text-white rounded-full">{portfolio.projectYear}</span>
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                {/* Project info */}
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-bold text-white mb-1 text-base">{portfolio.title}</h3>
                  {portfolio.description && (
                    <p className="text-white/70 mb-4 text-xs line-clamp-1">{portfolio.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditPortfolio(portfolio); }}
                      className="flex-1 px-4 py-2 text-sm bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Modifier
                    </button>
                    {portfolio.projectUrl && (
                      <ExternalLinkWarning
                        url={portfolio.projectUrl}
                        className="px-4 py-2 text-sm bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Voir
                      </ExternalLinkWarning>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemovePortfolio(portfolio.id); }}
                      className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {portfolios.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Portfolio vide</h3>
            <p className="text-gray-500 mb-4">Ajoutez vos projets pour attirer les créateurs</p>
            <button
              onClick={() => setShowPortfolioForm(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Ajouter un projet
            </button>
          </div>
        )}

        {/* Portfolio Edit Modal */}
        {showPortfolioForm && (
          <PortfolioModal
            editingPortfolio={editingPortfolio}
            portfolioForm={portfolioForm}
            setPortfolioForm={setPortfolioForm}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            uploading={uploading}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            resetPortfolioForm={resetPortfolioForm}
            onSubmit={editingPortfolio ? handleUpdatePortfolio : handleAddPortfolio}
            mediaFiles={mediaFiles}
            mediaInputRef={mediaInputRef}
            handleMediaInputChange={handleMediaInputChange}
            handleMediaDrop={handleMediaDrop}
            removeMediaFile={removeMediaFile}
            deleteExistingMedia={deleteExistingMedia}
            reorderMediaFiles={reorderMediaFiles}
          />
        )}

        {/* Portfolio View Modal (Behance-style) */}
        {viewingPortfolio && (
          <PortfolioViewModal
            portfolio={viewingPortfolio}
            onClose={() => setViewingPortfolio(null)}
            onEdit={(portfolio) => {
              setViewingPortfolio(null);
              startEditPortfolio(portfolio);
            }}
          />
        )}
      </div>
    </div>
  );
}
