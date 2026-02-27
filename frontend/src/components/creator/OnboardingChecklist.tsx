import { Link } from 'react-router-dom';

interface CreatorProfile {
  companyName?: string;
  industry?: string;
  description?: string;
  profilePictureUrl?: string;
}

interface Match {
  status: string;
}

interface Conversation {
  matches?: Match[];
}

interface OnboardingChecklistProps {
  creatorProfile: CreatorProfile | null;
  conversations: Conversation[];
  loading?: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href?: string;
  icon: React.ReactNode;
  color: string;
}

export default function OnboardingChecklist({
  creatorProfile,
  conversations,
  loading,
}: OnboardingChecklistProps) {
  const hasProfile =
    !!creatorProfile?.companyName &&
    !!creatorProfile?.industry &&
    !!creatorProfile?.description;
  const hasLogo = !!creatorProfile?.profilePictureUrl;
  const hasBrainstorming = conversations.length > 0;
  const hasMatches = conversations.some(c => (c.matches?.length || 0) > 0);
  const hasContacted = conversations.some(c =>
    c.matches?.some(m => m.status === 'CONTACTED' || m.status === 'ACCEPTED'),
  );

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      label: 'Compléter le profil entreprise',
      description: 'Nom, secteur et description renseignés',
      done: hasProfile,
      href: '/profile/creator',
      color: 'blue',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'logo',
      label: 'Ajouter un logo',
      description: 'Photo ou logo de votre entreprise',
      done: hasLogo,
      href: '/profile/creator',
      color: 'purple',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'brainstorming',
      label: 'Lancer une session brainstorming',
      description: 'Décrire votre projet avec l\'IA',
      done: hasBrainstorming,
      href: '/brainstorming',
      color: 'green',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: 'matches',
      label: 'Générer des matchs',
      description: 'L\'IA identifie les meilleurs profils',
      done: hasMatches,
      href: '/brainstorming',
      color: 'orange',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'contact',
      label: 'Contacter un professionnel',
      description: 'Envoyez votre premier message',
      done: hasContacted,
      href: '/projects',
      color: 'primary',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
  ];

  const completedCount = items.filter(i => i.done).length;
  const allDone = completedCount === items.length;

  // Hide checklist when everything is done
  if (allDone && !loading) return null;

  const progressPct = Math.round((completedCount / items.length) * 100);

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
    green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    primary: { bg: 'bg-primary-500', text: 'text-primary-600', light: 'bg-primary-50' },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Commencez votre aventure</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} sur {items.length} étapes complétées
          </p>
        </div>
        <span className="text-2xl font-bold text-primary-600">{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map(item => {
          const colors = colorClasses[item.color];
          const content = (
            <div
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                item.done
                  ? 'opacity-60'
                  : 'hover:bg-gray-50 cursor-pointer group'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                  item.done
                    ? 'bg-green-100'
                    : `${colors.light} group-hover:${colors.light}`
                }`}
              >
                {item.done ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={colors.text}>{item.icon}</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {item.label}
                </p>
                {!item.done && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>

              {/* Arrow */}
              {!item.done && (
                <svg
                  className={`w-4 h-4 text-gray-300 group-hover:${colors.text} transition-colors flex-shrink-0`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );

          if (item.done || !item.href) return <div key={item.id}>{content}</div>;
          return (
            <Link key={item.id} to={item.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
