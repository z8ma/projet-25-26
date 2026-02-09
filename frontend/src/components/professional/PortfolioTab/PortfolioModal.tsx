import React from 'react';

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
}

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
}: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingPortfolio ? 'Modifier le projet' : 'Nouveau projet'}
          </h3>
          <button onClick={resetPortfolioForm} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
            <input
              type="text"
              value={portfolioForm.title}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Refonte identité visuelle"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={portfolioForm.description}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image du projet</label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                uploading ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploading ? (
                <div className="py-4">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-purple-600">Upload en cours...</p>
                </div>
              ) : imagePreview || portfolioForm.imageUrl ? (
                <div className="relative">
                  <img
                    src={imagePreview || portfolioForm.imageUrl}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setPortfolioForm({ ...portfolioForm, imageUrl: '' });
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <span className="text-4xl block mb-2">📷</span>
                  <p className="text-sm text-gray-600">
                    Glissez-déposez une image ou <span className="text-purple-600 font-medium">cliquez pour parcourir</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF ou WebP (max. 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de projet</label>
            <input
              type="text"
              value={portfolioForm.projectType}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, projectType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Logo, Site web, Branding..."
            />
          </div>

          {/* Lien externe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien externe
              <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔗</span>
              <input
                type="url"
                value={portfolioForm.projectUrl}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, projectUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://behance.net/monprojet"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Lien vers Behance, Dribbble, votre site personnel...
            </p>
          </div>

          {/* Projet mis en avant */}
          <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <input
              type="checkbox"
              id="isFeatured"
              checked={portfolioForm.isFeatured}
              onChange={(e) => setPortfolioForm({ ...portfolioForm, isFeatured: e.target.checked })}
              className="w-5 h-5 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
            />
            <label htmlFor="isFeatured" className="flex-1 cursor-pointer">
              <span className="font-medium text-yellow-800">Mettre ce projet en avant</span>
              <p className="text-xs text-yellow-600 mt-0.5">
                Ce projet sera affiché en premier sur votre profil
              </p>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Enrichissement IA (optionnel)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  value={portfolioForm.clientType}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, clientType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  {PORTFOLIO_CLIENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                <input
                  type="number"
                  value={portfolioForm.projectYear}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectYear: e.target.value })}
                  min="2000"
                  max="2026"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Objectif</label>
                <input
                  type="text"
                  value={portfolioForm.projectGoal}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, projectGoal: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Refonte pour lancement produit"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre rôle</label>
                <input
                  type="text"
                  value={portfolioForm.roleDescription}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, roleDescription: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Direction artistique et création"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={resetPortfolioForm}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            {editingPortfolio ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
