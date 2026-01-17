import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { professionalApi } from '../services/api';

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

  // Professions state
  const [professions, setProfessions] = useState<any[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<any[]>([]);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermédiaire');

  // Portfolio state
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');
  const [newPortfolioImageUrl, setNewPortfolioImageUrl] = useState('');
  const [newPortfolioType, setNewPortfolioType] = useState('');
  const [newPortfolioTags, setNewPortfolioTags] = useState('');

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');

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
    await Promise.all([
      loadProfile(),
      loadProfessions(),
      loadMessages(),
    ]);
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
      if (response.success) {
        setProfessions(response.data);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await professionalApi.updateProfile({
        firstName,
        lastName,
        experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        availability,
        bio,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
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
      });

      if (response.success) {
        setSkills([...skills, response.data]);
        setNewSkillName('');
        setNewSkillLevel('Intermédiaire');
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

  const handleAddPortfolio = async () => {
    if (!newPortfolioTitle) return;

    try {
      const response = await professionalApi.addPortfolio({
        title: newPortfolioTitle,
        description: newPortfolioDescription,
        imageUrl: newPortfolioImageUrl,
        projectType: newPortfolioType,
        tags: newPortfolioTags ? newPortfolioTags.split(',').map(t => t.trim()) : [],
      });

      if (response.success) {
        setPortfolios([response.data, ...portfolios]);
        setNewPortfolioTitle('');
        setNewPortfolioDescription('');
        setNewPortfolioImageUrl('');
        setNewPortfolioType('');
        setNewPortfolioTags('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du projet');
    }
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
      setUnreadCount(unreadCount - 1);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Creative Match</h1>
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['profile', 'professions', 'skills', 'portfolio', 'messages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab === 'messages' ? `Messages (${unreadCount})` : tab.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            ✓ Mise à jour réussie
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Informations Personnelles</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                    Années d'expérience
                  </label>
                  <input
                    id="experienceYears"
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    min="0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                    Tarif horaire (€)
                  </label>
                  <input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Disponibilité
                </label>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Partiellement disponible">Partiellement disponible</option>
                  <option value="Non disponible">Non disponible</option>
                </select>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Présentation
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Présentez-vous en quelques mots..."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Professions Tab */}
        {activeTab === 'professions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mes Métiers</h2>

            <div className="mb-6">
              <div className="flex gap-2">
                <select
                  value={selectedProfessionId}
                  onChange={(e) => setSelectedProfessionId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner un métier</option>
                  {professions
                    .filter(p => !selectedProfessions.some(sp => sp.profession?.id === p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <button
                  onClick={handleAddProfession}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {selectedProfessions.map((sp) => (
                <div key={sp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">{sp.profession?.name}</span>
                    {sp.isPrimary && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Principal
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveProfession(sp.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compétences Logicielles</h2>

            <div className="mb-6 grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nom du logiciel"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Ajouter
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{skill.softwareName}</div>
                    <div className="text-sm text-gray-600">{skill.proficiencyLevel}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mon Portfolio</h2>

            <div className="mb-6 space-y-3 p-4 bg-gray-50 rounded-md">
              <input
                type="text"
                placeholder="Titre du projet *"
                value={newPortfolioTitle}
                onChange={(e) => setNewPortfolioTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Description"
                value={newPortfolioDescription}
                onChange={(e) => setNewPortfolioDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="URL de l'image"
                value={newPortfolioImageUrl}
                onChange={(e) => setNewPortfolioImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Type de projet (ex: Logo, Site web, 3D)"
                value={newPortfolioType}
                onChange={(e) => setNewPortfolioType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Tags (séparés par des virgules)"
                value={newPortfolioTags}
                onChange={(e) => setNewPortfolioTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleAddPortfolio}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Ajouter au Portfolio
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="border rounded-lg overflow-hidden">
                  {portfolio.imageUrl && (
                    <img src={portfolio.imageUrl} alt={portfolio.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                    )}
                    {portfolio.projectType && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {portfolio.projectType}
                      </span>
                    )}
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleRemovePortfolio(portfolio.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Messages des Créateurs ({unreadCount} non lus)
            </h2>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun message pour le moment</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-md ${message.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {message.subject && (
                          <h3 className="font-semibold">{message.subject}</h3>
                        )}
                        <p className="text-gray-700 mt-1">{message.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(message.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      {!message.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(message.id)}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
