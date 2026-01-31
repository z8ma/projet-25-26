import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { creatorApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';

type TabType = 'profile' | 'company' | 'preferences';

interface CreatorProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  logoUrl: string;
  phone: string;
  city: string;
  country: string;
  typicalBudget: string;
  preferredCreatives: string[];
  linkedinUrl: string;
  twitterUrl: string;
}

const INDUSTRIES = [
  'Tech / Startup',
  'E-commerce',
  'Finance / Banque',
  'Santé',
  'Education',
  'Immobilier',
  'Mode / Luxe',
  'Alimentation / Restaurant',
  'Sport / Fitness',
  'Voyage / Tourisme',
  'Médias / Divertissement',
  'Agence / Conseil',
  'Autre',
];

const COMPANY_SIZES = [
  { value: '1', label: 'Solo / Freelance' },
  { value: '2-10', label: '2-10 employés' },
  { value: '11-50', label: '11-50 employés' },
  { value: '51-200', label: '51-200 employés' },
  { value: '201-500', label: '201-500 employés' },
  { value: '500+', label: '500+ employés' },
];

const BUDGETS = [
  { value: '<1k', label: 'Moins de 1 000€' },
  { value: '1-5k', label: '1 000€ - 5 000€' },
  { value: '5-10k', label: '5 000€ - 10 000€' },
  { value: '10-25k', label: '10 000€ - 25 000€' },
  { value: '25-50k', label: '25 000€ - 50 000€' },
  { value: '50k+', label: 'Plus de 50 000€' },
];

const CREATIVE_TYPES = [
  { id: 'graphiste', label: 'Graphiste' },
  { id: 'ux-ui', label: 'UX/UI Designer' },
  { id: 'motion', label: 'Motion Designer' },
  { id: 'illustrateur', label: 'Illustrateur' },
  { id: '3d', label: 'Artiste 3D' },
  { id: 'web', label: 'Web Designer' },
  { id: 'branding', label: 'Branding Expert' },
  { id: 'photo', label: 'Photographe' },
  { id: 'video', label: 'Vidéaste' },
  { id: 'social', label: 'Social Media' },
];

export default function CreatorProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile state
  const [profile, setProfile] = useState<CreatorProfile>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    logoUrl: '',
    phone: '',
    city: '',
    country: 'France',
    typicalBudget: '',
    preferredCreatives: [],
    linkedinUrl: '',
    twitterUrl: '',
  });

  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'CREATOR') {
      navigate('/dashboard');
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await creatorApi.getProfile();
      if (response.success && response.data) {
        setProfile({
          companyName: response.data.companyName || '',
          industry: response.data.industry || '',
          companySize: response.data.companySize || '',
          website: response.data.website || '',
          description: response.data.description || '',
          logoUrl: response.data.logoUrl || '',
          phone: response.data.phone || '',
          city: response.data.city || '',
          country: response.data.country || 'France',
          typicalBudget: response.data.typicalBudget || '',
          preferredCreatives: response.data.preferredCreatives || [],
          linkedinUrl: response.data.linkedinUrl || '',
          twitterUrl: response.data.twitterUrl || '',
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await creatorApi.updateProfile(profile);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const toggleCreativeType = (id: string) => {
    setProfile(prev => ({
      ...prev,
      preferredCreatives: prev.preferredCreatives.includes(id)
        ? prev.preferredCreatives.filter(c => c !== id)
        : [...prev.preferredCreatives, id],
    }));
  };

  const calculateProfileCompletion = () => {
    const fields = [
      profile.companyName,
      profile.industry,
      profile.companySize,
      profile.description,
      profile.city,
      profile.typicalBudget,
      profile.preferredCreatives.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (!user) return null;

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'profile',
      label: 'Profil',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'company',
      label: 'Entreprise',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'preferences',
      label: 'Préférences',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  return (
    <CreatorLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Mon Profil
            </h1>
            <p className="text-gray-500 mt-1">Gérez votre profil et vos préférences</p>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profil complété</span>
              <span className={`text-sm font-bold ${profileCompletion === 100 ? 'text-emerald-600' : 'text-primary-600'}`}>
                {profileCompletion}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  profileCompletion === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-primary-500 to-pink-500'
                }`}
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            {profileCompletion < 100 && (
              <p className="text-xs text-gray-500 mt-2">Complétez votre profil pour de meilleurs matchs IA</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profil mis à jour avec succès
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informations personnelles
              </h2>

              <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Ma Super Startup"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://www.monsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Paris"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter / X</label>
                  <input
                    type="url"
                    value={profile.twitterUrl}
                    onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Informations entreprise
              </h2>

              <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner un secteur</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={profile.companySize}
                    onChange={(e) => setProfile({ ...profile, companySize: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionner une taille</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={profile.description}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    rows={4}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre entreprise, votre mission, vos valeurs..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Cette description aide l'IA à trouver les meilleurs créatifs pour vos projets
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL du logo</label>
                  <input
                    type="url"
                    value={profile.logoUrl}
                    onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="https://..."
                  />
                  {profile.logoUrl && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Aperçu du logo :</p>
                      <img
                        src={profile.logoUrl}
                        alt="Logo preview"
                        className="h-16 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Préférences projets
              </h2>

              <div className="max-w-4xl">
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget typique par projet <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {BUDGETS.map((budget) => (
                      <button
                        key={budget.value}
                        type="button"
                        onClick={() => setProfile({ ...profile, typicalBudget: budget.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          profile.typicalBudget === budget.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{budget.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Types de créatifs recherchés
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Sélectionnez les types de créatifs avec lesquels vous travaillez habituellement
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {CREATIVE_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleCreativeType(type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          profile.preferredCreatives.includes(type.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          profile.preferredCreatives.includes(type.id) ? 'text-primary-700' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                        {profile.preferredCreatives.includes(type.id) && (
                          <svg className="w-5 h-5 text-primary-500 mx-auto mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </CreatorLayout>
  );
}
