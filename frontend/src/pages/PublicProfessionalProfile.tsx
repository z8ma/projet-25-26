import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { professionalApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { PortfolioViewModal } from '../components/professional/PortfolioTab/PortfolioViewModal';
import ExternalLinkWarning from '../components/ExternalLinkWarning';

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
  { id: 'court', label: 'Mission courte' },
  { id: 'long', label: 'Mission longue' },
  { id: 'recurrent', label: 'Récurrent' },
  { id: 'one-shot', label: 'One-shot' },
];

const SKILL_LEVELS = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'EXPERT', label: 'Expert' },
];

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

const getSoftwareData = (name: string) => SOFTWARE_DATA[name] || { icon: '', color: '#6366F1' };

function SoftwareIcon({ name, className = "w-8 h-8" }: { name: string; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const data = getSoftwareData(name);
  if (data.icon && !hasError) {
    return <img src={data.icon} alt={name} className={className} onError={() => setHasError(true)} />;
  }
  return (
    <div className={`${className} rounded-lg flex items-center justify-center text-white font-bold text-xs`} style={{ backgroundColor: data.color }}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

export default function PublicProfessionalProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [likedPortfolios, setLikedPortfolios] = useState<Set<string>>(new Set());
  const [viewingPortfolio, setViewingPortfolio] = useState<any>(null);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const headerAnimation = useScrollAnimation([loading]);
  const statsAnimation = useScrollAnimation([loading]);
  const portfolioAnimation = useScrollAnimation([loading]);
  const skillsAnimation = useScrollAnimation([loading]);
  const softwareAnimation = useScrollAnimation([loading]);

  useDocumentTitle(professional ? `${professional.firstName} ${professional.lastName} | JUNY` : 'Profil | JUNY');

  // Close contact menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contactMenuRef.current && !contactMenuRef.current.contains(e.target as Node)) {
        setShowContactMenu(false);
      }
    };
    if (showContactMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContactMenu]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (id) {
      loadProfile();
    }
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await professionalApi.getProfessionalById(id!);
      const data = response.data;
      setProfessional(data);
      setFollowersCount(data._count?.followers || 0);

      // Load follow status & liked portfolios if logged in as pro
      if (user?.role === 'PROFESSIONAL') {
        try {
          const followRes = await professionalApi.getFollowStatus(data.id);
          setIsFollowing(followRes.data?.isFollowing || false);
        } catch {}

        if (data.portfolios?.length > 0) {
          try {
            const portfolioIds = data.portfolios.map((p: any) => p.id);
            const likesRes = await professionalApi.getLikedPortfolios(portfolioIds);
            setLikedPortfolios(new Set(likesRes.data || []));
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!professional || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await professionalApi.unfollowProfessional(professional.id);
        setIsFollowing(false);
        setFollowersCount(c => c - 1);
      } else {
        await professionalApi.followProfessional(professional.id);
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (portfolioId: string) => {
    try {
      if (likedPortfolios.has(portfolioId)) {
        await professionalApi.unlikePortfolio(portfolioId);
        setLikedPortfolios(prev => {
          const next = new Set(prev);
          next.delete(portfolioId);
          return next;
        });
      } else {
        await professionalApi.likePortfolio(portfolioId);
        setLikedPortfolios(prev => new Set(prev).add(portfolioId));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !professional || messageSending) return;
    setMessageSending(true);
    try {
      await professionalApi.sendDirectMessage(professional.id, messageText.trim());
      setMessageSent(true);
      setMessageText('');
      setTimeout(() => {
        setShowMessageModal(false);
        setMessageSent(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setMessageSending(false);
    }
  };

  const getAvailabilityLabel = (val: string | null) => {
    return val || 'Non spécifié';
  };

  const getAvailabilityColor = (val: string | null) => {
    switch (val) {
      case 'Disponible': return 'bg-green-500';
      case 'Partiellement disponible': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getAvailabilityBadgeColor = (val: string | null) => {
    switch (val) {
      case 'Disponible': return 'bg-green-100 text-green-700';
      case 'Partiellement disponible': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profil introuvable</h2>
          <p className="text-gray-500 mb-4">Ce professionnel n'existe pas ou a été supprimé.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const primaryProfession = professional.professions?.find((p: any) => p.isPrimary)?.profession?.name
    || professional.professions?.[0]?.profession?.name || 'Professionnel';
  const availabilityLabel = getAvailabilityLabel(professional.availability);
  const missionTypes: string[] = professional.missionTypes || [];
  const preferredClientTypes: string[] = professional.preferredClientTypes || [];
  const preferredCollabTypes: string[] = professional.preferredCollabTypes || [];
  const exclusions: string[] = professional.exclusions || [];
  const minimumBudget = professional.minimumBudget ? String(professional.minimumBudget) : '';
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Retour</span>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="JUNY" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold logo-gradient">JUNY</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copié !</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Partager
              </>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner + Profile Card */}
        <div
          ref={headerAnimation.ref}
          className={`bg-white rounded-2xl border border-gray-200 transition-all duration-700 ${
            headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Banner */}
          <div className="relative h-48 md:h-56 rounded-t-2xl overflow-hidden">
            {professional.bannerUrl ? (
              <img src={professional.bannerUrl} alt="Bannière" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 py-5 bg-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Profile Picture */}
              <div className="relative -mt-20 sm:-mt-16">
                {professional.profilePictureUrl ? (
                  <img src={professional.profilePictureUrl} alt="Profile" className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-xl" />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    <span className="text-3xl sm:text-4xl font-bold text-white">{professional.firstName?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                )}
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-3 border-white ${getAvailabilityColor(professional.availability)}`} />
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{professional.firstName} {professional.lastName}</h1>
                <p className="text-purple-600 font-medium">{primaryProfession}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
                  {professional.experienceYears && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {professional.experienceYears} ans d'exp.
                    </span>
                  )}
                  {professional.hourlyRate && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {professional.hourlyRate}€/h
                    </span>
                  )}
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityBadgeColor(professional.availability)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getAvailabilityColor(professional.availability)}`} />
                    {availabilityLabel}
                  </span>
                </div>

                {/* Followers count */}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">{followersCount}</span> abonné{followersCount !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">{professional._count?.following || 0}</span> abonnement{(professional._count?.following || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Follow Button */}
                {user?.role === 'PROFESSIONAL' && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-gray-200/50'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Suivi
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Suivre
                      </>
                    )}
                  </button>
                )}

                {/* Platform Message Button (creators only) */}
                {user?.role === 'CREATOR' && (
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Envoyer un message
                  </button>
                )}

                {/* Contact Button (social links) */}
                {(professional.websiteUrl || professional.linkedinUrl || professional.instagramUrl || professional.twitterUrl || professional.youtubeUrl) && (
                  <div className="relative" ref={contactMenuRef}>
                    <button
                      onClick={() => setShowContactMenu(!showContactMenu)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contacter
                    </button>

                    {showContactMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-2 space-y-1">
                          {professional.websiteUrl && (
                            <ExternalLinkWarning
                              url={professional.websiteUrl}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">Site web</p>
                                <p className="text-xs text-gray-500 truncate">{professional.websiteUrl.replace(/^https?:\/\//, '')}</p>
                              </div>
                            </ExternalLinkWarning>
                          )}
                          {professional.linkedinUrl && (
                            <ExternalLinkWarning
                              url={professional.linkedinUrl}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                                <p className="text-xs text-gray-500">Voir le profil</p>
                              </div>
                            </ExternalLinkWarning>
                          )}
                          {professional.instagramUrl && (
                            <ExternalLinkWarning
                              url={professional.instagramUrl}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#E4405F]/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">Instagram</p>
                                <p className="text-xs text-gray-500">Voir le profil</p>
                              </div>
                            </ExternalLinkWarning>
                          )}
                          {professional.twitterUrl && (
                            <ExternalLinkWarning
                              url={professional.twitterUrl}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-900/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">X / Twitter</p>
                                <p className="text-xs text-gray-500">Voir le profil</p>
                              </div>
                            </ExternalLinkWarning>
                          )}
                          {professional.youtubeUrl && (
                            <ExternalLinkWarning
                              url={professional.youtubeUrl}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#FF0000]/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">YouTube</p>
                                <p className="text-xs text-gray-500">Voir la chaîne</p>
                              </div>
                            </ExternalLinkWarning>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compact info bar */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
              {(professional.city || professional.country) && (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-700">{[professional.city, professional.country].filter(Boolean).join(', ')}</span>
                  </div>
                  <span className="text-gray-200">|</span>
                </>
              )}
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
              {preferredClientTypes.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    {preferredClientTypes.slice(0, 3).map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                        {CLIENT_TYPES.find(c => c.id === type)?.label || type}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-200">|</span>
                </>
              )}
              {preferredCollabTypes.length > 0 && (
                <>
                  <div className="flex items-center gap-1.5">
                    {preferredCollabTypes.slice(0, 2).map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[11px] font-medium">
                        {COLLAB_TYPES.find(c => c.id === type)?.label || type}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-200">|</span>
                </>
              )}
              {missionTypes.length > 0 && (
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
              )}
            </div>

            {/* All professions */}
            {professional.professions?.length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                {professional.professions.map((p: any) => (
                  <span
                    key={p.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.isPrimary
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.profession?.name || 'Autre'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div
          ref={statsAnimation.ref}
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-700 delay-100 ${
            statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{professional.experienceYears || '—'}</div>
            <div className="text-sm text-gray-500">Années d'exp.</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{professional.hourlyRate ? `${professional.hourlyRate}€` : '—'}</div>
            <div className="text-sm text-gray-500">Tarif horaire</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{professional.projectsCompleted || 0}</div>
            <div className="text-sm text-gray-500">Projets réalisés</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
              {professional.averageRating ? (
                <>
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {parseFloat(professional.averageRating).toFixed(1)}
                </>
              ) : '—'}
            </div>
            <div className="text-sm text-gray-500">Note moyenne</div>
          </div>
        </div>

        {/* À propos */}
        {(professional.bio || exclusions.length > 0) && (
          <div
            ref={portfolioAnimation.ref}
            className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-700 delay-200 ${
              portfolioAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              À propos
            </h2>
            {professional.bio && (
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{professional.bio}</p>
            )}
            {exclusions.length > 0 && (
              <div className={professional.bio ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
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
        )}

        {/* Portfolio Section */}
        <div
          ref={skillsAnimation.ref}
          className={`transition-all duration-700 delay-300 ${
            skillsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {professional.portfolios?.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Portfolio
                <span className="text-sm text-gray-400">({professional.portfolios.length})</span>
              </h2>

              {/* Responsive Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                {[...professional.portfolios]
                  .sort((a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
                  .map((portfolio: any) => (
                    <div
                      key={portfolio.id}
                      className="break-inside-avoid group cursor-pointer"
                      onClick={() => setViewingPortfolio(portfolio)}
                    >
                      <div className={`relative rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${portfolio.isFeatured ? 'ring-2 ring-purple-200' : ''}`}>
                        {/* Image */}
                        <div className="relative">
                          {(() => {
                            const coverUrl = portfolio.imageUrl
                              || portfolio.media?.find((m: any) => m.type === 'IMAGE')?.url
                              || portfolio.media?.[0]?.thumbnailUrl
                              || portfolio.media?.[0]?.url;
                            return coverUrl ? (
                              <img src={coverUrl} alt={portfolio.title} className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                            ) : (
                              <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            );
                          })()}

                          {/* Featured badge */}
                          {portfolio.isFeatured && (
                            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-[11px] font-medium rounded-full flex items-center gap-1 shadow-lg">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              En avant
                            </div>
                          )}

                          {/* Like button */}
                          {user?.role === 'PROFESSIONAL' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleLike(portfolio.id); }}
                              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                            >
                              <svg
                                className={`w-4 h-4 transition-colors ${likedPortfolios.has(portfolio.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                                fill={likedPortfolios.has(portfolio.id) ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                            <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              {portfolio.description && (
                                <p className="text-white/80 text-xs line-clamp-2">{portfolio.description}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card footer */}
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{portfolio.title}</h3>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-2">
                              {portfolio.projectType && (
                                <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{portfolio.projectType}</span>
                              )}
                              {portfolio.projectYear && (
                                <span className="text-[11px] text-gray-400">{portfolio.projectYear}</span>
                              )}
                            </div>
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {portfolio._count?.likes || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium">Aucun projet dans le portfolio</p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {professional.softwareSkills?.length > 0 && (
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {professional.softwareSkills.map((skill: any) => (
                <div key={skill.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <SoftwareIcon name={skill.softwareName} className="w-6 h-6 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{skill.softwareName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {SKILL_LEVELS.find(l => l.value === skill.proficiencyLevel)?.label}
                      {skill.yearsOfUse && ` · ${skill.yearsOfUse}a`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Portfolio View Modal */}
      {viewingPortfolio && (
        <PortfolioViewModal
          portfolio={viewingPortfolio}
          onClose={() => setViewingPortfolio(null)}
        />
      )}

      {/* Send Message Modal (for creators) */}
      {showMessageModal && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => { setShowMessageModal(false); setMessageSent(false); }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {messageSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-600">
                  {professional.firstName} recevra votre message dans sa messagerie JUNY.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Contacter {professional.firstName}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Envoyez un message via la plateforme JUNY
                </p>

                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Décrivez votre projet ou posez votre question..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                />

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || messageSending}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {messageSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
