import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { professionalApi, uploadApi, matchingApi, calendarApi } from '../services/api';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import NotificationDropdown from '../components/NotificationDropdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

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
];

const MenuIcon = ({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    chart: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    calendar: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    user: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    clipboard: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    settings: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    code: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    image: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    chat: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  };
  return icons[icon] || null;
};

export default function ProfessionalProfile() {
  useDocumentTitle('Mon Profil | JUNY');

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
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
  const [professions, setProfessions] = useState<any[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<any[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('CONFIRMED');
  const [newSkillYears, setNewSkillYears] = useState('');
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', imageUrl: '', projectUrl: '', projectType: '', tags: '',
    clientType: '', projectGoal: '', roleDescription: '', projectDuration: '',
    projectImpact: '', projectYear: '', isFeatured: false,
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    professions: true,
    skills: true,
    preferences: false,
    exclusions: false,
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

  // Calendar state
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'year'>('month');
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    type: 'TIME_OFF' as 'TIME_OFF' | 'EXTERNAL_MISSION' | 'REMINDER',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isAllDay: true,
    color: '#8B5CF6',
    clientName: '',
    budget: '',
  });

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

  const loadAllData = async () => {
    await Promise.all([loadProfile(), loadProfessions(), loadMessages(), loadMatches(), loadDashboardStats(), loadConversations(), loadCalendarEvents()]);
  };

  const loadCalendarEvents = async () => {
    try {
      const response = await calendarApi.getEvents();
      if (response.success) {
        setCalendarEvents(response.data || []);
      }
    } catch (err: any) {
      console.error('Error loading calendar events:', err);
    }
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const data: any = {
        type: eventForm.type,
        title: eventForm.title,
        startDate: eventForm.startDate,
        isAllDay: eventForm.isAllDay,
        color: eventForm.color,
      };
      if (eventForm.description) data.description = eventForm.description;
      if (eventForm.endDate) data.endDate = eventForm.endDate;
      if (eventForm.type === 'EXTERNAL_MISSION') {
        if (eventForm.clientName) data.clientName = eventForm.clientName;
        if (eventForm.budget) data.budget = parseFloat(eventForm.budget);
      }

      if (editingEvent) {
        await calendarApi.updateEvent(editingEvent.id, data);
      } else {
        await calendarApi.createEvent(data);
      }
      await loadCalendarEvents();
      setShowEventModal(false);
      resetEventForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await calendarApi.deleteEvent(eventId);
      await loadCalendarEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      type: 'TIME_OFF',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isAllDay: true,
      color: '#8B5CF6',
      clientName: '',
      budget: '',
    });
    setEditingEvent(null);
  };

  const openEventModal = (date?: Date, event?: any) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        type: event.type,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate ? event.endDate.split('T')[0] : '',
        isAllDay: event.isAllDay,
        color: event.color || '#8B5CF6',
        clientName: event.clientName || '',
        budget: event.budget ? String(event.budget) : '',
      });
    } else {
      resetEventForm();
      if (date) {
        setEventForm(prev => ({
          ...prev,
          startDate: date.toISOString().split('T')[0],
        }));
      }
    }
    setShowEventModal(true);
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
    try {
      const response = await professionalApi.respondToMatch(matchId, status);
      if (response.success) {
        setMatches(matches.map(m => m.id === matchId ? { ...m, status } : m));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réponse');
    }
  };

  const handleUpdateProjectStatus = async (matchId: string, projectStatus: string) => {
    try {
      const response = await matchingApi.updateProjectStatus(matchId, { projectStatus });
      if (response.success) {
        setMatches(matches.map(m => m.id === matchId ? { ...m, projectStatus } : m));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const loadProfile = async () => {
    try {
      const response = await professionalApi.getProfile();
      if (response.success) {
        const data = response.data;
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setProfilePictureUrl(data.profilePictureUrl || null);
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
    try {
      const response = await matchingApi.getConversationsProfessional();
      if (response.success) {
        setConversations(response.data);
        const totalUnread = response.data.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (err: any) {
      console.error('Error loading conversations:', err);
    }
  };

  const selectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    try {
      const response = await matchingApi.getMessages(conv.id);
      if (response.success) {
        setChatMessages(response.data);
        // Update unread count locally
        setConversations(prev => prev.map(c =>
          c.id === conv.id ? { ...c, unreadCount: 0 } : c
        ));
        setUnreadCount(prev => Math.max(0, prev - (conv.unreadCount || 0)));
      }
    } catch (err: any) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    setSendingMessage(true);
    try {
      const response = await matchingApi.sendMessage(selectedConversation.id, { content: newMessage.trim() });
      if (response.success) {
        setChatMessages(prev => [...prev, response.data]);
        setNewMessage('');
        // Update last message in conversations list
        setConversations(prev => prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: response.data, messages: [...c.messages, response.data] }
            : c
        ));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
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

  const resetPortfolioForm = () => {
    setPortfolioForm({
      title: '', description: '', imageUrl: '', projectUrl: '', projectType: '', tags: '',
      clientType: '', projectGoal: '', roleDescription: '', projectDuration: '',
      projectImpact: '', projectYear: '', isFeatured: false,
    });
    setEditingPortfolio(null);
    setShowPortfolioForm(false);
    setImagePreview(null);
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title) return;
    try {
      const response = await professionalApi.addPortfolio({
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageUrl: portfolioForm.imageUrl,
        projectUrl: portfolioForm.projectUrl || undefined,
        projectType: portfolioForm.projectType,
        tags: portfolioForm.tags ? portfolioForm.tags.split(',').map(t => t.trim()) : [],
        isFeatured: portfolioForm.isFeatured,
        clientType: portfolioForm.clientType,
        projectGoal: portfolioForm.projectGoal,
        roleDescription: portfolioForm.roleDescription,
        projectDuration: portfolioForm.projectDuration,
        projectImpact: portfolioForm.projectImpact,
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      });
      if (response.success) {
        // If this project is featured, update local state to unfeatured others
        if (portfolioForm.isFeatured) {
          setPortfolios([response.data, ...portfolios.map(p => ({ ...p, isFeatured: false }))]);
        } else {
          setPortfolios([response.data, ...portfolios]);
        }
        resetPortfolioForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio || !portfolioForm.title) return;
    try {
      const response = await professionalApi.updatePortfolio(editingPortfolio.id, {
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageUrl: portfolioForm.imageUrl,
        projectUrl: portfolioForm.projectUrl || undefined,
        projectType: portfolioForm.projectType,
        isFeatured: portfolioForm.isFeatured,
        clientType: portfolioForm.clientType,
        projectGoal: portfolioForm.projectGoal,
        roleDescription: portfolioForm.roleDescription,
        projectDuration: portfolioForm.projectDuration,
        projectImpact: portfolioForm.projectImpact,
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      });
      if (response.success) {
        // If this project is featured, update local state to unfeatured others
        if (portfolioForm.isFeatured) {
          setPortfolios(portfolios.map(p =>
            p.id === editingPortfolio.id ? response.data : { ...p, isFeatured: false }
          ));
        } else {
          setPortfolios(portfolios.map(p => p.id === editingPortfolio.id ? response.data : p));
        }
        resetPortfolioForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const startEditPortfolio = (portfolio: any) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title || '',
      description: portfolio.description || '',
      imageUrl: portfolio.imageUrl || '',
      projectUrl: portfolio.projectUrl || '',
      projectType: portfolio.projectType || '',
      tags: portfolio.tags?.map((t: any) => t.tag).join(', ') || '',
      clientType: portfolio.clientType || '',
      projectGoal: portfolio.projectGoal || '',
      roleDescription: portfolio.roleDescription || '',
      projectDuration: portfolio.projectDuration || '',
      projectImpact: portfolio.projectImpact || '',
      projectYear: portfolio.projectYear?.toString() || '',
      isFeatured: portfolio.isFeatured || false,
    });
    setImagePreview(portfolio.imageUrl || null);
    setShowPortfolioForm(true);
  };

  const handleRemovePortfolio = async (id: string) => {
    try {
      await professionalApi.removePortfolio(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadApi.uploadPortfolioImage(file);
      if (response.success) {
        setPortfolioForm({ ...portfolioForm, imageUrl: response.data.imageUrl });
        setImagePreview(response.data.imageUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="JUNY Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold logo-gradient">JUNY</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Badge */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              Professionnel
            </span>
            {/* Profile completeness */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
        <nav className="p-4">
          <ul className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-gray-400'}>
                      <MenuIcon icon={item.icon} />
                    </span>
                    {item.label}
                    {item.id === 'messages' && unreadCount > 0 && (
                      <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Sidebar Footer - Settings & Logout */}
        <div className="p-4 pb-6 mt-auto">
          <div className="mx-2 mb-4 border-t border-gray-200"></div>
          <Link
            to="/settings"
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title - visible on mobile */}
            <h1 className="lg:hidden text-lg font-semibold text-gray-900">
              {MENU_ITEMS.find(item => item.id === activeTab)?.label || 'Tableau de bord'}
            </h1>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile Quick Access - Desktop */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {firstName} {lastName}
                  </p>
                  <p className="text-xs text-gray-500">Professionnel</p>
                </div>
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {firstName ? firstName[0]?.toUpperCase() : '?'}
                  </div>
                )}
              </div>
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
            <div className="space-y-6">
              {/* Welcome header with key metrics */}
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-500 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <h1 className="text-2xl font-bold mb-1">
                    Bonjour{firstName ? ` ${firstName}` : ''}
                  </h1>
                  <p className="text-purple-200 mb-6">
                    Voici votre activité sur JUNY
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{dashboardStats?.stats?.activeMissions || 0}</div>
                      <div className="text-sm text-purple-200">Projets en cours</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{dashboardStats?.stats?.pendingMissions || 0}</div>
                      <div className="text-sm text-purple-200">En attente</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{dashboardStats?.stats?.totalMatches || 0}</div>
                      <div className="text-sm text-purple-200">Matchs totaux</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                      <div className="text-3xl font-bold">{dashboardStats?.stats?.recommendationAppearances || 0}</div>
                      <div className="text-sm text-purple-200">Recommandations</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('missions')}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">Missions</div>
                    <div className="text-xs text-gray-500">Voir mes missions</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">Messages</div>
                    <div className="text-xs text-gray-500">Conversations</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">Portfolio</div>
                    <div className="text-xs text-gray-500">Mes travaux</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">Profil</div>
                    <div className="text-xs text-gray-500">Modifier</div>
                  </div>
                </button>
              </div>

              {/* Two-column layout: Active projects + Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active projects - takes 2 cols */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Projets en cours</h2>
                    {(dashboardStats?.activeProjects?.length > 0) && (
                      <button onClick={() => setActiveTab('missions')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                        Voir tout
                      </button>
                    )}
                  </div>
                  {dashboardStats?.activeProjects?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.activeProjects.map((project: any) => {
                        const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                          NOT_STARTED: { label: 'Non commencé', color: 'text-gray-600', bg: 'bg-gray-100' },
                          IN_PROGRESS: { label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-100' },
                          REVIEW: { label: 'En revue', color: 'text-amber-600', bg: 'bg-amber-100' },
                        };
                        const status = statusConfig[project.projectStatus] || statusConfig.NOT_STARTED;
                        return (
                          <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {project.projectTitle || 'Projet sans titre'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                <span>{project.clientName}</span>
                                {project.clientIndustry && <span>- {project.clientIndustry}</span>}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="font-medium">Aucun projet en cours</p>
                      <p className="text-sm mt-1">Les projets acceptés apparaîtront ici</p>
                    </div>
                  )}
                </div>

                {/* Right column: Performance stats */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Performance</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Note moyenne</div>
                            <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.averageRating?.toFixed(1) || '-'}<span className="text-sm font-normal text-gray-400"> / 5</span></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{dashboardStats?.stats?.totalRatings || 0} avis</span>
                      </div>
                      <div className="border-t border-gray-100" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Projets finalisés</div>
                            <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.projectsCompleted || 0}</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-100" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-pink-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Ajouté en favoris</div>
                            <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.favoritesCount || 0}</div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-100" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Vues profil</div>
                            <div className="text-lg font-bold text-gray-900">{dashboardStats?.stats?.recommendationAppearances || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile completeness */}
                  {profileCompleteness < 100 && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-purple-800">Profil</span>
                        <span className="text-sm font-bold text-purple-600">{profileCompleteness}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2 mb-3">
                        <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${profileCompleteness}%` }} />
                      </div>
                      <p className="text-xs text-purple-600 mb-3">Un profil complet attire plus de créateurs</p>
                      <button
                        onClick={() => setActiveTab('profile')}
                        className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Compléter mon profil
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed projects */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Projets finalisés</h2>
                {dashboardStats?.completedProjects?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardStats.completedProjects.map((project: any) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {project.projectTitle || 'Projet'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{project.clientName}</span>
                            {project.clientIndustry && <span>- {project.clientIndustry}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {project.rating && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <span>★</span>
                              <span className="text-sm font-medium">{project.rating}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(project.completedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Aucun projet finalisé</p>
                    <p className="text-sm">Vos projets terminés apparaîtront ici</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (() => {
            const missionsWithDates = matches.filter((m: any) => m.status === 'ACCEPTED');
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const monthNamesFull = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

            const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
            const getFirstDayOfMonth = (month: number, year: number) => {
              const d = new Date(year, month, 1).getDay();
              return d === 0 ? 6 : d - 1;
            };

            const getDayMissions = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
              const date = new Date(year, month, day);
              return missionsWithDates.filter((m: any) => new Date(m.updatedAt).toDateString() === date.toDateString());
            };

            const getDayEvents = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
              const date = new Date(year, month, day);
              return calendarEvents.filter((e: any) => {
                const start = new Date(e.startDate);
                const end = e.endDate ? new Date(e.endDate) : start;
                return date >= new Date(start.toDateString()) && date <= new Date(end.toDateString());
              });
            };

            const isToday = (day: number, month: number = calendarMonth, year: number = calendarYear) => {
              const now = new Date();
              return day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            };

            const selectedEvents = selectedCalendarDate
              ? getDayEvents(selectedCalendarDate.getDate(), selectedCalendarDate.getMonth(), selectedCalendarDate.getFullYear())
              : [];

            const eventTypeConfig: Record<string, { label: string; icon: string; defaultColor: string }> = {
              TIME_OFF: { label: 'Période off', icon: '🏖️', defaultColor: '#EF4444' },
              EXTERNAL_MISSION: { label: 'Mission externe', icon: '💼', defaultColor: '#3B82F6' },
              REMINDER: { label: 'Rappel', icon: '🔔', defaultColor: '#F59E0B' },
            };

            const selectedMissions = selectedCalendarDate
              ? getDayMissions(selectedCalendarDate.getDate(), selectedCalendarDate.getMonth(), selectedCalendarDate.getFullYear())
              : [];

            // Get upcoming deadlines (missions with deadline dates sorted by closest first)
            const upcomingDeadlines = missionsWithDates
              .filter((m: any) => {
                // For now, use updatedAt as a proxy for deadline, or you can add a deadline field later
                const deadlineDate = new Date(m.updatedAt);
                return deadlineDate >= new Date() && m.projectStatus !== 'COMPLETED';
              })
              .sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
              .slice(0, 5);

            const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
              NOT_STARTED: { label: 'À démarrer', color: 'text-gray-600', bg: 'bg-gray-100' },
              IN_PROGRESS: { label: 'En cours', color: 'text-blue-600', bg: 'bg-blue-100' },
              REVIEW: { label: 'En revue', color: 'text-amber-600', bg: 'bg-amber-100' },
              COMPLETED: { label: 'Terminé', color: 'text-green-600', bg: 'bg-green-100' },
            };

            // Calculate monthly stats
            const monthEvents = calendarEvents.filter((e: any) => {
              const start = new Date(e.startDate);
              return start.getMonth() === calendarMonth && start.getFullYear() === calendarYear;
            });
            const timeOffDays = monthEvents.filter((e: any) => e.type === 'TIME_OFF').reduce((acc: number, e: any) => {
              const start = new Date(e.startDate);
              const end = e.endDate ? new Date(e.endDate) : start;
              return acc + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            }, 0);
            const externalMissions = monthEvents.filter((e: any) => e.type === 'EXTERNAL_MISSION');
            const externalRevenue = externalMissions.reduce((acc: number, e: any) => acc + (parseFloat(e.budget) || 0), 0);
            const junyMissions = missionsWithDates.filter((m: any) => {
              const date = new Date(m.updatedAt);
              return date.getMonth() === calendarMonth && date.getFullYear() === calendarYear;
            });
            const workingDays = getDaysInMonth(calendarMonth, calendarYear) - timeOffDays;

            return (
              <div className="flex gap-4">
                {/* Left column - Calendar + Monthly Overview */}
                <div className="flex-1 flex flex-col gap-4">
                  {/* Calendar section */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (calendarView === 'month') {
                            if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                            else { setCalendarMonth(calendarMonth - 1); }
                          } else {
                            setCalendarYear(calendarYear - 1);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCalendarView(calendarView === 'month' ? 'year' : 'month')}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors font-semibold text-gray-900"
                      >
                        {calendarView === 'month' ? `${monthNamesFull[calendarMonth]} ${calendarYear}` : calendarYear}
                      </button>
                      <button
                        onClick={() => {
                          if (calendarView === 'month') {
                            if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                            else { setCalendarMonth(calendarMonth + 1); }
                          } else {
                            setCalendarYear(calendarYear + 1);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => setCalendarView('month')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Mois
                        </button>
                        <button
                          onClick={() => setCalendarView('year')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${calendarView === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Année
                        </button>
                      </div>
                      <button
                        onClick={() => openEventModal()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Calendar Content */}
                  <div className="flex-1 p-4 overflow-auto">
                    {calendarView === 'month' ? (
                      <>
                        {/* Day names */}
                        <div className="grid grid-cols-7 mb-2">
                          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
                          ))}
                        </div>
                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                            <div key={`e-${i}`} className="h-12"></div>
                          ))}
                          {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                            const day = i + 1;
                            const dayMissions = getDayMissions(day);
                            const hasMissions = dayMissions.length > 0;
                            const dayEvents = getDayEvents(day);
                            const hasEvents = dayEvents.length > 0;
                            const hasTimeOff = dayEvents.some((e: any) => e.type === 'TIME_OFF');
                            const hasExternalMission = dayEvents.some((e: any) => e.type === 'EXTERNAL_MISSION');
                            const isTodayDay = isToday(day);
                            const isSelected = selectedCalendarDate?.getDate() === day && selectedCalendarDate?.getMonth() === calendarMonth && selectedCalendarDate?.getFullYear() === calendarYear;
                            return (
                              <button
                                key={day}
                                onClick={() => setSelectedCalendarDate(new Date(calendarYear, calendarMonth, day))}
                                className={`h-12 w-full rounded-lg text-sm font-medium transition-all relative flex flex-col items-center justify-start pt-1 ${
                                  isSelected ? 'bg-purple-600 text-white shadow-md' :
                                  hasTimeOff ? 'bg-red-50 text-red-600 border border-red-200' :
                                  isTodayDay ? 'bg-purple-100 text-purple-700 font-bold border-2 border-purple-300' :
                                  'hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200'
                                }`}
                              >
                                <span>{day}</span>
                                {(hasMissions || hasEvents) && (
                                  <div className="flex gap-0.5 mt-0.5">
                                    {hasMissions && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-purple-500'}`}></span>}
                                    {hasExternalMission && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-500'}`}></span>}
                                    {hasTimeOff && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Year view - 12 mini months */
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {Array.from({ length: 12 }).map((_, monthIdx) => {
                          const daysCount = getDaysInMonth(monthIdx, calendarYear);
                          const firstDay = getFirstDayOfMonth(monthIdx, calendarYear);
                          const isCurrentMonth = monthIdx === new Date().getMonth() && calendarYear === new Date().getFullYear();
                          return (
                            <button
                              key={monthIdx}
                              onClick={() => { setCalendarMonth(monthIdx); setCalendarView('month'); }}
                              className={`p-2 rounded-xl border transition-all hover:shadow-md ${isCurrentMonth ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}
                            >
                              <div className={`text-xs font-semibold mb-1.5 ${isCurrentMonth ? 'text-purple-700' : 'text-gray-700'}`}>
                                {monthNames[monthIdx]}
                              </div>
                              <div className="grid grid-cols-7 gap-px">
                                {Array.from({ length: firstDay }).map((_, i) => (
                                  <div key={`e-${i}`} className="w-3 h-3"></div>
                                ))}
                                {Array.from({ length: daysCount }).map((_, i) => {
                                  const day = i + 1;
                                  const isTodayDay = isToday(day, monthIdx, calendarYear);
                                  const hasMissions = getDayMissions(day, monthIdx, calendarYear).length > 0;
                                  const dayEvts = getDayEvents(day, monthIdx, calendarYear);
                                  const hasTimeOff = dayEvts.some((e: any) => e.type === 'TIME_OFF');
                                  const hasEvents = dayEvts.length > 0;
                                  return (
                                    <div
                                      key={day}
                                      className={`w-3 h-3 rounded-sm text-[6px] flex items-center justify-center ${
                                        isTodayDay ? 'bg-purple-600 text-white font-bold' :
                                        hasTimeOff ? 'bg-red-200' :
                                        hasMissions ? 'bg-purple-200 text-purple-700' :
                                        hasEvents ? 'bg-blue-200' :
                                        'text-gray-400'
                                      }`}
                                    >
                                      {isTodayDay || hasMissions || hasEvents ? '' : ''}
                                    </div>
                                  );
                                })}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick stats footer */}
                  <div className="px-3 py-2 border-t border-gray-100 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      <span className="text-xs text-gray-500">{missionsWithDates.filter((m: any) => m.projectStatus === 'IN_PROGRESS').length} missions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-xs text-gray-500">{calendarEvents.filter((e: any) => e.type === 'TIME_OFF').length} off</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-xs text-gray-500">{calendarEvents.filter((e: any) => e.type === 'EXTERNAL_MISSION').length} externes</span>
                    </div>
                  </div>
                </div>

                  {/* Monthly Overview Section */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Aperçu de {monthNamesFull[calendarMonth]}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Working Days */}
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">📅</span>
                          <span className="text-xs text-gray-500">Jours dispo</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{workingDays}</p>
                        <p className="text-[10px] text-gray-400">sur {getDaysInMonth(calendarMonth, calendarYear)} jours</p>
                      </div>

                      {/* Time Off */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🏖️</span>
                          <span className="text-xs text-gray-500">Jours off</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{timeOffDays}</p>
                        <p className="text-[10px] text-gray-400">{monthEvents.filter((e: any) => e.type === 'TIME_OFF').length} période(s)</p>
                      </div>

                      {/* JUNY Missions */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💜</span>
                          <span className="text-xs text-gray-500">JUNY</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{junyMissions.length}</p>
                        <p className="text-[10px] text-gray-400">mission(s) active(s)</p>
                      </div>

                      {/* External Revenue */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">💼</span>
                          <span className="text-xs text-gray-500">Externe</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{externalRevenue > 0 ? `${externalRevenue.toLocaleString()}€` : '—'}</p>
                        <p className="text-[10px] text-gray-400">{externalMissions.length} mission(s)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right panel - Deadlines + Selected day */}
                <div className="w-80 flex flex-col gap-3">
                  {/* Upcoming Deadlines Section */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-semibold text-gray-900 text-sm">Prochaines échéances</h3>
                    </div>
                    <div className="p-3">
                      {upcomingDeadlines.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs">Aucune échéance à venir</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {upcomingDeadlines.map((mission: any) => {
                            const deadlineDate = new Date(mission.updatedAt);
                            const daysUntil = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysUntil <= 3;
                            const status = statusConfig[mission.projectStatus] || statusConfig.NOT_STARTED;
                            return (
                              <div
                                key={mission.id}
                                className={`p-2.5 rounded-xl border transition-colors cursor-pointer hover:shadow-sm ${
                                  isUrgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
                                }`}
                                onClick={() => {
                                  setSelectedCalendarDate(deadlineDate);
                                  setCalendarMonth(deadlineDate.getMonth());
                                  setCalendarYear(deadlineDate.getFullYear());
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {mission.conversation?.projectTitle || 'Mission'}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{mission.conversation?.creator?.companyName}</p>
                                  </div>
                                  <div className={`text-right flex-shrink-0 ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                                    <p className="text-xs font-bold">{daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : `${daysUntil}j`}</p>
                                    <p className="text-[10px]">{deadlineDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.bg.replace('bg-', 'bg-').replace('100', '500')}`}></span>
                                  <span className={`text-[10px] ${status.color}`}>{status.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Day Section */}
                  <div className={`flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col transition-all ${selectedCalendarDate ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {selectedCalendarDate ? selectedCalendarDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Sélectionnez un jour'}
                        </h3>
                        <div className="flex items-center gap-1">
                          {selectedCalendarDate && (
                            <>
                              <button
                                onClick={() => openEventModal(selectedCalendarDate)}
                                className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-600"
                                title="Ajouter un événement"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                              <button onClick={() => setSelectedCalendarDate(null)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-3">
                      {!selectedCalendarDate ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">Cliquez sur un jour</p>
                        </div>
                      ) : (selectedMissions.length === 0 && selectedEvents.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-xs">Rien ce jour</p>
                          <button
                            onClick={() => openEventModal(selectedCalendarDate)}
                            className="mt-2 text-[10px] text-purple-600 hover:text-purple-700 font-medium"
                          >
                            + Ajouter un événement
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Events */}
                          {selectedEvents.map((event: any) => {
                            const typeConf = eventTypeConfig[event.type] || eventTypeConfig.REMINDER;
                            return (
                              <div
                                key={event.id}
                                className="p-2.5 rounded-xl border transition-colors group"
                                style={{ backgroundColor: `${event.color || typeConf.defaultColor}15`, borderColor: `${event.color || typeConf.defaultColor}40` }}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <span>{typeConf.icon}</span>
                                    <h4 className="font-medium text-gray-900 text-xs leading-tight">{event.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => openEventModal(undefined, event)}
                                      className="p-0.5 hover:bg-white/50 rounded text-gray-500 hover:text-gray-700"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(event.id)}
                                      className="p-0.5 hover:bg-white/50 rounded text-gray-500 hover:text-red-600"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[10px] text-gray-500">{typeConf.label}</p>
                                {event.type === 'EXTERNAL_MISSION' && event.clientName && (
                                  <p className="text-[10px] text-gray-600 mt-0.5">Client: {event.clientName}</p>
                                )}
                                {event.description && (
                                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                                )}
                              </div>
                            );
                          })}
                          {/* Missions */}
                          {selectedMissions.map((mission: any) => {
                            const status = statusConfig[mission.projectStatus] || statusConfig.NOT_STARTED;
                            return (
                              <div key={mission.id} className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 hover:bg-purple-100/50 transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-purple-600">📋</span>
                                    <h4 className="font-medium text-gray-900 text-xs leading-tight">
                                      {mission.conversation?.projectTitle || 'Mission'}
                                    </h4>
                                  </div>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium flex-shrink-0 ${status.color} ${status.bg}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mb-1.5">{mission.conversation?.creator?.companyName}</p>
                                <button
                                  onClick={() => setActiveTab('missions')}
                                  className="text-[10px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5"
                                >
                                  Voir les détails
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Profile header with quick summary */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="relative px-6 py-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-white">
                  <div className="flex items-center gap-4">
                    {/* Avatar with upload overlay */}
                    <div className="relative group">
                      {profilePictureUrl ? (
                        <img src={profilePictureUrl} alt="Profile" className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{firstName ? firstName[0]?.toUpperCase() : '?'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold text-gray-900 truncate">{firstName || 'Prénom'} {lastName || 'Nom'}</h1>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          availability === 'Disponible' ? 'bg-green-100 text-green-700' :
                          availability === 'Partiellement disponible' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            availability === 'Disponible' ? 'bg-green-500' :
                            availability === 'Partiellement disponible' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          {availability}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        {selectedProfessions[0]?.profession?.name && <span>{selectedProfessions[0].profession.name}</span>}
                        {experienceYears && <span className="text-gray-300">•</span>}
                        {experienceYears && <span>{experienceYears} ans d'exp.</span>}
                        {hourlyRate && <span className="text-gray-300">•</span>}
                        {hourlyRate && <span>{hourlyRate}€/h</span>}
                      </div>
                    </div>
                    {/* Profile completeness */}
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs text-gray-400 mb-1">Profil complété</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${profileCompleteness >= 80 ? 'bg-green-500' : profileCompleteness >= 50 ? 'bg-yellow-500' : 'bg-purple-500'}`} style={{ width: `${profileCompleteness}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{profileCompleteness}%</span>
                      </div>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" placeholder="Parlez de vous en quelques mots..." />
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
                          <input type="text" placeholder="Nom du logiciel" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm" />
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
                              <div>
                                <span className="font-medium text-gray-900 text-sm">{skill.softwareName}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                                    skill.proficiencyLevel === 'EXPERT' ? 'bg-purple-100 text-purple-700' :
                                    skill.proficiencyLevel === 'SENIOR' ? 'bg-blue-100 text-blue-700' :
                                    skill.proficiencyLevel === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>{SKILL_LEVELS.find(l => l.value === skill.proficiencyLevel)?.label}</span>
                                  {skill.yearsOfUse && <span className="text-xs text-gray-400">{skill.yearsOfUse}a</span>}
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

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (() => {
            const pendingMatches = matches.filter((m: any) => m.status === 'CONTACTED');
            const acceptedMatches = matches.filter((m: any) => m.status === 'ACCEPTED');
            const declinedMatches = matches.filter((m: any) => m.status === 'DECLINED');
            const proposedMatches = matches.filter((m: any) => m.status === 'PROPOSED');

            const MissionCard = ({ match, showActions = false }: { match: any; showActions?: boolean }) => (
              <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {match.conversation?.projectTitle || 'Projet sans titre'}
                        </h3>
                        {match.unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
                            {match.unreadCount} nouveau{match.unreadCount > 1 ? 'x' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="font-medium text-gray-700">
                          {match.conversation?.creator?.companyName || 'Entreprise'}
                        </span>
                        {match.conversation?.creator?.industry && (
                          <span className="text-gray-400">{match.conversation.creator.industry}</span>
                        )}
                        <span className="text-purple-600 font-semibold">{match.matchScore}%</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {match.conversation?.projectSummary || 'Pas de description'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedMission(expandedMission === match.id ? null : match.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <svg className={`w-5 h-5 transition-transform ${expandedMission === match.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showActions && (
                        <>
                          <button
                            onClick={() => handleRespondToMatch(match.id, 'ACCEPTED')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleRespondToMatch(match.id, 'DECLINED')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Décliner
                          </button>
                        </>
                      )}
                      {match.status === 'ACCEPTED' && (
                        <button
                          onClick={() => { setActiveTab('messages'); setTimeout(() => { const conv = conversations.find((c: any) => c.id === match.id); if (conv) selectConversation(conv); }, 200); }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          Messagerie
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedMission === match.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {/* Project status workflow - only for accepted missions */}
                    {match.status === 'ACCEPTED' && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Avancement du projet</p>
                        <div className="flex items-center gap-1">
                          {[
                            { key: 'NOT_STARTED', label: 'Non démarré', activeClass: 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' },
                            { key: 'IN_PROGRESS', label: 'En cours', activeClass: 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' },
                            { key: 'REVIEW', label: 'En review', activeClass: 'bg-amber-100 text-amber-700 ring-2 ring-amber-300' },
                            { key: 'COMPLETED', label: 'Terminé', activeClass: 'bg-green-100 text-green-700 ring-2 ring-green-300' },
                          ].map((step, i) => {
                            const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
                            const currentIdx = statuses.indexOf(match.projectStatus);
                            const stepIdx = statuses.indexOf(step.key);
                            const isActive = step.key === match.projectStatus;
                            const isPast = stepIdx < currentIdx;
                            const isNext = stepIdx === currentIdx + 1;

                            return (
                              <div key={step.key} className="flex items-center gap-1 flex-1">
                                <button
                                  onClick={() => isNext && handleUpdateProjectStatus(match.id, step.key)}
                                  disabled={!isNext}
                                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                                    isActive
                                      ? step.activeClass
                                      : isPast
                                      ? 'bg-green-50 text-green-600'
                                      : isNext
                                      ? 'bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600 cursor-pointer'
                                      : 'bg-gray-50 text-gray-400'
                                  }`}
                                  title={isNext ? `Passer à "${step.label}"` : ''}
                                >
                                  {isPast ? (
                                    <svg className="w-3.5 h-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    step.label
                                  )}
                                </button>
                                {i < 3 && (
                                  <svg className={`w-4 h-4 flex-shrink-0 ${isPast ? 'text-green-400' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick actions for accepted */}
                    {match.status === 'ACCEPTED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setActiveTab('messages'); setTimeout(() => { const conv = conversations.find((c: any) => c.id === match.id); if (conv) selectConversation(conv); }, 200); }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Envoyer un message
                        </button>
                        {match.projectStatus === 'COMPLETED' && (
                          <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Projet terminé
                          </span>
                        )}
                      </div>
                    )}

                    {/* Match info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Score de compatibilité</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${match.matchScore}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-purple-600">{match.matchScore}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Reçu le</p>
                        <p className="text-sm text-gray-700">
                          {new Date(match.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {match.reasoning && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pourquoi ce match</p>
                        <p className="text-sm text-gray-700">{match.reasoning}</p>
                      </div>
                    )}

                    {match.conversation?.projectSummary && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description du projet</p>
                        <p className="text-sm text-gray-700">{match.conversation.projectSummary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );

            return (
              <div className="space-y-6">
                {matches.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune mission</h3>
                    <p className="text-gray-500">Complétez votre profil pour attirer plus de créateurs !</p>
                  </div>
                ) : (
                  <>
                    {/* En attente */}
                    {pendingMatches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            En attente ({pendingMatches.length})
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {pendingMatches.map((match: any) => (
                            <MissionCard key={match.id} match={match} showActions />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acceptées */}
                    {acceptedMatches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Acceptées ({acceptedMatches.length})
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {acceptedMatches.map((match: any) => (
                            <MissionCard key={match.id} match={match} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proposées */}
                    {proposedMatches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Proposées ({proposedMatches.length})
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {proposedMatches.map((match: any) => (
                            <MissionCard key={match.id} match={match} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Déclinées */}
                    {declinedMatches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Déclinées ({declinedMatches.length})
                          </h2>
                        </div>
                        <div className="space-y-3 opacity-60">
                          {declinedMatches.map((match: any) => (
                            <MissionCard key={match.id} match={match} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
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
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${portfolios.length >= 20
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sort to show featured first */}
                {[...portfolios].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className={`bg-white rounded-2xl border overflow-hidden group hover:shadow-lg transition-all ${portfolio.isFeatured ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'
                      }`}
                  >
                    <div className="relative">
                      {portfolio.isFeatured && (
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
                          En avant
                        </div>
                      )}
                      {portfolio.imageUrl ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={portfolio.imageUrl}
                            alt={portfolio.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900">{portfolio.title}</h3>
                      {portfolio.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{portfolio.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {portfolio.projectType && (
                          <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">{portfolio.projectType}</span>
                        )}
                        {portfolio.projectYear && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">{portfolio.projectYear}</span>
                        )}
                        {portfolio.projectUrl && (
                          <ExternalLinkWarning
                            url={portfolio.projectUrl}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            🔗 Voir le projet
                          </ExternalLinkWarning>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditPortfolio(portfolio)}
                          className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleRemovePortfolio(portfolio.id)}
                          className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Supprimer
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
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${uploading ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
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
                        onClick={editingPortfolio ? handleUpdatePortfolio : handleAddPortfolio}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                      >
                        {editingPortfolio ? 'Mettre à jour' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
              <div className="flex h-full">
                {/* Conversations list */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-200`}>
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Messages
                      {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-sm bg-purple-100 text-purple-700 rounded-full">{unreadCount}</span>
                      )}
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <div className="text-center py-16 px-4">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Pas de conversations</h3>
                        <p className="text-xs text-gray-500">Les créateurs vous contacteront ici</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => selectConversation(conv)}
                          className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedConversation?.id === conv.id ? 'bg-purple-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {conv.conversation?.creator?.companyName?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {conv.conversation?.creator?.companyName || 'Entreprise'}
                                </p>
                                {conv.unreadCount > 0 && (
                                  <span className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {conv.conversation?.projectTitle || 'Projet'}
                              </p>
                              {conv.lastMessage && (
                                <p className="text-xs text-gray-400 truncate mt-1">
                                  {conv.lastMessage.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat area */}
                <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
                  {selectedConversation ? (
                    <>
                      {/* Chat header */}
                      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="md:hidden p-1 rounded-lg hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {selectedConversation.conversation?.creator?.companyName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {selectedConversation.conversation?.creator?.companyName || 'Entreprise'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedConversation.conversation?.projectTitle || 'Projet'}
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            Aucun message pour le moment. Commencez la conversation !
                          </div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isMine = msg.senderId === user?.id;
                            return (
                              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                  isMine
                                    ? 'bg-purple-600 text-white rounded-br-md'
                                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  <p className={`text-xs mt-1 ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            placeholder="Écrire un message..."
                            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sendingMessage}
                            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center px-4">
                      <div>
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Vos messages</h3>
                        <p className="text-gray-500">Sélectionnez une conversation pour commencer</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <button
                onClick={() => { setShowEventModal(false); resetEventForm(); }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'événement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'TIME_OFF', icon: '🏖️', label: 'Période off' },
                    { type: 'EXTERNAL_MISSION', icon: '💼', label: 'Mission externe' },
                    { type: 'REMINDER', icon: '🔔', label: 'Rappel' },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => setEventForm(prev => ({ ...prev, type: opt.type as any }))}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        eventForm.type === opt.type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{opt.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={eventForm.type === 'TIME_OFF' ? 'Ex: Vacances, Indisponible...' : eventForm.type === 'EXTERNAL_MISSION' ? 'Ex: Projet logo Nike' : 'Ex: Relancer client'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin (optionnel)</label>
                  <input
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* External Mission specific fields */}
              {eventForm.type === 'EXTERNAL_MISSION' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <input
                      type="text"
                      value={eventForm.clientName}
                      onChange={(e) => setEventForm(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Nom du client"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                    <input
                      type="number"
                      value={eventForm.budget}
                      onChange={(e) => setEventForm(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Notes additionnelles..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <div className="flex gap-2">
                  {['#8B5CF6', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setEventForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-transform ${eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowEventModal(false); resetEventForm(); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!eventForm.title || !eventForm.startDate || loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {editingEvent ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
