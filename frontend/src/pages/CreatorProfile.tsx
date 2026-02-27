import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { creatorApi } from '../services/api';
import CreatorLayout from '../components/CreatorLayout';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface CreatorProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  profilePictureUrl: string;
  phone: string;
  city: string;
  country: string;
  typicalBudget: string;
  preferredCreatives: string[];
  linkedinUrl: string;
  twitterUrl: string;
}

const INDUSTRIES = [
  'Tech / Startup', 'E-commerce', 'Finance / Banque', 'Santé', 'Education',
  'Immobilier', 'Mode / Luxe', 'Alimentation / Restaurant', 'Sport / Fitness',
  'Voyage / Tourisme', 'Médias / Divertissement', 'Agence / Conseil', 'Autre',
];

const COMPANY_SIZES = [
  { value: '1', label: 'Solo' },
  { value: '2-10', label: '2–10' },
  { value: '11-50', label: '11–50' },
  { value: '51-200', label: '51–200' },
  { value: '201-500', label: '201–500' },
  { value: '500+', label: '500+' },
];

const BUDGETS = [
  { value: '<1k', label: '< 1 000€' },
  { value: '1-5k', label: '1 000 – 5 000€' },
  { value: '5-10k', label: '5 000 – 10 000€' },
  { value: '10-25k', label: '10 000 – 25 000€' },
  { value: '25-50k', label: '25 000 – 50 000€' },
  { value: '50k+', label: '+ de 50 000€' },
];

const CREATIVE_TYPES = [
  { id: 'graphiste', label: 'Graphiste' },
  { id: 'ux-ui', label: 'UX/UI' },
  { id: 'motion', label: 'Motion' },
  { id: 'illustrateur', label: 'Illustration' },
  { id: '3d', label: '3D' },
  { id: 'web', label: 'Web Design' },
  { id: 'branding', label: 'Branding' },
  { id: 'photo', label: 'Photo' },
  { id: 'video', label: 'Vidéo' },
  { id: 'social', label: 'Social Media' },
];

const COMPANY_SIZE_LABELS: Record<string, string> = {
  '1': 'Solo / Freelance', '2-10': '2–10 employés', '11-50': '11–50 employés',
  '51-200': '51–200 employés', '201-500': '201–500 employés', '500+': '500+ employés',
};

export default function CreatorProfile() {
  useDocumentTitle('Mon Profil | JUNY');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile>({
    companyName: '', industry: '', companySize: '', website: '', description: '',
    profilePictureUrl: '', phone: '', city: '', country: 'France',
    typicalBudget: '', preferredCreatives: [], linkedinUrl: '', twitterUrl: '',
  });
  const [draftProfile, setDraftProfile] = useState<CreatorProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const headerAnim = useScrollAnimation([loaded]);
  const statsAnim = useScrollAnimation([loaded]);
  const descAnim = useScrollAnimation([loaded]);
  const creativesAnim = useScrollAnimation([loaded]);
  const promptAnim = useScrollAnimation([loaded]);

  useEffect(() => {
    if (!user || user.role !== 'CREATOR') { navigate('/dashboard'); return; }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const response = await creatorApi.getProfile();
      if (response.success && response.data) {
        const p: CreatorProfile = {
          companyName: response.data.companyName || '',
          industry: response.data.industry || '',
          companySize: response.data.companySize || '',
          website: response.data.website || '',
          description: response.data.description || '',
          profilePictureUrl: response.data.profilePictureUrl || '',
          phone: response.data.phone || '',
          city: response.data.city || '',
          country: response.data.country || 'France',
          typicalBudget: response.data.typicalBudget || '',
          preferredCreatives: response.data.preferredCreatives || [],
          linkedinUrl: response.data.linkedinUrl || '',
          twitterUrl: response.data.twitterUrl || '',
        };
        setProfile(p);
        setDraftProfile(p);
        // If profile is empty, open edit mode directly
        if (!p.companyName && !p.industry) setEditing(true);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoaded(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await creatorApi.updateProfile(draftProfile);
      if (response.success) {
        setProfile(draftProfile);
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setEditing(false);
    setError('');
  };

  const toggleCreativeType = (id: string) => {
    setDraftProfile(prev => ({
      ...prev,
      preferredCreatives: prev.preferredCreatives.includes(id)
        ? prev.preferredCreatives.filter(c => c !== id)
        : [...prev.preferredCreatives, id],
    }));
  };

  const completionFields = [
    !!profile.companyName, !!profile.industry, !!profile.companySize,
    !!profile.description, !!profile.city, !!profile.typicalBudget,
    profile.preferredCreatives.length > 0,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const budgetLabel = BUDGETS.find(b => b.value === profile.typicalBudget)?.label;

  if (!user || !loaded) return null;

  // ─────────────────────────────────────────
  // VIEW MODE
  // ─────────────────────────────────────────
  // Only show location if city is explicitly filled
  const hasLocation = !!profile.city;
  const locationText = [profile.city, profile.country].filter(Boolean).join(', ');
  const hasSocials = !!(profile.website || profile.linkedinUrl || profile.twitterUrl);

  if (!editing) {
    return (
      <CreatorLayout>
        <div className="space-y-6">
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profil mis à jour avec succès
            </div>
          )}

          {/* Banner + Profile Card */}
          <div
            ref={headerAnim.ref}
            className={`space-y-4 transition-[opacity,transform] duration-700 ${headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            {/* Banner */}
            <div className="relative w-full aspect-[3/1] max-h-48 rounded-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-primary-600 via-primary-500 to-pink-500">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="px-6 py-5">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Logo */}
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.companyName}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-xl flex-shrink-0"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-500 to-pink-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                      {profile.companyName ? (
                        <span className="text-3xl sm:text-4xl font-bold text-white">
                          {profile.companyName[0].toUpperCase()}
                        </span>
                      ) : (
                        <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Company info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.companyName || user?.email}
                    </h1>
                    {profile.industry && (
                      <p className="text-primary-600 font-medium">{profile.industry}</p>
                    )}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500">
                      {profile.companySize && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {COMPANY_SIZE_LABELS[profile.companySize] || profile.companySize}
                        </span>
                      )}
                      {hasLocation && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {locationText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => { setDraftProfile(profile); setEditing(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier le profil
                  </button>
                </div>

                {/* Compact info bar */}
                {(budgetLabel || profile.preferredCreatives.length > 0 || profile.phone) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {profile.phone && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium text-gray-700">{profile.phone}</span>
                        </div>
                        {(budgetLabel || profile.preferredCreatives.length > 0) && <span className="text-gray-200">|</span>}
                      </>
                    )}
                    {budgetLabel && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Budget <span className="font-semibold text-gray-900">{budgetLabel}</span></span>
                        </div>
                        {profile.preferredCreatives.length > 0 && <span className="text-gray-200">|</span>}
                      </>
                    )}
                    {profile.preferredCreatives.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        {profile.preferredCreatives.slice(0, 4).map(id => {
                          const type = CREATIVE_TYPES.find(t => t.id === id);
                          return type ? (
                            <span key={id} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-[11px] font-medium">
                              {type.label}
                            </span>
                          ) : null;
                        })}
                        {profile.preferredCreatives.length > 4 && (
                          <span className="text-[11px] text-gray-400">+{profile.preferredCreatives.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Social links */}
                {hasSocials && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all hover:scale-110" title="Site web">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                      </a>
                    )}
                    {profile.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 flex items-center justify-center text-[#0A66C2] transition-all hover:scale-110" title="LinkedIn">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {profile.twitterUrl && (
                      <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gray-900/10 hover:bg-gray-900/20 flex items-center justify-center text-gray-900 transition-all hover:scale-110" title="X / Twitter">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats cards */}
          <div
            ref={statsAnim.ref}
            className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-[opacity,transform] duration-700 delay-100 ${statsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-primary-100 transition-all duration-200">
              <div className={`text-2xl font-bold ${completion >= 80 ? 'text-primary-600' : 'text-gray-900'}`}>
                {completion}%
              </div>
              <div className="text-sm text-gray-500">Profil complété</div>
            </div>
            {budgetLabel && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-primary-100 transition-all duration-200">
                <div className="text-lg font-bold text-gray-900 leading-tight">{budgetLabel}</div>
                <div className="text-sm text-gray-500 mt-0.5">Budget typique</div>
              </div>
            )}
            {profile.preferredCreatives.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-primary-100 transition-all duration-200">
                <div className="text-2xl font-bold text-primary-600">{profile.preferredCreatives.length}</div>
                <div className="text-sm text-gray-500">Profils ciblés</div>
              </div>
            )}
          </div>

          {/* Description card */}
          {profile.description && (
            <div
              ref={descAnim.ref}
              className={`bg-white rounded-2xl border border-gray-200 px-6 py-5 transition-[opacity,transform] duration-700 delay-150 ${descAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">À propos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Preferred creatives card */}
          {profile.preferredCreatives.length > 0 && (
            <div
              ref={creativesAnim.ref}
              className={`bg-white rounded-2xl border border-gray-200 px-6 py-5 transition-[opacity,transform] duration-700 delay-200 ${creativesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Profils créatifs recherchés</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferredCreatives.map(id => {
                  const type = CREATIVE_TYPES.find(t => t.id === id);
                  return type ? (
                    <span key={id} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                      {type.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Completion prompt */}
          {completion < 100 && (
            <div
              ref={promptAnim.ref}
              className={`bg-gradient-to-r from-primary-50 to-pink-50 border border-primary-100 rounded-2xl p-5 flex items-center justify-between gap-4 transition-[opacity,transform] duration-700 delay-300 ${promptAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">Profil à {completion}% — complétez-le pour de meilleurs matchs IA</p>
                <p className="text-xs text-gray-500 mt-0.5">Un profil complet améliore la qualité des recommandations</p>
              </div>
              <button
                onClick={() => { setDraftProfile(profile); setEditing(true); }}
                className="flex-shrink-0 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
              >
                Compléter
              </button>
            </div>
          )}
        </div>
      </CreatorLayout>
    );
  }

  // ─────────────────────────────────────────
  // EDIT MODE
  // ─────────────────────────────────────────
  return (
    <CreatorLayout>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modifier le profil</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Mettez à jour vos informations</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Left: live preview */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-16 bg-gradient-to-br from-primary-400 to-primary-600" />
              <div className="flex justify-center -mt-8 px-4">
                {draftProfile.profilePictureUrl ? (
                  <img src={draftProfile.profilePictureUrl} alt="Logo"
                    className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl border-4 border-white shadow-md flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="px-4 pb-4 pt-2 text-center">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {draftProfile.companyName || <span className="text-gray-400 font-normal italic text-xs">Nom de l'entreprise</span>}
                </p>
                {draftProfile.industry && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                    {draftProfile.industry}
                  </span>
                )}
                {(draftProfile.city || draftProfile.country) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {[draftProfile.city, draftProfile.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Completion mini */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">Complétion</span>
                <span className="text-xs font-bold text-primary-600">{completion}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="space-y-5">

            {/* Identité */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-50 rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Identité
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Logo / Photo</label>
                  <ProfilePictureUpload
                    currentImageUrl={draftProfile.profilePictureUrl}
                    onUploadSuccess={(url) => setDraftProfile({ ...draftProfile, profilePictureUrl: url })}
                    onRemove={() => setDraftProfile({ ...draftProfile, profilePictureUrl: '' })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Email', value: user.email, disabled: true, type: 'email', key: null },
                    { label: "Nom de l'entreprise *", value: draftProfile.companyName, key: 'companyName', type: 'text', placeholder: 'Ma Super Startup' },
                    { label: 'Téléphone', value: draftProfile.phone, key: 'phone', type: 'tel', placeholder: '+33 6 12 34 56 78' },
                    { label: 'Site web', value: draftProfile.website, key: 'website', type: 'url', placeholder: 'https://monsite.com' },
                    { label: 'Ville', value: draftProfile.city, key: 'city', type: 'text', placeholder: 'Paris' },
                    { label: 'Pays', value: draftProfile.country, key: 'country', type: 'text', placeholder: 'France' },
                    { label: 'LinkedIn', value: draftProfile.linkedinUrl, key: 'linkedinUrl', type: 'url', placeholder: 'https://linkedin.com/in/...' },
                    { label: 'Twitter / X', value: draftProfile.twitterUrl, key: 'twitterUrl', type: 'url', placeholder: 'https://x.com/...' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={field.value}
                        disabled={!field.key}
                        placeholder={(field as any).placeholder || ''}
                        onChange={(e) => field.key && setDraftProfile({ ...draftProfile, [field.key]: e.target.value })}
                        className={`block w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                          !field.key
                            ? 'bg-gray-100 border-0 text-gray-500'
                            : 'bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Entreprise */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-50 rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Entreprise
              </h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Secteur *</label>
                    <select
                      value={draftProfile.industry}
                      onChange={(e) => setDraftProfile({ ...draftProfile, industry: e.target.value })}
                      className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner</option>
                      {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Taille *</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMPANY_SIZES.map(size => (
                        <button key={size.value} type="button"
                          onClick={() => setDraftProfile({ ...draftProfile, companySize: size.value })}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            draftProfile.companySize === size.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
                  <textarea
                    value={draftProfile.description}
                    onChange={(e) => setDraftProfile({ ...draftProfile, description: e.target.value })}
                    rows={4}
                    className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre entreprise, votre mission, vos valeurs... Cette description aide l'IA à trouver les meilleurs créatifs."
                  />
                </div>
              </div>
            </div>

            {/* Ce que vous recherchez */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-50 rounded-md flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                Ce que vous recherchez
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Budget typique *</label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map(b => (
                      <button key={b.value} type="button"
                        onClick={() => setDraftProfile({ ...draftProfile, typicalBudget: b.value })}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                          draftProfile.typicalBudget === b.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Types de créatifs</label>
                  <div className="flex flex-wrap gap-2">
                    {CREATIVE_TYPES.map(type => {
                      const sel = draftProfile.preferredCreatives.includes(type.id);
                      return (
                        <button key={type.id} type="button" onClick={() => toggleCreativeType(type.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                            sel ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {sel && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-2">
              <button type="button" onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="px-7 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm">
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enregistrement...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Enregistrer</>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </CreatorLayout>
  );
}
