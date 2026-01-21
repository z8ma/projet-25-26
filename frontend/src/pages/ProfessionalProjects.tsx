import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { professionalApi, matchingApi } from '../services/api';

export default function ProfessionalProjects() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'PROFESSIONAL') {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await professionalApi.getProfile();
      if (response.success) {
        setProfile(response.data);
        if (response.data.matches) {
          setProjects(response.data.matches);
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openStatusModal = (project: any) => {
    setSelectedProject(project);
    setNewStatus(project.projectStatus);
    setStatusModalOpen(true);
  };

  const updateProjectStatus = async () => {
    if (!selectedProject) return;

    try {
      const response = await matchingApi.updateProjectStatus(selectedProject.id, {
        projectStatus: newStatus,
      });

      if (response.success) {
        await loadData();
        setStatusModalOpen(false);
        setSelectedProject(null);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
    }
  };

  const getProjectStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      NOT_STARTED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pas commencé', icon: '⏳' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En cours', icon: '🔄' },
      REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En revue', icon: '👀' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé', icon: '✅' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulé', icon: '❌' },
    };
    return config[status] || config.NOT_STARTED;
  };

  const getMatchStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      PROPOSED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Proposé' },
      CONTACTED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Contacté' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepté' },
      DECLINED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusé' },
    };
    return config[status] || config.PROPOSED;
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['IN_PROGRESS', 'REVIEW'].includes(project.projectStatus);
    if (filter === 'completed') return project.projectStatus === 'COMPLETED';
    if (filter === 'pending') return project.projectStatus === 'NOT_STARTED';
    return true;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => ['IN_PROGRESS', 'REVIEW'].includes(p.projectStatus)).length,
    completed: projects.filter(p => p.projectStatus === 'COMPLETED').length,
    pending: projects.filter(p => p.projectStatus === 'NOT_STARTED').length,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-2xl font-bold logo-gradient">JUNY</span>
          </div>
          <div className="flex gap-3">
            <Link
              to="/profile/professional"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
            >
              Mon Profil
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Missions</h1>
          <p className="text-gray-500 mt-1">Suivez l'avancement de vos collaborations avec les créateurs</p>
        </div>

        {/* Stats Cards */}
        {profile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Projets terminés</p>
                  <p className="text-3xl font-bold text-green-600">{profile.projectsCompleted || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">En cours</p>
                  <p className="text-3xl font-bold text-blue-600">{profile.projectsInProgress || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Note moyenne</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {profile.averageRating ? `${Number(profile.averageRating).toFixed(1)}` : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taux de réponse</p>
                  <p className="text-3xl font-bold text-purple-600">{profile.responseRate || 100}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tous', count: stats.total },
              { id: 'active', label: 'En cours', count: stats.active },
              { id: 'pending', label: 'En attente', count: stats.pending },
              { id: 'completed', label: 'Terminés', count: stats.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des projets...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'Aucune mission pour le moment' : `Aucune mission ${filter === 'active' ? 'en cours' : filter === 'completed' ? 'terminée' : 'en attente'}`}
              </h3>
              <p className="text-gray-500">
                Les créateurs vous contacteront via la plateforme de matching
              </p>
            </div>
          ) : (
            filteredProjects.map((project: any) => {
              const projectStatus = getProjectStatusConfig(project.projectStatus);
              const matchStatus = getMatchStatusConfig(project.status);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{projectStatus.icon}</span>
                          <h3 className="text-xl font-bold text-gray-900">
                            {project.conversation?.projectTitle || 'Projet sans titre'}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Match: {project.matchScore}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${matchStatus.bg} ${matchStatus.text}`}>
                          {matchStatus.label}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${projectStatus.bg} ${projectStatus.text}`}>
                          {projectStatus.label}
                        </span>
                      </div>
                    </div>

                    {project.reasoning && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <p className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pourquoi ce match ?
                        </p>
                        <p className="text-sm text-blue-800">{project.reasoning}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Début</p>
                        <p className="font-semibold text-gray-900">
                          {project.startedAt
                            ? new Date(project.startedAt).toLocaleDateString('fr-FR')
                            : '-'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Fin</p>
                        <p className="font-semibold text-gray-900">
                          {project.completedAt
                            ? new Date(project.completedAt).toLocaleDateString('fr-FR')
                            : '-'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Durée</p>
                        <p className="font-semibold text-gray-900">
                          {project.startedAt && project.completedAt
                            ? `${Math.ceil(
                                (new Date(project.completedAt).getTime() -
                                  new Date(project.startedAt).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )} jours`
                            : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => openStatusModal(project)}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier le statut
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Status Update Modal */}
      {statusModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Mettre à jour le statut</h3>
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Projet</p>
                <p className="font-semibold text-gray-900">{selectedProject.conversation?.projectTitle || 'Sans titre'}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nouveau statut
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'NOT_STARTED', label: 'Pas commencé', icon: '⏳', desc: 'Le projet n\'a pas encore démarré' },
                    { value: 'IN_PROGRESS', label: 'En cours', icon: '🔄', desc: 'Vous travaillez activement dessus' },
                    { value: 'REVIEW', label: 'En revue', icon: '👀', desc: 'En attente de validation du créateur' },
                    { value: 'COMPLETED', label: 'Terminé', icon: '✅', desc: 'Le projet est finalisé' },
                    { value: 'CANCELLED', label: 'Annulé', icon: '❌', desc: 'Le projet a été annulé' },
                  ].map((status) => (
                    <label
                      key={status.value}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        newStatus === status.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={newStatus === status.value}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="sr-only"
                      />
                      <span className="text-xl">{status.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{status.label}</p>
                        <p className="text-xs text-gray-500">{status.desc}</p>
                      </div>
                      {newStatus === status.value && (
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setStatusModalOpen(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={updateProjectStatus}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
