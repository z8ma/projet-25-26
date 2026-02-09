import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';

interface ProfileTabProps {
  // Profile info
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bannerUrl: string | null;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  experienceYears: string;
  hourlyRate: string;
  availability: string;
  bio: string;

  // Preferences
  missionTypes: string[];
  preferredClientTypes: string[];
  preferredCollabTypes: string[];
  minimumBudget: string;

  // Social links
  websiteUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  youtubeUrl: string;

  // Professions & Skills
  selectedProfessions: any[];
  skills: any[];

  // Portfolio
  portfolios: any[];

  // UI state
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  profileCompleteness: number;
  setActiveTab: (tab: string) => void;

  // Functions
  handleBannerFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerRemove: () => void;

  // Animations
  profileHeaderAnimation: any;
  personalInfoAnimation: any;
  professionsAnimation: any;
  skillsAnimation: any;
}

export function ProfileTab({
  firstName,
  lastName,
  profilePictureUrl,
  bannerUrl,
  bannerInputRef,
  experienceYears,
  hourlyRate,
  availability,
  bio,
  missionTypes,
  preferredClientTypes,
  preferredCollabTypes,
  minimumBudget,
  websiteUrl,
  linkedinUrl,
  instagramUrl,
  twitterUrl,
  youtubeUrl,
  selectedProfessions,
  skills,
  portfolios,
  isEditMode,
  setIsEditMode,
  profileCompleteness,
  setActiveTab,
  handleBannerFileSelect,
  handleBannerRemove,
  profileHeaderAnimation,
  personalInfoAnimation,
  professionsAnimation,
  skillsAnimation,
}: ProfileTabProps) {
  if (isEditMode) {
    // TODO: ProfileEditForm component
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Edit Mode</h2>
        <p className="text-gray-500 mb-4">ProfileEditForm component coming soon...</p>
        <button
          onClick={() => setIsEditMode(false)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retour à la vue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with banner and profile info */}
      <ProfileHeader
        bannerUrl={bannerUrl}
        bannerInputRef={bannerInputRef}
        handleBannerFileSelect={handleBannerFileSelect}
        handleBannerRemove={handleBannerRemove}
        profilePictureUrl={profilePictureUrl}
        firstName={firstName}
        lastName={lastName}
        availability={availability}
        selectedProfessions={selectedProfessions}
        experienceYears={experienceYears}
        hourlyRate={hourlyRate}
        minimumBudget={minimumBudget}
        preferredClientTypes={preferredClientTypes}
        preferredCollabTypes={preferredCollabTypes}
        missionTypes={missionTypes}
        websiteUrl={websiteUrl}
        linkedinUrl={linkedinUrl}
        instagramUrl={instagramUrl}
        twitterUrl={twitterUrl}
        youtubeUrl={youtubeUrl}
        setIsEditMode={setIsEditMode}
        profileHeaderAnimation={profileHeaderAnimation}
      />

      {/* Stats Cards */}
      <ProfileStats
        experienceYears={experienceYears}
        hourlyRate={hourlyRate}
        skillsCount={skills.length}
        profileCompleteness={profileCompleteness}
        personalInfoAnimation={personalInfoAnimation}
      />

      {/* Portfolio Preview */}
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

      {/* Bio & Skills Section - TODO */}
      <div
        ref={skillsAnimation.ref}
        className={`bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-700 delay-300 ${
          skillsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">À propos</h3>
        {bio ? (
          <p className="text-gray-600 whitespace-pre-wrap">{bio}</p>
        ) : (
          <p className="text-gray-400 italic">Aucune biographie</p>
        )}

        {skills.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                  {skill.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
