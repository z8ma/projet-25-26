import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, loadUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'CREATOR' | 'PROFESSIONAL' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check if this is a success (existing user) or complete (new user)
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const googleId = searchParams.get('googleId');
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const isNewUser = email && googleId;

  useEffect(() => {
    if (!isNewUser && token) {
      // Existing user - just save token and redirect
      handleExistingUser(token);
    } else if (isNewUser) {
      // New user - show role selection
      setLoading(false);
    } else {
      setError('Paramètres OAuth invalides');
      setLoading(false);
    }
  }, []);

  const handleExistingUser = async (jwtToken: string) => {
    try {
      // Save token to localStorage first so loadUser can use it
      localStorage.setItem('token', jwtToken);
      await loadUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Erreur lors de la connexion');
      setLoading(false);
    }
  };

  const handleCompleteSignup = async () => {
    if (!selectedRole) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/api/auth/google/complete', {
        email,
        googleId,
        role: selectedRole,
        firstName,
        lastName,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuth(token, user);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      console.error('Error completing signup:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setSubmitting(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  // New user - role selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur JUNY !</h1>
          <p className="text-gray-600">
            Connecté avec <span className="font-medium text-purple-600">{email}</span>
          </p>
        </div>

        <div className="mb-6">
          <p className="text-center text-gray-700 font-medium mb-4">Choisissez votre type de compte :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator Card */}
            <button
              onClick={() => setSelectedRole('CREATOR')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedRole === 'CREATOR'
                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  selectedRole === 'CREATOR' ? 'bg-purple-600' : 'bg-purple-100'
                }`}>
                  <svg className={`w-8 h-8 ${selectedRole === 'CREATOR' ? 'text-white' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Créateur</h3>
                <p className="text-sm text-gray-600">
                  Vous cherchez des professionnels pour vos projets créatifs
                </p>
              </div>
            </button>

            {/* Professional Card */}
            <button
              onClick={() => setSelectedRole('PROFESSIONAL')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedRole === 'PROFESSIONAL'
                  ? 'border-purple-600 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  selectedRole === 'PROFESSIONAL' ? 'bg-purple-600' : 'bg-indigo-100'
                }`}>
                  <svg className={`w-8 h-8 ${selectedRole === 'PROFESSIONAL' ? 'text-white' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Professionnel</h3>
                <p className="text-sm text-gray-600">
                  Vous proposez vos services créatifs et cherchez des missions
                </p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCompleteSignup}
          disabled={!selectedRole || submitting}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Création du compte...
            </>
          ) : (
            'Continuer'
          )}
        </button>
      </div>
    </div>
  );
}
