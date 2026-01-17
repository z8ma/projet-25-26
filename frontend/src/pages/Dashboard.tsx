import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Creative Match</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bienvenue, {user.role === 'CREATOR' ? user.creator?.companyName || user.email : `${user.professional?.firstName} ${user.professional?.lastName}`}!
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">Type de compte</p>
              <p className="text-lg text-blue-900">
                {user.role === 'CREATOR' ? 'Créateur de contenu' : 'Professionnel créatif'}
              </p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">Email</p>
              <p className="text-lg text-green-900">{user.email}</p>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to={user.role === 'CREATOR' ? '/profile/creator' : '/profile/professional'}
                className="block w-full text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Compléter mon profil
              </Link>

              {user.role === 'CREATOR' && (
                <Link
                  to="/brainstorming"
                  className="block w-full text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                >
                  Brainstorming IA & Matching
                </Link>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                ✨ <strong>Nouvelles fonctionnalités disponibles!</strong>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {user.role === 'CREATOR'
                  ? 'Utilisez l\'IA pour brainstormer vos projets et trouvez les meilleurs professionnels!'
                  : 'Complétez votre profil avec portfolio, compétences et recevez des messages des créateurs!'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
