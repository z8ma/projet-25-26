import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { professionalApi } from '../services/api';

// Constants pour les options de sélection
const MISSION_TYPES = [
  { id: 'branding', label: 'Branding', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { id: 'ui-ux', label: 'UI / UX', icon: '📱', color: 'from-blue-500 to-cyan-500' },
  { id: 'web-design', label: 'Web design', icon: '🌐', color: 'from-indigo-500 to-purple-500' },
  { id: 'motion', label: 'Motion', icon: '🎬', color: 'from-orange-500 to-amber-500' },
  { id: 'illustration', label: 'Illustration', icon: '✏️', color: 'from-emerald-500 to-teal-500' },
  { id: 'social-media', label: 'Social media', icon: '📲', color: 'from-pink-500 to-purple-500' },
  { id: 'direction-artistique', label: 'Direction artistique', icon: '🎯', color: 'from-red-500 to-pink-500' },
  { id: 'print', label: 'Print', icon: '🖨️', color: 'from-gray-500 to-slate-500' },
  { id: 'no-code', label: 'No-code / Webflow', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: '3d-cgi', label: '3D / CGI', icon: '🎮', color: 'from-violet-500 to-purple-500' },
  { id: 'photographie', label: 'Photographie', icon: '📸', color: 'from-cyan-500 to-blue-500' },
  { id: 'video', label: 'Vidéo', icon: '🎥', color: 'from-rose-500 to-red-500' },
];

const CLIENT_TYPES = [
  { id: 'startups', label: 'Startups', icon: '🚀', desc: 'Projets innovants' },
  { id: 'pme', label: 'PME', icon: '🏢', desc: 'Entreprises établies' },
  { id: 'grands-comptes', label: 'Grands comptes', icon: '🏛️', desc: 'Corporate' },
  { id: 'agences', label: 'Agences', icon: '💼', desc: 'En sous-traitance' },
  { id: 'solopreneurs', label: 'Solopreneurs', icon: '💡', desc: 'Entrepreneurs solo' },
];

const COLLAB_TYPES = [
  { id: 'court', label: 'Mission courte', duration: '< 1 semaine', icon: '⚡' },
  { id: 'long', label: 'Mission longue', duration: '> 1 mois', icon: '📅' },
  { id: 'recurrent', label: 'Récurrent', duration: 'Abonnement', icon: '🔄' },
  { id: 'one-shot', label: 'One-shot', duration: 'Ponctuel', icon: '🎯' },
];

const SKILL_LEVELS = [
  { value: 'JUNIOR', label: 'Junior', color: 'bg-gray-100 text-gray-700', icon: '🌱' },
  { value: 'CONFIRMED', label: 'Confirmé', color: 'bg-green-100 text-green-700', icon: '✅' },
  { value: 'SENIOR', label: 'Senior', color: 'bg-blue-100 text-blue-700', icon: '⭐' },
  { value: 'EXPERT', label: 'Expert', color: 'bg-purple-100 text-purple-700', icon: '🏆' },
];

const PORTFOLIO_CLIENT_TYPES = [
  'Startup', 'PME', 'Grand compte', 'Agence', 'Particulier', 'Projet personnel',
];

const AVAILABILITY_OPTIONS = [
  { value: 'Disponible', label: 'Disponible', color: 'bg-green-500', icon: '🟢' },
  { value: 'Partiellement disponible', label: 'Partiellement', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'Non disponible', label: 'Indisponible', color: 'bg-red-500', icon: '🔴' },
];

// Menu items pour la sidebar
const MENU_ITEMS = [
  { id: 'profile', label: 'Mon Profil', icon: '👤', description: 'Infos personnelles' },
  { id: 'missions', label: 'Mes Missions', icon: '🎯', description: 'Types recherchés' },
  { id: 'preferences', label: 'Préférences', icon: '⚙️', description: 'Clients & collabs' },
  { id: 'skills', label: 'Compétences', icon: '💻', description: 'Logiciels & outils' },
  { id: 'portfolio', label: 'Portfolio', icon: '📁', description: 'Mes réalisations' },
  { id: 'messages', label: 'Messages', icon: '💬', description: 'Des créateurs' },
];

export default function ProfessionalProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availability, setAvailability] = useState('Disponible');
  const [bio, setBio] = useState('');

  // Nouveaux champs IA Matching
  const [missionTypes, setMissionTypes] = useState<string[]>([]);
  const [otherMissionType, setOtherMissionType] = useState('');
  const [preferredClientTypes, setPreferredClientTypes] = useState<string[]>([]);
  const [preferredCollabTypes, setPreferredCollabTypes] = useState<string[]>([]);
  const [minimumBudget, setMinimumBudget] = useState('');
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [newExclusion, setNewExclusion] = useState('');
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Professions state
  const [professions, setProfessions] = useState<any[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<any[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('CONFIRMED');
  const [newSkillYears, setNewSkillYears] = useState('');

  // Portfolio state
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', imageUrl: '', projectType: '', tags: '',
    clientType: '', projectGoal: '', roleDescription: '', projectDuration: '',
    projectImpact: '', projectYear: '',
  });

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'PROFESSIONAL') {
      navigate('/dashboard');
      return;
    }
    loadAllData();
  }, [user, navigate]);

  const loadAllData = async () => {
    await Promise.all([loadProfile(), loadProfessions(), loadMessages()]);
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
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de la compétence');
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
      title: '', description: '', imageUrl: '', projectType: '', tags: '',
      clientType: '', projectGoal: '', roleDescription: '', projectDuration: '',
      projectImpact: '', projectYear: '',
    });
    setEditingPortfolio(null);
    setShowPortfolioForm(false);
  };

  const handleAddPortfolio = async () => {
    if (!portfolioForm.title) return;
    try {
      const response = await professionalApi.addPortfolio({
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageUrl: portfolioForm.imageUrl,
        projectType: portfolioForm.projectType,
        tags: portfolioForm.tags ? portfolioForm.tags.split(',').map(t => t.trim()) : [],
        clientType: portfolioForm.clientType,
        projectGoal: portfolioForm.projectGoal,
        roleDescription: portfolioForm.roleDescription,
        projectDuration: portfolioForm.projectDuration,
        projectImpact: portfolioForm.projectImpact,
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      });
      if (response.success) {
        setPortfolios([response.data, ...portfolios]);
        resetPortfolioForm();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du projet');
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio || !portfolioForm.title) return;
    try {
      const response = await professionalApi.updatePortfolio(editingPortfolio.id, {
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageUrl: portfolioForm.imageUrl,
        projectType: portfolioForm.projectType,
        clientType: portfolioForm.clientType,
        projectGoal: portfolioForm.projectGoal,
        roleDescription: portfolioForm.roleDescription,
        projectDuration: portfolioForm.projectDuration,
        projectImpact: portfolioForm.projectImpact,
        projectYear: portfolioForm.projectYear ? parseInt(portfolioForm.projectYear) : undefined,
      });
      if (response.success) {
        setPortfolios(portfolios.map(p => p.id === editingPortfolio.id ? response.data : p));
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
      projectType: portfolio.projectType || '',
      tags: portfolio.tags?.map((t: any) => t.tag).join(', ') || '',
      clientType: portfolio.clientType || '',
      projectGoal: portfolio.projectGoal || '',
      roleDescription: portfolio.roleDescription || '',
      projectDuration: portfolio.projectDuration || '',
      projectImpact: portfolio.projectImpact || '',
      projectYear: portfolio.projectYear?.toString() || '',
    });
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

  const getSkillLevelInfo = (level: string) => {
    return SKILL_LEVELS.find(s => s.value === level) || SKILL_LEVELS[1];
  };

  const getCompletenessColor = () => {
    if (profileCompleteness >= 70) return 'from-green-500 to-emerald-500';
    if (profileCompleteness >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#12121a] border-r border-white/5 transition-all duration-300 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">JUNY</span>
                <p className="text-xs text-white/40">Espace Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        {!sidebarCollapsed && (
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl border border-white/10">
                {firstName ? firstName[0]?.toUpperCase() : '?'}
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {firstName || 'Nouveau'} {lastName || 'Pro'}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    availability === 'Disponible' ? 'bg-green-400' :
                    availability === 'Partiellement disponible' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></span>
                  <span className="text-white/50">{availability}</span>
                </div>
              </div>
            </div>

            {/* Completeness */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Profil complété</span>
                <span className="font-semibold text-white">{profileCompleteness}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getCompletenessColor()} transition-all duration-700`}
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className={`text-2xl transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="text-left">
                  <div className={`font-medium ${activeTab === item.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                    {item.label}
                    {item.id === 'messages' && unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-fuchsia-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/40">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-2">
          <Link
            to="/professional/projects"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <span className="text-xl">📋</span>
            {!sidebarCollapsed && <span className="font-medium">Mes Projets</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-[#1a1a24] border border-white/10 rounded-full flex items-center justify-center hover:bg-violet-500/20 transition-all"
        >
          <svg className={`w-4 h-4 text-white/50 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              {MENU_ITEMS.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-white/50 mt-2">{MENU_ITEMS.find(m => m.id === activeTab)?.description}</p>
          </header>

          {/* Notifications */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-3 animate-pulse">
              <span className="text-2xl">✅</span>
              <span>Modifications enregistrées avec succès !</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto hover:text-white">×</button>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-4xl">
              {/* Identity Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                </div>
                <div className="px-8 pb-8 -mt-16">
                  <div className="flex items-end gap-6">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-5xl font-bold border-4 border-[#0a0a0f] shadow-2xl">
                      {firstName ? firstName[0]?.toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-white">{firstName || 'Prénom'} {lastName || 'Nom'}</h2>
                        {selectedProfessions.length > 0 && (
                          <span className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                            {selectedProfessions[0]?.profession?.name}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 mt-1">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Prénom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Années d'expérience</label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      min="0"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Tarif horaire</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        min="0"
                        className="w-full px-5 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                        placeholder="Ex: 50"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30">€/h</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Disponibilité</label>
                    <div className="flex gap-2">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAvailability(opt.value)}
                          className={`flex-1 px-4 py-4 rounded-2xl border transition-all ${
                            availability === opt.value
                              ? 'bg-white/10 border-violet-500/50 text-white'
                              : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xl">{opt.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Bio / Présentation</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                    placeholder="Parlez de vous, de votre parcours, de ce qui vous passionne..."
                  />
                  <p className="text-xs text-white/30">{bio.length} caractères (min. 50 recommandé)</p>
                </div>

                {/* Métiers */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/70">Mes Métiers</label>
                  <div className="flex gap-3">
                    <select
                      value={selectedProfessionId}
                      onChange={(e) => setSelectedProfessionId(e.target.value)}
                      className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                    >
                      <option value="" className="bg-[#1a1a24]">Sélectionner un métier</option>
                      {professions
                        .filter(p => !selectedProfessions.some(sp => sp.profession?.id === p.id))
                        .map(p => (
                          <option key={p.id} value={p.id} className="bg-[#1a1a24]">{p.name}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddProfession}
                      className="px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium hover:opacity-90 transition-all"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfessions.map((sp) => (
                      <span key={sp.id} className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                        {sp.profession?.name}
                        {sp.isPrimary && <span className="text-xs bg-violet-500/30 px-2 py-0.5 rounded-full">Principal</span>}
                        <button type="button" onClick={() => handleRemoveProfession(sp.id)} className="hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/25"
                >
                  {loading ? '⏳ Enregistrement...' : '💾 Sauvegarder mon profil'}
                </button>
              </form>
            </div>
          )}

          {/* MISSIONS TAB */}
          {activeTab === 'missions' && (
            <div className="space-y-8 max-w-5xl">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Types de missions recherchées</h2>
                    <p className="text-white/50">Sélectionnez vos domaines d'expertise - prioritaire pour le matching IA</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {MISSION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleMissionType(type.label)}
                      className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                        missionTypes.includes(type.label)
                          ? 'bg-white/10 border-violet-500/50'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {missionTypes.includes(type.label) && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-20`}></div>
                      )}
                      <div className="relative z-10">
                        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{type.icon}</span>
                        <span className={`font-medium ${missionTypes.includes(type.label) ? 'text-white' : 'text-white/70'}`}>
                          {type.label}
                        </span>
                      </div>
                      {missionTypes.includes(type.label) && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-white/70 mb-2">Autre spécialité</label>
                  <input
                    type="text"
                    value={otherMissionType}
                    onChange={(e) => setOtherMissionType(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                    placeholder="Ex: Sound design, Copywriting, NFT art..."
                  />
                </div>

                <button
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Enregistrement...' : '💾 Sauvegarder mes missions'}
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-8 max-w-5xl">
              {/* Types de clients */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🤝</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Types de clients préférés</h2>
                    <p className="text-white/50">Avec qui aimez-vous collaborer ?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {CLIENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleClientType(type.label)}
                      className={`p-5 rounded-2xl border transition-all text-center ${
                        preferredClientTypes.includes(type.label)
                          ? 'bg-violet-500/20 border-violet-500/50'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{type.icon}</span>
                      <span className={`font-medium block ${preferredClientTypes.includes(type.label) ? 'text-white' : 'text-white/70'}`}>
                        {type.label}
                      </span>
                      <span className="text-xs text-white/40">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Types de collaboration */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">⏱️</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Format de collaboration</h2>
                    <p className="text-white/50">Quel type de mission préférez-vous ?</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {COLLAB_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleCollabType(type.label)}
                      className={`p-5 rounded-2xl border transition-all text-center ${
                        preferredCollabTypes.includes(type.label)
                          ? 'bg-fuchsia-500/20 border-fuchsia-500/50'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{type.icon}</span>
                      <span className={`font-medium block ${preferredCollabTypes.includes(type.label) ? 'text-white' : 'text-white/70'}`}>
                        {type.label}
                      </span>
                      <span className="text-xs text-white/40">{type.duration}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget minimum */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">💰</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Budget minimum</h2>
                    <p className="text-white/50">Les projets en dessous de ce montant ne vous seront pas proposés</p>
                  </div>
                </div>

                <div className="relative max-w-sm">
                  <input
                    type="number"
                    value={minimumBudget}
                    onChange={(e) => setMinimumBudget(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full px-5 py-4 pr-16 bg-white/5 border border-white/10 rounded-2xl text-white text-2xl font-bold placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 text-xl">€</span>
                </div>
              </div>

              {/* Exclusions */}
              <div className="bg-gradient-to-br from-red-500/5 to-red-500/[0.02] backdrop-blur-xl rounded-3xl border border-red-500/20 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">🚫</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Ce que je ne fais PAS</h2>
                    <p className="text-red-300/70">Ces critères excluront automatiquement certains projets</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
                    placeholder="Ex: Pas de rush, Pas de NFT, Pas de print..."
                    className="flex-1 px-5 py-4 bg-white/5 border border-red-500/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addExclusion}
                    className="px-6 py-4 bg-red-500/20 text-red-300 rounded-2xl font-medium hover:bg-red-500/30 transition-all"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {exclusions.map((exclusion, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
                      🚫 {exclusion}
                      <button type="button" onClick={() => removeExclusion(exclusion)} className="hover:text-white">×</button>
                    </span>
                  ))}
                  {exclusions.length === 0 && <span className="text-white/30">Aucune exclusion définie</span>}
                </div>
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? '⏳ Enregistrement...' : '💾 Sauvegarder mes préférences'}
              </button>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-8 max-w-5xl">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl">💻</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Mes compétences</h2>
                    <p className="text-white/50">Ajoutez vos logiciels et outils avec votre niveau</p>
                  </div>
                </div>

                {/* Add Skill Form */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Nom du logiciel"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                    <select
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(e.target.value)}
                      className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                    >
                      {SKILL_LEVELS.map(level => (
                        <option key={level.value} value={level.value} className="bg-[#1a1a24]">
                          {level.icon} {level.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Années d'usage"
                      value={newSkillYears}
                      onChange={(e) => setNewSkillYears(e.target.value)}
                      min="0"
                      className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium hover:opacity-90 transition-all"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => {
                    const levelInfo = getSkillLevelInfo(skill.proficiencyLevel);
                    return (
                      <div key={skill.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-violet-500/30 transition-all group">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white text-lg">{skill.softwareName}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
                                {levelInfo.icon} {levelInfo.label}
                              </span>
                              {skill.yearsOfUse && (
                                <span className="text-white/40 text-sm">{skill.yearsOfUse} ans</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {skills.length === 0 && (
                  <div className="text-center py-16">
                    <span className="text-6xl block mb-4">🛠️</span>
                    <h3 className="text-xl font-semibold text-white mb-2">Aucune compétence ajoutée</h3>
                    <p className="text-white/50">Ajoutez vos logiciels préférés pour un meilleur matching</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Mon Portfolio</h2>
                  <p className="text-white/50">Montrez vos meilleures réalisations aux créateurs</p>
                </div>
                <button
                  onClick={() => { resetPortfolioForm(); setShowPortfolioForm(true); }}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <span>+</span> Ajouter un projet
                </button>
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => (
                  <div key={portfolio.id} className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all">
                    {portfolio.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={portfolio.imageUrl}
                          alt={portfolio.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                        <span className="text-6xl opacity-50">🎨</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-white">{portfolio.title}</h3>
                      {portfolio.description && (
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">{portfolio.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {portfolio.projectType && (
                          <span className="px-2 py-1 text-xs bg-violet-500/20 text-violet-300 rounded-full">{portfolio.projectType}</span>
                        )}
                        {portfolio.clientType && (
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">{portfolio.clientType}</span>
                        )}
                        {portfolio.projectYear && (
                          <span className="px-2 py-1 text-xs bg-white/10 text-white/50 rounded-full">{portfolio.projectYear}</span>
                        )}
                      </div>

                      {(portfolio.projectGoal || portfolio.roleDescription) && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
                          <span>✓</span> Enrichi pour l'IA
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditPortfolio(portfolio)}
                          className="flex-1 px-4 py-2 text-sm bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleRemovePortfolio(portfolio.id)}
                          className="px-4 py-2 text-sm bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {portfolios.length === 0 && (
                <div className="text-center py-20 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10">
                  <span className="text-8xl block mb-6">📁</span>
                  <h3 className="text-2xl font-semibold text-white mb-2">Votre portfolio est vide</h3>
                  <p className="text-white/50 mb-6">Ajoutez vos meilleurs projets pour attirer les créateurs</p>
                  <button
                    onClick={() => setShowPortfolioForm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium hover:opacity-90 transition-all"
                  >
                    + Ajouter mon premier projet
                  </button>
                </div>
              )}

              {/* Portfolio Modal */}
              {showPortfolioForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#12121a] rounded-3xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#12121a] z-10">
                      <h3 className="text-xl font-bold text-white">
                        {editingPortfolio ? '✏️ Modifier le projet' : '➕ Nouveau projet'}
                      </h3>
                      <button onClick={resetPortfolioForm} className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white">
                        ✕
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-white/70 mb-2">Titre du projet *</label>
                          <input
                            type="text"
                            value={portfolioForm.title}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            placeholder="Ex: Refonte identité visuelle Startup X"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                          <textarea
                            value={portfolioForm.description}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                            rows={3}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                            placeholder="Décrivez le projet en quelques lignes..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">URL de l'image</label>
                          <input
                            type="text"
                            value={portfolioForm.imageUrl}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">Type de projet</label>
                          <input
                            type="text"
                            value={portfolioForm.projectType}
                            onChange={(e) => setPortfolioForm({ ...portfolioForm, projectType: e.target.value })}
                            placeholder="Ex: Logo, Site web, Motion..."
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <h4 className="font-semibold text-white">Enrichissement IA</h4>
                            <p className="text-xs text-white/50">Optionnel mais recommandé pour un meilleur matching</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Type de client</label>
                            <select
                              value={portfolioForm.clientType}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, clientType: e.target.value })}
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                            >
                              <option value="" className="bg-[#1a1a24]">Sélectionner...</option>
                              {PORTFOLIO_CLIENT_TYPES.map(type => (
                                <option key={type} value={type} className="bg-[#1a1a24]">{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Année</label>
                            <input
                              type="number"
                              value={portfolioForm.projectYear}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, projectYear: e.target.value })}
                              min="2000"
                              max="2026"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-2">Objectif du projet</label>
                            <input
                              type="text"
                              value={portfolioForm.projectGoal}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, projectGoal: e.target.value })}
                              placeholder="Ex: Refonte pour lancement nouveau produit"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-2">Votre rôle</label>
                            <input
                              type="text"
                              value={portfolioForm.roleDescription}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, roleDescription: e.target.value })}
                              placeholder="Ex: Direction artistique et création du logo"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Durée</label>
                            <input
                              type="text"
                              value={portfolioForm.projectDuration}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, projectDuration: e.target.value })}
                              placeholder="Ex: 2 semaines"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">Impact / Résultat</label>
                            <input
                              type="text"
                              value={portfolioForm.projectImpact}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, projectImpact: e.target.value })}
                              placeholder="Ex: +30% conversion"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-2">Tags (séparés par des virgules)</label>
                            <input
                              type="text"
                              value={portfolioForm.tags}
                              onChange={(e) => setPortfolioForm({ ...portfolioForm, tags: e.target.value })}
                              placeholder="Ex: branding, minimal, tech, startup"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex gap-3 sticky bottom-0 bg-[#12121a]">
                      <button
                        onClick={resetPortfolioForm}
                        className="flex-1 py-4 border border-white/20 text-white/70 rounded-2xl font-medium hover:bg-white/5 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={editingPortfolio ? handleUpdatePortfolio : handleAddPortfolio}
                        className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-medium hover:opacity-90 transition-all"
                      >
                        {editingPortfolio ? 'Mettre à jour' : 'Ajouter au portfolio'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Messages des créateurs
                  {unreadCount > 0 && (
                    <span className="ml-3 px-3 py-1 text-sm bg-fuchsia-500 rounded-full">{unreadCount} nouveaux</span>
                  )}
                </h2>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-20 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10">
                  <span className="text-8xl block mb-6">💬</span>
                  <h3 className="text-2xl font-semibold text-white mb-2">Pas encore de messages</h3>
                  <p className="text-white/50">Les créateurs vous contacteront ici quand ils seront intéressés par votre profil</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-6 rounded-3xl border transition-all ${
                        message.isRead
                          ? 'bg-white/5 border-white/10'
                          : 'bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {message.subject && (
                            <h3 className="font-semibold text-white text-lg">{message.subject}</h3>
                          )}
                          <p className="text-white/70 mt-2">{message.content}</p>
                          <p className="text-sm text-white/40 mt-4">
                            {new Date(message.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        {!message.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(message.id)}
                            className="ml-4 px-4 py-2 text-sm bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-all"
                          >
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
