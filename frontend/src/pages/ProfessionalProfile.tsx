import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../contexts/SidebarContext';
import { professionalApi, uploadApi, matchingApi, calendarApi } from '../services/api';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import NotificationDropdown from '../components/NotificationDropdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { usePortfolio } from '../hooks/professional/usePortfolio';
import { PortfolioTab } from '../components/professional/PortfolioTab';
import { PortfolioViewModal } from '../components/professional/PortfolioTab/PortfolioViewModal';
import { useCalendar } from '../hooks/professional/useCalendar';
import { CalendarTab } from '../components/professional/CalendarTab';
import { useMissions } from '../hooks/professional/useMissions';
import { MissionsTab } from '../components/professional/MissionsTab';
import { useMessages } from '../hooks/professional/useMessages';
import { MessagesTab } from '../components/professional/MessagesTab';
import { DashboardTab } from '../components/professional/DashboardTab';
import { ProfileView } from '../components/professional/ProfileTab/ProfileView';
import { ExploreTab } from '../components/professional/ExploreTab';

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

// Complete list of software suggestions for autocomplete
const SOFTWARE_SUGGESTIONS = [
  // Adobe Creative Suite
  'Photoshop', 'Illustrator', 'InDesign', 'Lightroom', 'After Effects', 'Premiere Pro',
  'Adobe XD', 'Animate', 'Audition', 'Dimension', 'Fresco', 'Substance 3D',
  // Design & UI/UX
  'Figma', 'Sketch', 'Canva', 'Framer', 'InVision', 'Principle', 'ProtoPie', 'Axure',
  'Balsamiq', 'Marvel', 'Zeplin', 'Abstract', 'Avocode',
  // 3D & Animation
  'Blender', 'Cinema 4D', 'Maya', 'ZBrush', '3ds Max', 'Houdini', 'Modo', 'Rhino 3D',
  'SketchUp', 'KeyShot', 'Marvelous Designer', 'Substance Painter', 'Spline',
  // Video & Motion
  'DaVinci Resolve', 'Final Cut Pro', 'iMovie', 'CapCut', 'Lumen5', 'Camtasia',
  // Web & No-code
  'Webflow', 'WordPress', 'Wix', 'Squarespace', 'Shopify', 'Bubble', 'Framer Sites',
  'Carrd', 'Readymag', 'Editor X',
  // Development
  'VS Code', 'GitHub', 'GitLab', 'Bitbucket', 'Sublime Text', 'WebStorm',
  // Collaboration & Project Management
  'Notion', 'Miro', 'FigJam', 'Slack', 'Trello', 'Asana', 'Monday.com', 'ClickUp',
  'Basecamp', 'Jira', 'Linear', 'Airtable', 'Coda',
  // Game Engines
  'Unity', 'Unreal Engine', 'Godot', 'GameMaker',
  // Other Creative Tools
  'Procreate', 'Affinity Designer', 'Affinity Photo', 'CorelDRAW', 'GIMP', 'Inkscape',
  'Krita', 'Clip Studio Paint', 'MediBang Paint', 'PaintTool SAI',
  // Presentation
  'Keynote', 'PowerPoint', 'Google Slides', 'Pitch', 'Prezi', 'Beautiful.ai',
  // Audio
  'Logic Pro', 'Ableton Live', 'FL Studio', 'Pro Tools', 'GarageBand', 'Audacity',
  // AI Tools
  'Midjourney', 'DALL-E', 'Stable Diffusion', 'RunwayML', 'ChatGPT', 'Claude',
];

// Software icons (Devicon CDN) and brand colors
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
  const [hasError, setHasError] = useState(false);
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

const PORTFOLIO_CLIENT_TYPES = [
  'Startup', 'PME', 'Grand compte', 'Agence', 'Particulier', 'Projet personnel',
];

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'chart' },
  { id: 'calendar', label: 'Calendrier', icon: 'calendar' },
  { id: 'missions', label: 'Missions', icon: 'clipboard' },
  { id: 'messages', label: 'Messages', icon: 'chat' },
  { id: 'portfolio', label: 'Portfolio', icon: 'image' },
  { id: 'profile', label: 'Mon Profil', icon: 'user' },
  { id: 'explore', label: 'Explorer', icon: 'search' },
];

const MenuIcon = ({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) => {
  const icons: Record<string, React.ReactElement> = {
    chart: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    calendar: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    user: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    clipboard: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    settings: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    code: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    image: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    chat: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    search: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  };
  return icons[icon] || null;
};

export default function ProfessionalProfile() {
  useDocumentTitle('Mon Profil | JUNY');

  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerZoom, setBannerZoom] = useState(1);
  const [bannerPosition, setBannerPosition] = useState({ x: 0, y: 0 });
  const [isBannerDragging, setIsBannerDragging] = useState(false);
  const [bannerDragStart, setBannerDragStart] = useState({ x: 0, y: 0 });
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerImageRef = useRef<HTMLImageElement>(null);
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const [experienceYears, setExperienceYears] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState('Disponible');
  const [bio, setBio] = useState('');
  const [missionTypes, setMissionTypes] = useState<string[]>([]);
  const [otherMissionType, setOtherMissionType] = useState('');
  const [preferredClientTypes, setPreferredClientTypes] = useState<string[]>([]);
  const [preferredCollabTypes, setPreferredCollabTypes] = useState<string[]>([]);
  const [minimumBudget, setMinimumBudget] = useState('');
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Location
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('France');

  // Social links
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [professions, setProfessions] = useState<any[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<any[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('CONFIRMED');
  const [newSkillYears, setNewSkillYears] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Portfolio hook
  const portfolio = usePortfolio();
  const { portfolios, setPortfolios } = portfolio;

  const [lightboxPortfolio, setLightboxPortfolio] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(() => {
    // Restore last active tab from localStorage
    return localStorage.getItem('professional-active-tab') || 'dashboard';
  });

  // Scroll animations
  const heroAnimation = useScrollAnimation([activeTab]);
  const statsAnimation = useScrollAnimation([activeTab]);
  const quickActionsAnimation = useScrollAnimation([activeTab]);
  const projectsAnimation = useScrollAnimation([activeTab]);
  const calendarAnimation = useScrollAnimation([activeTab]);
  const portfolioGridAnimation = useScrollAnimation([activeTab]);

  // Profile tab animations
  const profileHeaderAnimation = useScrollAnimation([activeTab]);
  const personalInfoAnimation = useScrollAnimation([activeTab]);
  const professionsAnimation = useScrollAnimation([activeTab]);
  const skillsAnimation = useScrollAnimation([activeTab]);
  const softwareAnimation = useScrollAnimation([activeTab]);
  const preferencesAnimation = useScrollAnimation([activeTab]);
  const exclusionsAnimation = useScrollAnimation([activeTab]);
  const socialLinksAnimation = useScrollAnimation([activeTab]);

  // Messages tab animations
  const messagesAnimation = useScrollAnimation([activeTab]);

  // Matches tab animations
  const matchesAnimation = useScrollAnimation([activeTab]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    professions: true,
    skills: true,
    preferences: false,
    exclusions: false,
    socialLinks: false,
    notifications: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Notification preferences
  const [notifyNewMatch, setNotifyNewMatch] = useState(true);
  const [notifyMessage, setNotifyMessage] = useState(true);
  const [notifyProjectUpdate, setNotifyProjectUpdate] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Calendar hook
  const calendar = useCalendar();
  const { calendarEvents, setCalendarEvents } = calendar;

  // Missions hook
  const missions = useMissions();

  // Messages hook
  const messaging = useMessages();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'PROFESSIONAL') {
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [user, navigate]);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem('professional-active-tab', activeTab);
  }, [activeTab]);

  // Synchronize "À propos" height with portfolio carousel
  useEffect(() => {
    const syncHeights = () => {
      if (portfolioRef.current && aboutRef.current) {
        const portfolioHeight = portfolioRef.current.offsetHeight;
        aboutRef.current.style.height = `${portfolioHeight}px`;
      }
    };

    // Wait for DOM to update when changing tabs
    const timer = setTimeout(syncHeights, 100);
    window.addEventListener('resize', syncHeights);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', syncHeights);
    };
  }, [portfolios, activeTab]);

  const loadAllData = async () => {
    await Promise.all([loadProfile(), loadProfessions(), loadMessages(), loadMatches(), loadDashboardStats(), loadConversations(), calendar.loadCalendarEvents()]);
  };


  const loadDashboardStats = async () => {
    try {
      const response = await professionalApi.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const loadMatches = async () => {
    try {
      const response = await professionalApi.getMyMatches();
      if (response.success) {
        setMatches(response.data);
      }
    } catch (err: any) {
      console.error('Error loading matches:', err);
    }
  };

  const handleRespondToMatch = async (matchId: string, status: 'ACCEPTED' | 'DECLINED') => {
    await missions.handleRespondToMatch(matchId, status, () => {
      setMatches(matches.map(m => m.id === matchId ? { ...m, status } : m));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  const handleUpdateProjectStatus = async (matchId: string, projectStatus: string) => {
    await missions.handleUpdateProjectStatus(matchId, projectStatus, () => {
      setMatches(matches.map(m => m.id === matchId ? { ...m, projectStatus } : m));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  const loadProfile = async () => {
    try {
      const response = await professionalApi.getProfile();
      if (response.success) {
        const data = response.data;
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setProfilePictureUrl(data.profilePictureUrl || null);
        setBannerUrl(data.bannerUrl || null);
        setExperienceYears(data.experienceYears?.toString() || '');
        setHourlyRate(data.hourlyRate?.toString() || '');
        setAvailability(data.availability || 'Disponible');
        setBio(data.bio || '');
        setMissionTypes(data.missionTypes || []);
        setOtherMissionType(data.otherMissionType || '');
        setPreferredClientTypes(data.preferredClientTypes || []);
        setPreferredCollabTypes(data.preferredCollabTypes || []);
        setMinimumBudget(data.minimumBudget?.toString() || '');
        setExclusions(data.exclusions || []);

        // Load location
        setCity(data.city || '');
        setCountry(data.country || 'France');

        // Load social links
        setWebsiteUrl(data.websiteUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setInstagramUrl(data.instagramUrl || '');
        setTwitterUrl(data.twitterUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setProfileCompleteness(data.profileCompleteness || 0);
        setSelectedProfessions(data.professions || []);
        setSkills(data.softwareSkills || []);
        setPortfolios(data.portfolios || []);
        // Notification preferences
        setNotifyNewMatch(data.notifyNewMatch !== false);
        setNotifyMessage(data.notifyMessage !== false);
        setNotifyProjectUpdate(data.notifyProjectUpdate !== false);
        setNotifyEmail(data.notifyEmail !== false);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    }
  };

  const loadProfessions = async () => {
    try {
      const response = await professionalApi.getProfessions();
      if (response.success) setProfessions(response.data);
    } catch (err: any) {
      console.error('Error loading professions:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await professionalApi.getMessages();
      if (response.success) {
        setMessages(response.data);
        setUnreadCount(response.data.filter((m: any) => !m.isRead).length);
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
    }
  };

  const loadConversations = async () => {
    await messaging.loadConversations();
    // Update unread count
    const totalUnread = messaging.conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
    setUnreadCount(totalUnread);
  };

  const selectConversation = async (conv: any) => {
    const unreadBefore = conv.unreadCount || 0;
    await messaging.selectConversation(conv);
    setUnreadCount(prev => Math.max(0, prev - unreadBefore));
  };

  const handleSendMessage = async () => {
    await messaging.handleSendMessage(user?.id);
  };

  const handleProfilePictureUpload = async (url: string) => {
    try {
      await professionalApi.updateProfile({ profilePictureUrl: url });
      setProfilePictureUrl(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erreur lors de la mise à jour de la photo');
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      await professionalApi.updateProfile({ profilePictureUrl: null });
      setProfilePictureUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erreur lors de la suppression de la photo');
    }
  };

  const handleBannerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerPreview(event.target?.result as string);
      setBannerZoom(1);
      setBannerPosition({ x: 0, y: 0 });
      setShowBannerEditor(true);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleBannerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsBannerDragging(true);
    setBannerDragStart({ x: e.clientX - bannerPosition.x, y: e.clientY - bannerPosition.y });
  };

  const handleBannerMouseMove = (e: React.MouseEvent) => {
    if (!isBannerDragging) return;
    e.preventDefault();
    setBannerPosition({
      x: e.clientX - bannerDragStart.x,
      y: e.clientY - bannerDragStart.y,
    });
  };

  const handleBannerMouseUp = () => {
    setIsBannerDragging(false);
  };

  const getCroppedBanner = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = bannerImageRef.current!;
      const container = bannerContainerRef.current!;

      // Banner output dimensions (3:1 aspect ratio, high quality)
      const outputWidth = 1200;
      const outputHeight = 400;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Get the preview dimensions
      const previewWidth = container.clientWidth;
      const previewHeight = container.clientHeight;

      // Scale factor from preview to output
      const scaleFactorX = outputWidth / previewWidth;
      const scaleFactorY = outputHeight / previewHeight;

      // Get image dimensions
      const imgRect = img.getBoundingClientRect();
      const baseWidth = imgRect.width / bannerZoom;
      const baseHeight = imgRect.height / bannerZoom;

      // Calculate zoomed dimensions
      const zoomedWidth = baseWidth * bannerZoom;
      const zoomedHeight = baseHeight * bannerZoom;

      // Draw dimensions
      const drawWidth = zoomedWidth * scaleFactorX;
      const drawHeight = zoomedHeight * scaleFactorY;

      // Center position + offset
      const drawX = (outputWidth / 2) - (drawWidth / 2) + (bannerPosition.x * scaleFactorX);
      const drawY = (outputHeight / 2) - (drawHeight / 2) + (bannerPosition.y * scaleFactorY);

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', 0.92);
    });
  };

  const handleBannerSave = async () => {
    try {
      setBannerUploading(true);
      const croppedBlob = await getCroppedBanner();
      const croppedFile = new File([croppedBlob], 'banner.jpg', { type: 'image/jpeg' });

      const response = await uploadApi.uploadBrainstormingFiles([croppedFile], () => { });
      if (response.success && response.data.length > 0) {
        const url = response.data[0].url;
        await professionalApi.updateProfile({ bannerUrl: url });
        setBannerUrl(url);
        setShowBannerEditor(false);
        setBannerPreview(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError('Erreur lors de l\'upload de la bannière');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerEditorClose = () => {
    setShowBannerEditor(false);
    setBannerPreview(null);
    setBannerZoom(1);
    setBannerPosition({ x: 0, y: 0 });
  };

  const handleBannerRemove = async () => {
    try {
      await professionalApi.updateProfile({ bannerUrl: null });
      setBannerUrl(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('Erreur lors de la suppression de la bannière');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await professionalApi.updateProfile({
        firstName, lastName,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability, bio, missionTypes,
        otherMissionType: otherMissionType || undefined,
        preferredClientTypes, preferredCollabTypes,
        minimumBudget: minimumBudget ? parseFloat(minimumBudget) : undefined,
        exclusions,
        // Location
        city: city || undefined,
        country: country || undefined,
        // Social links
        websiteUrl: websiteUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        youtubeUrl: youtubeUrl || undefined,
        // Notification preferences
        notifyNewMatch,
        notifyMessage,
        notifyProjectUpdate,
        notifyEmail,
      });

      if (response.success) {
        setSuccess(true);
        setProfileCompleteness(response.data.profileCompleteness || 0);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const toggleMissionType = (type: string) => {
    setMissionTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleClientType = (type: string) => {
    setPreferredClientTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleCollabType = (type: string) => {
    setPreferredCollabTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusions.includes(newExclusion.trim())) {
      setExclusions([...exclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (exclusion: string) => {
    setExclusions(exclusions.filter(e => e !== exclusion));
  };

  const handleAddProfession = async () => {
    if (!selectedProfessionId) return;
    try {
      const response = await professionalApi.addProfession({
        professionId: selectedProfessionId,
        isPrimary: selectedProfessions.length === 0,
      });
      if (response.success) {
        setSelectedProfessions([...selectedProfessions, response.data]);
        setSelectedProfessionId('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du métier');
    }
  };

  const handleRemoveProfession = async (id: string) => {
    try {
      await professionalApi.removeProfession(id);
      setSelectedProfessions(selectedProfessions.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName) return;
    try {
      const response = await professionalApi.addSkill({
        softwareName: newSkillName,
        proficiencyLevel: newSkillLevel,
        yearsOfUse: newSkillYears ? parseInt(newSkillYears) : undefined,
      });
      if (response.success) {
        setSkills([...skills, response.data]);
        setNewSkillName('');
        setNewSkillLevel('CONFIRMED');
        setNewSkillYears('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      await professionalApi.removeSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await professionalApi.markMessageAsRead(id);
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Mobile sidebar backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
          } ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-gray-100 ${isCollapsed ? 'lg:justify-center lg:px-0 px-4' : 'px-4'}`}>
          <Link to="/" className={`flex items-center gap-2 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="JUNY Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`text-2xl font-bold logo-gradient whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              }`}>
              JUNY
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Badge - Hidden when collapsed */}
        <div className={`px-4 py-3 border-b border-gray-100 transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:h-0 lg:py-0 lg:opacity-0' : 'h-auto opacity-100'
          }`}>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Pro
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{profileCompleteness}%</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'lg:px-2 lg:py-2' : 'p-2'}`}>
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className={isCollapsed ? 'lg:flex lg:justify-center' : ''}>
                  <button
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative font-medium transition-all duration-200 ${isCollapsed
                      ? 'flex items-center justify-center gap-3 px-3 py-2.5 rounded-xl lg:w-11 lg:h-11 lg:p-0 lg:gap-0 lg:rounded-full'
                      : 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl'
                      } ${isActive
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      <MenuIcon icon={item.icon} />
                    </span>
                    <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:hidden' : 'w-auto opacity-100'}`}>
                      {item.label}
                    </span>
                    {item.id === 'messages' && unreadCount > 0 && !isCollapsed && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                        {unreadCount}
                      </span>
                    )}
                    {isCollapsed && (
                      <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle Button - Desktop only */}
        <div className="hidden lg:block p-2 border-t border-gray-100">
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl font-medium transition-all duration-200 ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
              Réduire
            </span>
          </button>
        </div>

        {/* Sidebar Footer - Settings & Logout */}
        <div className="p-2 border-t border-gray-100">
          <Link
            to="/settings"
            title={isCollapsed ? 'Paramètres' : undefined}
            className={`group relative flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-all duration-200 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              }`}>
              Paramètres
            </span>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block shadow-lg">
                Paramètres
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Déconnexion' : undefined}
            className={`group relative flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all duration-200 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'
              }`}>
              Déconnexion
            </span>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] hidden lg:block shadow-lg">
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex items-center gap-2.5 flex-1">
              <div className="hidden lg:flex w-8 h-8 rounded-lg bg-purple-50 items-center justify-center text-purple-600 flex-shrink-0">
                <MenuIcon icon={MENU_ITEMS.find(item => item.id === activeTab)?.icon || 'chart'} className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                {MENU_ITEMS.find(item => item.id === activeTab)?.label || 'Tableau de bord'}
              </h1>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:opacity-80 transition-opacity"
              >
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {firstName ? firstName[0]?.toUpperCase() : '?'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{firstName} {lastName}</p>
                  <p className="text-xs text-gray-500">Professionnel</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Notifications */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Modifications enregistrées
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">×</button>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              dashboardStats={dashboardStats}
              firstName={firstName}
              profileCompleteness={profileCompleteness}
              setActiveTab={setActiveTab}
              heroAnimation={heroAnimation}
              quickActionsAnimation={quickActionsAnimation}
              projectsAnimation={projectsAnimation}
            />
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <CalendarTab
              calendarMonth={calendar.calendarMonth}
              setCalendarMonth={calendar.setCalendarMonth}
              calendarYear={calendar.calendarYear}
              setCalendarYear={calendar.setCalendarYear}
              selectedCalendarDate={calendar.selectedCalendarDate}
              setSelectedCalendarDate={calendar.setSelectedCalendarDate}
              calendarView={calendar.calendarView}
              setCalendarView={calendar.setCalendarView}
              calendarEvents={calendar.calendarEvents}
              showEventModal={calendar.showEventModal}
              editingEvent={calendar.editingEvent}
              eventForm={calendar.eventForm}
              setEventForm={calendar.setEventForm}
              loading={calendar.loading}
              openEventModal={calendar.openEventModal}
              handleCreateEvent={calendar.handleCreateEvent}
              handleDeleteEvent={calendar.handleDeleteEvent}
              resetEventForm={calendar.resetEventForm}
              matches={matches}
              calendarAnimation={calendarAnimation}
              setActiveTab={setActiveTab}
            />
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              {!isEditMode ? (
                <ProfileView
                  firstName={firstName}
                  lastName={lastName}
                  profilePictureUrl={profilePictureUrl}
                  bannerUrl={bannerUrl}
                  bannerInputRef={bannerInputRef}
                  handleBannerFileSelect={handleBannerFileSelect}
                  handleBannerRemove={handleBannerRemove}
                  bio={bio}
                  experienceYears={experienceYears}
                  hourlyRate={hourlyRate}
                  availability={availability}
                  selectedProfessions={selectedProfessions}
                  skills={skills}
                  missionTypes={missionTypes}
                  preferredClientTypes={preferredClientTypes}
                  preferredCollabTypes={preferredCollabTypes}
                  minimumBudget={minimumBudget}
                  exclusions={exclusions}
                  city={city}
                  country={country}
                  websiteUrl={websiteUrl}
                  linkedinUrl={linkedinUrl}
                  instagramUrl={instagramUrl}
                  twitterUrl={twitterUrl}
                  youtubeUrl={youtubeUrl}
                  portfolios={portfolios}
                  setLightboxPortfolio={setLightboxPortfolio}
                  portfolioRef={portfolioRef}
                  aboutRef={aboutRef}
                  profileHeaderAnimation={profileHeaderAnimation}
                  personalInfoAnimation={personalInfoAnimation}
                  professionsAnimation={professionsAnimation}
                  skillsAnimation={skillsAnimation}
                  softwareAnimation={softwareAnimation}
                  setIsEditMode={setIsEditMode}
                  setActiveTab={setActiveTab}
                  profileCompleteness={profileCompleteness}
                />
              ) : (
                <div className="space-y-4">
                  {/* Edit mode header */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="relative px-6 py-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsEditMode(false)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">Modifier le profil</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 mr-4">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${profileCompleteness >= 80 ? 'bg-green-500' : profileCompleteness >= 50 ? 'bg-yellow-500' : 'bg-purple-500'}`} style={{ width: `${profileCompleteness}%` }} />
                          </div>
                          <span className="text-sm text-gray-500">{profileCompleteness}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Informations personnelles */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('personal')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Informations personnelles</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.personal ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.personal && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-5">
                          {/* Photo de profil inline */}
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <ProfilePictureUpload
                              currentImageUrl={profilePictureUrl || undefined}
                              onUploadSuccess={handleProfilePictureUpload}
                              onRemove={handleProfilePictureRemove}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Prénom</label>
                              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Votre prénom" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nom</label>
                              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Votre nom" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Expérience (années)</label>
                              <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="5" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Tarif horaire (€)</label>
                              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Disponibilité</label>
                              <select value={availability} onChange={(e) => setAvailability(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="Disponible">Disponible</option>
                                <option value="Partiellement disponible">Partiellement</option>
                                <option value="Non disponible">Indisponible</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Ville</label>
                              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Paris" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1.5">Pays</label>
                              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="France" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">À propos</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={10}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Présentez-vous de manière détaillée : votre parcours, votre approche créative, vos valeurs, ce qui vous passionne..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Métiers & Spécialités */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('professions')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Métiers & Spécialités</span>
                          {selectedProfessions.length > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">{selectedProfessions.length}</span>
                          )}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.professions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.professions && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-5">
                          {/* Add profession */}
                          <div className="flex gap-2">
                            <select value={selectedProfessionId} onChange={(e) => setSelectedProfessionId(e.target.value)}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                              <option value="">Ajouter un métier...</option>
                              {professions.filter(p => !selectedProfessions.some(sp => sp.profession?.id === p.id)).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <button type="button" onClick={handleAddProfession}
                              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          {/* Selected professions */}
                          <div className="flex flex-wrap gap-2">
                            {selectedProfessions.map((sp) => (
                              <span key={sp.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                                {sp.profession?.name}
                                {sp.isPrimary && <span className="text-xs bg-indigo-200 px-1.5 py-0.5 rounded">Principal</span>}
                                <button type="button" onClick={() => handleRemoveProfession(sp.id)} className="hover:text-indigo-900 ml-1">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* Mission types */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Types de missions recherchées</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {MISSION_TYPES.map((type) => (
                                <button key={type.id} type="button" onClick={() => toggleMissionType(type.label)}
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${missionTypes.includes(type.label)
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Autre spécialité</label>
                            <input type="text" value={otherMissionType} onChange={(e) => setOtherMissionType(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Ex: Sound design, Copywriting..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Compétences & Logiciels */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('skills')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Logiciels & Outils</span>
                          {skills.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{skills.length}</span>
                          )}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.skills ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.skills && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-4">
                          {/* Add skill form */}
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="relative">
                                <input
                                  ref={skillInputRef}
                                  type="text"
                                  placeholder="Nom du logiciel"
                                  value={newSkillName}
                                  onChange={(e) => {
                                    setNewSkillName(e.target.value);
                                    setShowSkillSuggestions(e.target.value.length > 0);
                                  }}
                                  onFocus={() => setShowSkillSuggestions(newSkillName.length > 0)}
                                  onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                />
                                {showSkillSuggestions && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {SOFTWARE_SUGGESTIONS
                                      .filter(s =>
                                        s.toLowerCase().includes(newSkillName.toLowerCase()) &&
                                        !skills.some(skill => skill.softwareName.toLowerCase() === s.toLowerCase())
                                      )
                                      .slice(0, 8)
                                      .map((suggestion) => (
                                        <button
                                          key={suggestion}
                                          type="button"
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors"
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setNewSkillName(suggestion);
                                            setShowSkillSuggestions(false);
                                          }}
                                        >
                                          <SoftwareIcon name={suggestion} className="w-5 h-5" />
                                          <span>{suggestion}</span>
                                        </button>
                                      ))}
                                    {SOFTWARE_SUGGESTIONS.filter(s =>
                                      s.toLowerCase().includes(newSkillName.toLowerCase()) &&
                                      !skills.some(skill => skill.softwareName.toLowerCase() === s.toLowerCase())
                                    ).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                          Utiliser "{newSkillName}" comme nom personnalis
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                              <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                                {SKILL_LEVELS.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
                              </select>
                              <input type="number" placeholder="Années" value={newSkillYears} onChange={(e) => setNewSkillYears(e.target.value)} min="0"
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" />
                              <button onClick={handleAddSkill}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                                Ajouter
                              </button>
                            </div>
                          </div>
                          {/* Skills grid */}
                          {skills.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {skills.map((skill) => (
                                <div key={skill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg group hover:border-blue-200 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <SoftwareIcon name={skill.softwareName} />
                                    <div>
                                      <span className="font-medium text-gray-900 text-sm">{skill.softwareName}</span>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`px-1.5 py-0.5 text-xs rounded ${skill.proficiencyLevel === 'EXPERT' ? 'bg-purple-100 text-purple-700' :
                                          skill.proficiencyLevel === 'SENIOR' ? 'bg-blue-100 text-blue-700' :
                                            skill.proficiencyLevel === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                          }`}>{SKILL_LEVELS.find(l => l.value === skill.proficiencyLevel)?.label}</span>
                                        {skill.yearsOfUse && <span className="text-xs text-gray-400">{skill.yearsOfUse}a</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <button onClick={() => handleRemoveSkill(skill.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center py-6 text-gray-400 text-sm">Ajoutez vos logiciels et outils maîtrisés</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Préférences de collaboration */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('preferences')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Préférences de collaboration</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.preferences ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.preferences && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-5">
                          {/* Client types */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Clients préférés</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {CLIENT_TYPES.map((type) => (
                                <button key={type.id} type="button" onClick={() => toggleClientType(type.label)}
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${preferredClientTypes.includes(type.label)
                                    ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Collab types */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Format de collaboration</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {COLLAB_TYPES.map((type) => (
                                <button key={type.id} type="button" onClick={() => toggleCollabType(type.label)}
                                  className={`p-3 rounded-lg border text-left transition-all ${preferredCollabTypes.includes(type.label)
                                    ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                  <span className={`font-medium text-sm block ${preferredCollabTypes.includes(type.label) ? 'text-green-700' : 'text-gray-700'}`}>
                                    {type.label}
                                  </span>
                                  <span className="text-xs text-gray-400">{type.duration}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Budget minimum */}
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Budget minimum par projet</label>
                            <div className="relative max-w-xs">
                              <input type="number" value={minimumBudget} onChange={(e) => setMinimumBudget(e.target.value)} placeholder="0" min="0"
                                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Exclusions */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('exclusions')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">Ce que je ne fais pas</span>
                          {exclusions.length > 0 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium">{exclusions.length}</span>
                          )}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.exclusions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.exclusions && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-4">
                          <div className="flex gap-2">
                            <input type="text" value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())} placeholder="Ex: Pas de rush, Pas de NFT..."
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            <button type="button" onClick={addExclusion}
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                              Ajouter
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {exclusions.map((exclusion, index) => (
                              <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm">
                                {exclusion}
                                <button type="button" onClick={() => removeExclusion(exclusion)} className="hover:text-red-900">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </span>
                            ))}
                            {exclusions.length === 0 && <p className="text-gray-400 text-sm">Aucune exclusion définie</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Liens sociaux */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('socialLinks')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Liens sociaux & web</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.socialLinks ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {openSections.socialLinks && (
                      <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600 mb-4">Ajoutez vos liens pour permettre aux créateurs de découvrir votre travail</p>

                          {/* Site web */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                              </svg>
                              Site web
                            </label>
                            <input
                              type="url"
                              value={websiteUrl}
                              onChange={(e) => setWebsiteUrl(e.target.value)}
                              placeholder="https://votresite.com"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* LinkedIn */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              value={linkedinUrl}
                              onChange={(e) => setLinkedinUrl(e.target.value)}
                              placeholder="https://linkedin.com/in/votreprofil"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Instagram */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              Instagram
                            </label>
                            <input
                              type="url"
                              value={instagramUrl}
                              onChange={(e) => setInstagramUrl(e.target.value)}
                              placeholder="https://instagram.com/votreprofil"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Twitter / X */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              Twitter / X
                            </label>
                            <input
                              type="url"
                              value={twitterUrl}
                              onChange={(e) => setTwitterUrl(e.target.value)}
                              placeholder="https://x.com/votreprofil"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* YouTube */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                              YouTube
                            </label>
                            <input
                              type="url"
                              value={youtubeUrl}
                              onChange={(e) => setYoutubeUrl(e.target.value)}
                              placeholder="https://youtube.com/@votrecanal"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Notifications */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection('notifications')}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">Notifications</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openSections.notifications ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSections.notifications && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-5 space-y-4">
                          <p className="text-sm text-gray-500 mb-4">Choisissez quelles notifications vous souhaitez recevoir</p>

                          {/* Toggle switches */}
                          <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900">Nouveaux matchs</span>
                                  <p className="text-xs text-gray-500">Quand un créateur vous propose un projet</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotifyNewMatch(!notifyNewMatch)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifyNewMatch ? 'bg-purple-600' : 'bg-gray-300'}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifyNewMatch ? 'translate-x-5' : ''}`} />
                              </button>
                            </label>

                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900">Messages</span>
                                  <p className="text-xs text-gray-500">Quand vous recevez un nouveau message</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotifyMessage(!notifyMessage)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifyMessage ? 'bg-purple-600' : 'bg-gray-300'}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifyMessage ? 'translate-x-5' : ''}`} />
                              </button>
                            </label>

                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900">Mises à jour de projets</span>
                                  <p className="text-xs text-gray-500">Changements de statut sur vos missions</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setNotifyProjectUpdate(!notifyProjectUpdate)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${notifyProjectUpdate ? 'bg-purple-600' : 'bg-gray-300'}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifyProjectUpdate ? 'translate-x-5' : ''}`} />
                              </button>
                            </label>

                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">Notifications par email</span>
                                    <p className="text-xs text-gray-500">Recevoir également par email</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setNotifyEmail(!notifyEmail)}
                                  className={`relative w-11 h-6 rounded-full transition-colors ${notifyEmail ? 'bg-purple-600' : 'bg-gray-300'}`}
                                >
                                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifyEmail ? 'translate-x-5' : ''}`} />
                                </button>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-lg shadow-purple-500/25"
                  >
                    {loading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (
            <MissionsTab
              matches={matches}
              expandedMission={missions.expandedMission}
              setExpandedMission={missions.setExpandedMission}
              handleRespondToMatch={handleRespondToMatch}
              handleUpdateProjectStatus={handleUpdateProjectStatus}
              matchesAnimation={matchesAnimation}
              setActiveTab={setActiveTab}
              conversations={messaging.conversations}
              selectConversation={selectConversation}
            />
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <PortfolioTab
              portfolios={portfolio.portfolios}
              showPortfolioForm={portfolio.showPortfolioForm}
              setShowPortfolioForm={portfolio.setShowPortfolioForm}
              editingPortfolio={portfolio.editingPortfolio}
              portfolioForm={portfolio.portfolioForm}
              setPortfolioForm={portfolio.setPortfolioForm}
              imagePreview={portfolio.imagePreview}
              setImagePreview={portfolio.setImagePreview}
              uploading={portfolio.uploading}
              fileInputRef={portfolio.fileInputRef}
              resetPortfolioForm={portfolio.resetPortfolioForm}
              startEditPortfolio={portfolio.startEditPortfolio}
              handleFileChange={portfolio.handleFileChange}
              handleDrop={portfolio.handleDrop}
              handleDragOver={portfolio.handleDragOver}
              handleAddPortfolio={portfolio.handleAddPortfolio}
              handleUpdatePortfolio={portfolio.handleUpdatePortfolio}
              handleRemovePortfolio={portfolio.handleRemovePortfolio}
              portfolioGridAnimation={portfolioGridAnimation}
              mediaFiles={portfolio.mediaFiles}
              mediaInputRef={portfolio.mediaInputRef}
              handleMediaInputChange={portfolio.handleMediaInputChange}
              handleMediaDrop={portfolio.handleMediaDrop}
              removeMediaFile={portfolio.removeMediaFile}
              deleteExistingMedia={portfolio.deleteExistingMedia}
              reorderMediaFiles={portfolio.reorderMediaFiles}
            />
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <MessagesTab
              conversations={messaging.conversations}
              selectedConversation={messaging.selectedConversation}
              setSelectedConversation={messaging.setSelectedConversation}
              chatMessages={messaging.chatMessages}
              newMessage={messaging.newMessage}
              setNewMessage={messaging.setNewMessage}
              sendingMessage={messaging.sendingMessage}
              messagesEndRef={messaging.messagesEndRef}
              unreadCount={unreadCount}
              selectConversation={selectConversation}
              handleSendMessage={handleSendMessage}
              messagesAnimation={messagesAnimation}
              userId={user?.id}
            />
          )}

          {/* EXPLORE TAB */}
          {activeTab === 'explore' && (
            <ExploreTab />
          )}
        </main>
      </div>


      {/* Banner Editor Modal */}
      {showBannerEditor && bannerPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Ajuster votre bannière</h3>
                <p className="text-sm text-gray-500 mt-0.5">Glissez pour repositionner, utilisez le zoom pour ajuster</p>
              </div>
              <button
                onClick={handleBannerEditorClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Preview Area */}
              <div
                ref={bannerContainerRef}
                className="relative bg-gray-900 rounded-xl overflow-hidden mb-4 select-none w-full"
                style={{ aspectRatio: '3 / 1' }}
              >
                <div
                  className={`absolute inset-0 flex items-center justify-center touch-none ${isBannerDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  onMouseDown={handleBannerMouseDown}
                  onMouseMove={handleBannerMouseMove}
                  onMouseUp={handleBannerMouseUp}
                  onMouseLeave={handleBannerMouseUp}
                >
                  <img
                    ref={bannerImageRef}
                    src={bannerPreview}
                    alt="Banner Preview"
                    className="select-none"
                    style={{
                      maxWidth: '150%',
                      maxHeight: '150%',
                      width: 'auto',
                      height: 'auto',
                      transform: `translate(${bannerPosition.x}px, ${bannerPosition.y}px) scale(${bannerZoom})`,
                      transformOrigin: 'center center',
                      transition: isBannerDragging ? 'none' : 'transform 0.2s ease-out',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}
                    draggable={false}
                  />
                </div>

                {/* Instructions */}
                <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
                  <div className={`inline-block text-white text-sm px-4 py-2 rounded-full transition-all ${isBannerDragging ? 'bg-purple-600/90' : 'bg-black/50'
                    }`}>
                    {isBannerDragging ? 'Déplacement en cours...' : 'Glissez pour repositionner'}
                  </div>
                </div>
              </div>

              {/* Zoom Control */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Zoom</label>
                  <span className="text-sm text-gray-500">{bannerZoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBannerZoom(Math.max(0.5, bannerZoom - 0.1))}
                    disabled={bannerZoom <= 0.5}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={bannerZoom}
                    onChange={(e) => setBannerZoom(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setBannerZoom(Math.min(3, bannerZoom + 0.1))}
                    disabled={bannerZoom >= 3}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  setBannerZoom(1);
                  setBannerPosition({ x: 0, y: 0 });
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réinitialiser
              </button>

              {/* Upload Progress */}
              {bannerUploading && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm text-purple-700 font-medium">Upload en cours...</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleBannerEditorClose}
                  disabled={bannerUploading}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50 font-medium hover:scale-[1.02] active:scale-[0.98]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBannerSave}
                  disabled={bannerUploading}
                  className="flex-1 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {bannerUploading ? 'Upload...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio View Modal (Behance-style) */}
      {lightboxPortfolio && (
        <PortfolioViewModal
          portfolio={lightboxPortfolio}
          onClose={() => setLightboxPortfolio(null)}
          onEdit={(p) => {
            setLightboxPortfolio(null);
            setActiveTab('portfolio');
            portfolio.startEditPortfolio(p);
          }}
        />
      )}
    </div>
  );
}
