import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Register() {
  useDocumentTitle('Inscription | JUNY');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CREATOR' | 'PROFESSIONAL'>('CREATOR');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        role,
        ...(role === 'CREATOR' && companyName && { companyName }),
        ...(role === 'PROFESSIONAL' && { firstName, lastName }),
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        setAuth(token, user);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const creatorBenefits = [
    'Générez des matchs qualifiés en quelques minutes',
    'Comparez les profils côte à côte',
    'Messaging intégré avec vos prestataires',
    'IA brainstorming pour affiner votre brief',
  ];

  const proBenefits = [
    'Recevez des missions adaptées à votre expertise',
    'Profil mis en avant auprès de créateurs qualifiés',
    'Portfolio visible et valorisé',
    'Zéro commission sur vos contrats',
  ];

  const benefits = role === 'CREATOR' ? creatorBenefits : proBenefits;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 flex-col items-center justify-center p-12"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
            style={{ background: 'rgba(194,88,0,0.3)' }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full blur-2xl transition-all duration-700"
            style={{ background: 'rgba(253,224,71,0.2)' }}
          />
        </div>

        <div className="relative z-10 max-w-sm text-white">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
            <img
              src="/logo.png"
              alt="JUNY"
              style={{ height: '40px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-5xl font-bold text-white tracking-tight">JUNY</span>
          </Link>

          <h2 className="text-3xl font-bold mb-3 leading-tight">
            {role === 'CREATOR' ? (
              <>Trouvez vos prestataires idéaux,<br /><span className="text-white/70">sans effort.</span></>
            ) : (
              <>Développez votre activité<br /><span className="text-white/70">avec les bons clients.</span></>
            )}
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            {role === 'CREATOR'
              ? 'JUNY analyse votre projet et vous met en relation avec les prestataires qui correspondent vraiment à vos besoins.'
              : 'Rejoignez JUNY et recevez des opportunités ciblées correspondant à votre expertise.'}
          </p>

          {/* Benefits list */}
          <ul className="space-y-3 mb-10">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-white text-sm leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>

        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center px-6 py-12 bg-white relative overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="JUNY" style={{ height: '28px', width: 'auto' }} />
            <span className="text-2xl font-bold logo-gradient">JUNY</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
            <p className="text-gray-500">Rejoignez JUNY en quelques instants.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/google'}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Je suis...</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'CREATOR', label: 'Créateur', desc: 'Je cherche des prestataires', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )},
                  { value: 'PROFESSIONAL', label: 'Professionnel', desc: 'Je propose mes services', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )},
                ] as const).map(({ value, label, desc, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      role === value
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {role === value && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L5 8.5 2 5.5l-1 1 4 4 6-7-1-1z"/>
                        </svg>
                      </span>
                    )}
                    <span className={`mb-1.5 ${role === value ? 'text-primary-600' : 'text-gray-500'}`}>{icon}</span>
                    <span className={`text-sm font-bold ${role === value ? 'text-primary-700' : 'text-gray-800'}`}>{label}</span>
                    <span className={`text-xs mt-0.5 ${role === value ? 'text-primary-500' : 'text-gray-400'}`}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="modern-input-group">
              <label htmlFor="email" className="modern-label">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="modern-input"
                placeholder="votre@email.com"
              />
            </div>

            {/* Password */}
            <div className="modern-input-group">
              <label htmlFor="password" className="modern-label">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="modern-input pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">Min. 8 caractères avec majuscule, minuscule et chiffre</p>
            </div>

            {/* Conditional fields */}
            {role === 'CREATOR' && (
              <div className="modern-input-group">
                <label htmlFor="companyName" className="modern-label">Nom de l'entreprise <span className="text-gray-400 font-normal ml-1">(optionnel)</span></label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="modern-input"
                  placeholder="Ma Société"
                />
              </div>
            )}

            {role === 'PROFESSIONAL' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="modern-input-group">
                  <label htmlFor="firstName" className="modern-label">Prénom</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="modern-input"
                    placeholder="Jean"
                  />
                </div>
                <div className="modern-input-group">
                  <label htmlFor="lastName" className="modern-label">Nom</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="modern-input"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="modern-submit-button group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    Créer mon compte
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            <p className="text-xs text-gray-400 text-center">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/about" className="text-primary-500 hover:underline">Conditions d'utilisation</Link>
              {' '}et notre{' '}
              <Link to="/about" className="text-primary-500 hover:underline">Politique de confidentialité</Link>.
            </p>
          </form>

          {/* Footer links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Se connecter
              </Link>
            </p>
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
