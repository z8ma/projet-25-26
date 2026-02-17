import React from 'react';

// Import constants from parent file (we'll need to export them)
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

const SKILL_LEVELS = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'EXPERT', label: 'Expert' },
];

// Software icons data
const SOFTWARE_DATA: Record<string, { icon: string; color: string }> = {
  'Figma': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', color: '#F24E1E' },
  'Photoshop': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg', color: '#31A8FF' },
  'Illustrator': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-plain.svg', color: '#FF9A00' },
  'After Effects': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-original.svg', color: '#9999FF' },
  'Premiere Pro': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-original.svg', color: '#9999FF' },
  'Adobe XD': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-original.svg', color: '#FF61F6' },
  'Sketch': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg', color: '#F7B500' },
  'Canva': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg', color: '#00C4CC' },
  'Blender': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg', color: '#F5792A' },
  'Unity': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg', color: '#222C37' },
  'Unreal Engine': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unrealengine/unrealengine-original.svg', color: '#0E1128' },
  'Maya': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/maya/maya-original.svg', color: '#0696D7' },
  'VS Code': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', color: '#007ACC' },
  'GitHub': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', color: '#181717' },
  'Slack': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg', color: '#4A154B' },
  'Trello': { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg', color: '#0052CC' },
  'InDesign': { icon: '', color: '#FF3366' },
  'Lightroom': { icon: '', color: '#31A8FF' },
  'Webflow': { icon: '', color: '#4353FF' },
  'Framer': { icon: '', color: '#0055FF' },
  'Notion': { icon: '', color: '#000000' },
  'Miro': { icon: '', color: '#FFD02F' },
  'Cinema 4D': { icon: '', color: '#011A6A' },
  'DaVinci Resolve': { icon: '', color: '#233A51' },
  'Final Cut Pro': { icon: '', color: '#999999' },
};

const getSoftwareData = (name: string): { icon: string; color: string } => {
  return SOFTWARE_DATA[name] || { icon: '', color: '#6366F1' };
};

// Component for software icon with fallback
const SoftwareIcon = ({ name, className = "w-8 h-8" }: { name: string; className?: string }) => {
  const [hasError, setHasError] = React.useState(false);
  const data = getSoftwareData(name);

  if (data.icon && !hasError) {
    return (
      <img
        src={data.icon}
        alt={name}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-lg flex items-center justify-center text-white font-bold text-xs`}
      style={{ backgroundColor: data.color }}
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
};

interface ProfileViewProps {
  // Personal info
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string;
  experienceYears: string;
  hourlyRate: string;
  availability: string;

  // Banner
  bannerUrl: string | null;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  handleBannerFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerRemove: () => void;

  // Professions & Skills
  selectedProfessions: any[];
  skills: any[];

  // Mission types & Preferences
  missionTypes: string[];
  preferredClientTypes: string[];
  preferredCollabTypes: string[];
  minimumBudget: string;

  // Exclusions
  exclusions: string[];

  // Location
  city: string;
  country: string;

  // Social links
  websiteUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;

  // Portfolio
  portfolios: any[];
  setLightboxPortfolio: (portfolio: any) => void;
  portfolioRef: React.RefObject<HTMLDivElement | null>;
  aboutRef: React.RefObject<HTMLDivElement | null>;

  // UI state & callbacks
  profileCompleteness: number;
  setActiveTab: (tab: string) => void;
  setIsEditMode: (mode: boolean) => void;

  // Animations
  profileHeaderAnimation: any;
  personalInfoAnimation: any;
  professionsAnimation: any;
  skillsAnimation: any;
  softwareAnimation: any;
}

export function ProfileView({
  firstName,
  lastName,
  profilePictureUrl,
  bio,
  experienceYears,
  hourlyRate,
  availability,
  bannerUrl,
  bannerInputRef,
  handleBannerFileSelect,
  handleBannerRemove,
  selectedProfessions,
  skills,
  missionTypes,
  preferredClientTypes,
  preferredCollabTypes,
  minimumBudget,
  exclusions,
  city,
  country,
  websiteUrl,
  linkedinUrl,
  instagramUrl,
  twitterUrl,
  youtubeUrl,
  portfolios,
  setLightboxPortfolio,
  portfolioRef,
  aboutRef,
  profileCompleteness,
  setActiveTab,
  setIsEditMode,
  profileHeaderAnimation,
  personalInfoAnimation,
  professionsAnimation,
  skillsAnimation,
  softwareAnimation,
}: ProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Banner + Profile Card Container */}
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
                title="Changer la bannière"
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
                  title="Supprimer la bannière"
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
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${
                  availability === 'Disponible' ? 'bg-green-500' :
                  availability === 'Partiellement disponible' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
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
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    availability === 'Disponible' ? 'bg-green-100 text-green-700' :
                    availability === 'Partiellement disponible' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      availability === 'Disponible' ? 'bg-green-500' :
                      availability === 'Partiellement disponible' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
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

          {/* Compact info bar */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Location */}
            {(city || country) && (
              <>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium text-gray-700">{[city, country].filter(Boolean).join(', ')}</span>
                </div>
                <span className="text-gray-200">|</span>
              </>
            )}

            {/* Budget */}
            {minimumBudget && (
              <>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Min <span className="font-semibold text-gray-900">{minimumBudget}€</span></span>
                </div>
                <span className="text-gray-200">|</span>
              </>
            )}

            {/* Client types */}
            {preferredClientTypes.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  {preferredClientTypes.slice(0, 3).map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                      {CLIENT_TYPES.find(c => c.id === type)?.label || type}
                    </span>
                  ))}
                  {preferredClientTypes.length > 3 && (
                    <span className="text-[11px] text-gray-400">+{preferredClientTypes.length - 3}</span>
                  )}
                </div>
                <span className="text-gray-200">|</span>
              </>
            )}

            {/* Collab types */}
            {preferredCollabTypes.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  {preferredCollabTypes.slice(0, 2).map((type) => {
                    const collab = COLLAB_TYPES.find(c => c.id === type);
                    return (
                      <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-medium">
                        {collab?.label || type}
                      </span>
                    );
                  })}
                </div>
                <span className="text-gray-200">|</span>
              </>
            )}

            {/* Mission types */}
            {missionTypes.length > 0 && (
              <>
                <div className="flex items-center gap-1.5">
                  {missionTypes.slice(0, 3).map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-medium">
                      {MISSION_TYPES.find(m => m.id === type)?.label || type}
                    </span>
                  ))}
                  {missionTypes.length > 3 && (
                    <span className="text-[11px] text-gray-400">+{missionTypes.length - 3}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Social links - larger icons with brand colors */}
          {(websiteUrl || linkedinUrl || instagramUrl || twitterUrl || youtubeUrl) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all hover:scale-110" title="Site web">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </a>
              )}
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] transition-all hover:scale-110" title="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#E4405F]/10 hover:bg-[#E4405F]/20 flex items-center justify-center text-[#E4405F] transition-all hover:scale-110" title="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center text-gray-900 transition-all hover:scale-110" title="X / Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] transition-all hover:scale-110" title="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div
        ref={personalInfoAnimation.ref}
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${
          personalInfoAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{experienceYears || '—'}</div>
          <div className="text-sm text-gray-500">Années d'exp.</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{hourlyRate ? `${hourlyRate}€` : '—'}</div>
          <div className="text-sm text-gray-500">Tarif horaire</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{skills.length}</div>
          <div className="text-sm text-gray-500">Compétences</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className={`text-2xl font-bold ${profileCompleteness >= 80 ? 'text-purple-600' : 'text-gray-900'}`}>
            {profileCompleteness}%
          </div>
          <div className="text-sm text-gray-500">Profil complété</div>
        </div>
      </div>

      {/* Portfolio Header */}
      <div
        ref={professionsAnimation.ref}
        className={`flex items-center justify-between transition-all duration-700 delay-200 ${
          professionsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Portfolio
          <span className="text-sm text-gray-400">({portfolios.length})</span>
        </h2>
        <button
          onClick={() => setActiveTab('portfolio')}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Voir tout →
        </button>
      </div>

      {/* Main Content Grid - Portfolio Carousel + À propos */}
      <div
        ref={skillsAnimation.ref}
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-700 delay-300 ${
          skillsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Left - Portfolio Carousel (2/3) */}
        <div className="lg:col-span-2">
          {portfolios.length > 0 ? (
            <div ref={portfolioRef} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto gap-5 p-6 scrollbar-hide snap-x snap-mandatory">
                {[...portfolios].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).slice(0, 6).map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="flex-shrink-0 w-72 snap-start group cursor-pointer"
                    onClick={() => setLightboxPortfolio(portfolio)}
                  >
                    <div
                      className={`relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                        portfolio.isFeatured ? 'ring-2 ring-purple-200' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="h-52">
                        {portfolio.imageUrl ? (
                          <img
                            src={portfolio.imageUrl}
                            alt={portfolio.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <svg className="w-14 h-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Featured badge */}
                      {portfolio.isFeatured && (
                        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium rounded-full flex items-center gap-1.5 shadow-lg">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          En avant
                        </div>
                      )}

                      {/* Tags - visible, hidden on hover */}
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
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="font-bold text-white text-base">{portfolio.title}</h3>
                          {portfolio.description && (
                            <p className="text-white/70 text-xs line-clamp-2 mt-1">{portfolio.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Scroll indicator */}
              {portfolios.length > 2 && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium">Aucun projet dans le portfolio</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez vos meilleures réalisations</p>
              <button
                onClick={() => setActiveTab('portfolio')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Ajouter un projet
              </button>
            </div>
          )}
        </div>

        {/* Right - À propos (1/3) */}
        <div ref={aboutRef} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            À propos
          </h2>
          {bio ? (
            <div className="overflow-y-auto flex-1 min-h-0 -mr-2 pr-2 scrollbar-thin">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{bio}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">Aucune bio renseignée</p>
          )}

          {/* Exclusions - Si présentes */}
          {exclusions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ce que je ne fais pas</h3>
              <div className="flex flex-wrap gap-1.5">
                {exclusions.map((exclusion, index) => (
                  <span key={index} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                    {exclusion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div
        ref={softwareAnimation.ref}
        className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-700 delay-400 ${
          softwareAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Logiciels & Outils
        </h2>
        {skills.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <SoftwareIcon name={skill.softwareName} className="w-6 h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{skill.softwareName}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {SKILL_LEVELS.find(l => l.value === skill.proficiencyLevel)?.label}
                    {skill.yearsOfUse && ` • ${skill.yearsOfUse}a`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">Aucune compétence renseignée</p>
        )}
      </div>
    </div>
  );
}
