import React from 'react';
import { PortfolioModal } from './PortfolioModal';
import ExternalLinkWarning from '../../ExternalLinkWarning';

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
}: PortfolioTabProps) {
  return (
    <div className="space-y-6">
      <div
        ref={portfolioGridAnimation.ref}
        className={`transition-all duration-700 ${
          portfolioGridAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center justify-between">
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
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
            Vous avez atteint la limite de 20 projets. Supprimez un projet pour en ajouter un nouveau.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sort to show featured first */}
          {[...portfolios].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map((portfolio, index) => (
            <div
              key={portfolio.id}
              className={`bg-white rounded-2xl border group hover:shadow-2xl hover:-translate-y-1 transition-all ${
                portfolio.isFeatured
                  ? 'md:col-span-2 md:row-span-2 border-purple-200 ring-2 ring-purple-50'
                  : index % 7 === 0
                  ? 'md:col-span-2 border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="relative flex flex-col">
                {portfolio.isFeatured && (
                  <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg">
                    ⭐ En avant
                  </div>
                )}
                {portfolio.imageUrl ? (
                  <div className={`overflow-hidden rounded-t-2xl ${portfolio.isFeatured ? 'h-64' : 'h-40'}`}>
                    <img
                      src={portfolio.imageUrl}
                      alt={portfolio.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-2xl ${portfolio.isFeatured ? 'h-64' : 'h-40'}`}>
                    <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className={`font-semibold text-gray-900 ${portfolio.isFeatured ? 'text-lg' : 'text-base'}`}>{portfolio.title}</h3>
                {portfolio.description && (
                  <p className={`text-gray-500 mt-2 ${portfolio.isFeatured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2'}`}>{portfolio.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  {portfolio.projectType && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-medium">{portfolio.projectType}</span>
                  )}
                  {portfolio.projectYear && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">{portfolio.projectYear}</span>
                  )}
                  {portfolio.projectUrl && (
                    <ExternalLinkWarning
                      url={portfolio.projectUrl}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1 font-medium"
                    >
                      🔗 Voir le projet
                    </ExternalLinkWarning>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => startEditPortfolio(portfolio)}
                    className="flex-1 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleRemovePortfolio(portfolio.id)}
                    className="px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors font-medium"
                  >
                    🗑️
                  </button>
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

        {/* Portfolio Modal */}
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
          />
        )}
      </div>
    </div>
  );
}
