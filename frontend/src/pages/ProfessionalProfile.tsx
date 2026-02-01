import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { professionalApi, uploadApi } from '../services/api';
import ExternalLinkWarning from '../components/ExternalLinkWarning';
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
  { id: 'dashboard', label: 'Tableau de bord', emoji: '📊' },
  { id: 'profile', label: 'Profil', emoji: '👤' },
  { id: 'missions', label: 'Missions', emoji: '📋' },
  { id: 'preferences', label: 'Préférences', emoji: '⚙️' },
  { id: 'skills', label: 'Compétences', emoji: '💻' },
  { id: 'portfolio', label: 'Portfolio', emoji: '🖼️' },
  { id: 'messages', label: 'Messages', emoji: '💬' },
];

export default function ProfessionalProfile() {
  useDocumentTitle('Mon Profil | JUNY');

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
    await Promise.all([loadProfile(), loadProfessions(), loadMessages(), loadMatches(), loadDashboardStats()]);
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

  const loadProfile = async () => {
    try {
      const response = await professionalApi.getProfile();
      if (response.success) {
        const data = response.data;
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                JUNY<span className="text-purple-600">.</span>
              </Link>
              <span className="hidden sm:block px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                Espace Pro
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Profile completeness */}
              <div className="hidden md:flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{profileCompleteness}%</span>
              </div>

              <Link
                to="/settings"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {firstName ? firstName[0]?.toUpperCase() : '?'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200 p-6">
          <div className="sticky top-24 space-y-2">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex justify-around py-2">
            {MENU_ITEMS.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-3 rounded-xl ${activeTab === item.id ? 'text-purple-600' : 'text-gray-400'}`}
              >
                <span className="text-2xl">{item.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-0 p-6 lg:p-8 overflow-y-auto">
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
                {/* Welcome header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl p-8 text-white">
                  <h1 className="text-2xl font-bold mb-2">
                    Bienvenue{firstName ? `, ${firstName}` : ''} ! 👋
                  </h1>
                  <p className="text-purple-100">
                    Voici un aperçu de votre activité sur JUNY
                  </p>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.stats?.projectsCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-500">Projets finalisés</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.stats?.averageRating?.toFixed(1) || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Note moyenne ({dashboardStats?.stats?.totalRatings || 0} avis)
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="text-3xl mb-2">📩</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.stats?.pendingMissions || 0}
                    </div>
                    <div className="text-sm text-gray-500">Demandes en attente</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="text-3xl mb-2">🚀</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.stats?.activeMissions || 0}
                    </div>
                    <div className="text-sm text-gray-500">Missions actives</div>
                  </div>
                </div>

                {/* Recent ratings */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">⭐ Derniers avis reçus</h2>
                  {dashboardStats?.ratings?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardStats.ratings.map((rating: any) => (
                        <div key={rating.id} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {rating.projectTitle || 'Projet'}
                                </span>
                              </div>
                              {rating.comment && (
                                <p className="text-gray-600 text-sm mb-2">"{rating.comment}"</p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>👤 {rating.clientName || 'Client'}</span>
                                {rating.clientIndustry && <span>• {rating.clientIndustry}</span>}
                                <span>• {new Date(rating.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <span className="text-4xl block mb-2">⭐</span>
                      <p>Aucun avis pour le moment</p>
                      <p className="text-sm">Les avis apparaîtront ici après vos missions</p>
                    </div>
                  )}
                </div>

                {/* Recent collaborators */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">🤝 Collaborations récentes</h2>
                  {dashboardStats?.recentCollaborators?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {dashboardStats.recentCollaborators.map((collab: any) => (
                        <div key={collab.id} className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            {collab.logoUrl ? (
                              <img src={collab.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-xl text-purple-600">
                                {collab.companyName?.[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {collab.companyName || 'Client'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{collab.industry}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <span className="text-4xl block mb-2">🤝</span>
                      <p>Aucune collaboration pour le moment</p>
                    </div>
                  )}
                </div>

                {/* Completed projects */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">✅ Projets finalisés</h2>
                  {dashboardStats?.completedProjects?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.completedProjects.map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {project.projectTitle || 'Projet'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>👤 {project.clientName}</span>
                              {project.clientIndustry && <span>• {project.clientIndustry}</span>}
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
                      <span className="text-4xl block mb-2">📋</span>
                      <p>Aucun projet finalisé</p>
                      <p className="text-sm">Vos projets terminés apparaîtront ici</p>
                    </div>
                  )}
                </div>

                {/* Profile completeness reminder */}
                {profileCompleteness < 80 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">💡</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-800 mb-1">
                          Complétez votre profil pour plus de visibilité
                        </h3>
                        <p className="text-yellow-700 text-sm mb-3">
                          Votre profil est complété à {profileCompleteness}%. Un profil complet attire plus de créateurs !
                        </p>
                        <button
                          onClick={() => setActiveTab('profile')}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Compléter mon profil
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile header */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-purple-600 to-purple-400" />
                  <div className="px-8 pb-8 -mt-16">
                    <div className="flex items-end gap-6">
                      <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-5xl font-bold text-purple-600">
                          {firstName ? firstName[0]?.toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="flex-1 pb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {firstName || 'Prénom'} {lastName || 'Nom'}
                        </h1>
                        <p className="text-gray-500">{user?.email}</p>
                        {selectedProfessions.length > 0 && (
                          <span className="inline-block mt-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                            {selectedProfessions[0]?.profession?.name}
                          </span>
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        availability === 'Disponible' ? 'bg-green-50 text-green-700' :
                        availability === 'Partiellement disponible' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {availability}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">📝 Informations personnelles</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                      <input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (€)</label>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ex: 50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Disponible">Disponible</option>
                        <option value="Partiellement disponible">Partiellement</option>
                        <option value="Non disponible">Indisponible</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Parlez de vous..."
                    />
                  </div>

                  {/* Métiers */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Métiers</label>
                    <div className="flex gap-3 mb-3">
                      <select
                        value={selectedProfessionId}
                        onChange={(e) => setSelectedProfessionId(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un métier</option>
                        {professions
                          .filter(p => !selectedProfessions.some(sp => sp.profession?.id === p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddProfession}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessions.map((sp) => (
                        <span key={sp.id} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full">
                          {sp.profession?.name}
                          {sp.isPrimary && <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full">Principal</span>}
                          <button type="button" onClick={() => handleRemoveProfession(sp.id)} className="hover:text-purple-900">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </form>
              </div>
            )}

            {/* MISSIONS TAB */}
            {activeTab === 'missions' && (
              <div className="space-y-6">
                {/* Projets reçus */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">📥 Projets reçus</h2>
                  <p className="text-gray-500 mb-6">Les créateurs qui vous ont contacté</p>

                  {matches.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-5xl block mb-3">📭</span>
                      <p className="text-gray-500">Aucun projet reçu pour le moment</p>
                      <p className="text-sm text-gray-400 mt-1">Complétez votre profil pour attirer plus de créateurs !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {matches.map((match) => (
                        <div
                          key={match.id}
                          className={`p-6 rounded-xl border-2 transition-all ${
                            match.status === 'CONTACTED' ? 'border-purple-300 bg-purple-50' :
                            match.status === 'ACCEPTED' ? 'border-green-300 bg-green-50' :
                            match.status === 'DECLINED' ? 'border-gray-200 bg-gray-50' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {match.conversation?.projectTitle || 'Projet sans titre'}
                                </h3>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  match.status === 'CONTACTED' ? 'bg-purple-100 text-purple-700' :
                                  match.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                  match.status === 'DECLINED' ? 'bg-gray-100 text-gray-500' :
                                  match.status === 'PROPOSED' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {match.status === 'CONTACTED' ? '📩 Nouveau' :
                                   match.status === 'ACCEPTED' ? '✅ Accepté' :
                                   match.status === 'DECLINED' ? '❌ Décliné' :
                                   match.status === 'PROPOSED' ? '💡 Proposé' :
                                   match.status}
                                </span>
                                {match.unreadCount > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                                    {match.unreadCount} message{match.unreadCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm mb-3">
                                {match.conversation?.projectSummary || 'Pas de description'}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-gray-500">
                                  👤 {match.conversation?.creator?.companyName ||
                                      `${match.conversation?.creator?.firstName || ''} ${match.conversation?.creator?.lastName || ''}`}
                                </span>
                                {match.conversation?.creator?.industry && (
                                  <span className="text-gray-400">
                                    🏢 {match.conversation.creator.industry}
                                  </span>
                                )}
                                <span className="text-purple-600 font-medium">
                                  Match: {match.matchScore}%
                                </span>
                              </div>

                              {match.reasoning && (
                                <p className="text-xs text-gray-400 mt-2 italic">
                                  💡 {match.reasoning}
                                </p>
                              )}
                            </div>

                            {match.status === 'CONTACTED' && (
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleRespondToMatch(match.id, 'ACCEPTED')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  ✓ Accepter
                                </button>
                                <button
                                  onClick={() => handleRespondToMatch(match.id, 'DECLINED')}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                                >
                                  ✕ Décliner
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Client types */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">🤝 Clients préférés</h2>
                  <p className="text-gray-500 mb-6">Avec qui aimez-vous travailler ?</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {CLIENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleClientType(type.label)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferredClientTypes.includes(type.label)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium ${preferredClientTypes.includes(type.label) ? 'text-purple-700' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collab types */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">📅 Format de collaboration</h2>
                  <p className="text-gray-500 mb-6">Quel type de mission préférez-vous ?</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {COLLAB_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleCollabType(type.label)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          preferredCollabTypes.includes(type.label)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium block ${preferredCollabTypes.includes(type.label) ? 'text-purple-700' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                        <span className="text-sm text-gray-400">{type.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget minimum */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">💰 Budget minimum</h2>
                  <p className="text-gray-500 mb-6">Projets en dessous de ce montant exclus</p>

                  <div className="max-w-xs">
                    <div className="relative">
                      <input
                        type="number"
                        value={minimumBudget}
                        onChange={(e) => setMinimumBudget(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xl font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                  </div>
                </div>

                {/* Exclusions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">🚫 Ce que je ne fais pas</h2>
                  <p className="text-gray-500 mb-6">Ces critères excluront certains projets</p>

                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={newExclusion}
                      onChange={(e) => setNewExclusion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
                      placeholder="Ex: Pas de rush, Pas de NFT..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addExclusion}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exclusions.map((exclusion, index) => (
                      <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full">
                        {exclusion}
                        <button type="button" onClick={() => removeExclusion(exclusion)} className="hover:text-red-900">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Sauvegarder'}
                </button>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                {/* Mes spécialités */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">🎯 Mes spécialités</h2>
                  <p className="text-gray-500 mb-6">Types de missions que vous recherchez</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {MISSION_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleMissionType(type.label)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          missionTypes.includes(type.label)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium ${missionTypes.includes(type.label) ? 'text-purple-700' : 'text-gray-700'}`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autre spécialité</label>
                    <input
                      type="text"
                      value={otherMissionType}
                      onChange={(e) => setOtherMissionType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: Sound design, Copywriting..."
                    />
                  </div>

                  <button
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </div>

                {/* Logiciels et outils */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">🛠️ Logiciels & outils</h2>
                  <p className="text-gray-500 mb-6">Logiciels et outils que vous maîtrisez</p>

                  {/* Add skill form */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        placeholder="Nom du logiciel"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {SKILL_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Années"
                        value={newSkillYears}
                        onChange={(e) => setNewSkillYears(e.target.value)}
                        min="0"
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Skills grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="p-4 border border-gray-200 rounded-xl group hover:border-purple-200 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{skill.softwareName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                skill.proficiencyLevel === 'EXPERT' ? 'bg-purple-100 text-purple-700' :
                                skill.proficiencyLevel === 'SENIOR' ? 'bg-blue-100 text-blue-700' :
                                skill.proficiencyLevel === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {SKILL_LEVELS.find(l => l.value === skill.proficiencyLevel)?.label}
                              </span>
                              {skill.yearsOfUse && (
                                <span className="text-sm text-gray-400">{skill.yearsOfUse} ans</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {skills.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <span className="text-5xl block mb-3">💻</span>
                      <p>Aucune compétence ajoutée</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">🎨 Portfolio</h2>
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
                    ⚠️ Vous avez atteint la limite de 20 projets. Supprimez un projet pour en ajouter un nouveau.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sort to show featured first */}
                  {[...portfolios].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map((portfolio) => (
                    <div
                      key={portfolio.id}
                      className={`bg-white rounded-2xl border overflow-hidden group hover:shadow-lg transition-all ${
                        portfolio.isFeatured ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="relative">
                        {portfolio.isFeatured && (
                          <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-full flex items-center gap-1">
                            ⭐ En avant
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
                            <span className="text-5xl">🖼️</span>
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
                    <span className="text-6xl block mb-4">🖼️</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Portfolio vide</h3>
                    <p className="text-gray-500 mb-4">Ajoutez vos projets pour attirer les créateurs ✨</p>
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
                            <span className="font-medium text-yellow-800">⭐ Mettre ce projet en avant</span>
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
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    📬 Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-sm bg-purple-100 text-purple-700 rounded-full">{unreadCount}</span>
                    )}
                  </h2>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <span className="text-6xl block mb-4">💬</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Pas de messages</h3>
                    <p className="text-gray-500">Les créateurs vous contacteront ici 📨</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-6 rounded-2xl border ${
                          message.isRead
                            ? 'bg-white border-gray-200'
                            : 'bg-purple-50 border-purple-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {message.subject && (
                              <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                            )}
                            <p className="text-gray-600 mt-1">{message.content}</p>
                            <p className="text-sm text-gray-400 mt-3">
                              {new Date(message.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          {!message.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(message.id)}
                              className="ml-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Marquer lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
  );
}
