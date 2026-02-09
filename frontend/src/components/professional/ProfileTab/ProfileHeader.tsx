import React from 'react';

const CLIENT_TYPES = [
  { id: 'startups', label: 'Startups' },
  { id: 'pme', label: 'PME' },
  { id: 'grands-comptes', label: 'Grands comptes' },
  { id: 'agences', label: 'Agences' },
  { id: 'solopreneurs', label: 'Solopreneurs' },
];

const COLLAB_TYPES = [
  { id: 'court', label: 'Mission courte', duration: '< 1 semaine' },
  { id: 'long', label: 'Mission longue', duration: '> 1 mois' },
  { id: 'recurrent', label: 'Récurrent', duration: 'Abonnement' },
  { id: 'one-shot', label: 'One-shot', duration: 'Ponctuel' },
];

const MISSION_TYPES = [
  { id: 'branding', label: 'Branding' },
  { id: 'ui-ux', label: 'UI / UX' },
  { id: 'web-design', label: 'Web design' },
  { id: 'motion', label: 'Motion' },
  { id: 'illustration', label: 'Illustration' },
  { id: 'social-media', label: 'Social media' },
  { id: 'direction-artistique', label: 'Direction artistique' },
  { id: 'print', label: 'Print' },
  { id: 'no-code', label: 'No-code / Webflow' },
  { id: '3d-cgi', label: '3D / CGI' },
  { id: 'photographie', label: 'Photographie' },
  { id: 'video', label: 'Vidéo' },
];

interface ProfileHeaderProps {
  // Banner
  bannerUrl: string | null;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  handleBannerFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerRemove: () => void;

  // Profile Picture
  profilePictureUrl: string | null;
  firstName: string;
  lastName: string;
  availability: string;

  // Professional Info
  selectedProfessions: any[];
  experienceYears: string;
  hourlyRate: string;

  // Preferences
  minimumBudget: string;
  preferredClientTypes: string[];
  preferredCollabTypes: string[];
  missionTypes: string[];

  // Social Links
  websiteUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;

  // Actions
  setIsEditMode: (mode: boolean) => void;

  // Animation
  profileHeaderAnimation: any;
}

export function ProfileHeader({
  bannerUrl,
  bannerInputRef,
  handleBannerFileSelect,
  handleBannerRemove,
  profilePictureUrl,
  firstName,
  lastName,
  availability,
  selectedProfessions,
  experienceYears,
  hourlyRate,
  minimumBudget,
  preferredClientTypes,
  preferredCollabTypes,
  missionTypes,
  websiteUrl,
  linkedinUrl,
  instagramUrl,
  twitterUrl,
  youtubeUrl,
  setIsEditMode,
  profileHeaderAnimation,
}: ProfileHeaderProps) {
  return (
    <div
      ref={profileHeaderAnimation.ref}
      className={`bg-white rounded-2xl border border-gray-200 transition-all duration-700 ${
        profileHeaderAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Banner */}
      <div className="relative h-48 md:h-56 group rounded-t-2xl overflow-hidden">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Bannière" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>
          </div>
        )}

        {/* Banner edit overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-3">
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Changer la bannière
            </button>
            {bannerUrl && (
              <button
                onClick={handleBannerRemove}
                className="flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all text-sm font-medium text-red-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            )}
          </div>
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerFileSelect}
          className="hidden"
        />
      </div>

      {/* Profile Info Section */}
      <div className="px-6 py-5 bg-white">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Profile Picture */}
          <div className="relative -mt-20 sm:-mt-16">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-3xl sm:text-4xl font-bold text-white">{firstName ? firstName[0]?.toUpperCase() : '?'}</span>
              </div>
            )}
            <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${
              availability === 'Disponible' ? 'bg-green-500' :
              availability === 'Partiellement disponible' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>

          {/* Name & Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{firstName || 'Prénom'} {lastName || 'Nom'}</h1>
            <p className="text-purple-600 font-medium">{selectedProfessions[0]?.profession?.name || 'Profession non définie'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
              {experienceYears && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {experienceYears} ans d'exp.
                </span>
              )}
              {hourlyRate && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {hourlyRate}€/h
                </span>
              )}
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                availability === 'Disponible' ? 'bg-green-100 text-green-700' :
                availability === 'Partiellement disponible' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  availability === 'Disponible' ? 'bg-green-500' :
                  availability === 'Partiellement disponible' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {availability}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditMode(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Modifier le profil
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* Section 1: Budget & Préférences */}
            <div className="py-3 md:py-0 md:pr-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Préférences</h4>
              <div className="space-y-2">
                {minimumBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-gray-600 text-xs">Min:</span>
                    <span className="font-semibold text-gray-900 text-sm">{minimumBudget}€</span>
                  </div>
                )}
                {preferredClientTypes.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Clients</div>
                    <div className="flex flex-wrap gap-1">
                      {preferredClientTypes.slice(0, 3).map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {CLIENT_TYPES.find(c => c.id === type)?.label || type}
                        </span>
                      ))}
                      {preferredClientTypes.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          +{preferredClientTypes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {preferredCollabTypes.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Collaboration</div>
                    <div className="flex flex-wrap gap-1">
                      {preferredCollabTypes.slice(0, 2).map((type) => {
                        const collab = COLLAB_TYPES.find(c => c.id === type);
                        return (
                          <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                            {collab?.label || type}
                          </span>
                        );
                      })}
                      {preferredCollabTypes.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          +{preferredCollabTypes.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Types de mission */}
            <div className="py-3 md:py-0 md:px-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Types de mission</h4>
              {missionTypes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {missionTypes.slice(0, 4).map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      {MISSION_TYPES.find(m => m.id === type)?.label || type}
                    </span>
                  ))}
                  {missionTypes.length > 4 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                      +{missionTypes.length - 4}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Non renseigné</p>
              )}
            </div>

            {/* Section 3: Liens sociaux */}
            <div className="py-3 md:py-0 md:pl-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Liens</h4>
              <div className="flex flex-wrap gap-2">
                {websiteUrl && (
                  <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </a>
                )}
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {twitterUrl && (
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {!websiteUrl && !linkedinUrl && !instagramUrl && !twitterUrl && !youtubeUrl && (
                  <p className="text-xs text-gray-400 italic">Aucun lien</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
